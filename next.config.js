// const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    domains: [
      'ipfs.io',
      'app.ebisusbay.com',
      'files.ebisusbay.com',
      'gateway.ebisusbay.com',
      'ebisusbay.mypinata.cloud',
      'res.cloudinary.com',
      'ebisusbay.imgix.net',
      'metadata.cronos.domains',
    ],
  },
  async redirects() {
    return [
      {
        source: '/drops/founding-member',
        destination: '/collection/founding-member',
        permanent: true,
      },
      {
        source: '/manage/auctions', // todo: remove
        destination: '/auctions',
        permanent: true,
      },
      {
        source: '/collection/mad-treehouse',
        destination: '/collection/mm-treehouse',
        permanent: true,
      },
      {
        source: '/collection/weird-apes-club-v2',
        destination: '/collection/weird-apes-club',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
