const VALID_TYPES = [
  "lesson-plan",
  "worksheet",
  "quiz",
  "slides",
  "rubric",
  "activity",
];

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function linesFrom(value, formatter) {
  const arr = Array.isArray(value) ? value : [];
  const out = [];
  for (const item of arr) {
    const line = formatter(item);
    if (line == null || line === "") continue;
    out.push(line);
  }
  return out;
}

function toSingle(value) {
  if (typeof value === "string") return [value];
  if (typeof value === "number") return [String(value)];
  return [];
}

function materialsSection(label, value) {
  const lines = linesFrom(value, (item) =>
    item == null ? null : String(item),
  );
  if (lines.length === 0) return [];
  return [{ label, entries: [{ lines }] }];
}

function textSection(label, value) {
  const lines = toSingle(value);
  if (lines.length === 0) return [];
  return [{ label, entries: [{ lines }] }];
}

function entriesSection(label, value, formatter, numeral) {
  const list = Array.isArray(value) ? value : [];
  const entries = list.map((item, i) => {
    const { label: subLabel, lines } = formatter(item, i);
    const sub = numeral ? `${numeral} ${i + 1}` : subLabel ?? null;
    return { label: sub, lines };
  });
  const nonEmpty = entries.filter((e) => e.lines.length > 0);
  if (nonEmpty.length === 0) return [];
  return [{ label, entries: nonEmpty }];
}

function stepFormatter(item) {
  return { label: item?.name, lines: toSingle(item?.description) };
}

function worksheetItemFormatter(item) {
  const lines = [];
  if (item?.question) lines.push(String(item.question));
  if (item?.answer) lines.push(String(item.answer));
  return { label: null, lines };
}

function quizItemFormatter(item) {
  const lines = [];
  if (item?.question) lines.push(String(item.question));
  for (const o of Array.isArray(item?.options) ? item.options : []) {
    if (o != null && o !== "") lines.push(String(o));
  }
  if (item?.answer) lines.push(`คำตอบ: ${item.answer}`);
  if (item?.explanation) lines.push(`คำอธิบาย: ${item.explanation}`);
  return { label: null, lines };
}

function slideFormatter(item) {
  return {
    label: item?.title,
    lines: linesFrom(item?.bullets, String),
  };
}

function rubricCriterionFormatter(item) {
  const lines = linesFrom(item?.descriptions, (d) => {
    if (d == null || (d.level == null && d.text == null)) return null;
    return `ระดับ ${d.level ?? ""}${d.text != null ? ": " + d.text : ""}`;
  });
  return { label: item?.name, lines };
}

function durationSection(minutes) {
  if (!Number.isFinite(minutes)) return [];
  return [{ label: "เวลา", entries: [{ lines: [`${minutes} นาที`] }] }];
}

function groupSizeSection(size) {
  if (!Number.isFinite(size)) return [];
  return [{ label: "จำนวนสมาชิก", entries: [{ lines: [`${size} คน`] }] }];
}

const BUILDERS = {
  "lesson-plan": (body) => [
    ...textSection("จุดประสงค์การเรียนรู้", body.objective),
    ...durationSection(body.durationMinutes),
    ...materialsSection("สื่อ", body.materials),
    ...entriesSection("ขั้นตอน", body.steps, stepFormatter),
    ...textSection("การประเมิน", body.assessment),
  ],
  worksheet: (body) => [
    ...textSection("คำชี้แจง", body.instructions),
    ...entriesSection("ข้อ", body.items, worksheetItemFormatter, "ข้อ"),
  ],
  quiz: (body) => [
    ...entriesSection("ข้อ", body.items, quizItemFormatter, "ข้อ"),
  ],
  slides: (body) => [
    ...entriesSection("สไลด์", body.slides, slideFormatter),
  ],
  rubric: (body) => [
    ...entriesSection("เกณฑ์", body.criteria, rubricCriterionFormatter),
  ],
  activity: (body) => [
    ...durationSection(body.durationMinutes),
    ...groupSizeSection(body.groupSize),
    ...materialsSection("สื่อ", body.materials),
    ...entriesSection("ขั้นตอน", body.steps, stepFormatter),
  ],
};

export function renderBody({ outputType, body }) {
  if (!VALID_TYPES.includes(outputType)) {
    return { ok: false, title: "", sections: [] };
  }
  if (!isPlainObject(body)) {
    return { ok: false, title: "", sections: [] };
  }
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return { ok: false, title: "", sections: [] };
  }

  const title = typeof body.title === "string" ? body.title : "";

  const sections = BUILDERS[outputType](body).filter((section) =>
    section.entries.some((e) => e.lines.length > 0),
  );

  return { ok: true, title, sections };
}