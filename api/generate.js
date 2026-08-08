import { callGemini } from "./_gemini.js";

function parseBody(body) {
  try {
    return typeof body === "string" ? JSON.parse(body) : body;
  } catch {
    return null;
  }
}

export function makeGenerateHandler({ fetchImpl } = {}) {
  return async function generateHandler(req, res) {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }
    const body = parseBody(req.body);
    if (!body || typeof body.promptText !== "string" || !body.promptText.trim()) {
      res.status(400).json({ ok: false, error: "promptText is required" });
      return;
    }
    const result = await callGemini({
      promptText: body.promptText,
      model: body.model,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
      fetchImpl,
    });
    res.status(200).json(result);
  };
}

export default makeGenerateHandler();