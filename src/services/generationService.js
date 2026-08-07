import { isValidOutputType, OUTPUT_SCHEMAS } from "../data/schemas.js";
import { validateBody } from "../utils/validateSchema.js";
import { sanitizeBody } from "../utils/sanitizer.js";
import { extractJson } from "../utils/jsonExtractor.js";
import { templateGenerator } from "./templateGenerator.js";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(payload, { apiKey, fetchImpl = fetch, timeoutMs = 30000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(ENDPOINT + "?key=" + encodeURIComponent(apiKey), {
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
  async generate({ prompt = "", subject = "", grade = "", outputType = "", apiKey, fetchImpl, timeoutMs }) {
    const key = apiKey ?? import.meta.env?.VITE_GEMINI_API_KEY ?? "";
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
    const result = await callGemini(payload, { apiKey: key, fetchImpl, timeoutMs });

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

function buildPrompt({ prompt, subject, grade, outputType }) {
  const schema = OUTPUT_SCHEMAS[outputType];
  const fieldsText = schema.fields.map((f) => `- ${f.name} (${f.type})`).join("\n");
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
    "Use Thai language for all content. Do not wrap the JSON in markdown fences.",
  ].join("\n");
}