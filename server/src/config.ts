const DEFAULT_PORT = 8000;
const DEFAULT_WEB_ORIGIN = "http://localhost:5173";
const DEFAULT_SQLITE_PATH = "./data/frozen-guild.db";

function parsePort(value: string | undefined): number {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PORT;
  }

  return parsed;
}

function parseOrigins(value: string | undefined): string[] {
  if (!value) {
    return [DEFAULT_WEB_ORIGIN];
  }

  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return parts.length > 0 ? parts : [DEFAULT_WEB_ORIGIN];
}

export function createServerConfig() {
  return {
    port: parsePort(process.env.PORT),
    origins: parseOrigins(process.env.WEB_ORIGIN),
    sqlitePath: process.env.SQLITE_PATH ?? DEFAULT_SQLITE_PATH,
    nodeEnv: process.env.NODE_ENV ?? "development"
  };
}

export const serverConfig = createServerConfig();
