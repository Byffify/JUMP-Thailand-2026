import { test } from "node:test";
import assert from "node:assert/strict";
import { aiService } from "../src/services/aiService.js";

const offlineFetch = async () => ({ ok: false, status: 500 });

test("server unavailable -> offline heuristic reply that references the message", async () => {
  const reply = await aiService.generate({ message: "สอนคณิตศาสตร์", fetchImpl: offlineFetch });
  assert.equal(typeof reply, "string");
  assert.ok(reply.length > 0);
});

test("server offline + library docs -> reply references the doc count", async () => {
  const reply = await aiService.generate({
    message: "ดูเอกสารนี้หน่อย",
    libraryDocs: [{ chapterTitle: "บทที่ 1", docLabel: "แผนจัดการเรียนรู้" }],
    fetchImpl: offlineFetch,
  });
  assert.ok(reply.includes("1"), "reply should reference the library doc count");
});

test("server offline + attached files -> reply references the file count", async () => {
  const reply = await aiService.generate({
    message: "ช่วยสรุปไฟล์",
    attachedFiles: [{ name: "a.pdf" }, { name: "b.pdf" }],
    fetchImpl: offlineFetch,
  });
  assert.ok(reply.includes("2"), "reply should reference the attached file count");
});

test("server success -> returns server Gemini text content", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ ok: true, text: "นี่คือคำตอบจาก Gemini" }) });
  const reply = await aiService.generate({ message: "ช่วยอธิบาย", fetchImpl });
  assert.equal(reply, "นี่คือคำตอบจาก Gemini");
});

test("request is POSTed to /api/chat with promptText and no apiKey", async () => {
  let sentUrl = null;
  let sentBody = null;
  const fetchImpl = async (url, opts) => {
    sentUrl = url;
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true, text: "ตอบแล้ว" }) };
  };
  await aiService.generate({ message: "ถาม", fetchImpl });
  assert.ok(sentUrl.endsWith("/api/chat"), "client should call the serverless chat endpoint");
  assert.ok(sentBody.promptText.includes("ถาม"));
  assert.equal(sentBody.apiKey, undefined, "client must never send an API key");
});

test("request promptText includes library docs context", async () => {
  let sentBody = null;
  const fetchImpl = async (_url, opts) => {
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true, text: "ตอบแล้ว" }) };
  };
  await aiService.generate({
    message: "ถาม",
    libraryDocs: [{ chapterTitle: "บทที่ 2", docLabel: "ใบงาน" }],
    fetchImpl,
  });
  assert.ok(sentBody.promptText.includes("บทที่ 2"));
  assert.ok(sentBody.promptText.includes("ใบงาน"));
});

test("request promptText embeds attached file names", async () => {
  let sentBody = null;
  const fetchImpl = async (_url, opts) => {
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true, text: "ตอบแล้ว" }) };
  };
  await aiService.generate({
    message: "ถาม",
    attachedFiles: [{ name: "ใบงานคณิต.txt" }],
    fetchImpl,
  });
  assert.ok(sentBody.promptText.includes("ใบงานคณิต.txt"));
});

test("server ok-but-error -> offline reply, no throw", async () => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ ok: false, error: "empty" }) });
  const reply = await aiService.generate({ message: "สอบถาม", fetchImpl });
  assert.equal(typeof reply, "string");
  assert.ok(reply.length > 0);
});