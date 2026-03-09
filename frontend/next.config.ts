import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── SEO: Trailing slashes for consistent URLs ───
  trailingSlash: false,

  // ─── SEO: Custom HTTP headers ───
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers (also helps SEO — Google considers HTTPS/security)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets for performance (Core Web Vitals)
        source: "/(.*)\\.(svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ─── SEO: Redirects for clean URLs ───
  async redirects() {
    return [
      {
        source: "/index",
        destination: "/",
        permanent: true,
      },
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // ─── Performance: Compress output ───
  compress: true,

  // ─── Images: Optimisation config ───
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.algoleap.com",
      },
    ],
  },

  // ─── Power console log output ───
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
