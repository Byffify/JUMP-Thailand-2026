import { isValidOutputType, OUTPUT_SCHEMAS } from "../data/schemas.js";
import { validateBody } from "../utils/validateSchema.js";
import { sanitizeBody } from "../utils/sanitizer.js";
import { extractJson } from "../utils/jsonExtractor.js";
import { templateGenerator } from "./templateGenerator.js";

const GENERATE_ENDPOINT = "/api/generate";

async function callServer(payload, { fetchImpl = fetch, timeoutMs = 30000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(GENERATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return data?.ok && typeof data.text === "string"
      ? { ok: true, text: data.text }
      : { ok: false };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export const generationService = {
  async generate({ prompt = "", subject = "", grade = "", outputType = "", apiKey: _apiKey, model, fetchImpl, timeoutMs }) {
    const fallback = () => {
      const { body } = templateGenerator.generate({ prompt, subject, grade, outputType });
      return { ok: true, body, source: "template", error: null };
    };

    if (!isValidOutputType(outputType)) {
      return fallback();
    }

    const result = await callServer(
      {
        promptText: buildPrompt({ prompt, subject, grade, outputType }),
        model,
      },
      { fetchImpl, timeoutMs },
    );

    if (!result.ok) {
      return fallback();
    }

    const parsed = extractJson(result.text);
    if (!parsed) {
      return fallback();
    }

    const sanitized = sanitizeBody({ outputType, body: parsed });
    if (!validateBody(outputType, sanitized).valid) {
      return fallback();
    }

    return { ok: true, body: sanitized, source: "gemini", error: null };
  },
};

function describeField(f) {
  if (f.type === "array" && f.itemShape) {
    const shapeText = f.itemShape
      .map((sub) => `    - ${sub.name} (${sub.type})`)
      .join("\n");
    return `- ${f.name}: array of objects, each object has exactly these fields:\n${shapeText}`;
  }
  if (f.type === "array") {
    return `- ${f.name}: array of ${f.itemType || "values"}`;
  }
  return `- ${f.name}: ${f.type}`;
}

function buildPrompt({ prompt, subject, grade, outputType }) {
  const schema = OUTPUT_SCHEMAS[outputType];
  const fieldsText = schema.fields.map(describeField).join("\n");
  return [
    "You are a Thai teacher-education assistant. Respond with ONLY a JSON object.",
    "",
    "Requirements:",
    `- outputType: ${outputType}`,
    `- subject: ${subject}, grade: ${grade}`,
    `- prompt: ${prompt}`,
    "",
    "Return JSON with these top-level fields and nothing else:",
    fieldsText,
    "",
    "Respect the exact types above. An array-of-objects field must be an array of objects, never a flat array of strings.",
    "Use Thai language for all content. Do not wrap the JSON in markdown fences.",
  ].join("\n");
}