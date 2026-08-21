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
    const layout = await evaluate(`(() => {
      const scroller = document.querySelector('[data-schematic-scroll]');
      const svg = scroller.querySelector('svg');
      const targets = [...svg.querySelectorAll('[data-touch-target]')].map((node) => node.getBoundingClientRect().toJSON());
      const hitAreas = [...svg.querySelectorAll('[data-touch-target]')];
      const polygons = hitAreas.flatMap((node) => node.dataset.hitPolygons.split('|').map((polygon) => ({
        control: node.dataset.touchTarget,
        points: polygon.split(' ').map((pair) => pair.split(',').map(Number)),
      })));
      const orientation = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
      const onSegment = (a, b, p) => orientation(a, b, p) === 0 && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
      const segmentsIntersect = (a, b, c, d) => {
        const [o1, o2, o3, o4] = [orientation(a, b, c), orientation(a, b, d), orientation(c, d, a), orientation(c, d, b)];
        return (o1 !== o2 && o3 !== o4) || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
      };
      const pointInside = (point, polygon) => polygon.reduce((inside, vertex, index) => {
        const previous = polygon[(index + polygon.length - 1) % polygon.length];
        return ((vertex[1] > point[1]) !== (previous[1] > point[1]) && point[0] < (previous[0] - vertex[0]) * (point[1] - vertex[1]) / (previous[1] - vertex[1]) + vertex[0]) ? !inside : inside;
      }, false);
      const polygonsIntersect = (a, b) => a.some((point, index) => b.some((other, otherIndex) => segmentsIntersect(point, a[(index + 1) % a.length], other, b[(otherIndex + 1) % b.length]))) || pointInside(a[0], b) || pointInside(b[0], a);
      const overlappingPairs = [];
      for (let first = 0; first < polygons.length; first += 1) for (let second = first + 1; second < polygons.length; second += 1) {
        if (polygons[first].control !== polygons[second].control && polygonsIntersect(polygons[first].points, polygons[second].points)) overlappingPairs.push([polygons[first].control, polygons[second].control]);
      }
      const interactiveArtwork = [...svg.querySelectorAll('[data-control-artwork]')].filter((node) => getComputedStyle(node).pointerEvents !== 'none').map((node) => node.dataset.controlArtwork);
      const inactiveTargets = hitAreas.filter((node) => getComputedStyle(node).pointerEvents === 'none').map((node) => node.dataset.touchTarget);
      const pointerOwnershipFailures = [];
      for (const polygon of polygons) {
        const center = polygon.points.reduce((sum, point) => [sum[0] + point[0] / polygon.points.length, sum[1] + point[1] / polygon.points.length], [0, 0]);
        scroller.scrollLeft = Math.max(0, Math.min(scroller.scrollWidth - scroller.clientWidth, center[0] - scroller.clientWidth / 2));
        window.scrollTo(0, Math.max(0, svg.getBoundingClientRect().top + window.scrollY + center[1] - window.innerHeight / 2));
        const clientPoint = new DOMPoint(center[0], center[1]).matrixTransform(svg.getScreenCTM());
        const owner = document.elementFromPoint(clientPoint.x, clientPoint.y)?.closest('[data-control-id]')?.dataset.controlId;
        if (owner !== polygon.control) pointerOwnershipFailures.push({ expected: polygon.control, owner, center });
      }
      const artworkOwnershipFailures = [];
      for (const artwork of svg.querySelectorAll('[data-control-artwork]')) {
        const expected = artwork.dataset.controlArtwork;
        const length = artwork.getTotalLength();
        const samples = artwork.tagName === 'circle'
          ? [{ point: new DOMPoint(Number(artwork.getAttribute('cx')), Number(artwork.getAttribute('cy'))), fraction: 'anchor-center' }]
          : [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({ point: artwork.getPointAtLength(length * fraction), fraction }));
        for (const { point, fraction } of samples) {
          scroller.scrollLeft = Math.max(0, Math.min(scroller.scrollWidth - scroller.clientWidth, point.x - scroller.clientWidth / 2));
          window.scrollTo(0, Math.max(0, svg.getBoundingClientRect().top + window.scrollY + point.y - window.innerHeight / 2));
          const clientPoint = new DOMPoint(point.x, point.y).matrixTransform(svg.getScreenCTM());
          const owner = document.elementFromPoint(clientPoint.x, clientPoint.y)?.closest('[data-control-id]')?.dataset.controlId;
          if (owner && owner !== expected) artworkOwnershipFailures.push({ expected, owner, point: [point.x, point.y], fraction });
          if (!owner && !artwork.dataset.pointerExclusion) artworkOwnershipFailures.push({ expected, point: [point.x, point.y], fraction, missingExclusion: true });
        }
      }
      const plate = svg.querySelector('[data-yacht-plate="cruising-sloop-controls"]');
      return {
        viewport: document.documentElement.clientWidth,
        pageWidth: document.documentElement.scrollWidth,
        scroller: scroller.getBoundingClientRect().toJSON(),
        scrollWidth: scroller.scrollWidth,
        svg: svg.getBoundingClientRect().toJSON(),
        touchAction: getComputedStyle(scroller).touchAction,
        targets, overlappingPairs, interactiveArtwork, inactiveTargets, pointerOwnershipFailures, artworkOwnershipFailures, plate: plate?.getBoundingClientRect().toJSON(), embeddedTextCount: svg.querySelectorAll('text').length,
      };
    })()`);
    if (layout.pageWidth > layout.viewport || layout.scroller.left < 0 || layout.scroller.right > layout.viewport) throw new Error(`${width}px page overflow: ${JSON.stringify(layout)}`);
    if (layout.svg.width < 590 || layout.svg.height < 680 || !layout.plate || layout.plate.width < 590 || layout.plate.height < 680 || layout.embeddedTextCount !== 0) throw new Error(`${width}px illegible canvas: ${JSON.stringify(layout)}`);
    if (layout.targets.some(({ width: hitWidth, height }) => hitWidth < 44 || height < 44)) throw new Error(`${width}px undersized hit area: ${JSON.stringify(layout.targets)}`);
    if (layout.overlappingPairs.length) throw new Error(`${width}px overlapping hit areas: ${JSON.stringify(layout.overlappingPairs)}`);
    if (layout.interactiveArtwork.length) throw new Error(`${width}px crossing artwork competes for pointer input: ${JSON.stringify(layout.interactiveArtwork)}`);
    if (layout.inactiveTargets.length) throw new Error(`${width}px effective target is not pointer-interactive: ${JSON.stringify(layout.inactiveTargets)}`);
    if (layout.pointerOwnershipFailures.length) throw new Error(`${width}px pointer ownership mismatch: ${JSON.stringify(layout.pointerOwnershipFailures)}`);
    if (layout.artworkOwnershipFailures.length) throw new Error(`${width}px artwork resolves to the wrong control: ${JSON.stringify(layout.artworkOwnershipFailures)}`);
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
