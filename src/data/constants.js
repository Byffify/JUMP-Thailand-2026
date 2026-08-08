import {
  Calculator, BookOpen, Globe2, Users,
  FileText, ClipboardList, FileQuestion, Presentation, Star, Leaf,
} from "lucide-react";

export const SUBJECTS = [
  { id: "science", label: "วิทยาศาสตร์" },
  { id: "math", label: "คณิตศาสตร์" },
  { id: "thai", label: "ภาษาไทย" },
  { id: "english", label: "ภาษาอังกฤษ" },
  { id: "social", label: "สังคมศึกษา" },
];

export const GRADES = [
  { id: "p1", label: "ป.1" },
  { id: "p2", label: "ป.2" },
  { id: "p3", label: "ป.3" },
  { id: "p4", label: "ป.4" },
  { id: "p5", label: "ป.5" },
  { id: "p6", label: "ป.6" },
  { id: "m1", label: "ม.1" },
  { id: "m2", label: "ม.2" },
  { id: "m3", label: "ม.3" },
  { id: "m4", label: "ม.4" },
  { id: "m5", label: "ม.5" },
  { id: "m6", label: "ม.6" },
];

export const OUTPUT_TYPES = [
  { id: "lesson-plan", label: "แผนการสอน", icon: FileText },
  { id: "worksheet", label: "ใบงาน", icon: ClipboardList },
  { id: "quiz", label: "แบบทดสอบ", icon: FileQuestion },
  { id: "slides", label: "สไลด์นำเสนอ", icon: Presentation },
  { id: "rubric", label: "เกณฑ์การให้คะแนน", icon: Star },
  { id: "activity", label: "กิจกรรมในชั้นเรียน", icon: Users },
];

export const EXAMPLE_PROMPTS = [
  { text: "สร้างแผนการสอนวิทยาศาสตร์ ป.6 เรื่องระบบนิเวศ", subject: "science", icon: Leaf },
  { text: "ทำใบงานภาษาไทยเรื่องคำคุณศัพท์", subject: "thai", icon: BookOpen },
  { text: "สร้างแบบทดสอบคณิตศาสตร์ 10 ข้อ เรื่องเศษส่วน", subject: "math", icon: Calculator },
  { text: "ทำแผนการสอน 50 นาที เรื่องการเปลี่ยนแปลงสภาพภูมิอากาศ", subject: "social", icon: Globe2 },
];

export const GENERATION_STEPS = [
  "กำลังวิเคราะห์โจทย์...",
  "กำลังออกแบบโครงสร้างเนื้อหา...",
  "กำลังเรียบเรียงเนื้อหาให้เหมาะกับระดับชั้น...",
  "กำลังจัดรูปแบบผลลัพธ์...",
];