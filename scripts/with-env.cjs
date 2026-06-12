const { config } = require("dotenv");
const { existsSync } = require("node:fs");
const { resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

function resolveAppEnvironment() {
  const value = (process.env.APP_ENV || "local").trim().toLowerCase();

  if (value === "development" || value === "dev") {
    return "development";
  }

  if (value === "production" || value === "prod") {
    return "production";
  }

  return "local";
}

const appEnv = resolveAppEnvironment();
const envFile = resolve(process.cwd(), `.env.${appEnv}`);

if (existsSync(envFile)) {
  config({ path: envFile });
  console.info(`Loaded environment: ${appEnv} (${envFile})`);
} else {
  const legacyEnvFile = resolve(process.cwd(), ".env");

  if (existsSync(legacyEnvFile)) {
    config({ path: legacyEnvFile });
    console.info(`Loaded environment from legacy file (${legacyEnvFile})`);
  } else {
    console.warn(`No environment file found for APP_ENV=${appEnv}`);
  }
}

const [, , command, ...args] = process.argv;

if (!command) {
  console.error("Usage: node scripts/with-env.cjs <command> [args...]");
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
