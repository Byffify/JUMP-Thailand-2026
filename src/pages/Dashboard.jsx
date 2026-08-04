import {
  IconArrowRight,
  IconBolt,
  IconCamera,
  IconCirclePlus,
  IconClipboardList,
  IconClock,
  IconFileCheck,
  IconFileText,
  IconHelpCircle,
  IconHistory,
  IconPaperclip,
  IconPlayerPlay,
  IconPresentation,
  IconSparkles,
  IconTrendingUp,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── Tabs & Data ────────────────────────────────────────────────────────────
const TABS = [
  { label: "แผนการสอน", icon: IconFileText, placeholder: "เช่น สร้างแผนการสอนวิทยาศาสตร์ ระดับชั้นมัธยมศึกษาปีที่ 1 เรื่องการสังเคราะห์ด้วยแสง" },
  { label: "ใบงาน", icon: IconClipboardList, placeholder: "เช่น สร้างใบงานภาษาไทยเรื่องคำคุณศัพท์ สำหรับระดับชั้นประถมศึกษาปีที่ 4" },
  { label: "แบบทดสอบ", icon: IconHelpCircle, placeholder: "เช่น สร้างแบบทดสอบปรนัย 10 ข้อ เรื่องเศษส่วน" },
  { label: "สไลด์นำเสนอ", icon: IconPresentation, placeholder: "เช่น สร้างเนื้อหาสไลด์แนะนำไวยากรณ์ภาษาอังกฤษเบื้องต้น" },
  { label: "แบบประเมิน", icon: IconFileCheck, placeholder: "เช่น ออกแบบเกณฑ์การให้คะแนนสำหรับงานกลุ่ม" },
  { label: "กิจกรรม", icon: IconSparkles, placeholder: "เช่น เสนอกิจกรรมละลายพฤติกรรม 15 นาที สำหรับระดับชั้นประถมศึกษาปีที่ 5" },
];

const STATS = [
  { icon: IconFileText,   stat: "127",   label: "สื่อการสอนที่สร้างแล้ว", change: "+18 รายการในสัปดาห์นี้",        changeType: "positive" },
  { icon: IconClock,      stat: "86.5",  unit: "ชั่วโมง", label: "เวลาที่ประหยัดได้", change: "เทียบเท่าเวลาทำงาน 2 สัปดาห์", changeType: "positive" },
  { icon: IconTrendingUp, stat: "94%",   label: "อัตราการใช้งาน AI",      change: "สูงกว่าค่าเฉลี่ยของโรงเรียน",  changeType: "positive" },
];

const QUICK_ACTIONS = [
  { icon: IconFileText,    label: "แผนการสอน",   color: "bg-teal-500/15 text-teal-400 dark:bg-teal-500/20 dark:text-teal-300" },
  { icon: IconClipboardList, label: "ใบงาน",     color: "bg-violet-500/15 text-violet-500 dark:bg-violet-500/20 dark:text-violet-300" },
  { icon: IconHelpCircle,  label: "แบบทดสอบ",  color: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300" },
  { icon: IconPresentation,label: "สไลด์",       color: "bg-rose-500/15 text-rose-500 dark:bg-rose-500/20 dark:text-rose-300" },
];

const RECENT = [
  { icon: IconFileText,    title: "แผนการสอนวิทยาศาสตร์ ป.6 เรื่องระบบสุริยะ",   time: "เมื่อ 2 ชั่วโมงที่แล้ว",  tag: "แผนการสอน" },
  { icon: IconClipboardList, title: "ใบงานคณิตศาสตร์ เรื่องเศษส่วน ป.5",          time: "เมื่อวานนี้",             tag: "ใบงาน" },
  { icon: IconHelpCircle,  title: "แบบทดสอบภาษาไทย ม.1 เรื่องการอ่านจับใจความ",  time: "2 วันที่แล้ว",           tag: "แบบทดสอบ" },
];

// ─── Reusable Mini Components ────────────────────────────────────────────────
function StatCard({ icon: Icon, stat, unit, label, change }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-krumate-border bg-white dark:bg-krumate-surface p-5 shadow-sm hover:shadow-md dark:hover:bg-krumate-surface-strong transition-all duration-200">
      {/* Subtle glow top-right */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-krumate-primary/10 dark:bg-krumate-primary/20 blur-2xl" />
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-krumate-primary/10 dark:bg-krumate-primary/20 p-2.5">
          <Icon size={20} className="text-krumate-primary-dark dark:text-krumate-primary" />
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-krumate-primary">
          <IconTrendingUp size={12} />
          {change}
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-krumate-text">{stat}</span>
        {unit && <span className="text-sm font-medium text-slate-500 dark:text-krumate-muted">{unit}</span>}
      </div>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-krumate-muted">{label}</p>
    </div>
  );
}

function RecentCard({ icon: Icon, title, time, tag }) {
  const tagColors = {
    "แผนการสอน": "bg-teal-100 text-teal-700 dark:bg-krumate-primary/15 dark:text-krumate-primary",
    "ใบงาน":      "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
    "แบบทดสอบ":  "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  };
  return (
    <div className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 dark:border-krumate-border bg-white dark:bg-krumate-surface p-4 shadow-sm hover:border-krumate-primary/40 dark:hover:border-krumate-primary/50 hover:shadow-md dark:hover:bg-krumate-surface-strong transition-all duration-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-krumate-surface-2 group-hover:bg-krumate-primary/10 dark:group-hover:bg-krumate-primary/20 transition-colors">
        <Icon size={18} className="text-slate-500 dark:text-krumate-muted group-hover:text-krumate-primary-dark dark:group-hover:text-krumate-primary transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-krumate-text">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-krumate-muted">{time}</p>
      </div>
      <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tagColors[tag] || "bg-slate-100 dark:bg-krumate-surface-2 text-slate-600 dark:text-krumate-muted")}>
        {tag}
      </span>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { setPrefillPrompt } = useApp();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [prompt, setPrompt] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const generateFileId = () => Math.random().toString(36).substring(7);

  const processFiles = (files) => {
    for (const file of files) {
      const fileId = generateFileId();
      const attachedFile = { id: fileId, name: file.name, file };
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () =>
          setAttachedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, preview: reader.result } : f)));
        reader.readAsDataURL(file);
      }
      setAttachedFiles((prev) => [...prev, attachedFile]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setPrefillPrompt(prompt.trim());
    navigate("/generator");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handleFileSelect = (e) => {
    processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-6 pb-16">

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-krumate-primary via-teal-600 to-teal-800 dark:from-teal-900 dark:via-teal-800 dark:to-slate-900 p-8 sm:p-10 shadow-2xl">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          {/* Badge */}
          <span className="rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm tracking-wide">
            ✨ KruMate AI · สร้างสื่อการสอนง่ายๆ
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            วันนี้คุณอยากสอนเรื่องอะไร?
          </h1>
          <p className="max-w-lg text-sm sm:text-base text-white/80 leading-relaxed">
            อธิบายบทเรียนด้วยภาษาที่เข้าใจง่าย แล้วให้ KruMate AI สร้างสื่อการสอนคุณภาพให้ภายในไม่กี่วินาที
          </p>

          {/* Tab pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab.label === tab.label;
              return (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-white text-teal-700 shadow-md shadow-black/10"
                      : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Prompt Box — always white card for readability on teal bg */}
          <div className="relative z-10 w-full max-w-2xl mt-1">
            <form
              onSubmit={handleSubmit}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); processFiles(Array.from(e.dataTransfer.files)); }}
              className="relative overflow-visible rounded-2xl border-2 border-transparent bg-white shadow-2xl transition-all focus-within:border-teal-400"
            >
              {/* Attached files */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                  {attachedFiles.map((file) => (
                    <span key={file.id} className="group relative flex h-7 max-w-40 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-600 overflow-hidden">
                      {file.preview
                        ? <img src={file.preview} alt={file.name} className="h-4 w-4 rounded object-cover" />
                        : <IconPaperclip size={12} className="opacity-60" />}
                      <span className="truncate">{file.name}</span>
                      <button type="button" onClick={() => setAttachedFiles(p => p.filter(f => f.id !== file.id))}
                        className="absolute right-0.5 opacity-0 group-hover:opacity-100 rounded p-0.5 hover:text-red-500 transition-opacity">
                        <IconX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeTab.placeholder}
                rows={3}
                className="w-full resize-none bg-transparent px-4 pt-4 pb-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <IconPaperclip size={17} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <IconWand size={16} />
                  สร้างสื่อการสอน
                </button>
              </div>

              {/* Drop overlay */}
              {isDragOver && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-krumate-primary bg-krumate-primary/10 text-sm font-semibold text-krumate-primary-dark">
                  <IconCirclePlus size={18} className="mr-2" />
                  วางไฟล์ที่นี่
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-krumate-text">เริ่มสร้างด่วน</h2>
          <button onClick={() => navigate("/generator")}
            className="flex items-center gap-1 text-xs font-medium text-krumate-primary-dark dark:text-krumate-primary hover:underline">
            ดูทั้งหมด <IconArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => navigate("/generator")}
                className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-slate-200 dark:border-krumate-border bg-white dark:bg-krumate-surface py-6 px-4 hover:border-krumate-primary/40 dark:hover:border-krumate-primary/50 hover:shadow-md dark:hover:bg-krumate-surface-strong transition-all duration-200 cursor-pointer"
              >
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", a.color)}>
                  <Icon size={22} />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-krumate-text group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {a.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Stats + Recent ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* Stats */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-krumate-text">ภาพรวมการใช้งาน</h2>
          <div className="flex flex-col gap-3">
            {STATS.map((item, idx) => (
              <StatCard key={idx} {...item} />
            ))}
          </div>
        </section>

        {/* Recent */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 dark:text-krumate-text flex items-center gap-2">
              <IconHistory size={17} className="text-krumate-primary-dark dark:text-krumate-primary" />
              สื่อการสอนล่าสุด
            </h2>
            <button className="flex items-center gap-1 text-xs font-medium text-krumate-primary-dark dark:text-krumate-primary hover:underline">
              ดูทั้งหมด <IconArrowRight size={13} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT.map((item, idx) => (
              <RecentCard key={idx} {...item} />
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-2 flex items-center justify-between rounded-2xl border border-krumate-primary/20 dark:border-krumate-primary/30 bg-krumate-primary/5 dark:bg-krumate-primary/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-krumate-primary/15 dark:bg-krumate-primary/25">
                <IconBolt size={18} className="text-krumate-primary-dark dark:text-krumate-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-krumate-text">ลองสร้างสื่อการสอนใหม่</p>
                <p className="text-xs text-slate-500 dark:text-krumate-muted">ใช้เวลาเพียงไม่กี่วินาที</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/generator")}
              className="flex items-center gap-2 rounded-full bg-krumate-primary px-4 py-2 text-xs font-semibold text-white hover:bg-krumate-primary-dark shadow-sm transition-colors"
            >
              <IconSparkles size={14} />
              สร้างเลย
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
