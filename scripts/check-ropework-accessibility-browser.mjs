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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const result = await callback();
      if (result) return result;
    } catch { /* page starting */ }
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
const children = [];
let profile;

try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "ropework-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/ropework`)).ok, "preview");

  const browserArgs = ["--headless=new", "--disable-gpu", "--disable-dev-shm-usage", "--disable-service-worker", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") browserArgs.unshift("--no-sandbox");
  const browser = spawn(chromium, browserArgs, { stdio: ["ignore", "inherit", "inherit"] });
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
  const key = async (keyValue) => {
    const code = keyValue === " " ? "Space" : keyValue;
    const virtualKeyCode = keyValue === "Enter" ? 13 : keyValue === " " ? 32 : 9;
    const event = { key: keyValue, code, windowsVirtualKeyCode: virtualKeyCode, nativeVirtualKeyCode: virtualKeyCode };
    await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...event });
    if (keyValue === " " || keyValue === "Enter") {
      const text = keyValue === "Enter" ? "\r" : " ";
      await send("Input.dispatchKeyEvent", { type: "char", ...event, text, unmodifiedText: text });
    }
    await send("Input.dispatchKeyEvent", { type: "keyUp", ...event });
    await delay(40);
  };

  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/ropework` });
  await waitFor(() => evaluate("document.querySelectorAll('button[aria-pressed]').length === 7"), "knot cards");

  const semantics = await evaluate(`(() => {
    const cards = [...document.querySelectorAll('button[aria-pressed]')];
    const first = cards[0];
    return {
      count: cards.length,
      name: document.getElementById(first.getAttribute('aria-labelledby')).textContent,
      description: first.getAttribute('aria-describedby').split(' ').map((id) => document.getElementById(id).textContent.trim()),
      headings: document.querySelectorAll('h3[id$="-name"]').length,
      buttonChildren: first.children.length,
      selected: first.getAttribute('aria-pressed'),
      backName: document.querySelector('header button').getAttribute('aria-label'),
    };
  })()`);
  if (semantics.count !== 7 || semantics.name !== "Bowline" || semantics.description.at(-1) !== "Not learned" || semantics.headings !== 7 || semantics.buttonChildren !== 0 || semantics.selected !== "false" || semantics.backName !== "Back to Home") {
    throw new Error(`Initial ropework semantics missing: ${JSON.stringify(semantics)}`);
  }

  const expectedRopes = { "bowline": 1, "clove-hitch": 1, "reef-knot": 2, "figure-eight": 1, "round-turn": 1, "sheet-bend": 2, "rolling-hitch": 2 };
  for (const [knotId, ropeCount] of Object.entries(expectedRopes)) {
    await evaluate(`document.querySelector('button[aria-labelledby="${knotId}-name"]').click()`);
    await waitFor(() => evaluate(`document.querySelector('figure[data-knot-diagram="${knotId}"]') !== null`), `${knotId} diagram`);
    const diagram = await evaluate(`(() => { const figure = document.querySelector('figure[data-knot-diagram="${knotId}"]'); const svg = figure.querySelector('svg'); return { ropes: svg.querySelectorAll('[data-rope-path=continuous]').length, bridges: svg.querySelectorAll('[data-crossing-bridge]').length, name: svg.getAttribute('aria-label'), labels: svg.textContent }; })()`);
    if (diagram.ropes !== ropeCount || diagram.bridges < 1 || !diagram.name.includes("final-form diagram") || !diagram.labels.includes("working end") || !diagram.labels.includes("standing part / load")) {
      throw new Error(`${knotId} topology/accessibility metadata failed: ${JSON.stringify(diagram)}`);
    }
    await waitFor(() => evaluate("!document.querySelector('button[aria-pressed]').disabled"), `${knotId} save`);
  }
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/ropework` });
  await waitFor(() => evaluate("document.querySelectorAll('button[aria-pressed]').length === 7"), "reset knot cards");

  await key("Tab");
  await key("Tab");
  const firstFocus = await evaluate(`(() => {
    const active = document.activeElement;
    return { name: document.getElementById(active.getAttribute('aria-labelledby')).textContent, shadow: getComputedStyle(active).boxShadow };
  })()`);
  if (firstFocus.name !== "Bowline" || firstFocus.shadow === "none") throw new Error(`First card focus is not visible: ${JSON.stringify(firstFocus)}`);
  await key("Enter");
  try {
    await waitFor(() => evaluate("document.activeElement.textContent.trim() === 'Bowline details'"), "Bowline details focus");
  } catch (error) {
    const state = await evaluate("({ active: document.activeElement.outerHTML, pressed: document.querySelector('button[aria-labelledby=bowline-name]').getAttribute('aria-pressed') })");
    throw new Error(`${error.message}: ${JSON.stringify(state)}`);
  }
  for (const width of [375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    const layout = await evaluate(`(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      diagramWidth: document.querySelector('figure svg')?.getBoundingClientRect().width ?? 0,
      viewport: document.documentElement.clientWidth,
    }))()`);
    if (layout.overflow || layout.diagramWidth <= 0 || layout.diagramWidth > layout.viewport) {
      throw new Error(`Ropework diagram layout failed at ${width}px: ${JSON.stringify(layout)}`);
    }
  }
  await send("Emulation.clearDeviceMetricsOverride");
  await key("Tab");
  await key("Tab");
  if (!await evaluate("document.activeElement.textContent.includes('Back to Bowline in knot list')")) throw new Error("Details controls are not in predictable order.");
  await key("Enter");
  if (!await evaluate("document.activeElement.getAttribute('aria-labelledby') === 'bowline-name'")) throw new Error("Back did not restore Bowline card focus.");
  await key("Tab");
  await key(" ");
  await waitFor(() => evaluate("document.activeElement.textContent.trim() === 'Clove Hitch details'"), "Clove Hitch details focus");

  for (let cardIndex = 1; cardIndex < 7; cardIndex += 1) {
    await key("Tab");
    await key("Tab");
    await key("Enter");
    if (cardIndex < 6) {
      await key("Tab");
      await key(" ");
    }
  }
  await key("Tab");
  await key("Tab");
  await key("Tab");

  const completion = await evaluate(`(() => ({
    active: document.activeElement.textContent.trim(),
    selected: document.querySelectorAll('button[aria-pressed="true"]').length,
    learned: [...document.querySelectorAll('[id$="-state"]')].filter((node) => node.textContent.trim() === 'Learned').length,
    status: document.querySelector('[role=status]').textContent.trim(),
  }))()`);
  if (completion.active !== "Take Quiz" || completion.selected !== 1 || completion.learned !== 7 || !completion.status.includes("All 7 knots learned")) {
    throw new Error(`Completion keyboard path failed: ${JSON.stringify(completion)}`);
  }

  await send("Browser.close");
  socket.close();
  console.log("Ropework browser accessibility passed: all seven diagram topologies, 375/768/1280 layouts, native semantics, keyboard focus, Enter/Space activation, announcements, and completion CTA order.");
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null) child.kill("SIGTERM");
    if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
