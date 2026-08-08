import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTENT_VERSION } from "../src/data/schemas.js";

function makeStore() {
  const map = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
    },
  };
  return map;
}

test("create() preserves a {metadata, body} envelope and stamps version 1", async () => {
  makeStore();
  const { contentService } = await import("../src/services/contentService.js");
  const body = { title: "t", objective: "o", durationMinutes: 50, materials: [], steps: [], assessment: "a" };
  const metadata = { prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", source: "template" };

  const record = await contentService.create({ metadata, body });

  assert.equal(record.version, CONTENT_VERSION);
  assert.ok(typeof record.id === "string" && record.id.length > 0);
  assert.ok(typeof record.createdAt === "number");
  assert.deepEqual(record.metadata, metadata);
  assert.deepEqual(record.body, body);
});

test("create() migrates a legacy flat record to the envelope", async () => {
  makeStore();
  const { contentService } = await import("../src/services/contentService.js?legacy");

  const record = await contentService.create({ prompt: "p", subject: "math", grade: "p4", outputType: "quiz" });

  assert.equal(record.version, CONTENT_VERSION);
  assert.equal(record.metadata.prompt, "p");
  assert.equal(record.metadata.subject, "math");
  assert.equal(record.metadata.source, "legacy");
});

test("get() and list() round-trip created envelope content", async () => {
  makeStore();
  const { contentService } = await import("../src/services/contentService.js?roundtrip");
  const metadata = { prompt: "hello", subject: "thai", grade: "p1", outputType: "worksheet", source: "gemini" };
  const body = { title: "w", instructions: "do it", items: [] };

  const created = await contentService.create({ metadata, body });
  const got = await contentService.get(created.id);
  const all = await contentService.list();

  assert.deepEqual(got.metadata, metadata);
  assert.deepEqual(got.body, body);
  assert.equal(all.length, 1);
});

test("createGenerated() builds a proper envelope and tracks metadata", async () => {
  makeStore();
  const { contentService } = await import("../src/services/contentService.js?gen");
  const body = { title: "g", objective: "x", durationMinutes: 30, materials: ["b"], steps: [], assessment: "z" };

  const record = await contentService.createGenerated({
    prompt: "prompt1",
    subject: "science",
    grade: "p6",
    outputType: "lesson-plan",
    source: "template",
    body,
  });

  assert.equal(record.version, CONTENT_VERSION);
  assert.equal(record.metadata.prompt, "prompt1");
  assert.equal(record.metadata.source, "template");
  assert.equal(record.metadata.outputType, "lesson-plan");
  assert.deepEqual(record.body, body);
});