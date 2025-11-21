import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CURRENCY_API_API_KEY: z.string().min(1, "CURRENCY_API_API_KEY is required"),
  },
  client: {},
  runtimeEnv: {
    CURRENCY_API_API_KEY: process.env.CURRENCY_API_API_KEY,
  },
});
