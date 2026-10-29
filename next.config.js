/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Older pages still carry lint errors; widen this list as they are cleaned up.
    dirs: ['src/app/politics-ledger', 'src/app/embed', 'src/app/services/politicsCurated', 'scripts'],
  },
  async redirects() {
    return [
      {
        // The prose glossary moved into the Terms tab of the merged /glossary.
        source: '/guides/glossary',
        destination: '/glossary?tab=terms',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
