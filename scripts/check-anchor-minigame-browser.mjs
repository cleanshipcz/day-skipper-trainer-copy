import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";

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

const previewPort = 4175;
const debuggingPort = 9335;
const children = [];
const testEnvironment = {
  ...process.env,
  VITE_SUPABASE_URL: "http://127.0.0.1:54321",
  VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder",
};
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
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
  { stdio: ["ignore", "pipe", "pipe"], env: testEnvironment },
);
const [buildCode] = await once(build, "exit");
if (buildCode !== 0) throw new Error("Vite build failed before browser characterization.");

const preview = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"],
  { stdio: ["ignore", "pipe", "pipe"], env: testEnvironment },
);
children.push(preview);

try {
  await waitFor(async () => (await fetch(`http://127.0.0.1:${previewPort}/anchor-minigame`)).ok, "Vite preview");

  const browser = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-service-worker",
    `--remote-debugging-port=${debuggingPort}`,
    "--user-data-dir=/tmp/day-skipper-anchor-browser",
    "about:blank",
  ], { stdio: ["ignore", "pipe", "pipe"] });
  children.push(browser);

  const target = await waitFor(async () => {
    const targets = await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json();
    return targets.find(({ type }) => type === "page");
  }, "Chromium debugging target");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let commandId = 0;
  const pending = new Map();
  const networkUrls = [];
  const runtimeErrors = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callback.reject(new Error(message.error.message));
      else callback.resolve(message.result);
    } else if (message.method === "Network.requestWillBeSent") {
      networkUrls.push(message.params.request.url);
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
    networkUrls.length = 0;
    await send("Page.navigate", { url: `http://127.0.0.1:${previewPort}/anchor-minigame` });
    try {
      await waitForText("Anchoring Simulator");
    } catch (error) {
      const pageState = await evaluate(`({ url: location.href, text: document.body.innerText, html: document.body.innerHTML.slice(0, 1000) })`);
      throw new Error(`${error.message}: ${JSON.stringify({ pageState, runtimeErrors, networkUrls })}`);
    }
    const baseline = await evaluate(`Promise.all([
      Promise.resolve({ local: { ...localStorage }, session: { ...sessionStorage } }),
      indexedDB.databases().then((databases) => databases.map(({ name, version }) => ({ name, version }))),
    ])`);
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

    const after = await evaluate(`Promise.all([
      Promise.resolve({ local: { ...localStorage }, session: { ...sessionStorage } }),
      indexedDB.databases().then((databases) => databases.map(({ name, version }) => ({ name, version }))),
    ])`);
    if (JSON.stringify(after) !== JSON.stringify(baseline)) {
      throw new Error(`${width}px interaction wrote browser persistence: ${JSON.stringify({ baseline, after })}`);
    }
    const progressRequests = networkUrls.filter((url) => /user_progress|progress-queue/i.test(url));
    if (progressRequests.length) {
      throw new Error(`${width}px interaction attempted progress persistence: ${progressRequests.join(", ")}`);
    }
  }

  socket.close();
  console.log("Anchor browser characterization passed at 375px, 768px, and 1280px (pointer, keyboard, layout, storage).");
} finally {
  for (const child of children.reverse()) {
    if (!child.killed) child.kill("SIGTERM");
  }
}
