/** @type {import('next').NextConfig} */
const nextConfig = {
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
