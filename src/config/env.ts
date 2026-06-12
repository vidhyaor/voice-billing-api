import { z } from "zod";
import {
  APP_ENVIRONMENTS,
  loadEnvironmentFiles,
  type AppEnvironment,
} from "./load-env.js";

const { appEnv, loadedFile } = loadEnvironmentFiles();

if (loadedFile) {
  console.info(`Loaded environment: ${appEnv} (${loadedFile})`);
} else {
  console.warn(
    `No environment file found for APP_ENV=${appEnv}. Set variables in the shell or create .env.${appEnv}`,
  );
}

const envSchema = z.object({
  APP_ENV: z.enum(APP_ENVIRONMENTS).default(appEnv),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default(appEnv === "production" ? "production" : "development"),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .refine(
      (value) =>
        value.startsWith("postgresql://") ||
        value.startsWith("postgres://") ||
        value.startsWith("mysql://"),
      "DATABASE_URL must be a valid database connection string",
    ),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("*"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  SWAGGER_ENABLED: z
    .enum(["true", "false"])
    .default(appEnv === "production" ? "false" : "true")
    .transform((value) => value === "true"),
  APP_NAME: z.string().default("Voice Billing API"),
  APP_VERSION: z.string().default("1.0.0"),
});

const parsed = envSchema.safeParse({
  APP_ENV: appEnv,
  ...process.env,
});

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
export type { AppEnvironment };
