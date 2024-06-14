const { withMiddleware } = require("@cxnpl/next-app-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  basePath: "/js",
};

module.exports = withMiddleware(nextConfig);
