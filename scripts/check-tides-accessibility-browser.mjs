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
  profile = mkdtempSync(join(tmpdir(), "tides-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/navigation/tides/theory`)).ok, "preview");
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
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/tides/theory` });
  await waitFor(() => evaluate("document.querySelector('button[aria-label=\"Back to Tides\"]') !== null"), "tides lesson");

  const semantics = await evaluate(`(() => ({
    back: document.querySelector('button[aria-label="Back to Tides"]')?.ariaLabel,
    bulges: document.querySelector('[role=img][aria-label*="far-side tidal bulge"]')?.ariaLabel,
    amphidromic: document.querySelector('figcaption')?.textContent,
    completion: document.querySelector('button[aria-describedby="completion-status"]')?.disabled,
    status: document.getElementById('completion-status')?.getAttribute('aria-live'),
    touch: [...document.querySelectorAll('label')].every((node) => node.getBoundingClientRect().height >= 44)
  }))()`);
  if (semantics.back !== "Back to Tides" || !semantics.bulges || !/co-tidal lines/i.test(semantics.amphidromic) || !/co-range contours/i.test(semantics.amphidromic) || semantics.completion !== true || semantics.status !== "polite" || !semantics.touch) throw new Error(`Tides semantics failed: ${JSON.stringify(semantics)}`);

  for (const [width, textZoom] of [[320, 100], [375, 100], [375, 200], [768, 100], [1280, 100]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width <= 375 });
      await evaluate(`document.documentElement.style.fontSize = '${textZoom}%'`);
      const layout = await evaluate(`(() => { const viewport = document.documentElement.clientWidth; const header = document.querySelector('header').getBoundingClientRect(); const button = document.querySelector('header button[aria-describedby]').getBoundingClientRect(); const offenders = [...document.querySelectorAll('main, main *, header, header *')].filter((node) => node.getBoundingClientRect().right > viewport + 1 || node.getBoundingClientRect().left < -1).slice(0, 5).map((node) => ({ tag: node.tagName, className: String(node.className), right: node.getBoundingClientRect().right, text: node.textContent?.slice(0, 30) })); return { overflow: offenders.length > 0, viewport, headerRight: header.right, buttonRight: button.right, buttonBottom: button.bottom, headerBottom: header.bottom, offenders }; })()`);
      if (layout.overflow || layout.headerRight > layout.viewport + 1 || layout.buttonRight > layout.viewport + 1 || layout.buttonBottom > layout.headerBottom + 1) throw new Error(`Tides layout failed at ${width}px/${textZoom}% text: ${JSON.stringify(layout)}`);
  }
  await evaluate("document.documentElement.style.fontSize='100%'; document.activeElement.blur()");
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
  const focus = await evaluate(`(() => ({ name: document.activeElement?.ariaLabel, ring: getComputedStyle(document.activeElement).boxShadow }))()`);
  if (focus.name !== "Back to Tides" || focus.ring === "none") throw new Error(`Back focus failed: ${JSON.stringify(focus)}`);
  const normalAnimations = await evaluate("[...document.querySelectorAll('main *')].filter((node) => getComputedStyle(node).animationName !== 'none').length");
  if (normalAnimations !== 0) throw new Error(`Unexpected page animation without a reduced-motion preference: ${normalAnimations}`);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }, { name: "forced-colors", value: "active" }] });
  const media = await evaluate(`(() => { const svg = document.querySelector('svg[role=img]'); const sea = getComputedStyle(svg.querySelector('rect')); const land = getComputedStyle(svg.querySelector('path[stroke="#78716c"]')); const range = getComputedStyle(svg.querySelector('g[stroke="#ea580c"]')); const phase = getComputedStyle(svg.querySelector('g[stroke="#0369a1"]')); return { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, forced: matchMedia('(forced-colors: active)').matches, animations: [...document.querySelectorAll('main *')].filter((node) => getComputedStyle(node).animationName !== 'none').length, adjustment: getComputedStyle(svg).forcedColorAdjust, sea: sea.fill, landStroke: land.stroke, range: range.stroke, rangeDash: range.strokeDasharray, phase: phase.stroke, phaseDash: phase.strokeDasharray }; })()`);
  if (!media.reduced || !media.forced || media.animations !== 0 || media.adjustment === "none" || media.sea === media.landStroke || media.rangeDash === media.phaseDash) throw new Error(`Computed media styles failed: ${JSON.stringify(media)}`);
  await send("Browser.close"); socket.close();
  console.log("Tides browser accessibility passed: semantics, keyboard focus, touch targets, reduced motion, forced colours, 320/375/768/1280 layouts, 200% text, and a 320px effective viewport equivalent to 400% browser zoom at 1280px.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
