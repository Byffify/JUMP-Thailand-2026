import { useState, useRef, useEffect } from "react";
import { subjects, DOC_TYPES } from "../data/subjects";

async function getMockAIResponse(userMessage, attachedFiles, libraryDocs) {
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (libraryDocs.length > 0) {
    return `ผมเห็นเอกสารที่คุณเลือกจากคลัง ${libraryDocs.length} รายการแล้วครับ (${libraryDocs
      .map((d) => `${d.chapterTitle} - ${d.docLabel}`)
      .join(", ")}) — นี่คือคำตอบตัวอย่าง ระบบยังไม่เชื่อม AI จริง`;
  }
  if (attachedFiles.length > 0) {
    return `ผมเห็นไฟล์ที่แนบมา ${attachedFiles.length} ไฟล์แล้วครับ — นี่คือคำตอบตัวอย่าง ระบบยังไม่เชื่อม AI จริง`;
  }
  return `เกี่ยวกับ "${userMessage}" นี่เป็นคำตอบตัวอย่างครับ (ยังไม่เชื่อม AI จริง)`;
}

const chipStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  background: "rgba(255,255,255,0.6)",
  borderRadius: "8px",
  padding: "3px 8px",
  fontSize: "12px",
};

function MessageBubble({ role, content, files, libraryDocs }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: "16px" }}>
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: "14px",
          borderBottomRightRadius: isUser ? "4px" : "14px",
          borderBottomLeftRadius: isUser ? "14px" : "4px",
          background: isUser ? "#e6f1fb" : "#f1efe8",
          color: isUser ? "#0c447c" : "#222",
          fontSize: "14px",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {(files?.length > 0 || libraryDocs?.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            {files?.map((f, i) => (
              <span key={`f-${i}`} style={chipStyle}>📄 {f.name}</span>
            ))}
            {libraryDocs?.map((d, i) => (
              <span key={`d-${i}`} style={chipStyle}>📚 {d.chapterTitle} · {d.docLabel}</span>
            ))}
          </div>
        )}
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
      <div style={{ padding: "10px 16px", borderRadius: "14px", borderBottomLeftRadius: "4px", background: "#f1efe8", color: "#999", fontSize: "14px" }}>
        กำลังพิมพ์...
      </div>
    </div>
  );
}

function LibraryPickerModal({ onClose, onSelect }) {
  const [expandedSubject, setExpandedSubject] = useState(null);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "16px",
          width: "480px",
          maxWidth: "90vw",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px" }}>เลือกเอกสารจาก Library</h3>
          <span onClick={onClose} style={{ cursor: "pointer", color: "#999", fontSize: "18px" }}>✕</span>
        </div>

        <div style={{ overflowY: "auto", padding: "8px" }}>
          {subjects.map((s) => (
            <div key={s.id} style={{ marginBottom: "4px" }}>
              <div
                onClick={() => setExpandedSubject(expandedSubject === s.id ? null : s.id)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {s.title}
                <span style={{ color: "#999" }}>{expandedSubject === s.id ? "▾" : "▸"}</span>
              </div>

              {expandedSubject === s.id && (
                <div style={{ paddingLeft: "16px" }}>
                  {s.chapters.map((chapter) => {
                    if (!chapter.documents) {
                      return (
                        <p key={chapter.id} style={{ fontSize: "13px", color: "#aaa", padding: "6px 12px" }}>
                          {chapter.title} — ยังไม่มีเอกสาร
                        </p>
                      );
                    }
                    return (
                      <div key={chapter.id} style={{ marginBottom: "6px" }}>
                        <p style={{ fontSize: "13px", color: "#666", margin: "6px 12px 4px" }}>{chapter.title}</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {DOC_TYPES.map((docType) => (
                            <div
                              key={docType.key}
                              onClick={() =>
                                onSelect({
                                  subjectTitle: s.title,
                                  chapterTitle: chapter.title,
                                  docLabel: docType.label,
                                  docKey: docType.key,
                                })
                              }
                              style={{
                                padding: "6px 12px",
                                fontSize: "13px",
                                cursor: "pointer",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f1efe8")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              {docType.action === "view" ? "🎬" : "📄"} {docType.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Assistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "สวัสดีครับ! ผมช่วยตอบคำถามเกี่ยวกับไฟล์ในคลังสื่อการสอน หรือความรู้ในแต่ละวิชาได้ ถามมาได้เลยครับ 😊" },
  ]);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedLibraryDocs, setSelectedLibraryDocs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeLibraryDoc = (index) => {
    setSelectedLibraryDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectLibraryDoc = (doc) => {
    const exists = selectedLibraryDocs.some(
      (d) => d.chapterTitle === doc.chapterTitle && d.docKey === doc.docKey
    );
    if (!exists) {
      setSelectedLibraryDocs((prev) => [...prev, doc]);
    }
    setShowLibraryPicker(false);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if ((!trimmed && attachedFiles.length === 0 && selectedLibraryDocs.length === 0) || isTyping) return;

    const userMessage = {
      role: "user",
      content: trimmed,
      files: attachedFiles.map((f) => ({ name: f.name })),
      libraryDocs: selectedLibraryDocs,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const filesToSend = attachedFiles;
    const docsToSend = selectedLibraryDocs;
    setAttachedFiles([]);
    setSelectedLibraryDocs([]);
    setIsTyping(true);

    const reply = await getMockAIResponse(trimmed, filesToSend, docsToSend);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (input.trim() || attachedFiles.length > 0 || selectedLibraryDocs.length > 0) && !isTyping;

  return (
    <div style={{ padding: "32px", maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: "0 0 4px" }}>🤖 ผู้ช่วย AI</h1>
        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
          ถามเกี่ยวกับไฟล์ในคลังสื่อการสอน หรือความรู้ในแต่ละวิชาได้เลย
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", padding: "4px 4px 0" }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} files={msg.files} libraryDocs={msg.libraryDocs} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: "20px", padding: "10px 10px 10px 16px", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {(attachedFiles.length > 0 || selectedLibraryDocs.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            {attachedFiles.map((file, i) => (
              <div key={`f-${i}`} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f1efe8", borderRadius: "8px", padding: "5px 8px 5px 10px", fontSize: "12px" }}>
                📄 {file.name}
                <span onClick={() => removeFile(i)} style={{ cursor: "pointer", color: "#999", fontSize: "13px", lineHeight: 1 }}>✕</span>
              </div>
            ))}
            {selectedLibraryDocs.map((doc, i) => (
              <div key={`d-${i}`} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#e6f1fb", color: "#0c447c", borderRadius: "8px", padding: "5px 8px 5px 10px", fontSize: "12px" }}>
                📚 {doc.chapterTitle} · {doc.docLabel}
                <span onClick={() => removeLibraryDoc(i)} style={{ cursor: "pointer", color: "#0c447c", fontSize: "13px", lineHeight: 1 }}>✕</span>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์คำถามของคุณ..."
          rows={1}
          style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: "14px", padding: "6px 0", fontFamily: "inherit", boxSizing: "border-box", display: "block" }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} style={{ display: "none" }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="แนบไฟล์"
              style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #ccc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              📎
            </button>

            <button
              onClick={() => setShowLibraryPicker(true)}
              aria-label="เลือกจาก Library"
              style={{ height: "32px", borderRadius: "16px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "0 12px", color: "#555" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              📚 Library
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="ส่งข้อความ"
            style={{ width: "32px", height: "32px", borderRadius: "50%", border: "none", background: canSend ? "#1a1a1a" : "#ccc", cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, transition: "background 0.15s" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {showLibraryPicker && (
        <LibraryPickerModal onClose={() => setShowLibraryPicker(false)} onSelect={handleSelectLibraryDoc} />
      )}
    </div>
  );
}

export default Assistant;