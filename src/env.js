import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CIVIC_CLIENT_ID: z.string().min(1),
    // Twilio (optional for SMS)
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_PHONE_NUMBER: z.string().optional(),
    // Make all other variables optional
    ANCHOR_API_BASE_URL: z.string().url().optional(),
    ANCHOR_API_TOKEN: z.string().optional(),
    ESCROW_CONTRACT_ADDRESS: z.string().optional(),
    RPC_URL: z.string().url().optional(),
    druid_DISTRIBUTOR_PUBLIC_KEY: z.string().optional(),
    DRUID_DISTRIBUTOR_SECRET_KEY: z.string().optional(),
    STELLAR_HORIZON_URL: z.string().url().optional(),
    NATIVE_CONTRACT_ID: z.string().optional(),
    USDC_SAC: z.string().optional(),
    LAUNCHTUBE_URL: z.string().url().optional(),
    MERCURYT_URL: z.string().url().optional(),
    LAUNCHETUBE_JWT: z.string().optional(),
    MERCURY_JWT: z.string().optional(),
    SRT_ASSET_ID: z.string().optional(),
    ENABLE_SMS: z.string().optional(),
    SALT_ROUNDS: z.string().optional(),
    MOCK_KYC: z.string().optional().default("false"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Make all client-side variables optional
    NEXT_PUBLIC_RPC_URL: z.string().url().optional(),
    NEXT_PUBLIC_FACTORY_CONTRACT_ID: z.string().optional(),
    NEXT_PUBLIC_NATIVE_CONTRACT_ID: z.string().optional(),
    NEXT_PUBLIC_NETWORK_PASSPHRASE: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_PUSHER_APP_KEY: z.string().optional(),
    NEXT_PUBLIC_CIVIC_CLIENT_ID: z.string().optional(),
    NEXT_PUBLIC_MOCK_KYC: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CIVIC_CLIENT_ID: process.env.CIVIC_CLIENT_ID,
    ANCHOR_API_BASE_URL: process.env.ANCHOR_API_BASE_URL,
    ANCHOR_API_TOKEN: process.env.ANCHOR_API_TOKEN,
    ESCROW_CONTRACT_ADDRESS: process.env.ESCROW_CONTRACT_ADDRESS,
    RPC_URL: process.env.RPC_URL,
    druid_DISTRIBUTOR_PUBLIC_KEY: process.env.druid_DISTRIBUTOR_PUBLIC_KEY,
    DRUID_DISTRIBUTOR_SECRET_KEY: process.env.DRUID_DISTRIBUTOR_SECRET_KEY,
    STELLAR_HORIZON_URL: process.env.STELLAR_HORIZON_URL,
    NATIVE_CONTRACT_ID: process.env.NATIVE_CONTRACT_ID,
    USDC_SAC: process.env.USDC_SAC,
    LAUNCHTUBE_URL: process.env.LAUNCHTUBE_URL,
    MERCURYT_URL: process.env.MERCURYT_URL,
    LAUNCHETUBE_JWT: process.env.LAUNCHETUBE_JWT,
    MERCURY_JWT: process.env.MERCURY_JWT,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_FACTORY_CONTRACT_ID: process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID,
    NEXT_PUBLIC_NATIVE_CONTRACT_ID: process.env.NEXT_PUBLIC_NATIVE_CONTRACT_ID,
    NEXT_PUBLIC_NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE,
    SRT_ASSET_ID: process.env.SRT_ASSET_ID,
    ENABLE_SMS: process.env.ENABLE_SMS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    MOCK_KYC: process.env.MOCK_KYC,
    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    NEXT_PUBLIC_CIVIC_CLIENT_ID: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID,
    NEXT_PUBLIC_MOCK_KYC: process.env.NEXT_PUBLIC_MOCK_KYC,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
