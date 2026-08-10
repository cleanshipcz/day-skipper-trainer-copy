import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [process.env.CHROMIUM_PATH, "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", "/usr/bin/chromium"].filter(Boolean).find(existsSync);
if (!chromium) throw new Error("Chromium not found. Set CHROMIUM_PATH.");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { const result = await callback(); if (result) return result; } catch { /* page starting */ }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${label}`);
};
const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); });
});
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder" };
const children = [];
let profile;
try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "charts-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/navigation/charts`)).ok, "preview");
  const args = ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-service-worker", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  const browser = spawn(chromium, args, { stdio: ["ignore", "inherit", "inherit"] });
  children.push(browser);
  const debuggingPort = await waitFor(() => { const path = join(profile, "DevToolsActivePort"); return existsSync(path) ? Number(readFileSync(path, "utf8").split(/\r?\n/, 1)[0]) : null; }, "debugging port");
  const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json()).find(({ type }) => type === "page"), "page target");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id) return; const callback = pending.get(message.id); pending.delete(message.id); message.error ? callback.reject(new Error(message.error.message)) : callback.resolve(message.result); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const commandId = ++id; pending.set(commandId, { resolve, reject }); socket.send(JSON.stringify({ id: commandId, method, params })); });
  const evaluate = async (expression) => { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
  await send("Runtime.enable"); await send("Page.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/charts` });
  await waitFor(() => evaluate("document.querySelector('[aria-label=\"Chart theory sections\"]') !== null"), "chart page");

  const semantics = await evaluate(`(() => ({ back: document.querySelector('header button').getAttribute('aria-label'), tabs: document.querySelector('[role=tablist]').getAttribute('aria-label'), zoom: [...document.querySelectorAll('button')].filter((b) => /^Zoom (in|out)$/.test(b.getAttribute('aria-label'))).map((b) => b.getAttribute('aria-describedby')), scale: document.getElementById('plotter-scale-status').textContent.trim() }))()`);
  if (semantics.back !== "Back to Navigation" || semantics.tabs !== "Chart theory sections" || semantics.zoom.length !== 2 || semantics.zoom.some((id) => id !== "plotter-scale-status") || !semantics.scale.includes("40% to 200%")) throw new Error(`Chart semantics missing: ${JSON.stringify(semantics)}`);

  for (const width of [375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    for (const textZoom of [100, 200]) {
      await evaluate(`document.documentElement.style.fontSize = '${textZoom}%'`);
      for (const tab of ["Plotting", "Tides", "Symbols"]) {
        await evaluate(`[...document.querySelectorAll('[role=tab]')].find((node) => node.textContent.includes('${tab}')).click()`);
        const layout = await evaluate(`(() => ({ overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, page: document.querySelector('main').getBoundingClientRect().width, cards: Math.max(...[...document.querySelectorAll('[role=tabpanel] [class*=rounded]')].map((node) => node.getBoundingClientRect().width), 0), viewport: document.documentElement.clientWidth }))()`);
        if (layout.overflow || layout.page > layout.viewport || layout.cards > layout.viewport) throw new Error(`Chart ${tab} layout failed at ${width}px/${textZoom}% text: ${JSON.stringify(layout)}`);
      }
    }
  }
  await evaluate(`[...document.querySelectorAll('[role=tab]')].find((node) => node.textContent.includes('Plotting')).click()`);
  await evaluate("document.documentElement.style.fontSize = '100%'; document.activeElement.blur()");
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  const focus = await evaluate(`(() => ({ name: document.activeElement.getAttribute('aria-label'), ring: getComputedStyle(document.activeElement).boxShadow }))()`);
  if (focus.name !== "Back to Navigation" || focus.ring === "none") throw new Error(`Back focus is not named and visible: ${JSON.stringify(focus)}`);
  await evaluate("document.querySelector('button[aria-label=\"Zoom out\"]').click()");
  if (!await evaluate("document.getElementById('plotter-scale-status').textContent.includes('80%')")) throw new Error("Pointer zoom did not update its accessible scale status.");
  await send("Browser.close"); socket.close();
  console.log("Charts browser accessibility passed: named navigation and zoom controls, current scale limits, responsive layouts at 375/768/1280 and 200% text, visible keyboard focus, and pointer zoom.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
