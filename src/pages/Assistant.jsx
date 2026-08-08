import { useState, useRef, useEffect } from "react";
import { Paperclip, Library, Send, X, ChevronRight, BookOpen, FileText } from "lucide-react";
import { subjects, DOC_TYPES } from "../data/subjects";
import { Card, Button, AutosizeTextarea, EmptyState, Pill } from "../components/ui";
import { getSubjectIcon } from "../data/subjectIcons";
import { chatService } from "../services/chatService";
import { aiService } from "../services/aiService";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "สวัสดีครับ! ผมช่วยตอบคำถามเกี่ยวกับไฟล์ในคลังสื่อการสอน หรือความรู้ในแต่ละวิชาได้ ถามมาได้เลยครับ",
};

function AttachmentChip({ icon, children, onRemove }) {
  return (
    <Pill className="gap-1.5 py-1">
      {icon}
      <span className="max-w-40 truncate">{children}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-krumate-muted hover:text-error">
          <X size={12} />
        </button>
      )}
    </Pill>
  );
}

function MessageBubble({ role, content, files, libraryDocs }) {
  const isUser = role === "user";
  return (
    <div
      className={isUser ? "flex justify-end mb-4" : "flex justify-start mb-4"}
    >
      <div
        className={[
          "max-w-[75%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-krumate-primary text-white"
            : "bg-krumate-surface-strong text-krumate-text",
        ].join(" ")}
      >
        {(files?.length > 0 || libraryDocs?.length > 0) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {files?.map((f, i) => (
              <AttachmentChip key={`f-${i}`} icon={<FileText size={12} />}>{f.name}</AttachmentChip>
            ))}
            {libraryDocs?.map((d, i) => (
              <AttachmentChip key={`d-${i}`} icon={<BookOpen size={12} />}>{d.chapterTitle} · {d.docLabel}</AttachmentChip>
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
    <div className="flex justify-start mb-4">
      <div className="rounded-xl rounded-bl rounded-b-sm bg-krumate-surface-strong px-4 py-2.5 text-sm text-krumate-muted">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[70vh] w-[480px] max-w-[90vw] flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-krumate-border px-5 py-4">
          <h3 className="text-base font-semibold text-krumate-text">เลือกเอกสารจาก Library</h3>
          <button type="button" onClick={onClose} className="text-krumate-muted hover:text-krumate-text">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {subjects.map((s) => {
            const SubjectIcon = getSubjectIcon(s.subject);
            return (
            <div key={s.id} className="mb-1">
              <button
                type="button"
                onClick={() => setExpandedSubject(expandedSubject === s.id ? null : s.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-krumate-text hover:bg-krumate-surface-strong"
              >
                <span className="flex items-center gap-2">
                  <SubjectIcon size={15} className="text-krumate-muted" />
                  {s.title}
                </span>
                <ChevronRight
                  size={15}
                  className={[
                    "text-krumate-muted transition-transform",
                    expandedSubject === s.id ? "rotate-90" : "",
                  ].join(" ")}
                />
              </button>

              {expandedSubject === s.id && (
                <div className="pl-4">
                  {s.chapters.map((chapter) => {
                    if (!chapter.documents) {
                      return (
                        <p key={chapter.id} className="px-3 py-1.5 text-[13px] text-krumate-muted">
                          {chapter.title} — ยังไม่มีเอกสาร
                        </p>
                      );
                    }
                    return (
                      <div key={chapter.id} className="mb-1.5">
                        <p className="mx-3 mb-1 mt-1.5 text-[13px] text-krumate-muted">{chapter.title}</p>
                        <div className="flex flex-col gap-0.5">
                          {DOC_TYPES.map((docType) => (
                            <button
                              key={docType.key}
                              type="button"
                              onClick={() =>
                                onSelect({
                                  subjectTitle: s.title,
                                  chapterTitle: chapter.title,
                                  docLabel: docType.label,
                                  docKey: docType.key,
                                })
                              }
                              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-left text-[13px] text-krumate-text hover:bg-krumate-surface-strong"
                            >
                              <FileText size={14} className="text-krumate-muted" />
                              {docType.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Assistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedLibraryDocs, setSelectedLibraryDocs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  // Restore previous conversation on mount; seed a welcome message on first visit.
  useEffect(() => {
    let cancelled = false;
    chatService.list().then((stored) => {
      if (cancelled) return;
      if (stored.length === 0) {
        setMessages([WELCOME_MESSAGE]);
        chatService.replaceAll([WELCOME_MESSAGE]);
      } else {
        setMessages(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    const withUser = [...messages, userMessage];
    setMessages(withUser);
    setInput("");
    const filesToSend = attachedFiles;
    const docsToSend = selectedLibraryDocs;
    setAttachedFiles([]);
    setSelectedLibraryDocs([]);
    setIsTyping(true);
    await chatService.replaceAll(withUser);

    const reply = await aiService.generate({
      message: trimmed,
      attachedFiles: filesToSend,
      libraryDocs: docsToSend,
    });
    const withReply = [...withUser, { role: "assistant", content: reply }];
    setMessages(withReply);
    setIsTyping(false);
    await chatService.replaceAll(withReply);
  };

  const handleClear = async () => {
    await chatService.clear();
    setMessages([WELCOME_MESSAGE]);
    await chatService.replaceAll([WELCOME_MESSAGE]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = (input.trim() || attachedFiles.length > 0 || selectedLibraryDocs.length > 0) && !isTyping;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-[700px] flex-col py-2">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-krumate-text">ผู้ช่วย AI</h1>
          <p className="text-sm text-krumate-muted">
            ถามเกี่ยวกับไฟล์ในคลังสื่อการสอน หรือความรู้ในแต่ละวิชาได้เลย
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isTyping}
          className="shrink-0"
        >
          <X size={14} />
          ล้างประวัติ
        </Button>
      </div>

      <div className="mb-4 flex-1 overflow-y-auto px-1 pt-1">
        {messages.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="ยังไม่มีข้อความ"
            description="พิมพ์คำถามของคุณเพื่อเริ่มต้นสนทนากับผู้ช่วย AI"
          />
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} role={msg.role} content={msg.content} files={msg.files} libraryDocs={msg.libraryDocs} />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <Card className="p-2.5 px-4">
        {(attachedFiles.length > 0 || selectedLibraryDocs.length > 0) && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachedFiles.map((file, i) => (
              <AttachmentChip key={`f-${i}`} icon={<Paperclip size={12} />} onRemove={() => removeFile(i)}>
                {file.name}
              </AttachmentChip>
            ))}
            {selectedLibraryDocs.map((doc, i) => (
              <AttachmentChip key={`d-${i}`} icon={<BookOpen size={12} />} onRemove={() => removeLibraryDoc(i)}>
                {doc.chapterTitle} · {doc.docLabel}
              </AttachmentChip>
            ))}
          </div>
        )}

        <AutosizeTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์คำถามของคุณ..."
          rows={1}
          className="resize-none border-0 px-0 py-1.5 focus:ring-0 focus:border-0"
        />

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="แนบไฟล์"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-krumate-border bg-krumate-surface text-krumate-muted hover:bg-krumate-surface-strong hover:text-krumate-text"
            >
              <Paperclip size={16} />
            </button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowLibraryPicker(true)}
              className="gap-1.5"
            >
              <Library size={14} />
              Library
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="ส่งข้อความ"
            className="h-8 w-8 p-0"
          >
            <Send size={15} />
          </Button>
        </div>
      </Card>

      {showLibraryPicker && (
        <LibraryPickerModal onClose={() => setShowLibraryPicker(false)} onSelect={handleSelectLibraryDoc} />
      )}
    </div>
  );
}

export default Assistant;