import { afterEach, describe, expect, it, vi } from "vitest";
import { createServerConfig } from "../../server/src/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("server config", () => {
  it("uses sane defaults", () => {
    vi.stubEnv("PORT", undefined);
    vi.stubEnv("WEB_ORIGIN", undefined);
    vi.stubEnv("SQLITE_PATH", undefined);
    vi.stubEnv("NODE_ENV", undefined);

    const config = createServerConfig();

    expect(config.port).toBe(8000);
    expect(config.origins).toEqual(["http://localhost:5173"]);
    expect(config.sqlitePath).toBe("./data/frozen-guild.db");
    expect(config.nodeEnv).toBe("development");
  });

  it("parses env values", () => {
    vi.stubEnv("PORT", "9100");
    vi.stubEnv("WEB_ORIGIN", "https://a.com, https://b.com");
    vi.stubEnv("SQLITE_PATH", "./tmp/prod.db");
    vi.stubEnv("NODE_ENV", "production");

    const config = createServerConfig();

    expect(config.port).toBe(9100);
    expect(config.origins).toEqual(["https://a.com", "https://b.com"]);
    expect(config.sqlitePath).toBe("./tmp/prod.db");
    expect(config.nodeEnv).toBe("production");
  });
});
