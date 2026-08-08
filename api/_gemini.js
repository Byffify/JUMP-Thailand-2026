const DEFAULT_MODEL = "gemini-3.1-flash-lite";

export async function callGemini({
  promptText,
  model,
  generationConfig,
  apiKey,
  fetchImpl = fetch,
  timeoutMs = 30000,
}) {
  const resolvedKey = apiKey ?? process.env.GEMINI_API_KEY;
  if (!resolvedKey) return { ok: false, error: "GEMINI_API_KEY not configured" };

  const resolvedModel = model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": resolvedKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: `Gemini HTTP ${res.status}` };
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text.trim()) return { ok: false, error: "empty response" };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: String(err) };
  } finally {
    clearTimeout(timer);
  }
}