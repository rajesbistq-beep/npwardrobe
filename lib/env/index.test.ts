import assert from "node:assert/strict";
import test from "node:test";

import { getPublicEnv, getPublicEnvStatus } from "./index.ts";

const originalEnv = { ...process.env };

function restoreEnv() {
  process.env = { ...originalEnv };
}

function setEnv(overrides: Record<string, string | undefined>) {
  process.env = { ...originalEnv, ...overrides };
}

test("getPublicEnv does not throw when Supabase config is missing", () => {
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
    NEXT_PUBLIC_SITE_URL: undefined,
  });

  assert.doesNotThrow(() => getPublicEnv());
  assert.equal(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL, undefined);
  assert.equal(getPublicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY, undefined);
});

test("missing required vars are reported without leaking values", () => {
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    NEXT_PUBLIC_SITE_URL: "",
  });

  const status = getPublicEnvStatus();
  assert.equal(status.configured, false);
  assert.deepEqual(status.missing, ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  assert.deepEqual(status.invalid, []);
});

test("malformed Supabase URL is flagged as invalid", () => {
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: "not-a-valid-url",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  });

  const status = getPublicEnvStatus();
  assert.equal(status.configured, false);
  assert.deepEqual(status.invalid, ["NEXT_PUBLIC_SUPABASE_URL"]);
});

test("placeholder values are rejected", () => {
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "replace-me",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  });

  const status = getPublicEnvStatus();
  assert.equal(status.configured, false);
  assert.deepEqual(status.invalid, ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
});

test("valid config passes and keeps server-only variables separate", () => {
  setEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://xyz.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-value",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    SUPABASE_SERVICE_ROLE_KEY: "server-only-key",
  });

  const env = getPublicEnv();
  const status = getPublicEnvStatus();
  assert.equal(status.configured, true);
  assert.equal(env.NEXT_PUBLIC_SUPABASE_URL, "https://xyz.supabase.co");
  assert.equal(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "anon-key-value");
  assert.equal(process.env.SUPABASE_SERVICE_ROLE_KEY, "server-only-key");
});

process.on("exit", restoreEnv);
