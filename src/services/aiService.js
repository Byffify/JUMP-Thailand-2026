const CHAT_ENDPOINT = "/api/chat";

function offlineReply({ message = "", attachedFiles = [], libraryDocs = [] }) {
  if (libraryDocs.length > 0) {
    return (
      "ผมเห็นที่เลือกจากคลัง " +
      libraryDocs.length +
      " รายการครับ (" +
      libraryDocs.map((d) => `${d.chapterTitle} - ${d.docLabel}`).join(", ") +
      ") — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key บนเซิร์ฟเวอร์ก่อน"
    );
  }
  if (attachedFiles.length > 0) {
    return `ผมเห็นไฟล์ที่แนบมา ${attachedFiles.length} ไฟล์ครับ — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key บนเซิร์ฟเวอร์ก่อน`;
  }
  return message.trim()
    ? `เกี่ยวกับ "${message.trim()}" — ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key บนเซิร์ฟเวอร์ก่อน`
    : "ยังไม่สามารถเชื่อม AI ได้ กรุณาตั้งค่า API key บนเซิร์ฟเวอร์ก่อน";
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
    apiKey: _apiKey,
    model,
    fetchImpl = fetch,
    timeoutMs = 30000,
  }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptText: buildPrompt({ message, attachedFiles, libraryDocs }),
          model,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        return offlineReply({ message, attachedFiles, libraryDocs });
      }
      const data = await res.json();
      if (!data?.ok || !data?.text) {
        return offlineReply({ message, attachedFiles, libraryDocs });
      }
      return data.text.trim() ? data.text : offlineReply({ message, attachedFiles, libraryDocs });
    } catch {
      return offlineReply({ message, attachedFiles, libraryDocs });
    } finally {
      clearTimeout(timer);
    }
  },
};