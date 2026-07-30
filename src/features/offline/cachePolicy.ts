export const shouldCacheStudyContent = (request: Pick<Request, "destination">, url: Pick<URL, "pathname">): boolean =>
  request.destination === "document"
  || request.destination === "script"
  || /\.(?:css|json|png|svg|woff2?)$/i.test(url.pathname);
