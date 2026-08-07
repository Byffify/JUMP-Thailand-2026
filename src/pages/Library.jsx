import { useEffect, useState } from "react";
import { Search, FolderOpen, FileText, ChevronRight, ArrowLeft, Download, Play } from "lucide-react";
import { Card, Button, Input, Pill, EmptyState, Skeleton } from "../components/ui";
import { subjects, DOC_TYPES, SUBJECT_ICON } from "../data/subjects";

const SUB_ACTIONS = { view: Play, download: Download };

function SubjectList({
  subjects,
  search,
  setSearch,
  filterSubject,
  setFilterSubject,
  filterGrade,
  setFilterGrade,
  onOpenSubject,
  loading,
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

  const hasFilter = filterSubject !== "all" || filterGrade !== "all" || search;

  return (
    <div>
      <h1 className="text-2xl font-bold text-krumate-text mb-1">คลังสื่อ</h1>
      <p className="text-krumate-muted text-sm mb-5">
        คลังสื่อการสอนทั้งหมดของคุณ
      </p>

      <div className="flex flex-wrap gap-2.5 mb-6">
        <div className="relative flex-1 basis-60 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-krumate-muted"
          />
          <Input
            type="text"
            placeholder="ค้นหาชื่อ, วิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="w-auto rounded-lg border border-krumate-border bg-krumate-surface px-3 py-2 text-sm text-krumate-text focus:border-krumate-primary focus:outline-none cursor-pointer"
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
          className="w-auto rounded-lg border border-krumate-border bg-krumate-surface px-3 py-2 text-sm text-krumate-text focus:border-krumate-primary focus:outline-none cursor-pointer"
        >
          <option value="all">ทุกระดับชั้น</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>

        {hasFilter && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch("");
              setFilterSubject("all");
              setFilterGrade("all");
            }}
          >
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="ไม่พบรายการที่ค้นหา"
          description="ลองปรับคำค้นหาหรือตัวกรองของคุณ"
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {filtered.map((s) => {
            const meta = SUBJECT_ICON[s.subject] || { icon: "📄", bg: "#f1efe8", color: "#444" };
            return (
              <Card key={s.id} className="p-5 hover:shadow-md transition-all duration-200">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] mb-3"
                  style={{
                    background: meta.bg,
                    fontSize: "20px",
                    display: "flex",
                  }}
                >
                  {meta.icon}
                </div>
                <h3 className="mb-2.5 text-base font-bold text-krumate-text">{s.title}</h3>
                <div className="flex gap-1.5 flex-wrap mb-4 gap-y-1.5">
                  <Pill>{s.subject}</Pill>
                  <Pill>{s.grade}</Pill>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => onOpenSubject(s)}
                >
                  เปิด
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChapterList({ subject, onBack, onOpenChapter }) {
  return (
    <div>
      <Button variant="secondary" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft size={15} />
        กลับไปที่คลัง
      </Button>

      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
          style={{ background: SUBJECT_ICON[subject.subject]?.bg || "#f1efe8" }}
        >
          {SUBJECT_ICON[subject.subject]?.icon || "📄"}
        </div>
        <h2 className="text-xl font-bold text-krumate-text">{subject.title}</h2>
      </div>

      <div className="flex flex-col gap-2">
        {subject.chapters.map((chapter) => {
          const hasDocs = !!chapter.documents;
          const docCount = hasDocs ? Object.keys(chapter.documents).length : 0;
          return (
            <Card
              key={chapter.id}
              className={`flex items-center justify-between p-4 ${
                hasDocs ? "cursor-pointer hover:border-krumate-primary/40" : "opacity-55"
              }`}
              onClick={hasDocs ? () => onOpenChapter(chapter) : undefined}
            >
              <div>
                <p className="text-[15px] font-medium text-krumate-text">{chapter.title}</p>
                <p className="text-xs text-krumate-muted mt-0.5">
                  {hasDocs ? `${docCount} เอกสาร` : "ยังไม่มีเอกสาร"}
                </p>
              </div>
              <ChevronRight size={18} className="text-krumate-muted" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DocumentGrid({ chapter, onBack }) {
  return (
    <div>
      <Button variant="secondary" size="sm" onClick={onBack} className="mb-4 gap-1">
        <ArrowLeft size={15} />
        กลับไปที่บทเรียน
      </Button>
      <h2 className="text-xl font-bold text-krumate-text mb-5">{chapter.title}</h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
        {DOC_TYPES.map((docType) => {
          const doc = chapter.documents[docType.key];
          const ActionIcon = SUB_ACTIONS[docType.action];
          return (
            <Card key={docType.key} className="p-5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg mb-2.5"
                style={{ background: docType.bg }}
              >
                <FileText size={16} className="text-krumate-muted" />
              </div>
              <p className="mb-2.5 font-medium text-sm text-krumate-text">{docType.label}</p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-1.5"
                onClick={() => window.open(doc.url, "_blank")}
              >
                <ActionIcon size={14} />
                {docType.action === "view" ? "เปิดดู" : "ดาวน์โหลด"}
              </Button>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="py-2 max-w-[900px]">
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
          loading={loading}
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