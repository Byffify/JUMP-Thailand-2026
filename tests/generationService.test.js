import { test } from "node:test";
import assert from "node:assert/strict";
import { generationService } from "../src/services/generationService.js";
import { validateBody } from "../src/utils/validateSchema.js";

const okBody = { title: "x", objective: "y", durationMinutes: 50, materials: [], steps: [{ name: "s", durationMinutes: 5, description: "d" }], assessment: "a" };

test("no api key -> template source, valid body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "" });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("api success -> gemini source", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(okBody) }] } }] }),
  });
  const res = await generationService.generate({
    prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl,
  });
  assert.equal(res.source, "gemini");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("gemini malformed json -> template source, no throw", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "not json" }] } }] }) });
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
});

test("fetch reject -> template source, no throw", async () => {
  const fetchImpl = async () => { throw new Error("network"); };
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", apiKey: "k", fetchImpl });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});

test("invalid outputType -> template source, valid fallback body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "nope", apiKey: "" });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});