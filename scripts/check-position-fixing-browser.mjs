import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [process.env.CHROMIUM_PATH, "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", "/usr/bin/chromium"].filter(Boolean).find(existsSync);
if (!chromium) throw new Error("Chromium not found. Set CHROMIUM_PATH.");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => { for (let i = 0; i < 100; i += 1) { try { const value = await callback(); if (value) return value; } catch { /* starting */ } await delay(100); } throw new Error(`Timed out waiting for ${label}`); };
const port = await new Promise((resolve, reject) => { const server = createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); }); });
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder" };
const children = [];
let profile;
try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "position-fixing-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env }); children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/navigation/position`)).ok, "preview");
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
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/position` });
    await waitFor(() => evaluate("document.querySelector('#position-fix-exercise svg[role=img]') !== null"), `${width}px exercise`);
    for (const zoom of [100, 200]) {
      const layout = await evaluate(`(() => { document.documentElement.style.fontSize='${zoom}%'; const exercise=document.querySelector('#position-fix-exercise'); const chart=document.querySelector('#position-chart-region'); const svg=chart.querySelector('svg'); const enlarge=[...exercise.querySelectorAll('button')].find((b)=>b.textContent.includes('Enlarge chart inline')); const targets=[...exercise.querySelectorAll('button,input,select')].filter((node)=>getComputedStyle(node).display!=='none').map((node)=>({name:node.getAttribute('aria-label')||node.textContent.trim(),...node.getBoundingClientRect().toJSON()})); return {viewport:document.documentElement.clientWidth,pageWidth:document.documentElement.scrollWidth,exercise:exercise.getBoundingClientRect().toJSON(),chart:chart.getBoundingClientRect().toJSON(),svg:svg.getBoundingClientRect().toJSON(),enlargeDisplay:getComputedStyle(enlarge).display,targets}; })()`);
      if (layout.pageWidth > layout.viewport + 1 || layout.exercise.right > layout.viewport + 1) throw new Error(`Overflow at ${width}px/${zoom}%: ${JSON.stringify(layout)}`);
      if (Math.abs(layout.chart.width / layout.chart.height - 1.6) > 0.02 || Math.abs(layout.svg.width / layout.svg.height - 1.6) > 0.02) throw new Error(`Chart distortion at ${width}px/${zoom}%: ${JSON.stringify(layout)}`);
      if (layout.targets.some(({ width: w, height }) => w < 44 || height < 44)) throw new Error(`Touch target below 44px at ${width}px/${zoom}%: ${JSON.stringify(layout.targets)}`);
      if (width < 1024 && layout.enlargeDisplay !== "none") throw new Error(`Ineffective enlargement exposed at ${width}px`);
    }
    if (width === 1280) {
      const enlargement = await evaluate(`(() => { document.documentElement.style.fontSize='100%'; const chart=document.querySelector('#position-chart-region'); const before=chart.getBoundingClientRect().width; [...document.querySelectorAll('#position-fix-exercise button')].find((b)=>b.textContent.includes('Enlarge chart inline')).click(); return new Promise((resolve)=>requestAnimationFrame(()=>resolve({before,after:chart.getBoundingClientRect().width,layout:document.querySelector('#position-fix-exercise [data-layout]').dataset.layout}))); })()`);
      if (enlargement.layout !== "expanded" || enlargement.after <= enlargement.before * 1.25) throw new Error(`Desktop enlargement is not material: ${JSON.stringify(enlargement)}`);
    }
  }
  await send("Browser.close"); socket.close();
  console.log("Position Fixing browser checks passed at 375/768/1280 and 100%/200% text, with non-cropping 8:5 chart geometry, 44px controls, no overflow, and material desktop enlargement.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
