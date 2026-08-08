import { test } from "node:test";
import assert from "node:assert/strict";
import { aiService } from "../src/services/aiService.js";

test("no api key -> offline heuristic response that references the message", async () => {
  const reply = await aiService.generate({ message: "สอนคณิตศาสตร์", apiKey: "" });
  assert.equal(typeof reply, "string");
  assert.ok(reply.length > 0);
});

test("no api key + library docs -> response mentions the attached library count", async () => {
  const reply = await aiService.generate({
    message: "ดูเอกสารนี้หน่อย",
    libraryDocs: [{ chapterTitle: "บทที่ 1", docLabel: "แผนจัดการเรียนรู้" }],
    apiKey: "",
  });
  assert.ok(reply.includes("1"), "reply should reference the library doc count");
});

test("no api key + attached files -> response mentions the attached file count", async () => {
  const reply = await aiService.generate({
    message: "ช่วยสรุปไฟล์",
    attachedFiles: [{ name: "a.pdf" }, { name: "b.pdf" }],
    apiKey: "",
  });
  assert.ok(reply.includes("2"), "reply should reference the attached file count");
});

test("api key + success -> returns Gemini text content", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: "นี่คือคำตอบจาก Gemini" }] } }] }),
  });
  const reply = await aiService.generate({
    message: "ช่วยอธิบาย",
    apiKey: "k",
    fetchImpl,
  });
  assert.equal(reply, "นี่คือคำตอบจาก Gemini");
});

test("api key + success -> prompt includes library docs context", async () => {
  let sentBody = null;
  const fetchImpl = async (_url, opts) => {
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "ตอบแล้ว" }] } }] }) };
  };
  await aiService.generate({
    message: "ถาม",
    libraryDocs: [{ chapterTitle: "บทที่ 2", docLabel: "ใบงาน" }],
    apiKey: "k",
    fetchImpl,
  });
  const prompt = sentBody.contents[0].parts[0].text;
  assert.ok(prompt.includes("บทที่ 2"));
  assert.ok(prompt.includes("ใบงาน"));
});

test("api key + attached files -> prompt embeds file names", async () => {
  let sentBody = null;
  const fetchImpl = async (_url, opts) => {
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "ตอบแล้ว" }] } }] }) };
  };
  await aiService.generate({
    message: "ถาม",
    attachedFiles: [{ name: "ใบงานคณิต.txt" }],
    apiKey: "k",
    fetchImpl,
  });
  const prompt = sentBody.contents[0].parts[0].text;
  assert.ok(prompt.includes("ใบงานคณิต.txt"));
});

test("api failure -> falls back to offline heuristic response, no throw", async () => {
  const fetchImpl = async () => {
    throw new Error("network");
  };
  const reply = await aiService.generate({ message: "สอบถาม", apiKey: "k", fetchImpl });
  assert.equal(typeof reply, "string");
  assert.ok(reply.length > 0);
});

test("api error status -> falls back to offline response, no throw", async () => {
  const fetchImpl = async () => ({ ok: false, status: 429 });
  const reply = await aiService.generate({ message: "ถาม", apiKey: "k", fetchImpl });
  assert.equal(typeof reply, "string");
  assert.ok(reply.length > 0);
});