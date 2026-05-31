/**
 * Resolve the public origin of the app for the current request.
 *
 * The OAuth redirect_uri must exactly match what is registered in Google Cloud
 * Console AND be identical between the authorize request and the token exchange.
 * Deriving it from the incoming request (rather than NEXT_PUBLIC_APP_URL) makes
 * it correct automatically on localhost, Vercel preview deployments, and
 * production — avoiding redirect_uri_mismatch from a stale env var.
 */
export function getAppOrigin(request: Request): string {
  // Vercel and most proxies set these to the real public host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }
}

export function getRedirectUri(request: Request): string {
  return `${getAppOrigin(request)}/api/auth/callback`;
}
