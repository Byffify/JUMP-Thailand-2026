import { test } from "node:test";
import assert from "node:assert/strict";
import { generationService } from "../src/services/generationService.js";
import { validateBody } from "../src/utils/validateSchema.js";

const okBody = { title: "x", objective: "y", durationMinutes: 50, materials: [], steps: [{ name: "s", durationMinutes: 5, description: "d" }], assessment: "a" };

const offlineFetch = async () => ({ ok: false, status: 500 });

test("server unavailable -> template source, valid body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", fetchImpl: offlineFetch });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("server success -> gemini source", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ ok: true, text: JSON.stringify(okBody) }) });
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", fetchImpl });
  assert.equal(res.source, "gemini");
  assert.equal(validateBody("lesson-plan", res.body).valid, true);
});

test("server returns malformed text -> template source, no throw", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ ok: true, text: "not json" }) });
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", fetchImpl });
  assert.equal(res.ok, true);
  assert.equal(res.source, "template");
});

test("fetch reject -> template source, no throw", async () => {
  const fetchImpl = async () => { throw new Error("network"); };
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", fetchImpl });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});

test("invalid outputType -> template source, valid fallback body", async () => {
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "nope", fetchImpl: offlineFetch });
  assert.equal(res.source, "template");
  assert.equal(res.ok, true);
});

test("request is POSTed to /api/generate with promptText and no apiKey", async () => {
  let sentUrl = null;
  let sentBody = null;
  const fetchImpl = async (url, opts) => {
    sentUrl = url;
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true, text: JSON.stringify(okBody) }) };
  };
  const res = await generationService.generate({ prompt: "p", subject: "science", grade: "p6", outputType: "lesson-plan", fetchImpl });
  assert.equal(res.source, "gemini");
  assert.ok(sentUrl.endsWith("/api/generate"), "client should call the serverless generate endpoint");
  assert.ok(sentBody.promptText.includes("lesson-plan"));
  assert.equal(sentBody.apiKey, undefined, "client must never send an API key");
});