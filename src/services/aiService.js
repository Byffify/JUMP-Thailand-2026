const DEFAULT_MODEL = "gemini-3.1-flash-lite";

function buildEndpoint(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

function offlineReply({ message = "", attachedFiles = [], libraryDocs = [] }) {
  if (libraryDocs.length > 0) {
    return (
      "ผมเห็นที่เลือกจากคลัง " +
      libraryDocs.length +
      " รายการครับ (" +
      libraryDocs.map((d) => `${d.chapterTitle} - ${d.docLabel}`).join(", ") +
      ") — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key ก่อน"
    );
  }
  if (attachedFiles.length > 0) {
    return `ผมเห็นไฟล์ที่แนบมา ${attachedFiles.length} ไฟล์ครับ — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key ก่อน`;
  }
  return message.trim()
    ? `เกี่ยวกับ "${message.trim()}" — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key ก่อน`
    : "ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key ก่อน";
}

function buildPrompt({ message, attachedFiles, libraryDocs }) {
  const lines = [
    "You are a Thai teacher-education assistant.",
    "Answer conversationally and in Thai.",
    "",
    `User question: ${message || "(no text)"}`,
  ];
  if (libraryDocs.length > 0) {
    lines.push(
      "",
      "Selected library documents:",
      ...libraryDocs.map((d) => `- ${d.subjectTitle} / ${d.chapterTitle} / ${d.docLabel}`),
    );
  }
  if (attachedFiles.length > 0) {
    lines.push(
      "",
      "Attached files:",
      ...attachedFiles.map((f) => `- ${f.name}`),
    );
  }
  return lines.join("\n");
}

export const aiService = {
  async generate({
    message = "",
    attachedFiles = [],
    libraryDocs = [],
    apiKey,
    model,
    fetchImpl = fetch,
    timeoutMs = 30000,
  }) {
    const key = apiKey ?? import.meta.env?.VITE_GEMINI_API_KEY ?? "";
    if (!key) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return offlineReply({ message, attachedFiles, libraryDocs });
    }

    const payload = {
      contents: [{ parts: [{ text: buildPrompt({ message, attachedFiles, libraryDocs }) }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(buildEndpoint(model ?? DEFAULT_MODEL) + "?key=" + encodeURIComponent(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!res.ok) {
        return offlineReply({ message, attachedFiles, libraryDocs });
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return text.trim() ? text : offlineReply({ message, attachedFiles, libraryDocs });
    } catch {
      return offlineReply({ message, attachedFiles, libraryDocs });
    } finally {
      clearTimeout(timer);
    }
  },
};