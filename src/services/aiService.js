/**
 * Mock AI assistant. No real model/API is wired up yet.
 * Keep this function's signature stable so a real model/API can be swapped
 * in later without touching page components.
 */
export const aiService = {
  async generate({ message = "", attachedFiles = [], libraryDocs = [] }) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (libraryDocs.length > 0) {
      return (
        "ผมเห็นเอกสารที่คุณเลือกจากคลัง " +
        libraryDocs.length +
        " รายการแล้วครับ (" +
        libraryDocs.map((d) => `${d.chapterTitle} - ${d.docLabel}`).join(", ") +
        ") — นี่คือคำตอบตัวอย่าง ระบบยังไม่เชื่อม AI จริง"
      );
    }
    if (attachedFiles.length > 0) {
      return `ผมเห็นไฟล์ที่แนบมา ${attachedFiles.length} ไฟล์แล้วครับ — นี่คือคำตอบตัวอย่าง ระบบยังไม่เชื่อม AI จริง`;
    }
    return message.trim()
      ? `เกี่ยวกับ "${message.trim()}" นี่เป็นคำตอบตัวอย่างครับ (ยังไม่เชื่อม AI จริง)`
      : "นี่คือคำตอบตัวอย่างครับ (ยังไม่เชื่อม AI จริง)";
  },
};