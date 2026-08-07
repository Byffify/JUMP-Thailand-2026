import {
  createEmptyBody,
  isValidOutputType,
} from "../data/schemas.js";
import { SUBJECTS, GRADES } from "../data/constants.js";

const SUBJECT_LABELS = new Map(SUBJECTS.map((s) => [s.id, s.label]));
const GRADE_LABELS = new Map(GRADES.map((g) => [g.id, g.label]));

const DEFAULT_TOPIC = {
  "lesson-plan": "บทเรียน",
  worksheet: "ใบงาน",
  quiz: "แบบทดสอบ",
  slides: "สไลด์นำเสนอ",
  rubric: "เกณฑ์การให้คะแนน",
  activity: "กิจกรรมในชั้นเรียน",
};

function labelOf(map, id, fallback) {
  const value = Map.prototype.get.call(map, id);
  return typeof value === "string" ? value : fallback;
}

function cleanTopic(prompt) {
  const trimmed = typeof prompt === "string" ? prompt.trim() : "";
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed
    .replace(/^สร้าง|^ทำ|^จัดทำ|^ออกแบบ/g, "")
    .replace(/^\s+/, "")
    .replace(/[.!。]$/, "")
    .slice(0, 60);
}

function buildLessonPlan({ topic, subjectLabel, gradeLabel }) {
  const title = `แผนการสอน ${subjectLabel} ${gradeLabel} — ${topic}`;
  return {
    title,
    objective: `นักเรียนชั้น${gradeLabel}สามารถเรียนรู้และอธิบาย${topic}ได้อย่างถูกต้อง เหมาะสำหรับวิชา${subjectLabel}`,
    durationMinutes: 50,
    materials: ["หนังสือเรียน", "กระดาน", "ปากกา", "สื่อภาพประกอบ"],
    steps: [
      {
        name: "ขั้นนำ",
        durationMinutes: 5,
        description: "ทบทวนความรู้เดิมและเข้าสู่บทเรียน ตั้งคำถามกระตุ้นความสนใจในหัวข้อ",
      },
      {
        name: "ขั้นสอน",
        durationMinutes: 30,
        description: `อธิบายและสาธิตเนื้อหาเกี่ยวกับ${topic} พร้อมยกตัวอย่างที่เหมาะสมกับระดับชั้น`,
      },
      {
        name: "ขั้นสรุป",
        durationMinutes: 15,
        description: "สรุปใจความสำคัญร่วมกันและตรวจสอบความเข้าใจของผู้เรียน",
      },
    ],
    assessment: "ประเมินจากการตอบคำถามและสรุปความเข้าใจท้ายคาบเรียน",
  };
}

function buildWorksheet({ topic, subjectLabel, gradeLabel }) {
  return {
    title: `ใบงาน ${subjectLabel} ${gradeLabel} — ${topic}`,
    instructions: `จงเติมคำตอบที่ถูกต้องลงในช่องว่างแต่ละข้อ ตามหัวข้อ ${topic} ของวิชา${subjectLabel} ระดับ${gradeLabel}`,
    items: [
      { question: `${topic} คือ ___`, answer: "คำตอบตัวอย่าง" },
      { question: "จงเขียนว่าหัวข้อที่เรียนเกี่ยวกับ ___", answer: "เนื้อหาของบทเรียน" },
      { question: "ตัวอย่างที่เกี่ยวข้องกับวิชานี้คือ ___", answer: "คำตอบจากความรู้" },
      { question: "ประโยชน์ของบทเรียนนี้คือ ___", answer: "การนำไปใช้ในชีวิต" },
      { question: "ข้อควรจำที่สำคัญคือ ___", answer: "ใจความสำคัญของบทเรียน" },
    ],
  };
}

function buildQuiz({ topic, subjectLabel, gradeLabel }) {
  return {
    title: `แบบทดสอบ ${subjectLabel} ${gradeLabel} — ${topic}`,
    items: [
      {
        question: `ข้อใดเป็นใจความสำคัญของ ${topic}?`,
        type: "multiple_choice",
        options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
        answer: "ตัวเลือก ก",
        explanation: "เพราะตัวเลือก ก ตรงกับใจความหลักของบทเรียน",
      },
      {
        question: `ข้อใดอธิบายเรื่อง ${topic} ได้ถูกต้องที่สุด?`,
        type: "multiple_choice",
        options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
        answer: "ตัวเลือก ก",
        explanation: "ตัวเลือก ก ให้คำอธิบายที่ครบถ้วนและถูกต้อง",
      },
      {
        question: `วิชา ${subjectLabel} เกี่ยวข้องกับ ${topic} อย่างไร?`,
        type: "multiple_choice",
        options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
        answer: "ตัวเลือก ก",
        explanation: "ตัวเลือก ก แสดงความเชื่อมโยงของบทเรียนนี้",
      },
      {
        question: `ขั้นตอนแรกที่ดีที่สุดในการเริ่มเรียน ${topic} คืออะไร?`,
        type: "multiple_choice",
        options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
        answer: "ตัวเลือก ก",
        explanation: "ตัวเลือก ก เป็นจุดเริ่มต้นที่ถูกต้อง",
      },
      {
        question: `การนำ ${topic} ไปใช้ให้เกิดผลดีมากที่สุดคือข้อใด?`,
        type: "multiple_choice",
        options: ["ตัวเลือก ก", "ตัวเลือก ข", "ตัวเลือก ค", "ตัวเลือก ง"],
        answer: "ตัวเลือก ก",
        explanation: "ตัวเลือก ก เหมาะสมกับวัตถุประสงค์ของบทเรียน",
      },
    ],
  };
}

function buildSlides({ topic, subjectLabel, gradeLabel }) {
  return {
    title: `สไลด์นำเสนอ ${subjectLabel} ${gradeLabel} — ${topic}`,
    slides: [
      {
        title: "ปก",
        bullets: [`วิชา ${subjectLabel} ระดับ${gradeLabel}`, `หัวข้อ ${topic}`],
      },
      {
        title: "เนื้อหา",
        bullets: [
          `${topic} เป็นหัวใจของบทเรียนนี้`,
          "นำเสนอแนวคิดหลักตามระดับชั้น",
          "ใช้ตัวอย่างที่เหมาะสมและปราศจากความรุนแรง",
        ],
      },
      {
        title: "ตัวอย่าง",
        bullets: [
          "ตัวอย่างประกอบเนื้อหา",
          "การประยุกต์ใช้ในชีวิตประจำวัน",
        ],
      },
      {
        title: "สรุป",
        bullets: ["จับใจความสำคัญของบทเรียน", "ทบทวนหัวข้อที่เรียน"],
      },
      {
        title: "คำถาม",
        bullets: ["คำถามตรวจสอบความเข้าใจ", "คำถามชวนให้คิดต่อยอด"],
      },
    ],
  };
}

function buildRubric({ topic, subjectLabel, gradeLabel }) {
  return {
    title: `เกณฑ์การให้คะแนน ${subjectLabel} ${gradeLabel} — ${topic}`,
    criteria: [
      {
        name: "ความถูกต้องของเนื้อหา",
        descriptions: [
          { level: "4", text: "ถูกต้องครบถ้วน ชัดเจน ตรงตามหัวข้อ" },
          { level: "3", text: "ถูกต้องเป็นส่วนใหญ่" },
          { level: "2", text: "ถูกต้องบางส่วน" },
        ],
      },
      {
        name: "ความครบถ้วนของงาน",
        descriptions: [
          { level: "4", text: "ครบทุกส่วนตามกำหนด" },
          { level: "3", text: "ครบเกือบทั้งหมด" },
          { level: "2", text: "ยังไม่ครบ" },
        ],
      },
      {
        name: "ความคิดสร้างสรรค์",
        descriptions: [
          { level: "4", text: "นำเสนอแนวคิดยอดเยี่ยม" },
          { level: "3", text: "คิดอย่างสมเหตุสมผล" },
          { level: "2", text: "เริ่มมีแนวคิดบ้าง" },
        ],
      },
    ],
  };
}

function buildActivity({ topic, subjectLabel, gradeLabel }) {
  return {
    title: `กิจกรรม ${subjectLabel} ${gradeLabel} — ${topic}`,
    durationMinutes: 40,
    groupSize: 4,
    materials: ["กระดาษ", "ปากกา", "กระดาน"],
    steps: [
      { name: "เตรียมความพร้อม", description: "ฟังคำชี้แจงและแบ่งกลุ่มตามหัวข้อ" },
      { name: "ลงมือทำกิจกรรม", description: `ร่วมปฏิบัติกิจกรรมที่เกี่ยวข้องกับ ${topic}` },
      { name: "สรุปและสะท้อนผล", description: "นำเสนอผลงานและสรุปข้อเรียนรู้" },
    ],
  };
}

const BUILDERS = {
  "lesson-plan": buildLessonPlan,
  worksheet: buildWorksheet,
  quiz: buildQuiz,
  slides: buildSlides,
  rubric: buildRubric,
  activity: buildActivity,
};

export function generate(input = {}) {
  const outputType = input.outputType;
  if (!isValidOutputType(outputType)) {
    return { body: createEmptyBody("lesson-plan") };
  }

  const subjectLabel = labelOf(SUBJECT_LABELS, input.subject, "วิชา");
  const gradeLabel = labelOf(GRADE_LABELS, input.grade, "");
  const topic = cleanTopic(input.prompt) ?? DEFAULT_TOPIC[outputType];
  const builder = BUILDERS[outputType];

  return { body: builder({ topic, subjectLabel, gradeLabel }) };
}

export const templateGenerator = { generate };