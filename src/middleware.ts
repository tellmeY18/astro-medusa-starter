import { defineMiddleware } from "astro:middleware";
import { supportedCountryCodes } from "./lib/data/mock-regions";

function isStaticOrInternalPath(pathname: string) {
  if (
    pathname === "/_astro" ||
    pathname.startsWith("/_astro/") ||
    pathname === "/_image" ||
    pathname.startsWith("/_image") ||
    pathname.startsWith("/@") ||
    pathname.startsWith("/__")
  ) {
    return true;
  }
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (isStaticOrInternalPath(context.url.pathname)) {
    return next();
  }

  const method = context.request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return next();
  }

  const pathname = context.url.pathname;
  const segments = pathname.split("/");
  const firstSegment = segments[1]?.toLowerCase();

  if (supportedCountryCodes.includes(firstSegment)) {
    return next();
  }

  const defaultCode = supportedCountryCodes[0] || "us";
  const redirectPath = pathname === "/" ? "" : pathname;
  const redirectUrl = `${context.url.origin}/${defaultCode}${redirectPath}${context.url.search}`;
  return context.redirect(redirectUrl, 307);
});
