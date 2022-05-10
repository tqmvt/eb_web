const withTM = require('next-transpile-modules')(['ethers']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ipfs.io"],
  },
};

module.exports = withTM(nextConfig);
// module.exports = nextConfig;
