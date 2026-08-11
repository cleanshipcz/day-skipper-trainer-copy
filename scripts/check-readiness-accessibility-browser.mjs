import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [process.env.CHROMIUM_PATH, "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", "/usr/bin/chromium"].filter(Boolean).find(existsSync);
if (!chromium) throw new Error("Chromium not found");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (fn, label) => { for (let i = 0; i < 120; i += 1) { try { const value = await fn(); if (value) return value; } catch {} await delay(100); } throw new Error(`Timed out: ${label}`); };
const port = await new Promise((resolve, reject) => { const server = createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const address = server.address(); server.close(() => resolve(address.port)); }); });
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-placeholder" };
const children = [];
let profile;

try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0]) throw new Error("build failed");
  profile = mkdtempSync(join(tmpdir(), "readiness-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/passage-planning/checklist`)).ok, "preview");
  const args = ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-service-worker", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  const browser = spawn(chromium, args, { stdio: ["ignore", "inherit", "inherit"] });
  children.push(browser);
  const debugPort = await waitFor(() => { const path = join(profile, "DevToolsActivePort"); return existsSync(path) ? Number(readFileSync(path, "utf8").split(/\r?\n/)[0]) : null; }, "debug port");
  const target = await waitFor(async () => (await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json()).find((candidate) => candidate.type === "page"), "target");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => { const message = JSON.parse(data); if (!message.id) return; const request = pending.get(message.id); pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params })); });
  const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;
  await send("Runtime.enable"); await send("Page.enable");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }, { name: "forced-colors", value: "active" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 320, height: 700, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/passage-planning/checklist` });
  await waitFor(() => evaluate("document.querySelector('[aria-label=\"Pre-departure checklist progress\"]') !== null && !document.querySelector('fieldset button').disabled"), "ready checklist");
  const inspect = () => evaluate(`(()=>{const main=document.querySelector('main');const buttons=[...document.querySelectorAll('fieldset button')].map((node)=>node.getBoundingClientRect().toJSON());const progress=document.querySelector('[role=progressbar]');const progressStyle=getComputedStyle(progress.firstElementChild);const first=document.querySelector('fieldset');const overflow=[...document.querySelectorAll('main *')].filter(node=>node.getBoundingClientRect().right>321).slice(0,5).map(node=>({tag:node.tagName,text:node.textContent.slice(0,60),right:node.getBoundingClientRect().right,class:node.className}));return {viewport:document.documentElement.clientWidth,width:document.documentElement.scrollWidth,mainRight:main.getBoundingClientRect().right,overflow,buttons,progressTransitionDuration:progressStyle.transitionDuration,progressTransitionProperty:progressStyle.transitionProperty,progressName:progress.getAttribute('aria-label'),progressDescription:progress.getAttribute('aria-describedby'),itemName:first.querySelector('legend').textContent,itemDescription:first.getAttribute('aria-describedby'),reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,forced:matchMedia('(forced-colors: active)').matches}})()`);
  await evaluate("document.documentElement.style.fontSize='200%'"); await delay(100);
  const audit = await inspect();
  if (audit.width > audit.viewport + 1 || audit.mainRight > audit.viewport + 1) throw new Error(`320px/200% reflow failed ${JSON.stringify(audit)}`);
  if (audit.buttons.some((box) => box.height < 44 || box.width < 44)) throw new Error("Checklist status target is smaller than 44px");
  if (!audit.progressName || !audit.progressDescription || audit.progressTransitionProperty !== "none" || audit.progressTransitionDuration !== "0s" || !audit.itemName || !audit.itemDescription.includes("rationale") || !audit.reduced || !audit.forced) throw new Error(`semantic/media audit failed ${JSON.stringify(audit)}`);
  await evaluate("document.documentElement.style.fontSize='400%'"); await delay(100);
  const zoomAudit = await inspect();
  if (zoomAudit.width > zoomAudit.viewport + 1 || zoomAudit.mainRight > zoomAudit.viewport + 1) throw new Error(`320px/400% reflow failed ${JSON.stringify(zoomAudit)}`);
  await evaluate(`(()=>{const button=[...document.querySelectorAll('fieldset button')].find((node)=>node.textContent==='Satisfactory');button.focus();return true})()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
  const keyboard = await waitFor(() => evaluate(`(()=>{const button=[...document.querySelectorAll('fieldset button')].find((node)=>node.textContent==='Satisfactory');const live=document.querySelector('.sr-only[role=status]');return button.getAttribute('aria-pressed')==='true' && live.textContent.includes('Satisfactory') ? {pressed:button.getAttribute('aria-pressed'),live:live.textContent,focused:document.activeElement===button} : null})()`), "keyboard update");
  if (!keyboard.focused) throw new Error(`Status activation stole focus ${JSON.stringify(keyboard)}`);
  await evaluate(`(()=>{const node=[...document.querySelectorAll('fieldset button')].find((candidate)=>candidate.textContent==='Defect');node.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',isPrimary:true}));node.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'touch',isPrimary:true}));node.click();return true})()`);
  await waitFor(() => evaluate(`[...document.querySelector('fieldset').querySelectorAll('button')].find(node=>node.textContent==='Defect')?.getAttribute('aria-pressed')==='true'`), "touch activation");
  const rowPoint = await evaluate(`(()=>{const box=document.querySelector('fieldset').getBoundingClientRect();return{x:box.left+4,y:box.top+4}})()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: rowPoint.x, y: rowPoint.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rowPoint.x, y: rowPoint.y, button: "left", clickCount: 1 });
  const pointer = await evaluate(`(()=>{const buttons=[...document.querySelector('fieldset').querySelectorAll('button')];return{pressed:buttons.filter(node=>node.getAttribute('aria-pressed')==='true').map(node=>node.textContent),live:document.querySelector('.sr-only[role=status]').textContent}})()`);
  if (pointer.pressed.length !== 1 || pointer.pressed[0] !== "Defect" || !pointer.live.includes("Defect")) throw new Error(`touch/row double-activation regression ${JSON.stringify(pointer)}`);
  await send("Browser.close"); socket.close();
  console.log("Readiness accessibility browser checks passed: keyboard and touch activation without focus theft/double toggles, concise live status, names/descriptions, 44px targets, 320px at 200% and 400% text reflow, forced colors and zero-duration reduced-motion progress.");
} finally {
  for (const child of children.reverse()) { if (child.exitCode === null) child.kill("SIGTERM"); if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5000)]); if (child.exitCode === null) child.kill("SIGKILL"); }
  if (profile) rmSync(profile, { recursive: true, force: true });
}
