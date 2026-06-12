import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const APP_ENVIRONMENTS = ["local", "development", "production"] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export function resolveAppEnvironment(): AppEnvironment {
  const value = process.env.APP_ENV?.trim().toLowerCase();

  if (value === "development" || value === "dev") {
    return "development";
  }

  if (value === "production" || value === "prod") {
    return "production";
  }

  return "local";
}

export function loadEnvironmentFiles(): {
  appEnv: AppEnvironment;
  loadedFile: string | null;
} {
  const appEnv = resolveAppEnvironment();
  const envFile = resolve(process.cwd(), `.env.${appEnv}`);

  if (existsSync(envFile)) {
    config({ path: envFile });
    return { appEnv, loadedFile: envFile };
  }

  const legacyEnvFile = resolve(process.cwd(), ".env");

  if (existsSync(legacyEnvFile)) {
    config({ path: legacyEnvFile });
    return { appEnv, loadedFile: legacyEnvFile };
  }

  return { appEnv, loadedFile: null };
}
