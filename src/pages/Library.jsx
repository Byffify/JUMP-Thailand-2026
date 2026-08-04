import { useState } from "react";
import { subjects, DOC_TYPES, SUBJECT_ICON } from "../data/subjects";

function Card({ children, style, onClick, hoverable = true }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        boxShadow: hoverable && hover ? "0 4px 12px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.06)",
        transform: hoverable && hover ? "translateY(-2px)" : "translateY(0)",
        transition: "box-shadow 0.15s, transform 0.15s",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function BackButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginBottom: "16px",
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      ← {label}
    </button>
  );
}

function Badge({ children, bg, color }) {
  return (
    <span
      style={{
        background: bg,
        color: color,
        fontSize: "12px",
        padding: "3px 10px",
        borderRadius: "6px",
      }}
    >
      {children}
    </span>
  );
}

function SubjectList({
  subjects,
  search,
  setSearch,
  filterSubject,
  setFilterSubject,
  filterGrade,
  setFilterGrade,
  onOpenSubject,
}) {
  const subjectOptions = [...new Set(subjects.map((s) => s.subject))];
  const gradeOptions = [...new Set(subjects.map((s) => s.grade))];

  const filtered = subjects.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || s.subject === filterSubject;
    const matchGrade = filterGrade === "all" || s.grade === filterGrade;
    return matchSearch && matchSubject && matchGrade;
  });

  const selectStyle = {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    background: "#fff",
    cursor: "pointer",
  };

  return (
    <div>
      <h1 style={{ marginBottom: "4px" }}>📚 My Library</h1>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        คลังสื่อการสอนทั้งหมดของคุณ
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: "200px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อ, วิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          style={selectStyle}
        >
          <option value="all">ทุกวิชา</option>
          {subjectOptions.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          style={selectStyle}
        >
          <option value="all">ทุกระดับชั้น</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        {(filterSubject !== "all" || filterGrade !== "all" || search) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterSubject("all");
              setFilterGrade("all");
            }}
            style={{ ...selectStyle, color: "#777" }}
          >
            ล้างตัวกรอง ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {filtered.map((s) => {
          const meta = SUBJECT_ICON[s.subject] || { icon: "📄", bg: "#f1efe8", color: "#444" };
          return (
            <Card key={s.id} style={{ padding: "20px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: meta.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  marginBottom: "12px",
                }}
              >
                {meta.icon}
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>{s.title}</h3>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                <Badge bg={meta.bg} color={meta.color}>
                  {s.subject}
                </Badge>
                <Badge bg="#f1efe8" color="#555">
                  {s.grade}
                </Badge>
              </div>
              <button
                onClick={() => onOpenSubject(s)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                เปิด →
              </button>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            padding: "40px",
            border: "1px dashed #ddd",
            borderRadius: "12px",
            color: "#999",
          }}
        >
          ไม่พบรายการที่ค้นหา
        </div>
      )}
    </div>
  );
}

function ChapterList({ subject, onBack, onOpenChapter }) {
  return (
    <div>
      <BackButton onClick={onBack} label="กลับไปที่คลัง" />

      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: SUBJECT_ICON[subject.subject]?.bg || "#f1efe8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {SUBJECT_ICON[subject.subject]?.icon || "📄"}
        </div>
        <h2 style={{ margin: 0 }}>{subject.title}</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {subject.chapters.map((chapter) => {
          const hasDocs = !!chapter.documents;
          const docCount = hasDocs ? Object.keys(chapter.documents).length : 0;
          return (
            <Card
              key={chapter.id}
              onClick={hasDocs ? () => onOpenChapter(chapter) : undefined}
              hoverable={hasDocs}
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: hasDocs ? 1 : 0.55,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "15px" }}>{chapter.title}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#777" }}>
                  {hasDocs ? `${docCount} เอกสาร` : "ยังไม่มีเอกสาร"}
                </p>
              </div>
              <span style={{ color: "#999" }}>›</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DocumentGrid({ chapter, onBack }) {
  const handleAction = (docType, doc) => {
    window.open(doc.url, "_blank");
  };

  return (
    <div>
      <BackButton onClick={onBack} label="กลับไปที่บทเรียน" />
      <h2 style={{ margin: "0 0 20px" }}>{chapter.title}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        {DOC_TYPES.map((docType) => {
          const doc = chapter.documents[docType.key];
          return (
            <Card key={docType.key} hoverable={false} style={{ padding: "18px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: docType.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  fontSize: "16px",
                }}
              >
                {docType.action === "view" ? "🎬" : "📄"}
              </div>
              <p style={{ margin: "0 0 10px", fontWeight: 500, fontSize: "14px" }}>{docType.label}</p>
              <button
                onClick={() => handleAction(docType, doc)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                {docType.action === "view" ? "เปิดดู" : "ดาวน์โหลด"}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Library() {
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      {!selectedSubject && (
        <SubjectList
          subjects={subjects}
          search={search}
          setSearch={setSearch}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          filterGrade={filterGrade}
          setFilterGrade={setFilterGrade}
          onOpenSubject={(s) => setSelectedSubject(s)}
        />
      )}

      {selectedSubject && !selectedChapter && (
        <ChapterList
          subject={selectedSubject}
          onBack={() => setSelectedSubject(null)}
          onOpenChapter={(c) => setSelectedChapter(c)}
        />
      )}

      {selectedSubject && selectedChapter && (
        <DocumentGrid chapter={selectedChapter} onBack={() => setSelectedChapter(null)} />
      )}
    </div>
  );
}

export default Library;
