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
  // Let Chromium write diagnostics directly. Intermediary Node pipes can fill
  // when a CI log consumer applies backpressure and deadlock the browser/CDP.
  const browser = spawn(chromium, args, { stdio: ["ignore", "inherit", "inherit"] });
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
    const layout = await evaluate(`(async () => {
      const scroller = document.querySelector('[data-schematic-scroll]');
      const svg = scroller.querySelector('svg');
      const card = scroller.closest('[class*="overflow-hidden"]');
      const instructionalElements = [
        document.querySelector('[data-schematic-help]'),
        document.querySelector('[aria-label="Diagram number key"]'),
        document.querySelector('[data-schematic-hint]'),
        ...document.querySelectorAll('[aria-label="Diagram number key"] button'),
      ].filter(Boolean);
      const clippedInstructionalElements = instructionalElements.flatMap((node) => {
        const bounds = node.getBoundingClientRect();
        const cardBounds = card.getBoundingClientRect();
        const label = node.getAttribute('aria-label')
          || (node.hasAttribute('data-schematic-hint') ? 'hint' : null)
          || (node.hasAttribute('data-schematic-help') ? 'help' : null)
          || node.textContent.trim();
        return bounds.left < cardBounds.left - 1 || bounds.right > cardBounds.right + 1
          ? [{ label, bounds: bounds.toJSON(), card: cardBounds.toJSON() }]
          : [];
      });
      const targets = [...svg.querySelectorAll('[data-touch-target]')].map((node) => node.getBoundingClientRect().toJSON());
      const hitAreas = [...svg.querySelectorAll('[data-touch-target]')];
      const handles = hitAreas.map((node) => ({
        control: node.dataset.touchTarget,
        center: [Number(node.getAttribute('cx')), Number(node.getAttribute('cy'))],
        radius: Number(node.getAttribute('r')),
      }));
      const overlappingPairs = [];
      for (let first = 0; first < handles.length; first += 1) for (let second = first + 1; second < handles.length; second += 1) {
        const a = handles[first];
        const b = handles[second];
        if (Math.hypot(a.center[0] - b.center[0], a.center[1] - b.center[1]) < a.radius + b.radius) overlappingPairs.push([a.control, b.control]);
      }
      const interactiveArtwork = [...svg.querySelectorAll('[data-control-artwork]')].filter((node) => getComputedStyle(node).pointerEvents !== 'none').map((node) => node.dataset.controlArtwork);
      const inactiveTargets = hitAreas.filter((node) => getComputedStyle(node).pointerEvents === 'none').map((node) => node.dataset.touchTarget);
      const pointerOwnershipFailures = [];
      const misalignedTargets = [];
      const clickFailures = [];
      const hoverFailures = [];
      for (const handle of handles) {
        const center = handle.center;
        scroller.scrollLeft = Math.max(0, Math.min(scroller.scrollWidth - scroller.clientWidth, center[0] - scroller.clientWidth / 2));
        window.scrollTo(0, Math.max(0, svg.getBoundingClientRect().top + window.scrollY + center[1] - window.innerHeight / 2));
        const clientPoint = new DOMPoint(center[0], center[1]).matrixTransform(svg.getScreenCTM());
        const visibleMarker = svg.querySelector('[data-control-affordance="' + handle.control + '"]');
        if (!visibleMarker || Number(visibleMarker.getAttribute('cx')) !== center[0] || Number(visibleMarker.getAttribute('cy')) !== center[1]) {
          pointerOwnershipFailures.push({ expected: handle.control, owner: 'visible marker is not centered in target', center });
          continue;
        }
        const pointOwner = document.elementFromPoint(clientPoint.x, clientPoint.y);
        const owner = pointOwner?.closest('[data-control-id]')?.dataset.controlId;
        if (owner !== handle.control) pointerOwnershipFailures.push({ expected: handle.control, owner, center });
        const artwork = [...svg.querySelectorAll('[data-control-artwork="' + handle.control + '"]')].filter((node) => node.tagName.toLowerCase() === 'path');
        const closestDistance = Math.min(...artwork.flatMap((path) => {
          const length = path.getTotalLength();
          return Array.from({ length: Math.ceil(length / 2) + 1 }, (_, index) => {
            const point = path.getPointAtLength(Math.min(length, index * 2));
            return Math.hypot(point.x - center[0], point.y - center[1]);
          });
        }));
        if (closestDistance > 8) misalignedTargets.push({ control: handle.control, closestDistance });
        const target = svg.querySelector('[data-touch-target="' + handle.control + '"]');
        pointOwner?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: clientPoint.x, clientY: clientPoint.y }));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (!target.closest('[data-control-id]').getAttribute('filter')?.includes('controlGlow')) hoverFailures.push(handle.control);
        pointOwner?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: clientPoint.x, clientY: clientPoint.y }));
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const controlName = target.closest('[data-control-id]').getAttribute('aria-label').replace(/^Show /, '').replace(/ details from diagram$/, '');
        if (!document.querySelector('[data-control-details] [aria-label="Close ' + controlName + ' details"]')) clickFailures.push(handle.control);
        pointOwner?.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: clientPoint.x, clientY: clientPoint.y }));
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      const presentationFailures = [...svg.querySelectorAll('[data-control-artwork]')]
        .filter((node) => !node.dataset.pointerExclusion)
        .map((node) => node.dataset.controlArtwork);
      return {
        viewport: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        scroller: scroller.getBoundingClientRect().toJSON(),
        scrollWidth: scroller.scrollWidth,
        svg: svg.getBoundingClientRect().toJSON(),
        touchAction: getComputedStyle(scroller).touchAction,
        clippedInstructionalElements, targets, overlappingPairs, interactiveArtwork, inactiveTargets, pointerOwnershipFailures, misalignedTargets, clickFailures, hoverFailures, presentationFailures,
        embeddedKeys: [...svg.querySelectorAll('[data-control-key]')].map((node) => ({ control: node.dataset.controlKey, number: node.textContent })),
        legendNames: [...document.querySelectorAll('[aria-label="Diagram number key"] button')].map((node) => node.textContent.trim()),
      };
    })()`);
    if (layout.pageWidth > layout.viewport || layout.scroller.left < 0 || layout.scroller.right > layout.viewport) throw new Error(`${width}px page overflow: ${JSON.stringify(layout)}`);
    if (layout.clippedInstructionalElements.length) throw new Error(`${width}px teaching content clipped by diagram min-width: ${JSON.stringify(layout.clippedInstructionalElements)}`);
    if (layout.svg.width < 820 || layout.svg.height < 540) throw new Error(`${width}px illegible canvas: ${JSON.stringify(layout)}`);
    if (layout.embeddedKeys.length !== 12 || new Set(layout.embeddedKeys.map(({ number }) => number)).size !== 12 || layout.legendNames.length !== 12) throw new Error(`${width}px incomplete non-colour diagram key: ${JSON.stringify(layout)}`);
    if (layout.targets.some(({ width: hitWidth, height }) => hitWidth < 44 || height < 44)) throw new Error(`${width}px undersized hit area: ${JSON.stringify(layout.targets)}`);
    if (layout.overlappingPairs.length) throw new Error(`${width}px overlapping hit areas: ${JSON.stringify(layout.overlappingPairs)}`);
    if (layout.interactiveArtwork.length) throw new Error(`${width}px crossing artwork competes for pointer input: ${JSON.stringify(layout.interactiveArtwork)}`);
    if (layout.inactiveTargets.length) throw new Error(`${width}px effective target is not pointer-interactive: ${JSON.stringify(layout.inactiveTargets)}`);
    if (layout.pointerOwnershipFailures.length) throw new Error(`${width}px pointer ownership mismatch: ${JSON.stringify(layout.pointerOwnershipFailures)}`);
    if (layout.misalignedTargets.length) throw new Error(`${width}px hit areas do not fit their depicted controls: ${JSON.stringify(layout.misalignedTargets)}`);
    if (layout.clickFailures.length) throw new Error(`${width}px visible affordance click mismatch: ${JSON.stringify(layout.clickFailures)}`);
    if (layout.hoverFailures.length) throw new Error(`${width}px hover ownership mismatch: ${JSON.stringify(layout.hoverFailures)}`);
    if (layout.presentationFailures.length) throw new Error(`${width}px artwork lacks explicit pointer exclusion: ${JSON.stringify(layout.presentationFailures)}`);
    if (layout.touchAction !== "auto") throw new Error(`${width}px must preserve native vertical touch scrolling; touch-action=${layout.touchAction}`);
    if (width === 375 && layout.scrollWidth <= layout.scroller.width) throw new Error("375px diagram must be horizontally scrollable without shrinking the teaching plate.");

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
