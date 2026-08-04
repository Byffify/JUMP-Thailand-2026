import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, Bell, Settings } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Button, OptionButton } from "../components/ui";
import {
  SUBJECTS,
  GRADES,
  OUTPUT_TYPES,
  EXAMPLE_PROMPTS,
  GENERATION_STEPS,
} from "../data/constants";

export default function Generator() {
  const navigate = useNavigate();
  const { prefillPrompt, setPrefillPrompt, setGeneratedContent } = useApp();

  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [grade, setGrade] = useState(GRADES[5].id);
  const [outputType, setOutputType] = useState(OUTPUT_TYPES[0].id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // รับค่าคำสั่งที่ผู้ใช้ส่งมาจากหน้าอื่น (เช่น Dashboard) ผ่าน Context
  useEffect(() => {
    if (prefillPrompt) {
      setPrompt(prefillPrompt);
      setPrefillPrompt(""); // ล้างค่าหลังใช้งาน เพื่อไม่ให้ค้างในครั้งถัดไป
    }
  }, [prefillPrompt, setPrefillPrompt]);

  // จำลองสถานะการสร้างสื่อการสอนทีละขั้นตอน
  useEffect(() => {
    if (!isGenerating) return;

    if (stepIndex >= GENERATION_STEPS.length) {
      const id = Date.now();
      const content = {
        id,
        prompt: prompt.trim(),
        subject,
        grade,
        outputType,
      };
      setGeneratedContent(content);
      navigate(`/content/${id}`);
      return;
    }

    const timer = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timer);
  }, [
    isGenerating,
    stepIndex,
    prompt,
    subject,
    grade,
    outputType,
    navigate,
    setGeneratedContent,
  ]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setStepIndex(0);
    setIsGenerating(true);
  };

  const applyExample = (ex) => {
    if (isGenerating) return;
    setPrompt(ex.text);
    if (ex.subject) setSubject(ex.subject);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-krumate-text tracking-tight">
            สร้างสื่อการสอนด้วยปัญญาประดิษฐ์
          </h1>
          <p className="text-krumate-muted text-sm mt-1">
            กรอกรายละเอียดบทเรียน แล้วให้ระบบช่วยสร้างสื่อการสอนให้คุณ
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            aria-label="การแจ้งเตือน"
            className="w-10 h-10 rounded-xl border border-krumate-border bg-krumate-surface flex items-center justify-center hover:bg-krumate-surface-strong dark:border-krumate-border dark:bg-krumate-surface-2 dark:hover:bg-krumate-surface-soft"
          >
            <Bell size={18} className="text-krumate-muted" />
          </button>
          <button
            aria-label="ตั้งค่า"
            className="w-10 h-10 rounded-xl border border-krumate-border bg-krumate-surface flex items-center justify-center hover:bg-krumate-surface-strong dark:border-krumate-border dark:bg-krumate-surface-2 dark:hover:bg-krumate-surface-soft"
          >
            <Settings size={18} className="text-krumate-muted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* ฝั่งซ้าย: ฟอร์มสร้างสื่อการสอน */}
        <Card className="p-7 border border-slate-100 dark:border-krumate-border">
          <label className="block text-sm font-semibold text-slate-800 dark:text-krumate-text mb-2.5">
            อธิบายสิ่งที่คุณต้องการสอน
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="เช่น สร้างแผนการสอนวิทยาศาสตร์ ระดับชั้นประถมศึกษาปีที่ 6 เรื่องระบบนิเวศ ใช้เวลา 50 นาที"
            rows={3}
            disabled={isGenerating}
            className="w-full rounded-2xl border border-krumate-border bg-slate-50 dark:bg-krumate-surface-2 px-4 py-3.5 text-slate-800 dark:text-krumate-text placeholder:text-slate-400 dark:placeholder:text-krumate-muted focus:outline-none focus:ring-2 focus:ring-krumate-primary focus:border-transparent disabled:opacity-60 resize-y"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mt-6">
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-krumate-text mb-2.5">
                วิชา
              </div>
              <div className="flex flex-col gap-2">
                {SUBJECTS.map((s) => (
                  <OptionButton
                    key={s.id}
                    active={subject === s.id}
                    onClick={() => setSubject(s.id)}
                    icon={s.icon}
                    label={s.label}
                    disabled={isGenerating}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-krumate-text mb-2.5">
                ระดับชั้น
              </div>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map((g) => (
                  <OptionButton
                    key={g.id}
                    active={grade === g.id}
                    onClick={() => setGrade(g.id)}
                    label={g.label}
                    layout="col"
                    disabled={isGenerating}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-slate-700 dark:text-krumate-text mb-2.5">
              ประเภทสื่อการสอน
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {OUTPUT_TYPES.map((t) => (
                <OptionButton
                  key={t.id}
                  active={outputType === t.id}
                  onClick={() => setOutputType(t.id)}
                  icon={t.icon}
                  label={t.label}
                  layout="col"
                  disabled={isGenerating}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full justify-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  กำลังสร้างสื่อการสอน...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  สร้างสื่อการสอน
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2 pt-5">
              {GENERATION_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    i <= stepIndex
                      ? "text-krumate-primary-dark dark:text-krumate-primary"
                      : "text-krumate-muted/70 dark:text-krumate-muted/60"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      i <= stepIndex
                        ? "bg-krumate-primary"
                        : "bg-krumate-border"
                    }`}
                  />
                  {step}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ฝั่งขวา: เคล็ดลับ + ตัวอย่างคำสั่ง */}
        <div>
          <div className="rounded-3xl p-5 mb-5 border border-krumate-primary/30 bg-teal-50 dark:bg-krumate-surface-strong dark:border-krumate-primary/40">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles
                size={16}
                className="text-krumate-primary-dark dark:text-krumate-primary"
              />
              <span className="font-bold text-sm text-krumate-primary-dark dark:text-krumate-primary">
                เคล็ดลับการเขียนคำสั่ง
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-700 dark:text-krumate-text leading-relaxed">
              <p>ระบุระดับชั้นให้ชัดเจน</p>
              <p>ระบุระยะเวลาที่ใช้ในการสอน</p>
              <p>ระบุจุดเน้น เช่น กิจกรรมกลุ่มหรือการทดลอง</p>
              <p>ระบุจำนวนข้อ หากต้องการสร้างแบบทดสอบ</p>
            </div>
          </div>

          <div className="text-base font-bold text-krumate-text mb-3">
            ตัวอย่างคำสั่ง
          </div>
          <div className="flex flex-col gap-2.5">
            {EXAMPLE_PROMPTS.map((ex, i) => {
              const Icon = ex.icon;
              return (
                <Card
                  key={i}
                  onClick={() => applyExample(ex)}
                  className="p-4 cursor-pointer flex items-start gap-3 border border-krumate-border bg-white dark:bg-krumate-surface hover:border-krumate-primary/50 hover:bg-krumate-surface-strong dark:hover:bg-krumate-surface-strong transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-krumate-primary-soft">
                    <Icon
                      size={15}
                      className="text-krumate-primary-dark dark:text-krumate-primary"
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="text-sm text-krumate-text leading-snug pt-0.5">
                    {ex.text}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
