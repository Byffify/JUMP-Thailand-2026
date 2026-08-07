import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBody } from "../src/utils/bodyRenderer.js";

const SIX = ["lesson-plan", "worksheet", "quiz", "slides", "rubric", "activity"];

function lessonBody() {
  return {
    title: "แผนการสอนระบบนิเวศ",
    objective: "นักเรียนสามารถอธิบายห่วงโซ่อาหารได้",
    durationMinutes: 50,
    materials: ["บัตรภาพ", "สีชอล์ก"],
    steps: [
      { name: "ขั้นนำ", durationMinutes: 10, description: "ตั้งคำถามกระตุ้นความสนใจ" },
      { name: "ขั้นสอน", durationMinutes: 30, description: "อธิบายห่วงโซ่อาหาร" },
    ],
    assessment: "ประเมินจากแผนภาพห่วงโซ่อาหาร",
  };
}

function worksheetBody() {
  return {
    title: "ใบงานคำที่หายไป",
    instructions: "เติมคำในช่องว่างให้ถูกต้อง",
    items: [
      { question: "พืชสร้างอาหารเองได้ เรียกว่า ?", answer: "ผู้ผลิต" },
      { question: "คนกินข้าว เป็น ?", answer: "ผู้บริโภค" },
    ],
  };
}

function quizBody() {
  return {
    title: "แบบทดสอบระบบนิเวศ",
    items: [
      {
        question: "ข้อใดคือผู้ผลิต?",
        type: "multiple_choice",
        options: ["เห็ด", "ต้นข้าว", "เสือ", "แบคทีเรีย"],
        answer: "ต้นข้าว",
        explanation: "ต้นข้าวสังเคราะห์แสงได้เอง",
      },
    ],
  };
}

function slidesBody() {
  return {
    title: "สไลด์ระบบนิเวศ",
    slides: [
      { title: "ปกเรื่อง", bullets: ["ระบบนิเวศ"] },
      { title: "เนื้อหา", bullets: ["ผู้ผลิต", "ผู้บริโภค", "ผู้ย่อยสลาย"] },
    ],
  };
}

function rubricBody() {
  return {
    title: "เกณฑ์การให้คะแนนงานเขียน",
    criteria: [
      {
        name: "ความถูกต้อง",
        descriptions: [
          { level: "ดีเยี่ยม", text: "ถูกต้องครบถ้วน" },
          { level: "พอใช้", text: "มีข้อผิดพลาดบางส่วน" },
        ],
      },
    ],
  };
}

function activityBody() {
  return {
    title: "กิจกรรมสำรวจสิ่งมีชีวิต",
    durationMinutes: 40,
    groupSize: 4,
    materials: ["กล้องมือถือ", "สมุดจด"],
    steps: [{ name: "สำรวจ", description: "สำรวจสิ่งมีชีวิตรอบบริเวณโรงเรียน" }],
  };
}

function findSection(view, label) {
  return view.sections.find((s) => s.label === label);
}

test("lesson-plan renders all sections with label + title", () => {
  const view = renderBody({ outputType: "lesson-plan", body: lessonBody() });
  assert.equal(view.ok, true);
  assert.equal(view.title, "แผนการสอนระบบนิเวศ");
  const labels = view.sections.map((s) => s.label);
  assert.ok(labels.includes("จุดประสงค์การเรียนรู้"));
  assert.ok(labels.includes("เวลา"));
  assert.ok(labels.includes("สื่อ"));
  assert.ok(labels.includes("ขั้นตอน"));
  assert.ok(labels.includes("การประเมิน"));

  const materials = findSection(view, "สื่อ");
  assert.deepEqual(materials.entries[0].lines, ["บัตรภาพ", "สีชอล์ก"]);

  const steps = findSection(view, "ขั้นตอน");
  assert.equal(steps.entries.length, 2);
  assert.equal(steps.entries[0].label, "ขั้นนำ");
  assert.deepEqual(steps.entries[0].lines, ["ตั้งคำถามกระตุ้นความสนใจ"]);

  const objective = findSection(view, "จุดประสงค์การเรียนรู้");
  assert.deepEqual(objective.entries[0].lines, ["นักเรียนสามารถอธิบายห่วงโซ่อาหารได้"]);

  const time = findSection(view, "เวลา");
  assert.deepEqual(time.entries[0].lines, ["50 นาที"]);
});

test("worksheet renders instructions section + numbered item entries", () => {
  const view = renderBody({ outputType: "worksheet", body: worksheetBody() });
  assert.equal(view.ok, true);
  const labels = view.sections.map((s) => s.label);
  assert.ok(labels.includes("คำชี้แจง"));
  assert.ok(labels.includes("ข้อ"));

  const items = findSection(view, "ข้อ");
  assert.equal(items.entries.length, 2);
  assert.equal(items.entries[0].label, "ข้อ 1");
  assert.deepEqual(items.entries[0].lines, ["พืชสร้างอาหารเองได้ เรียกว่า ?", "ผู้ผลิต"]);
});

test("quiz renders item entries with options, answer, explanation", () => {
  const view = renderBody({ outputType: "quiz", body: quizBody() });
  assert.equal(view.ok, true);
  const items = view.sections.find((s) => s.label === "ข้อ");
  assert.equal(items.entries.length, 1);
  const { label, lines } = items.entries[0];
  assert.equal(label, "ข้อ 1");
  assert.ok(lines.some((l) => l.includes("ต้นข้าว")));
  assert.ok(lines.some((l) => l.includes("คำตอบ")));
  assert.ok(lines.some((l) => l.includes("สังเคราะห์แสง")));
});

test("slides renders entries labeled by slide title with bullet lines", () => {
  const view = renderBody({ outputType: "slides", body: slidesBody() });
  assert.equal(view.ok, true);
  const slides = view.sections.find((s) => s.label === "สไลด์");
  assert.equal(slides.entries.length, 2);
  assert.equal(slides.entries[0].label, "ปกเรื่อง");
  assert.deepEqual(slides.entries[0].lines, ["ระบบนิเวศ"]);
  assert.deepEqual(slides.entries[1].lines, ["ผู้ผลิต", "ผู้บริโภค", "ผู้ย่อยสลาย"]);
});

test("rubric renders criterion entries with per-level descriptions", () => {
  const view = renderBody({ outputType: "rubric", body: rubricBody() });
  assert.equal(view.ok, true);
  const criteria = view.sections.find((s) => s.label === "เกณฑ์");
  assert.equal(criteria.entries.length, 1);
  assert.equal(criteria.entries[0].label, "ความถูกต้อง");
  assert.ok(criteria.entries[0].lines.includes("ระดับ ดีเยี่ยม: ถูกต้องครบถ้วน"));
  assert.ok(criteria.entries[0].lines.includes("ระดับ พอใช้: มีข้อผิดพลาดบางส่วน"));
});

test("activity renders duration/group/materials sections + steps entries", () => {
  const view = renderBody({ outputType: "activity", body: activityBody() });
  assert.equal(view.ok, true);
  const labels = view.sections.map((s) => s.label);
  assert.ok(labels.includes("เวลา"));
  assert.ok(labels.includes("จำนวนสมาชิก"));
  assert.ok(labels.includes("สื่อ"));
  assert.ok(labels.includes("ขั้นตอน"));

  const time = findSection(view, "เวลา");
  assert.equal(time.entries[0].lines[0], "40 นาที");

  const group = findSection(view, "จำนวนสมาชิก");
  assert.equal(group.entries[0].lines[0], "4 คน");

  const steps = findSection(view, "ขั้นตอน");
  assert.equal(steps.entries[0].label, "สำรวจ");
  assert.deepEqual(steps.entries[0].lines, ["สำรวจสิ่งมีชีวิตรอบบริเวณโรงเรียน"]);
});

test("unknown outputType returns ok:false with empty title and sections", () => {
  const view = renderBody({ outputType: "not-a-type", body: lessonBody() });
  assert.equal(view.ok, false);
  assert.equal(view.title, "");
  assert.deepEqual(view.sections, []);
});

test("non-plain body returns ok:false", () => {
  assert.equal(renderBody({ outputType: "lesson-plan", body: null }).ok, false);
  assert.equal(renderBody({ outputType: "lesson-plan", body: "nope" }).ok, false);
  assert.equal(renderBody({ outputType: "lesson-plan", body: [] }).ok, false);
  assert.equal(renderBody({ outputType: "lesson-plan", body: {} }).ok, false);
});

test("renderBody never throws on garbage", () => {
  const bad = [
    null,
    undefined,
    42,
    "string",
    [],
    [1, 2],
    { title: 123 },
    { items: "no" },
    { steps: {} },
    { materials: "no" },
  ];
  for (const outputType of SIX) {
    assert.doesNotThrow(() => renderBody({ outputType, body: undefined }));
    assert.doesNotThrow(() => renderBody({ outputType, body: "garbage" }));
  }
  assert.doesNotThrow(() => renderBody({ outputType: "quiz", body: "nope" }));
  for (const b of bad) {
    assert.doesNotThrow(() => renderBody({ outputType: "lesson-plan", body: b }));
    assert.doesNotThrow(() => renderBody({ outputType: "", body: b }));
  }
});

test("title comes from body.title when present, else empty string", () => {
  assert.equal(
    renderBody({ outputType: "lesson-plan", body: { ...lessonBody(), title: "สวัสดี" } }).title,
    "สวัสดี",
  );
  const noTitle = { ...lessonBody() };
  delete noTitle.title;
  assert.equal(renderBody({ outputType: "lesson-plan", body: noTitle }).title, "");
});

test("missing optional sections are omitted, never undefined", () => {
  const body = lessonBody();
  delete body.materials;
  delete body.steps;
  const view = renderBody({ outputType: "lesson-plan", body });
  assert.equal(view.ok, true);
  for (const s of view.sections) {
    for (const e of s.entries) {
      assert.ok(Array.isArray(e.lines), `${e.label} lines is array`);
    }
  }
  assert.ok(!view.sections.find((s) => s.label === "สื่อ"));
  assert.ok(!view.sections.find((s) => s.label === "ขั้นตอน"));
});