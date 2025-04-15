/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: [
    "passkey-kit",
    "passkey-factory-sdk",
    "passkey-kit-sdk",
    "sac-sdk",
    "@civic/auth-web3",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "**",
      },
    ],
  },
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.CIVIC_CLIENT_ID || ''
});

export default withCivicAuth(config);
