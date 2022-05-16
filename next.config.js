// const withTM = require('next-transpile-modules')(['ethers']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['ipfs.io'],
  },
};

module.exports = nextConfig;
// module.exports = nextConfig;
