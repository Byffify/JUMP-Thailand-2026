import { test } from "node:test";
import assert from "node:assert/strict";

import {
  OUTPUT_TYPES,
  SOURCES,
  CONTENT_VERSION,
  OUTPUT_SCHEMAS,
  createEmptyBody,
  isValidOutputType,
} from "../src/data/schemas.js";
import {
  validateBody,
  validateContentRecord,
} from "../src/utils/validateSchema.js";

const lessonPlanFixture = {
  title: "Ecosystems",
  objective: "Students understand food chains",
  durationMinutes: 50,
  materials: ["textbook", "markers"],
  steps: [
    { name: "Warm-up", durationMinutes: 5, description: "Quick questions" },
    { name: "Main", durationMinutes: 30, description: "Group work" },
  ],
  assessment: "Exit ticket",
};

const worksheetFixture = {
  title: "Adjectives",
  instructions: "Fill in the blanks",
  items: [{ question: "A ___ dog", answer: "small" }],
};

const quizFixture = {
  title: "Fractions",
  items: [
    {
      question: "1/2 + 1/2 = ?",
      type: "multiple-choice",
      options: ["1", "2", "3"],
      answer: "1",
      explanation: "Two halves make a whole",
    },
  ],
};

const slidesFixture = {
  title: "Climate Change",
  slides: [
    { title: "Intro", bullets: ["What it is", "Main causes"] },
    { title: "Wrap-up", bullets: ["Key takeaways"] },
  ],
};

const rubricFixture = {
  title: "Writing Rubric",
  criteria: [
    {
      name: "Grammar",
      descriptions: [
        { level: "3", text: "Few errors" },
        { level: "2", text: "Some errors" },
      ],
    },
  ],
};

const activityFixture = {
  title: "Nature Walk",
  durationMinutes: 30,
  groupSize: 4,
  materials: ["clipboard", "pencil"],
  steps: [{ name: "Observe", description: "Record findings" }],
};

const fixtures = {
  "lesson-plan": lessonPlanFixture,
  worksheet: worksheetFixture,
  quiz: quizFixture,
  slides: slidesFixture,
  rubric: rubricFixture,
  activity: activityFixture,
};

test("OUTPUT_SCHEMAS covers all 6 output types", () => {
  assert.equal(OUTPUT_TYPES.length, 6);
  for (const type of OUTPUT_TYPES) {
    const schema = OUTPUT_SCHEMAS[type];
    assert.ok(schema, `schema exists for ${type}`);
    assert.equal(schema.key, type);
    assert.ok(Array.isArray(schema.fields));
    for (const field of schema.fields) {
      assert.ok(field.name);
      assert.ok(["string", "array", "object", "number"].includes(field.type));
    }
  }
});

test("constants match the contract", () => {
  assert.deepEqual(SOURCES, ["gemini", "template", "legacy"]);
  assert.equal(CONTENT_VERSION, 1);
  assert.equal(isValidOutputType("quiz"), true);
  assert.equal(isValidOutputType("video"), false);
  assert.equal(isValidOutputType(undefined), false);
});

test("createEmptyBody returns usable minimal bodies for all 6 types", () => {
  for (const type of OUTPUT_TYPES) {
    const body = createEmptyBody(type);
    assert.ok(body, `empty body for ${type}`);
    const result = validateBody(type, body);
    assert.equal(result.valid, true, `empty body for ${type} is valid`);
  }
});

test("createEmptyBody returns null for unknown type", () => {
  assert.equal(createEmptyBody("video"), null);
});

test("validateBody accepts known-good fixtures", () => {
  for (const type of OUTPUT_TYPES) {
    const result = validateBody(type, fixtures[type]);
    assert.equal(result.valid, true, `${type} should be valid`);
    assert.deepEqual(result.errors, []);
    assert.equal(result.normalized, fixtures[type]);
  }
});

test("validateBody fails on missing required field", () => {
  const missingTitle = { ...worksheetFixture };
  delete missingTitle.title;
  const result = validateBody("worksheet", missingTitle);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('"title"')));
  assert.equal("normalized" in result, false);
});

test("validateBody fails on wrong-typed field", () => {
  const bad = { ...activityFixture, durationMinutes: "long" };
  const result = validateBody("activity", bad);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("durationMinutes")));
});

test("validateBody fails on nested item missing field", () => {
  const bad = {
    ...slidesFixture,
    slides: [{ title: "Intro", bullets: ["a"] }, { title: "No bullets" }],
  };
  const result = validateBody("slides", bad);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("bullets")));
});

test("validateBody enforces quiz max 15 items", () => {
  const items = Array.from({ length: 16 }, (_, i) => ({
    question: `Q${i}`,
    type: "multiple-choice",
    options: ["a", "b"],
    answer: "a",
    explanation: "e",
  }));
  const result = validateBody("quiz", { title: "Big", items });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("at most 15")));
});

test("validateBody fails on unknown outputType", () => {
  const result = validateBody("video", {});
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("Unknown outputType")));
});

test("validateBody fails on non-object body", () => {
  const stringResult = validateBody("quiz", "not an object");
  assert.equal(stringResult.valid, false);
  assert.ok(stringResult.errors.some((e) => e.includes("plain object")));

  const nullResult = validateBody("quiz", null);
  assert.equal(nullResult.valid, false);

  const arrayResult = validateBody("quiz", []);
  assert.equal(arrayResult.valid, false);
});

test("validateContentRecord accepts a valid v1 envelope", () => {
  const record = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    version: 1,
    createdAt: 1716576000000,
    metadata: {
      prompt: "Create a lesson plan about ecosystems",
      subject: "science",
      grade: "p6",
      outputType: "lesson-plan",
      source: "gemini",
    },
    body: lessonPlanFixture,
  };
  const result = validateContentRecord(record);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("validateContentRecord rejects legacy record (missing metadata)", () => {
  const legacy = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    version: 1,
    createdAt: 1716576000000,
    body: lessonPlanFixture,
  };
  const result = validateContentRecord(legacy);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("metadata")));
});

test("validateContentRecord rejects non-envelope inputs", () => {
  assert.equal(validateContentRecord(null).valid, false);
  assert.equal(validateContentRecord("nope").valid, false);

  const badVersion = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    version: 2,
    createdAt: 1716576000000,
    metadata: {
      prompt: "p",
      subject: "science",
      grade: "p6",
      outputType: "quiz",
      source: "template",
    },
    body: quizFixture,
  };
  assert.equal(validateContentRecord(badVersion).valid, false);
});

test("validateContentRecord propagates body errors", () => {
  const record = {
    id: "550e8400-e29b-41d4-a716-446655440003",
    version: 1,
    createdAt: 1716576000000,
    metadata: {
      prompt: "p",
      subject: "math",
      grade: "m1",
      outputType: "activity",
      source: "legacy",
    },
    body: { title: "Only title" },
  };
  const result = validateContentRecord(record);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.startsWith("body:")));
});
