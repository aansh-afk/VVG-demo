/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `pg` is loaded lazily and only when DATABASE_URL is set. Keeping it external
  // stops the bundler from trying to resolve it when it isn't installed.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
