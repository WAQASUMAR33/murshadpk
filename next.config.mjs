/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'murshadpk.pkstockhelper.info',
            
          },
        ],
      },
};

export default nextConfig;
