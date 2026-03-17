import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

describe("smoke tests", () => {
  it("dist/index.js exists and has shebang", () => {
    const content = readFileSync(resolve(root, "dist/index.js"), "utf8");
    assert.ok(content.startsWith("#!/usr/bin/env node"), "missing shebang");
  });

  it("package.json has required fields", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    assert.ok(pkg.bin, "missing bin field");
    assert.ok(pkg.files, "missing files field");
    assert.equal(pkg.type, "module");
    assert.ok(pkg.bin["mcp-server-screenshot"], "missing binary entry");
  });
});
