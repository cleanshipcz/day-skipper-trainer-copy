import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8"));
const serviceWorker = readFileSync("dist/sw.js", "utf8");
const topicSources = [
  "nauticalTerms", "ropework", "anchorwork", "victualling", "engine", "rig",
  "colregs", "lightsSignals", "safetyMob", "safetyFire", "safetyLifeRaft",
  "safetyFlares", "safety", "pilotage", "weather", "passagePlanning",
].map((name) => `src/data/quizzes/${name}.ts`);

const missing = topicSources.filter((source) => !manifest[source]?.isDynamicEntry);
if (missing.length) {
  throw new Error(`Quiz banks must remain independent dynamic chunks; missing: ${missing.join(", ")}`);
}

const quizPage = manifest["src/pages/Quiz.tsx"];
if (!quizPage?.isDynamicEntry) throw new Error("Quiz page must remain a lazy route.");
const bundledTopic = topicSources.find((source) => quizPage.dynamicImports?.includes(source));
if (bundledTopic) throw new Error(`Single-topic route eagerly bundles ${bundledTopic}.`);

const precachedTopic = topicSources.find((source) => serviceWorker.includes(manifest[source].file));
if (precachedTopic) {
  throw new Error(`Service-worker install precaches on-demand bank ${manifest[precachedTopic].file}.`);
}
const workboxDefine = serviceWorker.lastIndexOf('define(["./workbox-');
const factoryStart = serviceWorker.indexOf("function(", workboxDefine);
const factoryEnd = serviceWorker.lastIndexOf("});");
if (workboxDefine < 0 || factoryStart < 0 || factoryEnd < factoryStart) {
  throw new Error("Could not inspect the generated Workbox service worker.");
}
const factorySource = serviceWorker.slice(factoryStart, factoryEnd + 1);

const runtimeRoutes = [];
class StaleWhileRevalidate {
  constructor(options) {
    this.options = options;
  }
}
class NavigationRoute {
  constructor(handler) {
    this.handler = handler;
  }
}
const workbox = {
  StaleWhileRevalidate,
  NavigationRoute,
  cleanupOutdatedCaches() {},
  createHandlerBoundToURL() {},
  precacheAndRoute() {},
  registerRoute: (...args) => runtimeRoutes.push(args),
};
runInNewContext(`(${factorySource})(workbox)`, {
  workbox,
  self: { addEventListener() {}, skipWaiting() {} },
});

const quizRoute = runtimeRoutes.find(([, handler]) => handler instanceof StaleWhileRevalidate);
if (!quizRoute) throw new Error("Service worker has no StaleWhileRevalidate runtime route.");
const [matchesQuizRequest, handler, method] = quizRoute;
if (method !== "GET" || handler.options?.cacheName !== "theory-and-on-demand-quiz-content") {
  throw new Error("Quiz runtime route must cache GET requests with the intended cache.");
}
for (const source of topicSources) {
  const file = manifest[source].file;
  const matches = matchesQuizRequest({
    request: { destination: "script", method: "GET" },
    url: new URL(file, "https://trainer.example/"),
  });
  if (!matches) throw new Error(`Service-worker runtime route does not match quiz bank ${file}.`);
}

console.log(
  `Quiz chunk assertion passed: ${topicSources.length} independently lazy banks; `
  + "none loaded eagerly or install-precached; runtime caching enabled.",
);
