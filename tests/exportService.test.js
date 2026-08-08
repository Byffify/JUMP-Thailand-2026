import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";

import { OUTPUT_TYPES } from "../src/data/schemas.js";
import { templateGenerator } from "../src/services/templateGenerator.js";
import { exportService } from "../src/services/exportService.js";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");

function fontBase64(file) {
  return fs.readFileSync(path.join(FONT_DIR, file), { encoding: null }).toString("base64");
}

const PDF_FONTS = {
  regular: fontBase64("Sarabun-Regular.ttf"),
  bold: fontBase64("Sarabun-Bold.ttf"),
};

function makeRecord(outputType) {
  const { body } = templateGenerator.generate({
    prompt: "สร้างเนื้อหาสำหรับบทเรียน",
    subject: "science",
    grade: "p6",
    outputType,
  });
  return {
    id: "rec-" + outputType,
    version: 1,
    createdAt: "2026-08-08T00:00:00.000Z",
    metadata: { prompt: "หัวข้อ ระบบนิเวศ", subject: "science", grade: "p6", outputType, source: "template" },
    body,
  };
}

async function bytesOf(blob) {
  assert.ok(blob instanceof Blob, "expected a Blob");
  return new Uint8Array(await blob.arrayBuffer());
}

async function readZipEntries(blob) {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const out = {};
  await Promise.all(
    Object.keys(zip.files).map(async (name) => {
      out[name] = await zip.files[name].async("string");
    }),
  );
  return out;
}

function firstBytes(bytes, n) {
  return Array.from(bytes.slice(0, n)).map((b) => String.fromCharCode(b)).join("");
}

test("pdf export produces application/pdf with %PDF magic and non-trivial size for all 6 types", async () => {
  for (const type of OUTPUT_TYPES) {
    const { blob, name } = await exportService.buildPdf({
      record: makeRecord(type),
      fonts: PDF_FONTS,
    });
    const bytes = await bytesOf(blob);
    assert.match(firstBytes(bytes, 5), /^%PDF/);
    assert.ok(blob.type.includes("application/pdf"), `mime=${blob.type}`);
    assert.ok(blob.size > 2000, `size=${blob.size} for ${type}`);
    assert.match(name, /\.pdf$/, `name=${name}`);
  }
});

test("pdf export embeds the Sarabun font when font files are provided", async () => {
  const { blob } = await exportService.buildPdf({
    record: makeRecord("lesson-plan"),
    fonts: PDF_FONTS,
  });
  const decode = new TextDecoder("latin1").decode(await bytesOf(blob));
  assert.ok(decode.includes("Sarabun"), "PDF should declare the embedded Sarabun font");
});

test("docx export produces a valid zip containing Thai title and section labels for all 6 types", async () => {
  for (const type of OUTPUT_TYPES) {
    const { blob, name } = await exportService.buildDocx({ record: makeRecord(type) });
    const bytes = await bytesOf(blob);
    assert.ok(bytes[0] === 0x50 && bytes[1] === 0x4b, "PK zip magic for " + type);
    assert.match(name, /\.docx$/, `name=${name}`);

    const entries = await readZipEntries(blob);
    const docXml = entries["word/document.xml"];
    assert.ok(docXml, "word/document.xml entry present");
    assert.match(docXml, /แผนการ|ใบงาน|แบบทดสอบ|เกณฑ์|กิจกรรม|สไลด์/, `title or section text in document.xml (${type})`);
  }
});

test("pptx export produces a valid zip containing slide content for all 6 types", async () => {
  for (const type of OUTPUT_TYPES) {
    const { blob, name } = await exportService.buildPptx({ record: makeRecord(type) });
    const bytes = await bytesOf(blob);
    assert.ok(bytes[0] === 0x50 && bytes[1] === 0x4b, "PK magic for " + type);
    assert.match(name, /\.pptx$/, `name=${name}`);

    const entries = await readZipEntries(blob);
    const slideNames = Object.keys(entries).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
    assert.ok(slideNames.length >= 1, `has at least one slide (${type})`);
    const slideXml = entries[slideNames[0]];
    assert.ok(/[ก-๙]/.test(slideXml), `slide contains Thai text (${type})`);
  }
});

test("export dispatcher builds the right blob per format and returns a stable file name", async () => {
  const record = makeRecord("lesson-plan");
  const pdf = await exportService.export(record, "pdf", { fonts: PDF_FONTS });
  const docx = await exportService.export(record, "docx");
  const pptx = await exportService.export(record, "pptx");

  assert.match(pdf.name, /\.pdf$/i);
  assert.match(docx.name, /\.docx$/i);
  assert.match(pptx.name, /\.pptx$/i);

  assert.ok(pdf.blob.size > 2000);
  assert.ok(docx.blob.size > 1000);
  assert.ok(pptx.blob.size > 1000);
});

test("export() rejects an unsupported format", async () => {
  await assert.rejects(() => exportService.export(makeRecord("lesson-plan"), "html"), /format/);
});