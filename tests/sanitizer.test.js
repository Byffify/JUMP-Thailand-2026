import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeBody } from "../src/utils/sanitizer.js";
import { validateBody } from "../src/utils/validateSchema.js";
import { OUTPUT_TYPES, createEmptyBody } from "../src/data/schemas.js";

test("sanitizeBody returns valid body for every output type given empty", () => {
  for (const t of OUTPUT_TYPES) {
    const b = sanitizeBody({ outputType: t, body: {} });
    assert.equal(validateBody(t, b).valid, true, t);
  }
});
test("sanitizeBody fills missing fields with defaults", () => {
  const b = sanitizeBody({ outputType: "lesson-plan", body: {} });
  assert.equal(b.title, "");
  assert.equal(b.durationMinutes, 0);
  assert.ok(Array.isArray(b.materials));
  assert.equal(validateBody("lesson-plan", b).valid, true);
});
test("sanitizeBody coerces types", () => {
  const b = sanitizeBody({ outputType: "lesson-plan", body: { title: 123, durationMinutes: "50" } });
  assert.equal(b.title, "123");
  assert.equal(b.durationMinutes, 50);
});
test("sanitizeBody caps quiz items at 15", () => {
  const body = createEmptyBody("quiz");
  body.items = Array.from({ length: 20 }, (_, i) => ({
    question: `q${i}`,
    type: "multiple_choice",
    options: ["a", "b", "c", "d"],
    answer: "a",
    explanation: "e",
  }));
  const b = sanitizeBody({ outputType: "quiz", body });
  assert.equal(b.items.length, 15);
  assert.equal(validateBody("quiz", b).valid, true);
});
test("sanitizeBody never throws on garbage", () => {
  assert.doesNotThrow(() => sanitizeBody({ outputType: "worksheet", body: null }));
  assert.doesNotThrow(() => sanitizeBody({ outputType: "worksheet", body: "nope" }));
  assert.doesNotThrow(() => sanitizeBody({ outputType: "quiz", body: { title: [] } }));
});

test("sanitizeBody coerces flat strings under object-shaped array into valid objects", () => {
  const b = sanitizeBody({
    outputType: "lesson-plan",
    body: { title: "t", objective: "o", durationMinutes: 50, materials: [], steps: ["ขั้นนำ", "ขั้นสอน"], assessment: "a" },
  });
  const result = validateBody("lesson-plan", b);
  assert.equal(result.valid, true);
  assert.equal(b.steps.length, 2);
  assert.equal(b.steps[0].name, "ขั้นนำ");
  assert.equal(b.steps[0].description, "");
  assert.equal(typeof b.steps[0].durationMinutes, "number");
});