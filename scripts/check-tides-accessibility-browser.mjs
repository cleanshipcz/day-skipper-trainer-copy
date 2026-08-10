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
]
  .filter(Boolean)
  .find(existsSync);
if (!chromium) throw new Error("Chromium not found. Set CHROMIUM_PATH.");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (callback, label) => {
  for (let attempt = 0; attempt < 300; attempt += 1) {
    try {
      const result = await callback();
      if (result) return result;
    } catch {
      /* page starting */
    }
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
  const build = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "build"],
    { stdio: "inherit", env },
  );
  if ((await once(build, "exit"))[0] !== 0)
    throw new Error("Vite build failed.");
  profile = mkdtempSync(join(tmpdir(), "tides-accessibility-browser-"));
  const preview = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    { stdio: "inherit", env },
  );
  children.push(preview);
  await waitFor(
    async () =>
      (await fetch(`http://127.0.0.1:${port}/navigation/tides/theory`)).ok,
    "preview",
  );
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-service-worker",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "about:blank",
  ];
  if (process.env.CHROMIUM_NO_SANDBOX === "1") args.unshift("--no-sandbox");
  const browser = spawn(chromium, args, {
    stdio: ["ignore", "inherit", "inherit"],
  });
  children.push(browser);
  const debuggingPort = await waitFor(() => {
    const path = join(profile, "DevToolsActivePort");
    return existsSync(path)
      ? Number(readFileSync(path, "utf8").split(/\r?\n/, 1)[0])
      : null;
  }, "debugging port");
  const target = await waitFor(
    async () =>
      (
        await (await fetch(`http://127.0.0.1:${debuggingPort}/json`)).json()
      ).find(({ type }) => type === "page"),
    "page target",
  );
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, "open");
  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const callback = pending.get(message.id);
    pending.delete(message.id);
    message.error
      ? callback.reject(new Error(message.error.message))
      : callback.resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const commandId = ++id;
      pending.set(commandId, { resolve, reject });
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", {
    url: `http://127.0.0.1:${port}/navigation/tides/theory`,
  });
  await waitFor(
    () =>
      evaluate(
        "document.querySelector('button[aria-label=\"Back to Tides\"]') !== null",
      ),
    "tides lesson",
  );

  const semantics = await evaluate(`(() => ({
    back: document.querySelector('button[aria-label="Back to Tides"]')?.ariaLabel,
    bulges: document.querySelector('[role=img][aria-label*="far-side tidal bulge"]')?.ariaLabel,
    amphidromic: document.querySelector('figcaption')?.textContent,
    completion: document.querySelector('button[aria-describedby="completion-status"]')?.disabled,
    status: document.getElementById('completion-status')?.getAttribute('aria-live'),
    touch: [...document.querySelectorAll('label')].every((node) => node.getBoundingClientRect().height >= 44)
  }))()`);
  if (
    semantics.back !== "Back to Tides" ||
    !semantics.bulges ||
    !/co-tidal lines/i.test(semantics.amphidromic) ||
    !/co-range contours/i.test(semantics.amphidromic) ||
    semantics.completion !== true ||
    semantics.status !== "polite" ||
    !semantics.touch
  )
    throw new Error(`Tides semantics failed: ${JSON.stringify(semantics)}`);

  for (const [width, textZoom] of [
    [320, 100],
    [375, 100],
    [375, 200],
    [768, 100],
    [1280, 100],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width <= 375,
    });
    await evaluate(`document.documentElement.style.fontSize = '${textZoom}%'`);
    const layout = await evaluate(
      `(() => { const viewport = document.documentElement.clientWidth; const header = document.querySelector('header').getBoundingClientRect(); const button = document.querySelector('header button[aria-describedby]').getBoundingClientRect(); const offenders = [...document.querySelectorAll('main, main *, header, header *')].filter((node) => node.getBoundingClientRect().right > viewport + 1 || node.getBoundingClientRect().left < -1).slice(0, 5).map((node) => ({ tag: node.tagName, className: String(node.className), right: node.getBoundingClientRect().right, text: node.textContent?.slice(0, 30) })); return { overflow: offenders.length > 0, viewport, headerRight: header.right, buttonRight: button.right, buttonBottom: button.bottom, headerBottom: header.bottom, offenders }; })()`,
    );
    if (
      layout.overflow ||
      layout.headerRight > layout.viewport + 1 ||
      layout.buttonRight > layout.viewport + 1 ||
      layout.buttonBottom > layout.headerBottom + 1
    )
      throw new Error(
        `Tides layout failed at ${width}px/${textZoom}% text: ${JSON.stringify(layout)}`,
      );
  }
  await evaluate(
    "document.documentElement.style.fontSize='100%'; document.activeElement.blur()",
  );
  await send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  const focus = await evaluate(
    `(() => ({ name: document.activeElement?.ariaLabel, ring: getComputedStyle(document.activeElement).boxShadow }))()`,
  );
  if (focus.name !== "Back to Tides" || focus.ring === "none")
    throw new Error(`Back focus failed: ${JSON.stringify(focus)}`);
  const normalAnimations = await evaluate(
    "[...document.querySelectorAll('main *')].filter((node) => getComputedStyle(node).animationName !== 'none').length",
  );
  if (normalAnimations !== 0)
    throw new Error(
      `Unexpected page animation without a reduced-motion preference: ${normalAnimations}`,
    );
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-reduced-motion", value: "reduce" },
      { name: "forced-colors", value: "active" },
    ],
  });
  const media = await evaluate(
    `(() => { const svg = document.querySelector('svg[role=img]'); const sea = getComputedStyle(svg.querySelector('rect')); const land = getComputedStyle(svg.querySelector('path[stroke="#78716c"]')); const range = getComputedStyle(svg.querySelector('g[stroke="#ea580c"]')); const phase = getComputedStyle(svg.querySelector('g[stroke="#0369a1"]')); return { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, forced: matchMedia('(forced-colors: active)').matches, animations: [...document.querySelectorAll('main *')].filter((node) => getComputedStyle(node).animationName !== 'none').length, adjustment: getComputedStyle(svg).forcedColorAdjust, sea: sea.fill, landStroke: land.stroke, range: range.stroke, rangeDash: range.strokeDasharray, phase: phase.stroke, phaseDash: phase.strokeDasharray }; })()`,
  );
  if (
    !media.reduced ||
    !media.forced ||
    media.animations !== 0 ||
    media.adjustment === "none" ||
    media.sea === media.landStroke ||
    media.rangeDash === media.phaseDash
  )
    throw new Error(`Computed media styles failed: ${JSON.stringify(media)}`);

  // Calculating Tidal Heights has its own dense publication table, curve,
  // formulae and two-direction check. Exercise it in Chromium rather than
  // relying on utility-class assertions in the component suite.
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "forced-colors", value: "none" }],
  });
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", {
    url: `http://127.0.0.1:${port}/navigation/tides/heights-theory`,
  });
  await waitFor(
    () =>
      evaluate(
        "document.querySelector('button[aria-label=\"Back to Tides overview\"]') !== null",
      ),
    "tidal heights lesson",
  );
  const heightsSemantics = await evaluate(`(() => ({
    back: document.querySelector('button[aria-label="Back to Tides overview"]')?.ariaLabel,
    figure: document.querySelector('figure > figcaption')?.textContent,
    curve: document.querySelector('figure svg[role=img]')?.getAttribute('aria-labelledby'),
    curveDescription: document.querySelector('figure svg desc')?.textContent,
    structuredEquivalent: [...document.querySelectorAll('figure dl dt')].map((node) => node.textContent),
    ruleCaption: [...document.querySelectorAll('table caption')].find((node) => /share of total range/i.test(node.textContent))?.textContent,
    rowHeaders: [...document.querySelectorAll('table th[scope=row]')].length,
    liveChecks: [...document.querySelectorAll('fieldset p[role=status][aria-live=polite]')].length,
    completionLive: document.querySelector('header p[role=status]')?.getAttribute('aria-live')
  }))()`);
  if (
    heightsSemantics.back !== "Back to Tides overview" ||
    !/solid blue curve.*dashed green/i.test(heightsSemantics.figure) ||
    !heightsSemantics.curve ||
    !/solid curve.*Dashed construction lines/i.test(
      heightsSemantics.curveDescription,
    ) ||
    heightsSemantics.structuredEquivalent.join("|") !==
      "Start event|Lookup|Result|End event" ||
    !heightsSemantics.ruleCaption ||
    heightsSemantics.rowHeaders < 3 ||
    heightsSemantics.completionLive !== "polite"
  )
    throw new Error(
      `Tidal heights semantics failed: ${JSON.stringify(heightsSemantics)}`,
    );

  for (const [width, textZoom] of [
    [320, 100],
    [375, 100],
    [375, 200],
    [768, 100],
    [1280, 100],
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: width <= 375,
    });
    await evaluate(`document.documentElement.style.fontSize = '${textZoom}%'`);
    const layout = await evaluate(`(() => {
      const viewport = document.documentElement.clientWidth;
      const header = document.querySelector('header').getBoundingClientRect();
      const heading = document.querySelector('h1').getBoundingClientRect();
      const back = document.querySelector('button[aria-label="Back to Tides overview"]').getBoundingClientRect();
      const completion = document.querySelector('header button:not([aria-label])').getBoundingClientRect();
      const labels = [...document.querySelectorAll('fieldset label')].map((node) => node.getBoundingClientRect());
      const offenders = [...document.querySelectorAll('main, main *')].filter((node) => node.getBoundingClientRect().right > viewport + 1 && !node.closest('.overflow-x-auto')).slice(0, 8).map((node) => ({ tag: node.tagName, className: String(node.className), right: node.getBoundingClientRect().right, width: node.getBoundingClientRect().width, text: node.textContent?.trim().slice(0, 35) }));
      return { viewport, documentWidth: document.documentElement.scrollWidth, headerRight: header.right, headingRight: heading.right, back: { width: back.width, height: back.height, right: back.right, bottom: back.bottom }, completion: { width: completion.width, height: completion.height, right: completion.right, bottom: completion.bottom }, headerBottom: header.bottom, touch: labels.every((box) => box.height >= 44 && box.width >= 44), offenders };
    })()`);
    if (
      layout.documentWidth > layout.viewport + 1 ||
      layout.headerRight > layout.viewport + 1 ||
      layout.headingRight > layout.viewport + 1 ||
      layout.back.width < 44 ||
      layout.back.height < 44 ||
      layout.completion.width < 44 ||
      layout.completion.height < 44 ||
      layout.completion.right > layout.viewport + 1 ||
      layout.completion.bottom > layout.headerBottom + 1 ||
      !layout.touch
    )
      throw new Error(
        `Tidal heights layout failed at ${width}px/${textZoom}% text: ${JSON.stringify(layout)}`,
      );
  }

  await send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 900,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await evaluate(
    "document.documentElement.style.fontSize='100%'; document.activeElement.blur()",
  );
  await send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
  });
  const heightsFocus = await evaluate(
    `(() => ({ name: document.activeElement?.ariaLabel, ring: getComputedStyle(document.activeElement).boxShadow }))()`,
  );
  if (
    heightsFocus.name !== "Back to Tides overview" ||
    heightsFocus.ring === "none"
  )
    throw new Error(
      `Tidal heights Back focus failed: ${JSON.stringify(heightsFocus)}`,
    );
  await evaluate("document.querySelector('input[name=height-check]').focus()");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: " ",
    code: "Space",
    text: " ",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  });
  await evaluate("document.querySelector('input[name=time-check]').focus()");
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: " ",
    code: "Space",
    text: " ",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: " ",
    code: "Space",
    windowsVirtualKeyCode: 32,
    nativeVirtualKeyCode: 32,
  });
  const keyboardChecks = await evaluate(
    `(() => ({ height: document.querySelector('input[name=height-check]')?.checked, time: document.querySelector('input[name=time-check]')?.checked, feedback: [...document.querySelectorAll('fieldset p[role=status]')].map((node) => node.textContent) }))()`,
  );
  if (
    !keyboardChecks.height ||
    !keyboardChecks.time ||
    keyboardChecks.feedback.length !== 2 ||
    !keyboardChecks.feedback.every((copy) => /^Correct/.test(copy))
  )
    throw new Error(
      `Tidal heights keyboard checks failed: ${JSON.stringify(keyboardChecks)}`,
    );

  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "forced-colors", value: "active" }],
  });
  const heightsForcedColours = await evaluate(
    `(() => { const svg = document.querySelector('figure svg'); const curve = svg.querySelector('path[fill=none]'); const construction = svg.querySelector('line[stroke="#047857"]'); return { active: matchMedia('(forced-colors: active)').matches, adjustment: getComputedStyle(svg).forcedColorAdjust, curveWidth: getComputedStyle(curve).strokeWidth, constructionDash: getComputedStyle(construction).strokeDasharray, figureVisible: svg.getBoundingClientRect().width > 0 && svg.getBoundingClientRect().height > 0 }; })()`,
  );
  if (
    !heightsForcedColours.active ||
    heightsForcedColours.adjustment === "none" ||
    heightsForcedColours.curveWidth === "0px" ||
    heightsForcedColours.constructionDash === "none" ||
    !heightsForcedColours.figureVisible
  )
    throw new Error(
      `Tidal heights forced colours failed: ${JSON.stringify(heightsForcedColours)}`,
    );

  // The passage planner combines a calculator, a locked practice attempt,
  // graphical/text-equivalent results, and durable completion evidence.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "none" }] });
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/tides/heights-calc` });
  await waitFor(() => evaluate("document.querySelector('button[aria-label=\"Back to Tides\"]') !== null"), "tidal passage planner");
  const plannerSemantics = await evaluate(`(() => {
    const answer = [...document.querySelectorAll('input')].find((node) => node.labels?.[0]?.textContent.includes('Required height of tide'));
    const chart = document.querySelector('svg[role=img]');
    const table = [...document.querySelectorAll('table')].find((node) => /Text alternative/.test(node.caption?.textContent));
    const charted = document.getElementById('chartedDepth');
    return { back: document.querySelector('button[aria-label="Back to Tides"]')?.ariaLabel, answerName: answer?.labels?.[0]?.textContent, answerDescription: answer?.getAttribute('aria-describedby'), chartName: chart?.querySelector('title')?.textContent, chartDescription: chart?.querySelector('desc')?.textContent, tableRows: table?.querySelectorAll('th[scope=row]').length, signedHint: charted?.getAttribute('aria-describedby'), touch: [...document.querySelectorAll('button')].every((node) => node.getBoundingClientRect().height >= 44) };
  })()`);
  if (plannerSemantics.back !== "Back to Tides" || !/Required height/.test(plannerSemantics.answerName) || !plannerSemantics.answerDescription || !/Predicted tidal height/.test(plannerSemantics.chartName) || !/Safe intervals/.test(plannerSemantics.chartDescription) || plannerSemantics.tableRows !== 3 || !plannerSemantics.signedHint?.includes("charted-value-hint") || !plannerSemantics.touch) throw new Error(`Planner semantics failed: ${JSON.stringify(plannerSemantics)}`);

  for (const [width, textZoom] of [[320, 100], [375, 100], [375, 200], [768, 100], [1280, 100]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width <= 375 });
    await evaluate(`document.documentElement.style.fontSize='${textZoom}%'`);
    const layout = await evaluate(`(() => { const viewport=document.documentElement.clientWidth; const offenders=[...document.querySelectorAll('main, main > *, header, header *')].filter((node) => { const box=node.getBoundingClientRect(); return box.right>viewport+1 || box.left < -1; }).map((node)=>({tag:node.tagName,right:node.getBoundingClientRect().right})); return { viewport, scrollWidth: document.documentElement.scrollWidth, offenders }; })()`);
    if (layout.scrollWidth > layout.viewport + 1 || layout.offenders.length) throw new Error(`Planner layout failed at ${width}px/${textZoom}%: ${JSON.stringify(layout)}`);
  }
  await evaluate(`document.documentElement.style.fontSize='100%'; (() => { const input=[...document.querySelectorAll('input')].find((node)=>node.labels?.[0]?.textContent.includes('Required height of tide')); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '1.8'); input.dispatchEvent(new Event('input',{bubbles:true})); input.focus(); })()`);
  await waitFor(() => evaluate("[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Check answer'))?.disabled === false"), "enabled practice check");
  const keyboardTarget = await evaluate(`(() => { const button=[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Check answer')); button.focus(); return { name:button.textContent.trim(), focused:document.activeElement===button, ring:getComputedStyle(button).boxShadow, outline:getComputedStyle(button).outlineStyle }; })()`);
  if (!keyboardTarget.focused || keyboardTarget.name !== "Check answer") throw new Error(`Planner keyboard focus failed: ${JSON.stringify(keyboardTarget)}`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " ", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
  await waitFor(() => evaluate("[...document.querySelectorAll('[role=status]')].some((node)=>node.textContent.includes('Correct'))"), "keyboard practice feedback");
  const locked = await evaluate(`(() => { const input=[...document.querySelectorAll('input')].find((node)=>node.labels?.[0]?.textContent.includes('Required height of tide')); return { locked: input.closest('fieldset').disabled, feedback: [...document.querySelectorAll('[role=status]')].some((node)=>/margin is 0.6 m.*positive margin/i.test(node.textContent)), stayed: location.pathname === '/navigation/tides/heights-calc' }; })()`);
  if (!locked.locked || !locked.feedback || !locked.stayed) throw new Error(`Planner keyboard/lock failed: ${JSON.stringify(locked)}`);

  // Complete the second evidence step, then deny the anonymous durable store
  // exactly at completion time. This is a deterministic failure seam: the
  // control must remain on this route and expose an operable retry state.
  await evaluate(`(() => { const radio=[...document.querySelectorAll('input[type=radio]')].find((node)=>node.parentElement?.textContent.includes('Charted depth + predicted tide')); radio.click(); })()`);
  await waitFor(() => evaluate("[...document.querySelectorAll('button')].some((node)=>node.textContent.trim()==='Save completion' && !node.disabled)"), "enabled planner completion");
  await evaluate(`(() => { window.__plannerOriginalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('Storage denied for completion audit', 'QuotaExceededError'); }; const button=[...document.querySelectorAll('button')].find((node)=>node.textContent.trim()==='Save completion'); button.focus(); })()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", text: " ", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
  await waitFor(() => evaluate("[...document.querySelectorAll('button')].some((node)=>node.textContent.trim()==='Retry completion')"), "planner completion retry");
  const completionFailure = await evaluate(`(() => { const retry=[...document.querySelectorAll('button')].find((node)=>node.textContent.trim()==='Retry completion'); const status=retry.parentElement.querySelector('[role=status]'); return { retryEnabled: !retry.disabled, status: status?.textContent, live: status?.getAttribute('aria-live'), stayed: location.pathname === '/navigation/tides/heights-calc', focusedName: document.activeElement?.textContent?.trim() }; })()`);
  if (!completionFailure.retryEnabled || completionFailure.live !== "polite" || !/Completion was not saved.*retry/i.test(completionFailure.status) || !completionFailure.stayed) throw new Error(`Planner completion failure contract failed: ${JSON.stringify(completionFailure)}`);
  await evaluate("Storage.prototype.setItem = window.__plannerOriginalSetItem; delete window.__plannerOriginalSetItem");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
  const plannerForced = await evaluate(`(() => { const svg=document.querySelector('svg[role=img]'); const curve=svg.querySelector('path'); return { active:matchMedia('(forced-colors: active)').matches, visible:svg.getBoundingClientRect().width>0, curveWidth:getComputedStyle(curve).strokeWidth, textAlternative:document.querySelector('table caption')?.textContent }; })()`);
  if (!plannerForced.active || !plannerForced.visible || plannerForced.curveWidth === "0px" || !/Text alternative/.test(plannerForced.textAlternative)) throw new Error(`Planner forced colours failed: ${JSON.stringify(plannerForced)}`);

  // Course to Steer is a dense, sticky lesson. Verify its non-colour vector
  // equivalent, keyboard evidence/focus handoff, responsive controls and
  // shared durable completion contract in the real browser.
  await send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "none" }] });
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/navigation/tides/streams-theory` });
  await waitFor(() => evaluate("document.getElementById('cts-diagram-title') !== null"), "course-to-steer lesson");
  const ctsSemantics = await evaluate(`(() => ({ back:document.querySelector('header button')?.ariaLabel, description:document.getElementById('cts-diagram-desc')?.textContent, caption:document.querySelector('table caption')?.textContent, rows:document.querySelectorAll('table th[scope=row]').length, completion:[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Complete the readiness check'))?.disabled, touch:[...document.querySelectorAll('label')].every((node)=>node.getBoundingClientRect().height>=44) }))()`);
  if (ctsSemantics.back !== "Back to tides menu" || !/071 degrees true/.test(ctsSemantics.description) || !/solid through-water.*dotted stream.*dashed ground track/i.test(ctsSemantics.caption) || ctsSemantics.rows !== 3 || ctsSemantics.completion !== true || !ctsSemantics.touch) throw new Error(`Course-to-steer semantics failed: ${JSON.stringify(ctsSemantics)}`);
  for (const [width, textZoom] of [[320,100],[375,200],[768,100],[1280,100]]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height:900, deviceScaleFactor:1, mobile:width<=375 });
    await evaluate(`document.documentElement.style.fontSize='${textZoom}%'`);
    const layout = await evaluate(`(() => ({ viewport:document.documentElement.clientWidth, scrollWidth:document.documentElement.scrollWidth, header:document.querySelector('header').getBoundingClientRect().right, action:[...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Open Vector Solution Tool')).getBoundingClientRect().right }))()`);
    if (layout.scrollWidth > layout.viewport + 1 || layout.header > layout.viewport + 1 || layout.action > layout.viewport + 1) throw new Error(`Course-to-steer layout failed at ${width}px/${textZoom}%: ${JSON.stringify(layout)}`);
  }
  await evaluate(`document.documentElement.style.fontSize='100%'; document.querySelector('input[value="071"]').focus()`);
  await send("Input.dispatchKeyEvent", { type:"keyDown", key:" ", code:"Space", text:" ", windowsVirtualKeyCode:32, nativeVirtualKeyCode:32 });
  await send("Input.dispatchKeyEvent", { type:"keyUp", key:" ", code:"Space", windowsVirtualKeyCode:32, nativeVirtualKeyCode:32 });
  await waitFor(() => evaluate("document.activeElement?.getAttribute('aria-label') === 'Readiness feedback'"), "course-to-steer feedback focus");
  const ctsKeyboard = await evaluate(`(() => ({ checked:document.querySelector('input[value="071"]').checked, enabled:![...document.querySelectorAll('button')].find((node)=>node.textContent.includes('Open Vector Solution Tool')).disabled, save:[...document.querySelectorAll('button')].some((node)=>node.textContent.trim()==='Save completion'), live:document.activeElement?.getAttribute('aria-live') }))()`);
  if (!ctsKeyboard.checked || !ctsKeyboard.enabled || !ctsKeyboard.save || ctsKeyboard.live !== "polite") throw new Error(`Course-to-steer keyboard/completion failed: ${JSON.stringify(ctsKeyboard)}`);
  await send("Emulation.setEmulatedMedia", { features: [{ name:"forced-colors", value:"active" }] });
  const ctsForced = await evaluate(`(() => { const paths=[...document.querySelectorAll('svg[role=img] path[stroke-dasharray]')]; return { active:matchMedia('(forced-colors: active)').matches, styles:new Set(paths.map((path)=>getComputedStyle(path).strokeDasharray)).size, table:document.querySelectorAll('table th[scope=row]').length, visible:document.querySelector('svg[role=img]').getBoundingClientRect().width>0 }; })()`);
  if (!ctsForced.active || ctsForced.styles < 2 || ctsForced.table !== 3 || !ctsForced.visible) throw new Error(`Course-to-steer forced colours failed: ${JSON.stringify(ctsForced)}`);
  await send("Browser.close");
  socket.close();
  console.log(
    "Tides browser accessibility passed for theory, heights, passage planning and Course to Steer: semantics, keyboard focus and evidence, shared completion, touch targets, forced colours, structured alternatives, 320/375/768/1280 layouts and 200% text. Residual manual checks remain for platform screen-reader speech and OS-specific 400% browser chrome.",
  );
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null) child.kill("SIGTERM");
    if (child.exitCode === null)
      await Promise.race([once(child, "exit"), delay(5_000)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  if (profile)
    rmSync(profile, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 100,
    });
}
