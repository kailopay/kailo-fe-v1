import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN ?? "http://localhost:8081";

// Every backend route under /auth, enumerated so the frontend can own pages
// at /auth/verify-email and /auth/reset-password (the targets of the backend's
// console-logged email links). Adding a backend auth route means adding it
// here; adding any other frontend page under /auth means keeping it out.
const backendAuthPaths = [
  "/auth/register",
  "/auth/login",
  "/auth/logout",
  "/auth/email/verify",
  "/auth/email/resend",
  "/auth/password/forgot",
  "/auth/password/reset",
  "/auth/password/change",
  "/auth/google/login",
  "/auth/google/callback",
  "/auth/me",
  "/auth/me/avatar",
] as const;

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // The backend sends no CORS headers by design. Same-origin only:
        // these paths belong to the API and must reach it before any
        // filesystem route can shadow them.
        ...backendAuthPaths.map((path) => ({
          source: path,
          destination: `${apiOrigin}${path}`,
        })),
        { source: "/v1/:path*", destination: `${apiOrigin}/v1/:path*` },
        { source: "/livez", destination: `${apiOrigin}/livez` },
        { source: "/readyz", destination: `${apiOrigin}/readyz` },
        { source: "/startupz", destination: `${apiOrigin}/startupz` },
      ],
    };
  },
};

export default nextConfig;
