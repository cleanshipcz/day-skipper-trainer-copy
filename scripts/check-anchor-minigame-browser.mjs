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
  const key = async (keyName, times = 1) => {
    for (let index = 0; index < times; index += 1) {
      await send("Input.dispatchKeyEvent", { type: "keyDown", key: keyName });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key: keyName });
      await delay(75);
    }
  };

  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.enable");

  for (const width of [375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width === 375,
    });
    networkRequests.length = 0;
    await send("Page.navigate", { url: `http://127.0.0.1:${previewPort}/anchor-minigame` });
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
        ["← Left", "→ Right", "↓ Down (pay out)", "↑ Up (heave)", "Enter (check)"].includes(button.textContent.trim()));
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
    if (layout.controls.length !== 5 || layout.controls.some(({ left, right, width: controlWidth }) =>
      left < 0 || right > layout.viewport || controlWidth < 44)) {
      throw new Error(`${width}px controls are clipped or undersized: ${JSON.stringify(layout.controls)}`);
    }

    await clickButton("↓ Down (pay out)", 80);
    await clickButton("← Left", 12);
    await clickButton("Enter (check)");
    try {
      await waitForText("Anchor secure");
    } catch (error) {
      throw new Error(`${width}px pointer path failed: ${await evaluate("document.body.innerText")}`);
    }
    await clickButton("Try again here");
    await waitForText("Anchor not set");

    await key("ArrowDown", 80);
    await key("ArrowLeft", 12);
    await key("Enter");
    await waitForText("Anchor secure");

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
  console.log("Anchor browser characterization passed at 375px, 768px, and 1280px (pointer, keyboard, layout, storage).");
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
