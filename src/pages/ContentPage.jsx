import { useParams, useNavigate, Link } from "react-router-dom";
import { FileDown, FileText, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Button, Pill } from "../components/ui";
import { SUBJECTS, GRADES, OUTPUT_TYPES } from "../data/constants";

const findLabel = (List,id) => List.find((item) => item.id === id)?.label ?? id;

export default function ContentPage(){
    const{ id } = useParams();
    const navigate = useNavigate();
    const { generatedContent } = useApp();
    const content = generatedContent?.id === Number(id) ? generatedContent : null;

    if(!content) {
        return (
              <div className="max-w-2xl mx-auto px-6 py-16 text-center">
                <p className="text-slate-500 mb-4">
                  ไม่พบข้อมูลสื่อการสอนนี้ อาจเกิดจากการรีเฟรชหน้าหรือลิงก์หมดอายุ
                </p>
                <Button onClick={() => navigate("/generator")}>
                  <ArrowLeft size={18} />
                  กลับไปสร้างใหม่
                </Button>
              </div>
            );
    }

    const subjectLabel = findLabel(SUBJECTS, content.subject);
    const gradeLabel = findLabel(GRADES, content.grade);
    const typeLabel = findLabel(OUTPUT_TYPES, content.outputType);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <Link to="/generator" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
            <ArrowLeft size={16} />
            สร้างชิ้นใหม่
          </Link>
    
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex gap-2 mb-2">
                <Pill>{subjectLabel}</Pill>
                <Pill>{gradeLabel}</Pill>
                <Pill className="bg-teal-50 text-teal-700 border-teal-200">{typeLabel}</Pill>
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">{content.prompt}</h1>
            </div>
    
            <div className="flex gap-2 shrink-0">
              <Button variant="secondary"><FileDown size={16} /> PDF</Button>
              <Button variant="secondary"><FileDown size={16} /> DOCX</Button>
              <Button variant="secondary"><FileDown size={16} /> PPTX</Button>
            </div>
          </div>
    
          <Card className="p-6">
            <ContentPreview type={content.outputType} />
          </Card>
    
          <Card className="mt-4 p-4 text-sm text-slate-500 flex items-center gap-2">
            <FileText size={16} />
            สร้างเมื่อ {new Date(content.id).toLocaleString("th-TH")}
          </Card>
        </div>
      );
}
function ContentPreview({ type }) {
  switch (type) {
    case "lesson-plan":
      return (
        <div className="space-y-4 text-slate-700">
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
        <div className="space-y-3 text-slate-700">
          <p className="font-medium">ใบงาน: เติมคำในช่องว่างให้ถูกต้อง</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>พืชสีเขียวสร้างอาหารเองได้ เรียกว่า ______</li>
            <li>สัตว์ที่กินพืชเป็นอาหาร เรียกว่า ______</li>
            <li>สิ่งมีชีวิตที่ย่อยสลายซากพืชซากสัตว์ เรียกว่า ______</li>
          </ol>
        </div>
      );
    case "quiz":
      return (
        <div className="space-y-4 text-slate-700">
          <p className="font-medium">ข้อ 1. ข้อใดคือผู้ผลิตในระบบนิเวศ?</p>
          <div className="space-y-1 text-sm pl-4">
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
            <div key={slide} className="aspect-video rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-sm">
              {slide}
            </div>
          ))}
        </div>
      );
    case "rubric":
      return (
        <table className="w-full text-sm text-left text-slate-700">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-4">เกณฑ์</th>
              <th className="py-2 pr-4">ดีมาก (4)</th>
              <th className="py-2">พอใช้ (2)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 pr-4">ความถูกต้องของเนื้อหา</td>
              <td className="py-2 pr-4">ถูกต้องครบถ้วน</td>
              <td className="py-2">มีข้อผิดพลาดบางส่วน</td>
            </tr>
          </tbody>
        </table>
      );
    default:
      return (
        <div className="text-slate-700">
          <p className="font-medium mb-2">กิจกรรมกลุ่ม: สำรวจระบบนิเวศใกล้ตัว</p>
          <p>แบ่งนักเรียนเป็นกลุ่ม ให้แต่ละกลุ่มสำรวจสิ่งมีชีวิตในบริเวณโรงเรียน แล้วนำเสนอหน้าชั้น</p>
        </div>
      );
  }
}

function Section({ title, children }) {
  return (
    <div>
      <p className="font-medium text-slate-900 mb-1">{title}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}