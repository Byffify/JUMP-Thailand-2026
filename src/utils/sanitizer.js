import { isValidOutputType, createEmptyBody, OUTPUT_SCHEMAS } from "../data/schemas.js";

export function sanitizeBody({ outputType, body }) {
  const fallback = createEmptyBody(outputType);
  if (!isValidOutputType(outputType)) return fallback ?? {};
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return fallback;
  }

  const schema = OUTPUT_SCHEMAS[outputType];
  const out = {};
  for (const field of schema.fields) {
    const raw = body[field.name];
    out[field.name] = sanitizeField(raw, field);
  }
  return out;
}

function sanitizeField(raw, field) {
  switch (field.type) {
    case "array": {
      if (!Array.isArray(raw)) return [];
      const items = raw
        .filter((item) => item != null)
        .map((item) => sanitizeArrayItem(item, field));
      return field.name === "items" ? items.slice(0, 15) : items;
    }
    case "object":
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(n) ? n : 0;
    }
    case "string":
    default:
      return raw == null ? "" : String(raw);
  }
}

function sanitizeArrayItem(item, field) {
  const shape = field.itemShape;
  if (!shape) return item;
  // Coerce scalar items (e.g. Gemini returning steps as strings) into valid
  // shape objects instead of letting schema validation fail and dropping content.
  if (typeof item === "string" || typeof item === "number") {
    const firstString = shape.find((sub) => sub.type === "string");
    const out = {};
    for (const sub of shape) {
      if (sub.type === "string") {
        const isFirst = firstString && sub.name === firstString.name;
        out[sub.name] = isFirst ? String(item) : "";
      } else if (sub.type === "number") {
        out[sub.name] = 0;
      } else if (sub.type === "array") {
        out[sub.name] = [];
      } else {
        out[sub.name] = {};
      }
    }
    return out;
  }
  if (!shape || typeof item !== "object" || item === null) return item;
  const out = {};
  for (const sub of shape) {
    out[sub.name] = sanitizeField(item[sub.name], sub);
  }
  return out;
}