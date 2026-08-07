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
      return raw == null || typeof raw === "string" ? String(raw ?? "") : String(raw);
  }
}

function sanitizeArrayItem(item, field) {
  const shape = field.itemShape;
  if (!shape || typeof item !== "object" || item === null) return item;
  const out = {};
  for (const sub of shape) {
    out[sub.name] = sanitizeField(item[sub.name], sub);
  }
  return out;
}