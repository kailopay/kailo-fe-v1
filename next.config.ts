import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // The backend sends no CORS headers by design. Same-origin only:
        // /auth, /v1, and health paths belong to the API and must reach it
        // before any filesystem route can shadow them.
        { source: "/auth/:path*", destination: `${apiOrigin}/auth/:path*` },
        { source: "/v1/:path*", destination: `${apiOrigin}/v1/:path*` },
        { source: "/livez", destination: `${apiOrigin}/livez` },
        { source: "/readyz", destination: `${apiOrigin}/readyz` },
        { source: "/startupz", destination: `${apiOrigin}/startupz` },
      ],
    };
  },
};

export default nextConfig;
