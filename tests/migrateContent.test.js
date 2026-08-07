import { test } from "node:test";
import assert from "node:assert/strict";

import { CONTENT_VERSION } from "../src/data/schemas.js";
import {
  isV1Record,
  migrateRecord,
  migrateList,
} from "../src/utils/migrateContent.js";

const legacyLessonPlan = {
  id: "legacy-1",
  createdAt: 1716576000000,
  prompt: "Create a lesson plan about ecosystems",
  subject: "science",
  grade: "p6",
  outputType: "lesson-plan",
  legacyTag: "keep-me",
};

test("isV1Record detects v1 envelopes", () => {
  const v1 = {
    id: "x",
    version: 1,
    createdAt: 1,
    metadata: {},
    body: {},
  };
  assert.equal(isV1Record(v1), true);
  assert.equal(isV1Record({ version: 1 }), false);
  assert.equal(isV1Record({ metadata: {} }), false);
  assert.equal(isV1Record({ version: 1, metadata: "nope" }), false);
  assert.equal(isV1Record(null), false);
  assert.equal(isV1Record("nope"), false);
  assert.equal(isV1Record([]), false);
});

test("migrateRecord converts legacy flat record to v1 envelope", () => {
  const out = migrateRecord(legacyLessonPlan);

  assert.equal(out.id, "legacy-1");
  assert.equal(out.version, CONTENT_VERSION);
  assert.equal(out.createdAt, 1716576000000);
  assert.deepEqual(out.metadata, {
    prompt: "Create a lesson plan about ecosystems",
    subject: "science",
    grade: "p6",
    outputType: "lesson-plan",
    source: "legacy",
  });
  assert.deepEqual(out.body, {
    title: "",
    objective: "",
    durationMinutes: 0,
    materials: [],
    steps: [],
    assessment: "",
  });
  assert.equal(out.legacyTag, "keep-me");
  assert.equal(isV1Record(out), true);
});

test("migrateRecord uses Date.now() when createdAt is absent", () => {
  const before = Date.now();
  const out = migrateRecord({
    id: "no-created",
    prompt: "p",
    subject: "science",
    grade: "p6",
    outputType: "worksheet",
  });
  const after = Date.now();
  assert.equal(typeof out.createdAt, "number");
  assert.ok(out.createdAt >= before && out.createdAt <= after);
});

test("migrateRecord keeps existing body for known outputType", () => {
  const body = { title: "Keep me", instructions: "x", items: [] };
  const out = migrateRecord({
    id: "with-body",
    outputType: "worksheet",
    body,
  });
  assert.equal(out.body, body);
});

test("migrateRecord is idempotent on v1 records", () => {
  const v1 = {
    id: "v1",
    version: 1,
    createdAt: 123,
    metadata: {
      prompt: "p",
      subject: "science",
      grade: "p6",
      outputType: "quiz",
      source: "gemini",
    },
    body: { title: "t", items: [] },
  };
  assert.equal(migrateRecord(v1), v1);
});

test("migrateRecord never throws on invalid input", () => {
  assert.equal(migrateRecord(null).version, CONTENT_VERSION);
  assert.deepEqual(migrateRecord(undefined).metadata, {});
  assert.deepEqual(migrateRecord("nope").body, {});
  assert.deepEqual(migrateRecord(42).metadata, {});

  const unknownType = migrateRecord({
    id: "bad-type",
    outputType: "video",
    body: { anything: true },
  });
  assert.equal(unknownType.version, CONTENT_VERSION);
  assert.equal(unknownType.metadata.source, "legacy");
  assert.equal(unknownType.metadata.outputType, "video");
  assert.deepEqual(unknownType.body, { anything: true });
});

test("migrateRecord uses empty body for invalid outputType with no body", () => {
  const out = migrateRecord({ id: "no-body", outputType: "video" });
  assert.deepEqual(out.body, {});
});

test("migrateRecord validates unknown top-level keys preserved", () => {
  const out = migrateRecord({
    id: "x",
    prompt: "p",
    outputType: "quiz",
    extraTopLevel: { nested: [1, 2] },
  });
  assert.deepEqual(out.extraTopLevel, { nested: [1, 2] });
});

test("migrateList maps every record", () => {
  const v1 = {
    id: "v1",
    version: 1,
    createdAt: 5,
    metadata: { prompt: "p", outputType: "quiz", source: "gemini" },
    body: { title: "t", items: [] },
  };
  const list = migrateList([legacyLessonPlan, v1]);
  assert.equal(list.length, 2);
  assert.equal(isV1Record(list[0]), true);
  assert.equal(isV1Record(list[1]), true);
  assert.equal(list[1], v1);
  assert.equal(list[0].id, "legacy-1");
});

function fakeWindowLocalStorage() {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    },
  };
  return store;
}

function destroyWindow() {
  delete globalThis.window;
}

const { contentService } = await import("../src/services/contentService.js");

test("contentService.list migrates mixed legacy + v1 store", async () => {
  const store = fakeWindowLocalStorage();
  const legacy = {
    id: "legacy-store",
    createdAt: 100,
    prompt: "p",
    subject: "science",
    grade: "p6",
    outputType: "activity",
  };
  const v1 = {
    id: "v1-store",
    version: 1,
    createdAt: 200,
    metadata: {
      prompt: "p",
      subject: "math",
      grade: "m1",
      outputType: "quiz",
      source: "template",
    },
    body: { title: "t", items: [] },
  };
  store.set("krumate:contents", JSON.stringify([legacy, v1]));

  const result = await contentService.list();
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "v1-store");
  assert.equal(result[0].version, 1);
  assert.equal(result[1].id, "legacy-store");
  assert.equal(result[1].metadata.source, "legacy");
  assert.equal(result[1].metadata.outputType, "activity");
  assert.equal(result[1].version, CONTENT_VERSION);
  assert.ok(Array.isArray(result[1].body.steps));
  destroyWindow();
});

test("contentService.get migrates a legacy record", async () => {
  fakeWindowLocalStorage();
  const legacy = {
    id: "legacy-get",
    createdAt: 100,
    prompt: "p",
    subject: "science",
    grade: "p6",
    outputType: "slides",
  };
  await contentService.create(legacy);

  const found = await contentService.get("legacy-get");
  assert.ok(found);
  assert.equal(found.version, CONTENT_VERSION);
  assert.equal(found.metadata.source, "legacy");
  assert.equal(found.id, "legacy-get");
  destroyWindow();
});

test("contentService.create persists a legacy item as a v1 envelope", async () => {
  fakeWindowLocalStorage();
  const created = await contentService.create({
    id: "created-legacy",
    prompt: "hello",
    subject: "science",
    grade: "p6",
    outputType: "rubric",
  });
  assert.equal(created.id, "created-legacy");
  assert.equal(created.version, CONTENT_VERSION);
  assert.equal(created.metadata.source, "legacy");
  assert.equal(created.metadata.prompt, "hello");

  const all = await contentService.list();
  const persisted = all.find((c) => c.id === "created-legacy");
  assert.equal(isV1Record(persisted), true);
  assert.equal(persisted.metadata.source, "legacy");
  assert.ok(Array.isArray(persisted.body.criteria));
  destroyWindow();
});

test("contentService.create is idempotent for v1 input", async () => {
  fakeWindowLocalStorage();
  const v1 = {
    id: "created-v1",
    version: 1,
    createdAt: 500,
    metadata: {
      prompt: "p",
      subject: "science",
      grade: "p6",
      outputType: "lesson-plan",
      source: "gemini",
    },
    body: {
      title: "t",
      objective: "o",
      durationMinutes: 50,
      materials: [],
      steps: [],
      assessment: "a",
    },
  };
  const created = await contentService.create(v1);
  assert.equal(created.id, "created-v1");
  assert.equal(created.version, 1);
  assert.equal(created.createdAt, 500);
  assert.equal(created.metadata.source, "gemini");
  assert.deepEqual(created.body, v1.body);
  destroyWindow();
});

test("contentService.get returns null for missing id", async () => {
  fakeWindowLocalStorage();
  assert.equal(await contentService.get("nope"), null);
  destroyWindow();
});
