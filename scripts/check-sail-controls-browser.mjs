import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [
  process.env.CHROMIUM_PATH,
  "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
  "/usr/bin/chromium",
].filter(Boolean).find(existsSync);
if (!chromium) throw new Error("Chromium not found. Set CHROMIUM_PATH.");

const children = [];
let profile;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { const result = await callback(); if (result) return result; } catch { /* starting */ }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
};
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const env = {
  ...process.env,
  VITE_SUPABASE_URL: "http://127.0.0.1:54321",
  VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder",
};

const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");

try {
  profile = mkdtempSync(join(tmpdir(), "sail-controls-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/nautical-terms/sail-controls`)).ok, "preview");

  const args = ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-service-worker", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  const browser = spawn(chromium, args, { stdio: "ignore" });
  children.push(browser);
  const debuggingPort = await waitFor(() => {
    const path = join(profile, "DevToolsActivePort");
    return existsSync(path) ? Number(readFileSync(path, "utf8").split(/\r?\n/, 1)[0]) : null;
  }, "debugging port");
  const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json()).find(({ type }) => type === "page"), "page target");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const callback = pending.get(message.id);
    pending.delete(message.id);
    message.error ? callback.reject(new Error(message.error.message)) : callback.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const commandId = ++id;
    pending.set(commandId, { resolve, reject });
    socket.send(JSON.stringify({ id: commandId, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");

  for (const width of [375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/nautical-terms/sail-controls` });
    await waitFor(() => evaluate("document.querySelectorAll('[data-touch-target]').length === 12"), `${width}px diagram`);
    const layout = await evaluate(`(() => {
      const scroller = document.querySelector('[data-schematic-scroll]');
      const svg = scroller.querySelector('svg');
      const targets = [...svg.querySelectorAll('[data-touch-target]')].map((node) => node.getBoundingClientRect().toJSON());
      const labels = [...svg.querySelectorAll('g[role=button] text')].map((node) => ({ text: node.textContent.trim(), box: node.getBoundingClientRect().toJSON(), size: parseFloat(getComputedStyle(node).fontSize) }));
      return {
        viewport: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        scroller: scroller.getBoundingClientRect().toJSON(),
        scrollWidth: scroller.scrollWidth,
        svg: svg.getBoundingClientRect().toJSON(),
        touchAction: getComputedStyle(scroller).touchAction,
        targets, labels,
      };
    })()`);
    if (layout.pageWidth > layout.viewport || layout.scroller.left < 0 || layout.scroller.right > layout.viewport) throw new Error(`${width}px page overflow: ${JSON.stringify(layout)}`);
    if (layout.svg.width < 590 || layout.svg.height < 680 || layout.labels.length !== 12 || layout.labels.some(({ size, box }) => size < 10 || box.width < 25 || box.height < 10)) throw new Error(`${width}px illegible canvas: ${JSON.stringify(layout)}`);
    if (layout.targets.some(({ width: hitWidth, height }) => hitWidth < 44 || height < 44)) throw new Error(`${width}px undersized hit area: ${JSON.stringify(layout.targets)}`);
    if (layout.touchAction !== "auto") throw new Error(`${width}px must preserve native vertical touch scrolling; touch-action=${layout.touchAction}`);
    if (width === 375 && layout.scrollWidth <= layout.scroller.width) throw new Error("375px diagram must be horizontally scrollable without shrinking labels.");

    const scrollLeft = await evaluate(`(() => {
      const scroller = document.querySelector('[data-schematic-scroll]');
      scroller.scrollLeft = scroller.scrollWidth;
      const control = scroller.querySelector('[aria-label="Show Main Halyard details from diagram"]');
      control.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      return scroller.scrollLeft;
    })()`);
    await waitFor(() => evaluate("Boolean(document.querySelector('[data-control-details]'))"), `${width}px selected details`);
    const interaction = await evaluate(`(() => {
      const scroller = document.querySelector('[data-schematic-scroll]');
      const svg = scroller.querySelector('svg');
      const details = document.querySelector('[data-control-details]');
      return { scrollLeft: scroller.scrollLeft, svg: svg.getBoundingClientRect().toJSON(), details: details && details.getBoundingClientRect().toJSON() };
    })()`);
    if (width === 375 && scrollLeft <= 0) throw new Error("Mobile horizontal pan/scroll did not move the diagram.");
    if (!interaction.details || interaction.details.top < interaction.svg.bottom) throw new Error(`${width}px details obscure selected control: ${JSON.stringify(interaction)}`);
  }

  await send("Browser.close");
  socket.close();
  console.log("Sail Controls browser characterization passed at 375px, 768px, and 1280px.");
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null) child.kill("SIGTERM");
    if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
