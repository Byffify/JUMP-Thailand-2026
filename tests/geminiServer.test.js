import { test } from "node:test";
import assert from "node:assert/strict";
import { callGemini } from "../api/_gemini.js";
import { makeGenerateHandler } from "../api/generate.js";
import { makeChatHandler } from "../api/chat.js";

const okFetchImpl = async (text) => async (_url, _opts) => ({
  ok: true,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
});

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(o) {
      this.body = o;
      return this;
    },
  };
}

function jsonReq(body, method = "POST") {
  return { method, body: typeof body === "string" ? body : JSON.stringify(body) };
}

test("callGemini -> success returns text with x-goog-api-key header, never in URL", async () => {
  let capturedUrl = null;
  let capturedHeaders = null;
  const fetchImpl = async (url, opts) => {
    capturedUrl = url;
    capturedHeaders = opts.headers;
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "สวัสดี" }] } }] }) };
  };
  const result = await callGemini({ promptText: "question", apiKey: "sec-123", fetchImpl });
  assert.equal(result.ok, true);
  assert.equal(result.text, "สวัสดี");
  assert.ok(capturedUrl.startsWith("https://generativelanguage.googleapis.com/v1beta/models/"));
  assert.ok(capturedUrl.endsWith(":generateContent"));
  assert.ok(!capturedUrl.includes("sec-123"), "API key must not appear in the URL");
  assert.equal(capturedHeaders["x-goog-api-key"], "sec-123");
});

test("callGemini -> no apiKey anywhere returns ok:false without fetching", async () => {
  const saved = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  let called = false;
  const fetchImpl = async () => {
    called = true;
    return { ok: true, json: async () => ({}) };
  };
  try {
    const result = await callGemini({ promptText: "x", fetchImpl });
    assert.equal(result.ok, false);
    assert.equal(called, false);
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
  }
});

test("callGemini uses GEMINI_API_KEY env when apiKey option omitted", async () => {
  const saved = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "env-key";
  try {
    const result = await callGemini({ promptText: "x", fetchImpl: await okFetchImpl("ok") });
    assert.equal(result.ok, true);
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
    else delete process.env.GEMINI_API_KEY;
  }
});

test("callGemini -> Gemini http error -> ok:false, no throw", async () => {
  const fetchImpl = async () => ({ ok: false, status: 429 });
  const result = await callGemini({ promptText: "x", apiKey: "k", fetchImpl });
  assert.equal(result.ok, false);
});

test("callGemini -> malformed response -> ok:false, no throw", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({}) });
  const result = await callGemini({ promptText: "x", apiKey: "k", fetchImpl });
  assert.equal(result.ok, false);
});

test("generate handler -> valid body -> 200 { ok, text }", async () => {
  const saved = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "srv-key";
  try {
    const handler = makeGenerateHandler({ fetchImpl: await okFetchImpl(JSON.stringify({ title: "t" })) });
    const res = fakeRes();
    await handler(jsonReq({ promptText: "plan" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.source || res.body.token, undefined);
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
    else delete process.env.GEMINI_API_KEY;
  }
});

test("generate handler -> missing promptText -> 400", async () => {
  const handler = makeGenerateHandler({ fetchImpl: await okFetchImpl("x") });
  const res = fakeRes();
  await handler(jsonReq({}), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.ok, false);
});

test("generate handler -> non-POST -> 405", async () => {
  const handler = makeGenerateHandler({ fetchImpl: await okFetchImpl("x") });
  const res = fakeRes();
  await handler(jsonReq({ promptText: "p" }, "GET"), res);
  assert.equal(res.statusCode, 405);
});

test("chat handler -> valid body -> prompt text { ok, text }", async () => {
  const saved = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "srv-key";
  try {
    const handler = makeChatHandler({ fetchImpl: await okFetchImpl("ตอบครับ") });
    const res = fakeRes();
    await handler(jsonReq({ promptText: "ช่วยหน่อย" }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.text, "ตอบครับ");
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
    else delete process.env.GEMINI_API_KEY;
  }
});

test("chat handler -> missing promptText -> 400", async () => {
  const handler = makeChatHandler({ fetchImpl: await okFetchImpl("x") });
  const res = fakeRes();
  await handler(jsonReq({}), res);
  assert.equal(res.statusCode, 400);
});

test("handlers never include the API key in the response body", async () => {
  const saved = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "supersecret";
  try {
    const handler = makeGenerateHandler({ fetchImpl: await okFetchImpl("hello") });
    const res = fakeRes();
    await handler(jsonReq({ promptText: "plan" }), res);
    assert.ok(!JSON.stringify(res.body).includes("supersecret"));
    const chandler = makeChatHandler({ fetchImpl: await okFetchImpl("hi") });
    const cres = fakeRes();
    await chandler(jsonReq({ promptText: "chat" }), cres);
    assert.ok(!JSON.stringify(cres.body).includes("supersecret"));
  } finally {
    if (saved !== undefined) process.env.GEMINI_API_KEY = saved;
    else delete process.env.GEMINI_API_KEY;
  }
});