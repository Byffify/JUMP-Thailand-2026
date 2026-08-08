export const OUTPUT_TYPES = [
  "lesson-plan",
  "worksheet",
  "quiz",
  "slides",
  "rubric",
  "activity",
];

export const SOURCES = ["gemini", "template", "legacy"];

export const CONTENT_VERSION = 1;

const lessonPlanFields = [
  { name: "title", type: "string", required: true },
  { name: "objective", type: "string", required: true },
  { name: "durationMinutes", type: "number", required: true },
  { name: "materials", type: "array", required: true, itemType: "string" },
  {
    name: "steps",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "name", type: "string", required: true },
      { name: "durationMinutes", type: "number", required: true },
      { name: "description", type: "string", required: true },
    ],
  },
  { name: "assessment", type: "string", required: true },
];

const worksheetFields = [
  { name: "title", type: "string", required: true },
  { name: "instructions", type: "string", required: true },
  {
    name: "items",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "question", type: "string", required: true },
      { name: "answer", type: "string", required: true },
    ],
  },
];

const quizFields = [
  { name: "title", type: "string", required: true },
  {
    name: "items",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "question", type: "string", required: true },
      { name: "type", type: "string", required: true },
      { name: "options", type: "array", required: true, itemType: "string" },
      { name: "answer", type: "string", required: true },
      { name: "explanation", type: "string", required: true },
    ],
  },
];

const slidesFields = [
  { name: "title", type: "string", required: true },
  {
    name: "slides",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "title", type: "string", required: true },
      { name: "bullets", type: "array", required: true, itemType: "string" },
    ],
  },
];

const rubricFields = [
  { name: "title", type: "string", required: true },
  {
    name: "criteria",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "name", type: "string", required: true },
      {
        name: "descriptions",
        type: "array",
        required: true,
        itemType: "object",
        itemShape: [
          { name: "level", type: "string", required: true },
          { name: "text", type: "string", required: true },
        ],
      },
    ],
  },
];

const activityFields = [
  { name: "title", type: "string", required: true },
  { name: "durationMinutes", type: "number", required: true },
  { name: "groupSize", type: "number", required: true },
  { name: "materials", type: "array", required: true, itemType: "string" },
  {
    name: "steps",
    type: "array",
    required: true,
    itemType: "object",
    itemShape: [
      { name: "name", type: "string", required: true },
      { name: "description", type: "string", required: true },
    ],
  },
];

export const OUTPUT_SCHEMAS = {
  "lesson-plan": { key: "lesson-plan", fields: lessonPlanFields },
  worksheet: { key: "worksheet", fields: worksheetFields },
  quiz: { key: "quiz", fields: quizFields },
  slides: { key: "slides", fields: slidesFields },
  rubric: { key: "rubric", fields: rubricFields },
  activity: { key: "activity", fields: activityFields },
};

function emptyValueFor(type) {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return null;
  }
}

export function createEmptyBody(outputType) {
  const schema = OUTPUT_SCHEMAS[outputType];
  if (!schema) {
    return null;
  }
  const body = {};
  for (const field of schema.fields) {
    body[field.name] = emptyValueFor(field.type);
  }
  return body;
}

export function isValidOutputType(t) {
  return OUTPUT_TYPES.includes(t);
}
