// const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
  },
  images: {
    dangerouslyAllowSVG: false,
    domains: [
      'ipfs.io',
      'app.ebisusbay.com',
      'files.ebisusbay.com',
      'gateway.ebisusbay.com',
      'ebisusbay.mypinata.cloud',
      'res.cloudinary.com',
      'ebisusbay.imgix.net',
      'metadata.cronos.domains',
      'ik.imagekit.io',
      'cdn.ebisusbay.com',
      'cdn.ebisusbay.biz'
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
        source: '/collection/mad-treehouse',
        destination: '/collection/mm-treehouse',
        permanent: true,
      },
      {
        source: '/collection/weird-apes-club-v2',
        destination: '/collection/weird-apes-club',
        permanent: true,
      },
      {
        source: '/collection/degen-mad-meerkat',
        destination: '/collection/mad-meerkat-degen',
        permanent: true,
      },
      {
        source: '/collection/degen-mad-meerkat/:id',
        destination: '/collection/mad-meerkat-degen/:id',
        permanent: true,
      },
      {
        source: '/metaverse-auctions',
        destination: '/mad-auction',
        permanent: false,
      },
      {
        source: '/sales_bot',
        destination:
          'https://discord.com/api/oauth2/authorize?client_id=976699886890254356&permissions=269503504&scope=bot%20applications.commands',
        permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
