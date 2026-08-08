import { isValidOutputType, OUTPUT_SCHEMAS } from "../data/schemas.js";
import { validateBody } from "../utils/validateSchema.js";
import { sanitizeBody } from "../utils/sanitizer.js";
import { extractJson } from "../utils/jsonExtractor.js";
import { templateGenerator } from "./templateGenerator.js";

const DEFAULT_MODEL = "gemini-3.1-flash-lite";

function buildEndpoint(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

async function callGemini(payload, { apiKey, model, fetchImpl = fetch, timeoutMs = 30000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(buildEndpoint(model) + "?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson(text);
    return parsed ? { ok: true, text, parsed } : { ok: false };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}

export const generationService = {
  async generate({ prompt = "", subject = "", grade = "", outputType = "", apiKey, model, fetchImpl, timeoutMs }) {
    const key = apiKey ?? import.meta.env?.VITE_GEMINI_API_KEY ?? "";
    const resolvedModel = model ?? import.meta.env?.VITE_GEMINI_MODEL ?? DEFAULT_MODEL;
    const fallback = () => {
      const { body } = templateGenerator.generate({ prompt, subject, grade, outputType });
      return { ok: true, body, source: "template", error: null };
    };

    if (!isValidOutputType(outputType) || !key) {
      return fallback();
    }

    const payload = {
      contents: [{ parts: [{ text: buildPrompt({ prompt, subject, grade, outputType }) }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 4096 },
    };
    const result = await callGemini(payload, { apiKey: key, model: resolvedModel, fetchImpl, timeoutMs });

    if (!result.ok) {
      return fallback();
    }

    const sanitized = sanitizeBody({ outputType, body: result.parsed });
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