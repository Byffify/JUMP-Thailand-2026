import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, Bell, Settings } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Button, OptionButton } from "../components/ui";
import { SUBJECTS, GRADES, OUTPUT_TYPES, EXAMPLE_PROMPTS, GENERATION_STEPS } from "../data/constants";

export default function Generator() {
  const navigate = useNavigate();
  const { prefillPrompt, setPrefillPrompt, setGeneratedContent } = useApp();

  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [grade, setGrade] = useState(GRADES[5].id);
  const [outputType, setOutputType] = useState(OUTPUT_TYPES[0].id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // รับค่า prompt ที่ผู้ใช้กดมาจากหน้าอื่น (เช่น Dashboard) ผ่าน Context
  useEffect(() => {
    if (prefillPrompt) {
      setPrompt(prefillPrompt);
      setPrefillPrompt(""); // เคลียร์ทิ้งหลังใช้ ไม่ให้ค้างไปเติมซ้ำครั้งหน้า
    }
  }, [prefillPrompt, setPrefillPrompt]);

  // จำลองสถานะการ generate ทีละขั้น
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
  }, [isGenerating, stepIndex, prompt, subject, grade, outputType, navigate, setGeneratedContent]);

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">สร้างสื่อการสอนด้วย AI</h1>
          <p className="text-slate-500 text-sm mt-1">กรอกรายละเอียด แล้วให้ AI ช่วยสร้างสื่อการสอนให้คุณ</p>
        </div>
        <div className="flex gap-2.5">
          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
            <Bell size={18} className="text-slate-500" />
          </button>
          <button className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
            <Settings size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* ฝั่งซ้าย: ฟอร์มสร้างสื่อการสอน */}
        <Card className="p-7">
          <label className="block text-sm font-semibold text-slate-900 mb-2.5">อธิบายสิ่งที่คุณต้องการสอน</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="เช่น สร้างแผนการสอนวิทยาศาสตร์ ป.6 เรื่องระบบนิเวศ 50 นาที"
            rows={3}
            disabled={isGenerating}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-60 resize-y"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 mt-6">
            <div>
              <div className="text-sm font-semibold text-slate-900 mb-2.5">วิชา</div>
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
              <div className="text-sm font-semibold text-slate-900 mb-2.5">ระดับชั้น</div>
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
            <div className="text-sm font-semibold text-slate-900 mb-2.5">ประเภทสื่อการสอน</div>
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
                  กำลังสร้าง...
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
                  className={`flex items-center gap-2 text-sm transition-opacity ${
                    i <= stepIndex ? "opacity-100 text-teal-700" : "opacity-30 text-slate-400"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${i <= stepIndex ? "bg-teal-600" : "bg-slate-300"}`} />
                  {step}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ฝั่งขวา: เคล็ดลับ + ตัวอย่างพรอมต์ */}
        <div>
          <div
            className="rounded-3xl p-5.5 mb-5 text-white"
            style={{ background: "linear-gradient(135deg, #0F172A 0%, #164E4A 100%)", padding: 22 }}
          >
            <div className="flex items-center gap-2 mb-3.5">
              <Sparkles size={16} className="text-amber-400" />
              <span className="font-bold text-sm">เคล็ดลับการเขียนพรอมต์</span>
            </div>
            <div className="flex flex-col gap-2.5 text-sm text-slate-300 leading-relaxed">
              <p>ระบุระดับชั้นให้ชัดเจน</p>
              <p>บอกระยะเวลาที่ใช้สอน</p>
              <p>ระบุจุดเน้น เช่น กิจกรรมกลุ่ม หรือ ทดลอง</p>
              <p>บอกจำนวนข้อ หากต้องการแบบทดสอบ</p>
            </div>
          </div>

          <div className="text-base font-bold text-slate-900 mb-3">ตัวอย่างพรอมต์</div>
          <div className="flex flex-col gap-2.5">
            {EXAMPLE_PROMPTS.map((ex, i) => {
              const Icon = ex.icon;
              return (
                <Card
                  key={i}
                  onClick={() => applyExample(ex)}
                  className="p-4 cursor-pointer flex items-start gap-3 hover:border-slate-300 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: ex.bg }}
                  >
                    <Icon size={15} style={{ color: ex.color }} strokeWidth={2.2} />
                  </div>
                  <span className="text-sm text-slate-700 leading-snug pt-0.5">{ex.text}</span>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
