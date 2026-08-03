import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const chromium = [process.env.CHROMIUM_PATH, "/home/openclaw/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome", "/usr/bin/chromium"]
  .filter(Boolean).find(existsSync);
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
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});
const env = { ...process.env, VITE_SUPABASE_URL: "http://127.0.0.1:54321", VITE_SUPABASE_PUBLISHABLE_KEY: "browser-characterization-placeholder" };
const children = [];
let profile;

try {
  const build = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "build"], { stdio: "inherit", env });
  if ((await once(build, "exit"))[0] !== 0) throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "quiz-accessibility-browser-"));
  const preview = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "inherit", env });
  children.push(preview);
  await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/quiz/nautical-terms-quiz`)).ok, "preview");

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
  await send("Runtime.enable");
  await send("Page.enable");

  for (const width of [320, 375, 768, 1280]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width <= 375 });
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/quiz/nautical-terms-quiz` });
    await waitFor(() => evaluate("document.querySelectorAll('input[type=radio]').length > 1"), `${width}px quiz`);
    const layout = await evaluate(`(() => {
      document.documentElement.style.fontSize = '${width === 320 ? 32 : 16}px';
      const long = 'Exceptionallylonglocalizedcontent'.repeat(8);
      document.querySelector('h3').textContent = long;
      document.querySelector('label span').textContent = long;
      return {
        viewport: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        radios: document.querySelectorAll('input[type=radio]').length,
        backName: document.querySelector('header button').getAttribute('aria-label'),
        progressText: document.querySelector('[role=progressbar]').getAttribute('aria-valuetext'),
      };
    })()`);
    if (layout.pageWidth > layout.viewport) throw new Error(`${width}px quiz overflow: ${JSON.stringify(layout)}`);
    if (layout.radios < 2 || !layout.backName.startsWith("Back to home from ") || !layout.progressText.startsWith("Question 1 of ")) throw new Error(`${width}px semantics missing: ${JSON.stringify(layout)}`);
  }

  await send("Emulation.setEmulatedMedia", { media: "screen", features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await evaluate("document.querySelector('input[type=radio]').click()");
  await delay(100);
  await evaluate("[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Submit Answer')).click()");
  await delay(100);
  const motion = await evaluate(`(() => {
    const label = document.querySelector('input[type=radio]').closest('label');
    const status = document.querySelector('[role=status]');
    return { labelTransition: getComputedStyle(label).transitionProperty, statusAnimation: status && getComputedStyle(status).animationName, statusCount: document.querySelectorAll('[role=status]').length };
  })()`);
  if (motion.labelTransition !== "none" || !["none", null].includes(motion.statusAnimation) || motion.statusCount !== 1) throw new Error(`Reduced-motion/feedback failure: ${JSON.stringify(motion)}`);

  await send("Browser.close");
  socket.close();
  console.log("Quiz browser accessibility passed at 320px, 375px, 768px, 1280px, large text, and reduced motion.");
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null) child.kill("SIGTERM");
    if (child.exitCode === null) await Promise.race([once(child, "exit"), delay(5_000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
