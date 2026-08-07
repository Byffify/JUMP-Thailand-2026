import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderOpen,
  FileText,
  ClipboardList,
  FileQuestion,
  Presentation,
  Star,
  Users,
  Play,
  Trash2,
} from "lucide-react";
import { Card, Button, Input, Pill, SourceBadge, EmptyState, Skeleton } from "../components/ui";
import { SUBJECTS, GRADES, OUTPUT_TYPES } from "../data/constants";
import { contentService } from "../services/contentService";

const findLabel = (list, id) => list.find((item) => item.id === id)?.label ?? id;

const TYPE_ICON = {
  "lesson-plan": FileText,
  worksheet: ClipboardList,
  quiz: FileQuestion,
  slides: Presentation,
  rubric: Star,
  activity: Users,
};

export default function Library() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");

  const load = async () => {
    setLoading(true);
    const list = await contentService.list();
    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((item) => {
    const metadata = item.metadata ?? {};
    const prompt = metadata.prompt ?? "";
    const subject = metadata.subject;
    const grade = metadata.grade;
    const subjectLabel = findLabel(SUBJECTS, subject);
    const matchSearch =
      prompt.toLowerCase().includes(search.toLowerCase()) ||
      subjectLabel.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "all" || subject === filterSubject;
    const matchGrade = filterGrade === "all" || grade === filterGrade;
    return matchSearch && matchSubject && matchGrade;
  });

  const hasFilter = filterSubject !== "all" || filterGrade !== "all" || search;

  const handleRemove = async (id) => {
    await contentService.remove(id);
    await load();
  };

  return (
    <div className="py-2 max-w-[900px]">
      <h1 className="text-2xl font-bold text-krumate-text mb-1">คลังสื่อ</h1>
      <p className="text-krumate-muted text-sm mb-5">สื่อการสอนทั้งหมดที่คุณสร้างขึ้น</p>

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
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
          className="w-auto rounded-lg border border-krumate-border bg-krumate-surface px-3 py-2 text-sm text-krumate-text focus:border-krumate-primary focus:outline-none cursor-pointer"
        >
          <option value="all">ทุกระดับชั้น</option>
          {GRADES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="ยังไม่มีสื่อการสอน"
          description="สร้างสื่อการสอนจากหน้าแดชบอร์ดหรือหน้าสร้างสื่อเพื่อเริ่มต้น"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="ไม่พบรายการที่ค้นหา"
          description="ลองปรับคำค้นหาหรือตัวกรองของคุณ"
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {filtered.map((item) => {
            const metadata = item.metadata ?? {};
            const Icon = TYPE_ICON[metadata.outputType] || FileText;
            return (
              <Card key={item.id} className="p-5 hover:shadow-md transition-all duration-200">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-krumate-primary/10 text-krumate-primary-dark dark:bg-krumate-primary/20 dark:text-krumate-primary">
                  <Icon size={20} />
                </div>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-krumate-text">
                    {metadata.prompt}
                  </h3>
                  <SourceBadge source={metadata.source} className="shrink-0" />
                </div>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  <Pill>{findLabel(SUBJECTS, metadata.subject)}</Pill>
                  <Pill>{findLabel(GRADES, metadata.grade)}</Pill>
                  <Pill>{findLabel(OUTPUT_TYPES, metadata.outputType)}</Pill>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => navigate(`/content/${item.id}`)}
                  >
                    <Play size={14} />
                    เปิด
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                    aria-label="ลบสื่อนี้"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}