const { withMiddleware } = require("@cxnpl/next-app-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/js",
};

module.exports = withMiddleware(nextConfig);
