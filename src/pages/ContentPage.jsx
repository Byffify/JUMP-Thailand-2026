import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileDown, FileText, ArrowLeft } from "lucide-react";
import { Card, Button, Pill, ErrorState, Skeleton } from "../components/ui";
import { SUBJECTS, GRADES, OUTPUT_TYPES } from "../data/constants";
import { contentService } from "../services/contentService";

const findLabel = (List, id) => List.find((item) => item.id === id)?.label ?? id;

export default function ContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    contentService.get(id).then((found) => {
      if (cancelled) return;
      setContent(found);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-6 py-10">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <ErrorState
          message="ไม่พบข้อมูลสื่อการสอนนี้"
          onRetry={() => navigate("/generator")}
        />
        <div className="mt-4">
          <Button onClick={() => navigate("/generator")}>
            <ArrowLeft size={18} />
            กลับไปสร้างใหม่
          </Button>
        </div>
      </div>
    );
  }

  const subjectLabel = findLabel(SUBJECTS, content.subject);
  const gradeLabel = findLabel(GRADES, content.grade);
  const typeLabel = findLabel(OUTPUT_TYPES, content.outputType);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link to="/generator" className="mb-6 inline-flex items-center gap-1 text-sm text-krumate-muted hover:text-krumate-text">
        <ArrowLeft size={16} />
        สร้างชิ้นใหม่
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex gap-2">
            <Pill>{subjectLabel}</Pill>
            <Pill>{gradeLabel}</Pill>
            <Pill className="bg-krumate-primary-soft text-krumate-primary-dark dark:text-krumate-primary">{typeLabel}</Pill>
          </div>
          <h1 className="text-2xl font-semibold text-krumate-text">{content.prompt}</h1>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="secondary"><FileDown size={16} /> PDF</Button>
          <Button variant="secondary"><FileDown size={16} /> DOCX</Button>
          <Button variant="secondary"><FileDown size={16} /> PPTX</Button>
        </div>
      </div>

      <Card className="p-6">
        <ContentPreview type={content.outputType} />
      </Card>

      <Card className="mt-4 flex items-center gap-2 p-4 text-sm text-krumate-muted">
        <FileText size={16} />
        สร้างเมื่อ {new Date(content.createdAt ?? content.id).toLocaleString("th-TH")}
      </Card>
    </div>
  );
}

function ContentPreview({ type }) {
  switch (type) {
    case "lesson-plan":
      return (
        <div className="space-y-4 text-krumate-text">
          <Section title="จุดประสงค์การเรียนรู้">
            นักเรียนสามารถอธิบายความสัมพันธ์ระหว่างสิ่งมีชีวิตในระบบนิเวศได้
          </Section>
          <Section title="ขั้นนำ (10 นาที)">
            ตั้งคำถามกระตุ้นความคิดเกี่ยวกับสิ่งมีชีวิตรอบตัวนักเรียน
          </Section>
          <Section title="ขั้นสอน (30 นาที)">
            อธิบายห่วงโซ่อาหารและบทบาทของผู้ผลิต ผู้บริโภค และผู้ย่อยสลาย
          </Section>
          <Section title="ขั้นสรุป (10 นาที)">
            ให้นักเรียนวาดแผนภาพห่วงโซ่อาหารอย่างง่าย
          </Section>
        </div>
      );
    case "worksheet":
      return (
        <div className="space-y-3 text-krumate-text">
          <p className="font-medium">ใบงาน: เติมคำในช่องว่างให้ถูกต้อง</p>
          <ol className="list-inside list-decimal space-y-2">
            <li>พืชสีเขียวสร้างอาหารเองได้ เรียกว่า ______</li>
            <li>สัตว์ที่กินพืชเป็นอาหาร เรียกว่า ______</li>
            <li>สิ่งมีชีวิตที่ย่อยสลายซากพืชซากสัตว์ เรียกว่า ______</li>
          </ol>
        </div>
      );
    case "quiz":
      return (
        <div className="space-y-4 text-krumate-text">
          <p className="font-medium">ข้อ 1. ข้อใดคือผู้ผลิตในระบบนิเวศ?</p>
          <div className="space-y-1 pl-4 text-sm">
            <p>ก. เห็ด</p>
            <p>ข. ต้นข้าว</p>
            <p>ค. เสือ</p>
            <p>ง. แบคทีเรีย</p>
          </div>
        </div>
      );
    case "slides":
      return (
        <div className="grid grid-cols-2 gap-4">
          {["ปกเรื่อง", "ภาพรวมเนื้อหา", "รายละเอียดหลัก", "สรุปและคำถาม"].map((slide) => (
            <div key={slide} className="flex aspect-video items-center justify-center rounded-xl border border-krumate-border bg-krumate-surface-strong text-sm text-krumate-muted">
              {slide}
            </div>
          ))}
        </div>
      );
    case "rubric":
      return (
        <table className="w-full text-left text-sm text-krumate-text">
          <thead>
            <tr className="border-b border-krumate-border">
              <th className="py-2 pr-4">เกณฑ์</th>
              <th className="py-2 pr-4">ดีมาก (4)</th>
              <th className="py-2">พอใช้ (2)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-krumate-border">
              <td className="py-2 pr-4">ความถูกต้องของเนื้อหา</td>
              <td className="py-2 pr-4">ถูกต้องครบถ้วน</td>
              <td className="py-2">มีข้อผิดพลาดบางส่วน</td>
            </tr>
          </tbody>
        </table>
      );
    default:
      return (
        <div className="text-krumate-text">
          <p className="mb-2 font-medium">กิจกรรมกลุ่ม: สำรวจระบบนิเวศใกล้ตัว</p>
          <p>แบ่งนักเรียนเป็นกลุ่ม ให้แต่ละกลุ่มสำรวจสิ่งมีชีวิตในบริเวณโรงเรียน แล้วนำเสนอหน้าชั้น</p>
        </div>
      );
  }
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-1 font-medium text-krumate-text">{title}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}
