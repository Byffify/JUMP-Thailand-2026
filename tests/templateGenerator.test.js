import { test } from "node:test";
import assert from "node:assert/strict";

import { OUTPUT_TYPES } from "../src/data/schemas.js";
import { validateBody } from "../src/utils/validateSchema.js";
import {
  generate,
  templateGenerator,
} from "../src/services/templateGenerator.js";

const BASE = {
  prompt: "สร้างเนื้อหาสำหรับบทเรียน",
  subject: "science",
  grade: "p6",
};

function runFor(type) {
  return generate({ ...BASE, outputType: type });
}

test("generate returns a valid body for each of the 6 output types", () => {
  for (const type of OUTPUT_TYPES) {
    const { body } = runFor(type);
    const result = validateBody(type, body);
    assert.equal(result.valid, true, `${type} body should be schema-valid`);
    assert.deepEqual(result.errors, []);
  }
});

test("generate is deterministic for each output type", () => {
  for (const type of OUTPUT_TYPES) {
    const first = runFor(type);
    const second = runFor(type);
    assert.deepEqual(first.body, second.body, `${type} should be deterministic`);
  }
});

test("generate returns fallback body and does not throw on invalid outputType", () => {
  const result = generate({ ...BASE, outputType: "video" });
  assert.ok(result.body);
  assert.equal(result.body.title, "");
  assert.equal(validateBody("lesson-plan", result.body).valid, true);
});

test("generate returns a valid body even with empty prompt (default topic)", () => {
  for (const type of OUTPUT_TYPES) {
    const { body } = generate({
      prompt: "",
      subject: "math",
      grade: "m1",
      outputType: type,
    });
    const result = validateBody(type, body);
    assert.equal(result.valid, true, `${type} empty-prompt body valid`);
  }
});

test("subject and grade labels appear in lesson-plan output", () => {
  const { body } = generate({
    prompt: "",
    subject: "science",
    grade: "p6",
    outputType: "lesson-plan",
  });
  assert.match(body.title, /วิทยาศาสตร์/);
  assert.match(body.title, /ป\.6/);
});

test("exposes generate via templateGenerator object", () => {
  assert.equal(typeof templateGenerator.generate, "function");
  const viaObject = templateGenerator.generate({ ...BASE, outputType: "quiz" });
  assert.equal(validateBody("quiz", viaObject.body).valid, true);
});

test("lesson-plan includes concrete Thai steps", () => {
  const { body } = runFor("lesson-plan");
  const names = body.steps.map((s) => s.name);
  assert.deepEqual(names, ["ขั้นนำ", "ขั้นสอน", "ขั้นสรุป"]);
});