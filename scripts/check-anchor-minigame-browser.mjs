import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const browserCandidates = [
  process.env.CHROMIUM_PATH,
  "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter(Boolean);
const browserPath = browserCandidates.find(existsSync);
if (!browserPath) {
  throw new Error("Chromium not found. Set CHROMIUM_PATH to run the anchor browser characterization.");
}

const children = [];
let profileDirectory;
const testEnvironment = {
  ...process.env,
  VITE_SUPABASE_URL: "http://127.0.0.1:54321",
  VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder",
};
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const reservePort = async () => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  server.close();
  await once(server, "close");
  if (!port) throw new Error("Could not reserve a local test port.");
  return port;
};
const previewPort = await reservePort();
const waitFor = async (callback, label) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const value = await callback();
      if (value) return value;
    } catch {
      // The preview/browser process may still be starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
};

const build = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "build"],
  { stdio: ["ignore", "inherit", "inherit"], env: testEnvironment },
);
const [buildCode] = await once(build, "exit");
if (buildCode !== 0) throw new Error("Vite build failed before browser characterization.");

profileDirectory = mkdtempSync(join(tmpdir(), "day-skipper-anchor-browser-"));
const preview = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"],
  { stdio: ["ignore", "pipe", "pipe"], env: testEnvironment },
);
preview.stdout.pipe(process.stdout);
preview.stderr.pipe(process.stderr);
children.push(preview);

try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${previewPort}/anchor-minigame`)).ok, "Vite preview");

  const browserArguments = [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-service-worker",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDirectory}`,
    "about:blank",
  ];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") {
    // Explicit opt-in is reserved for container runtimes that cannot provide
    // Chromium's user-namespace sandbox; CI and normal local runs keep it on.
    browserArguments.unshift("--no-sandbox");
  }
  const browser = spawn(browserPath, browserArguments, { stdio: ["ignore", "pipe", "pipe"] });
  browser.stdout.pipe(process.stdout);
  browser.stderr.pipe(process.stderr);
  children.push(browser);

  const debuggingPort = await waitFor(() => {
    const activePortPath = join(profileDirectory, "DevToolsActivePort");
    if (!existsSync(activePortPath)) return null;
    return Number(readFileSync(activePortPath, "utf8").split(/\r?\n/, 1)[0]);
  }, "Chromium debugging port");
  const target = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json();
    return targets.find(({ type }) => type === "page");
  }, "Chromium debugging target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let commandId = 0;
  const pending = new Map();
  const networkRequests = [];
  const runtimeErrors = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback.reject(new Error(message.error.message));
      else callback.resolve(message.result);
    } else if (message.method === "Network.requestWillBeSent") {
      networkRequests.push({
        method: message.params.request.method,
        url: message.params.request.url,
        postData: message.params.request.postData,
      });
    } else if (message.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(message.params.exceptionDetails);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const waitForText = (text) => waitFor(
    () => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`),
    JSON.stringify(text),
  );
  const snapshotStorage = () => evaluate(`(async () => {
    const databases = [];
    for (const descriptor of await indexedDB.databases()) {
      if (!descriptor.name) continue;
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open(descriptor.name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const stores = {};
      for (const storeName of database.objectStoreNames) {
        stores[storeName] = await new Promise((resolve, reject) => {
          const transaction = database.transaction(storeName, "readonly");
          const request = transaction.objectStore(storeName).getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      databases.push({ name: descriptor.name, version: descriptor.version, stores });
      database.close();
    }
    databases.sort((left, right) => left.name.localeCompare(right.name));
    return { local: { ...localStorage }, session: { ...sessionStorage }, databases };
  })()`);
  const buttonPoint = async (label) => evaluate(`(() => {
    const element = [...document.querySelectorAll("button")].find((button) => button.textContent.trim() === ${JSON.stringify(label)});
    if (!element) throw new Error("Missing button: " + ${JSON.stringify(label)});
    element.scrollIntoView({ block: "center", inline: "center" });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  const clickButton = async (label, times = 1) => {
    for (let index = 0; index < times; index += 1) {
      const point = await buttonPoint(label);
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
      await delay(75);
    }
  };
  const blurFocus = () => evaluate("document.activeElement?.blur()");
  const key = async (keyName, times = 1) => {
    const virtualKeyCode = { Enter: 13, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 }[keyName];
    for (let index = 0; index < times; index += 1) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyName, code: keyName, windowsVirtualKeyCode: virtualKeyCode });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyName, code: keyName, windowsVirtualKeyCode: virtualKeyCode });
      await delay(75);
    }
  };
  const manipulationPoint = () => evaluate(`(() => {
    const surface = document.querySelector('[role="application"][aria-label^="Anchor manipulation surface"]');
    if (!surface) throw new Error("Missing anchor manipulation surface");
    surface.scrollIntoView({ block: "center", inline: "center" });
    const rect = surface.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      touchAction: getComputedStyle(surface).touchAction,
      parentTouchAction: getComputedStyle(surface.parentElement).touchAction,
    };
  })()`);
  const readManipulationState = () => evaluate(`(() => {
    const label = [...document.querySelectorAll("span")].find((element) => element.textContent.trim() === "Rode out");
    const rode = label?.parentElement?.querySelector("span:last-child")?.textContent?.trim();
    const status = document.querySelector('[role="application"]')?.closest("div.relative")?.parentElement
      ?.parentElement?.querySelector("[data-description]")?.textContent?.trim()
      ?? document.body.innerText;
    return { rode, status };
  })()`);
  const waitForRode = (rode) => waitFor(async () => (await readManipulationState()).rode === rode, `${rode} rode readout`);

  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      const forced = new URL(location.href).searchParams.get("scenarioRandom");
      if (forced !== null) Math.random = () => Number(forced);
    })();`,
  });

  for (const width of [320, 375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width <= 375,
    });
    await send("Page.navigate", { url: `http://127.0.0.1:${previewPort}/anchor-minigame?scenarioRandom=0` });
    await waitForText("Anchoring Simulator");
    await delay(100);

    const mousePoint = await manipulationPoint();
    if (mousePoint.touchAction !== "none" || mousePoint.parentTouchAction === "none") {
      throw new Error(`${width}px gesture suppression escaped the active surface: ${JSON.stringify(mousePoint)}`);
    }
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: mousePoint.x, y: mousePoint.y, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: mousePoint.x - 38, y: mousePoint.y + 30, button: "left" });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: mousePoint.x - 38, y: mousePoint.y + 30, button: "left", clickCount: 1 });
    await waitForRode("2.0 m");
    if (!(await readManipulationState()).status.includes("Drifting back from the anchor")) {
      throw new Error(`${width}px mouse drag did not update boat status: ${JSON.stringify(await readManipulationState())}`);
    }

    await clickButton("New setup");
    await waitForRode("0.0 m");
    const touchPoint = await manipulationPoint();
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: touchPoint.x, y: touchPoint.y, id: 1 }] });
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: touchPoint.x - 38, y: touchPoint.y + 30, id: 1 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await waitForRode("2.0 m");
    if (!(await readManipulationState()).status.includes("Drifting back from the anchor")) {
      throw new Error(`${width}px touch drag did not update boat status: ${JSON.stringify(await readManipulationState())}`);
    }

    const cancelPoint = await manipulationPoint();
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cancelPoint.x, y: cancelPoint.y, id: 2 }] });
    await send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: cancelPoint.x, y: cancelPoint.y, id: 3 }] });
    await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cancelPoint.x, y: cancelPoint.y + 30, id: 3 }] });
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await waitForRode("4.0 m");
  }

  const coverageMatrix = [
    { width: 375, random: 0, title: "Sheltered cove", rode: 32, overRoomRode: 43, astern: 5, settingLoads: 3 },
    { width: 768, random: 0.26, title: "Harbour afternoon", rode: 48, overRoomRode: 59, astern: 6, settingLoads: 4 },
    { width: 1280, random: 0.51, title: "Open roadstead", rode: 78, overRoomRode: 89, astern: 7, settingLoads: 5 },
    { width: 768, random: 0.76, title: "Tidal river bend", rode: 46, overRoomRode: 53, astern: 6, settingLoads: 4 },
  ];

  for (const workflow of coverageMatrix) {
    const { width } = workflow;
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width === 375,
    });
    networkRequests.length = 0;
    await send("Page.navigate", { url: `http://127.0.0.1:${previewPort}/anchor-minigame?scenarioRandom=${workflow.random}` });
    try {
      await waitForText("Anchoring Simulator");
    } catch (error) {
      const pageState = await evaluate(`({ url: location.href, text: document.body.innerText, html: document.body.innerHTML.slice(0, 1000) })`);
      throw new Error(`${error.message}: ${JSON.stringify({ pageState, runtimeErrors, networkRequests })}`);
    }
    const baseline = await snapshotStorage();
    const layout = await evaluate(`(() => {
      const svg = document.querySelector('svg[aria-label="Anchoring side profile"]');
      const controls = [...document.querySelectorAll("button")].filter((button) =>
        ["← Left", "→ Right", "↓ Down (pay out)", "↑ Up (heave)", "Apply setting load", "Apply wind/tide change", "Run anchor watch", "Safe recovery", "Enter (check)"].includes(button.textContent.trim()));
      return {
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        svg: svg && svg.getBoundingClientRect().toJSON(),
        controls: controls.map((control) => control.getBoundingClientRect().toJSON()),
      };
    })()`);
    if (layout.viewport > width || layout.viewport < width - 20 || layout.scrollWidth > layout.viewport || !layout.svg || layout.svg.width > layout.viewport) {
      throw new Error(`${width}px layout overflows: ${JSON.stringify(layout)}`);
    }
    if (layout.controls.length !== 9 || layout.controls.some(({ left, right, width: controlWidth }) =>
      left < 0 || right > layout.viewport || controlWidth < 44)) {
      throw new Error(`${width}px controls are clipped or undersized: ${JSON.stringify(layout.controls)}`);
    }

    const scenarioTitle = await evaluate(`document.querySelector("main h3")?.textContent?.trim()`);
    if (scenarioTitle !== workflow.title) {
      throw new Error(`${width}px deterministic scenario mismatch: expected ${workflow.title}, received ${scenarioTitle}`);
    }

    // Negative checkpoints keep both safety gates observable in the browser
    // characterization: adequate geometry alone cannot replace setting load,
    // and extra rode is rejected when its calculated swing exceeds the fixture.
    await clickButton("↓ Down (pay out)", workflow.rode);
    await clickButton("← Left", workflow.astern);
    await clickButton("Enter (check)");
    await waitForText("progressive setting load not completed");
    await clickButton("Close");
    await clickButton("↓ Down (pay out)", workflow.overRoomRode - workflow.rode);
    await clickButton("Enter (check)");
    await waitForText("full swept area conflicts");
    await clickButton("Try again here");
    await waitForText("Anchor not set");

    await clickButton("↓ Down (pay out)", workflow.rode);
    await clickButton("← Left", workflow.astern);
    await clickButton("Apply setting load", workflow.settingLoads);
    await clickButton("Enter (check)");
    await waitForText("holding observation");
    await clickButton("Close");
    await delay(5_100);
    await clickButton("Apply wind/tide change");
    await clickButton("Run anchor watch");
    if (workflow.title === "Tidal river bend") {
      await waitForText("detected dragging");
      await clickButton("Safe recovery", 2);
      await clickButton("↓ Down (pay out)", workflow.rode);
      await clickButton("← Left", workflow.astern);
      await clickButton("Apply setting load", workflow.settingLoads);
      await clickButton("Enter (check)");
      await clickButton("Close");
      await delay(5_100);
      await clickButton("Apply wind/tide change");
      await clickButton("Run anchor watch");
    }
    await clickButton("Enter (check)");
    try {
      await waitForText("Modeled checks passed");
    } catch (error) {
      throw new Error(`${width}px pointer path failed: ${await evaluate("document.body.innerText")}`);
    }
    await clickButton("Try again here");
    await waitForText("Anchor not set");

    await blurFocus();
    await key("ArrowDown", workflow.rode);
    await key("ArrowLeft", workflow.astern);
    await clickButton("Apply setting load", workflow.settingLoads);
    await blurFocus();
    await key("Enter");
    await waitForText("holding observation");
    await clickButton("Close");
    await delay(5_100);
    await clickButton("Apply wind/tide change");
    await clickButton("Run anchor watch");
    if (workflow.title === "Tidal river bend") {
      await waitForText("detected dragging");
      await clickButton("Safe recovery", 2);
      await blurFocus();
      await key("ArrowDown", workflow.rode);
      await key("ArrowLeft", workflow.astern);
      await clickButton("Apply setting load", workflow.settingLoads);
      await blurFocus();
      await key("Enter");
      await clickButton("Close");
      await delay(5_100);
      await clickButton("Apply wind/tide change");
      await clickButton("Run anchor watch");
    }
    await blurFocus();
    await key("Enter");
    try {
      await waitForText("Modeled checks passed");
    } catch (error) {
      throw new Error(`${width}px keyboard path failed: ${await evaluate("document.body.innerText")}`);
    }

    const after = await snapshotStorage();
    if (JSON.stringify(after) !== JSON.stringify(baseline)) {
      throw new Error(`${width}px interaction wrote browser persistence: ${JSON.stringify({ baseline, after })}`);
    }
    const progressRequests = networkRequests.filter(({ method, url, postData = "" }) => {
      const mutation = /^(?:POST|PUT|PATCH|DELETE)$/i.test(method);
      const progressEndpoint = /\/rest\/v1\/(?:user_progress|rpc\/[^/?]*progress[^/?]*)/i.test(url);
      const knownSaveRpc = /\/rest\/v1\/rpc\/save_topic_progress(?:[/?]|$)/i.test(url);
      const progressPayload = /(?:topic_id|points_earned|answers_history|progress-queue)/i.test(postData);
      return knownSaveRpc || (mutation && (progressEndpoint || progressPayload));
    });
    if (progressRequests.length) {
      throw new Error(`${width}px interaction attempted progress persistence: ${JSON.stringify(progressRequests)}`);
    }
  }

  await send("Browser.close");
  socket.close();
  console.log("Anchor browser characterization passed direct mouse/touch manipulation across 320px, 375px, 768px, and 1280px plus every scenario fixture (cancellation, negative safety gates, buttons, keyboard, layout, storage).");
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
    if (child.exitCode === null) {
      await Promise.race([once(child, "exit"), delay(5_000)]);
    }
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (profileDirectory) {
    rmSync(profileDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
