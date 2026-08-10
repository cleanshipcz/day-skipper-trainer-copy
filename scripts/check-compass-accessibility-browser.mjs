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
  const server = createServer(); server.once("error", reject);
  server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); });
});
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder" };
const children = [];
let profile;
try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "compass-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/navigation/compass`)).ok, "preview");
  const args = ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-service-worker", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  const browser = spawn(chromium, args, { stdio: ["ignore", "inherit", "inherit"] }); children.push(browser);
  const debuggingPort = await waitFor(() => { const path = join(profile, "DevToolsActivePort"); return existsSync(path) ? Number(readFileSync(path, "utf8").split(/\r?\n/, 1)[0]) : null; }, "debugging port");
  const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json()).find(({ type }) => type === "page"), "page target");
  const socket = new WebSocket(target.webSocketDebuggerUrl); await once(socket, "open");
  let id = 0; const pending = new Map();
  socket.addEventListener("message", ({ data }) => { const message = JSON.parse(data); if (!message.id) return; const callback = pending.get(message.id); pending.delete(message.id); message.error ? callback.reject(new Error(message.error.message)) : callback.resolve(message.result); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const commandId = ++id; pending.set(commandId, { resolve, reject }); socket.send(JSON.stringify({ id: commandId, method, params })); });
  const evaluate = async (expression) => { const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
  await send("Runtime.enable"); await send("Page.enable");

  for (const width of [375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/compass` });
    await waitFor(() => evaluate("document.querySelector('[aria-label^=\"Compass answer\"]') !== null"), `${width}px compass page`);
    for (const textZoom of [100, 200]) {
      const layout = await evaluate(`(() => {
        document.documentElement.style.fontSize = '${textZoom}%';
        const notificationPortal = document.querySelector('[aria-label="Notifications (F8)"]');
        if (notificationPortal) notificationPortal.style.display = 'none';
        const regions = [...document.querySelectorAll('[role=region][aria-label*="scroll horizontally"]')];
        const targetSelectors = ['header button[aria-label^="Back"]', '#true', '#variation', '#deviation', 'button[aria-pressed]', '[aria-label^="Compass answer"]', 'button'];
        const targets = [...new Set(targetSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]))].filter((node) => node.matches('header button, input, button[aria-pressed]') || node.textContent.includes('Check answers'));
        const offenders = [...document.querySelectorAll('body *')].filter((node) => { const rect = node.getBoundingClientRect(); return rect.right > document.documentElement.clientWidth + 1 && getComputedStyle(node).position !== 'fixed'; }).slice(0, 8).map((node) => ({ tag: node.tagName, className: node.className?.baseVal ?? node.className, text: node.textContent?.trim().slice(0, 40), right: Math.round(node.getBoundingClientRect().right) }));
        return { viewport: document.documentElement.clientWidth, pageWidth: document.documentElement.scrollWidth, mainWidth: document.querySelector('main').getBoundingClientRect().width, regions: regions.map((node) => { const scroller = node.querySelector('.overflow-auto'); return { client: scroller.clientWidth, scroll: scroller.scrollWidth, name: node.getAttribute('aria-label') }; }), targets: targets.map((node) => ({ name: node.getAttribute('aria-label') ?? node.textContent.trim(), height: node.getBoundingClientRect().height, width: node.getBoundingClientRect().width })), offenders };
      })()`);
      if (layout.pageWidth > layout.viewport || layout.mainWidth > layout.viewport) throw new Error(`Compass page overflow at ${width}px/${textZoom}% text: ${JSON.stringify(layout)}`);
      if (layout.regions.length !== 2 || layout.regions.some(({ name }) => !name?.includes("scroll horizontally"))) throw new Error(`Compass table context missing: ${JSON.stringify(layout)}`);
      if (layout.targets.some(({ height, width }) => height < 44 || width < 44)) throw new Error(`Compass touch target below 44px: ${JSON.stringify(layout)}`);
    }
  }
  const semantics = await evaluate(`(() => ({ back: document.querySelector('header button').getAttribute('aria-label'), toggles: [...document.querySelectorAll('button[aria-pressed]')].map((node) => [node.getAttribute('aria-label'), node.getAttribute('aria-pressed')]), answer: document.querySelector('[aria-label^="Compass answer"]').getAttribute('aria-label') }))()`);
  if (!semantics.back.startsWith("Back to Navigation") || semantics.toggles.length !== 2 || semantics.toggles.some(([name, pressed]) => !name.includes("direction") || pressed !== "false") || !semantics.answer.includes("degrees compass")) throw new Error(`Compass semantics missing: ${JSON.stringify(semantics)}`);
  await send("Browser.close"); socket.close();
  console.log("Compass browser accessibility passed: 375/768/1280 layouts at 100% and 200% text, internal table scrolling with context, 44px controls, and named navigation, toggles, and drill answers.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
