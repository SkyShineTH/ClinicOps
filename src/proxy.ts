import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);

function getRequestId(request: NextRequest) {
  const existingRequestId = request.headers.get("x-request-id")?.trim();
  if (existingRequestId) return existingRequestId.slice(0, 128);

  const vercelRequestId = request.headers.get("x-vercel-id")?.trim();
  if (vercelRequestId) return vercelRequestId.slice(0, 128);

  return crypto.randomUUID();
}

function logApiRequest(request: NextRequest, requestId: string) {
  console.log(
    JSON.stringify({
      event: "api_request",
      method: request.method,
      path: request.nextUrl.pathname,
      requestId,
      timestamp: new Date().toISOString(),
    }),
  );
}

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const requestId = getRequestId(request);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("x-request-id", requestId);
    logApiRequest(request, requestId);

    return response;
  }

  return intlProxy(request);
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|_vercel|app|.*\\..*).*)"],
};
