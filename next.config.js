/** @type {import('next').NextConfig} */

// The browser only ever talks to this site. /api/portal/* is forwarded to the
// API server, so the login cookie stays first-party and httpOnly.
// API_INTERNAL_URL: where this server reaches the API (Docker: http://api:5800).
const API = (process.env.API_INTERNAL_URL || "http://localhost:5800").replace(/\/+$/, "")

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: "/api/portal/:path*", destination: `${API}/api/portal/:path*` }]
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "same-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    }]
  },
}

module.exports = nextConfig
