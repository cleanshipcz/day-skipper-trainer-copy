import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [process.env.CHROMIUM_PATH, "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", "/usr/bin/chromium"].filter(Boolean).find(existsSync);
if (!chromium) throw new Error("Chromium not found. Set CHROMIUM_PATH.");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => { for (let i = 0; i < 120; i += 1) { try { const value = await callback(); if (value) return value; } catch { /* page starting */ } await delay(100); } throw new Error(`Timed out waiting for ${label}`); };
const port = await new Promise((resolve, reject) => { const server = createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); }); });
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder" };
const children = []; let profile;
try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "fog-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env }); children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/weather/fog`)).ok, "preview");
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
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }, { name: "prefers-color-scheme", value: "dark" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/weather/fog` });
  await waitFor(() => evaluate("document.querySelector('[aria-labelledby=\"fog-practice-heading\"] input[type=radio]') !== null && !document.querySelector('[aria-labelledby=\"fog-practice-heading\"] fieldset').disabled"), "enabled fog practice");
  const semantics = await evaluate(`(() => { const practice=document.querySelector('[aria-labelledby="fog-practice-heading"]'); const figure=practice.querySelector('figure'); const svg=figure.querySelector('svg[role=img]'); const caption=figure.querySelector('figcaption'); const buttons=[...practice.querySelectorAll('button')].filter((node)=>getComputedStyle(node).display!=='none').map((node)=>node.getBoundingClientRect().toJSON()); const choices=[...practice.querySelectorAll('label')].map((node)=>node.getBoundingClientRect().toJSON()); return {viewport:document.documentElement.clientWidth,pageWidth:document.documentElement.scrollWidth,practice:practice.getBoundingClientRect().toJSON(),title:svg.querySelector('title')?.textContent,caption:caption?.textContent,captionVisible:getComputedStyle(caption).display!=='none',reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,dark:matchMedia('(prefers-color-scheme: dark)').matches,buttons,choices}; })()`);
  if (semantics.pageWidth > semantics.viewport + 1 || semantics.practice.right > semantics.viewport + 1) throw new Error(`Fog practice overflow at 375px: ${JSON.stringify(semantics)}`);
  if (semantics.buttons.some(({ width, height }) => width < 44 || height < 44) || semantics.choices.some(({ width, height }) => width < 44 || height < 44)) throw new Error(`Fog controls are not touch usable: ${JSON.stringify({ buttons: semantics.buttons, choices: semantics.choices })}`);
  if (semantics.title !== "Operational situation diagram" || !semantics.captionVisible || !semantics.caption?.includes("Diagram meaning:") || !semantics.reduced || !semantics.dark) throw new Error(`Fog media/semantic equivalence failed: ${JSON.stringify(semantics)}`);
  await evaluate(`(() => { const practice=document.querySelector('[aria-labelledby="fog-practice-heading"]'); const radios=practice.querySelectorAll('input[type=radio]'); radios[1].focus(); radios[1].click(); [...practice.querySelectorAll('button')].find((button)=>button.textContent.trim()==='Check decision').click(); })()`);
  await waitFor(() => evaluate("document.querySelector('[aria-labelledby=\"fog-practice-heading\"] [role=status]')?.textContent.includes('Correct.')"), "keyboard-completed scenario");
  const stored = await evaluate("JSON.parse(localStorage.getItem('theory-gate:anonymous:weather-fog:fog-operational-scenarios-v1')).visitedSectionIds.includes('forecast-recognition')");
  if (!stored) throw new Error("Correct scenario evidence was not persisted in browser storage.");
  await send("Page.reload", { ignoreCache: true });
  await waitFor(() => evaluate("[...document.querySelectorAll('button')].some((button)=>button.textContent.includes('Scenario 1 — complete'))"), "restored scenario after reload");
  const restored = await evaluate(`(() => { const button=[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Scenario 1 — complete')); button.focus(); button.click(); const fieldset=document.querySelector('[aria-labelledby="fog-practice-heading"] fieldset'); return {current:button.getAttribute('aria-current'),disabled:fieldset.disabled,status:document.querySelector('[aria-labelledby="fog-practice-heading"] [role=status]')?.textContent}; })()`);
  if (!restored.disabled || !restored.status?.includes("Scenario complete")) throw new Error(`Reloaded evidence was not safely restored: ${JSON.stringify(restored)}`);
  await evaluate("document.documentElement.style.fontSize='200%'"); await delay(100);
  const zoom = await evaluate(`(() => { const practice=document.querySelector('[aria-labelledby="fog-practice-heading"]'); return {viewport:document.documentElement.clientWidth,pageWidth:document.documentElement.scrollWidth,right:practice.getBoundingClientRect().right,labels:[...practice.querySelectorAll('label')].map((node)=>node.getBoundingClientRect().toJSON())}; })()`);
  if (zoom.right > zoom.viewport + 1 || zoom.labels.some(({ right }) => right > zoom.viewport + 1)) throw new Error(`Fog practice failed 200% reflow: ${JSON.stringify(zoom)}`);
  await send("Browser.close"); socket.close();
  console.log("Fog accessibility browser checks passed: anonymous scenario evidence persisted across reload; keyboard activation and focusable scenario navigation worked; the fog practice and answer labels stayed within the viewport at 375px/200% text; touch controls, SVG title plus visible equivalent caption, dark media and reduced-motion media were verified.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
