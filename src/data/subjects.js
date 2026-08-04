export const subjects = [
  {
    id: "math-p6",
    title: "แผนการสอนคณิตศาสตร์",
    subject: "คณิตศาสตร์",
    grade: "ป.6",
    chapters: [
      {
        id: "fractions",
        title: "เศษส่วน",
        documents: {
          slide: { url: "#" },
          worksheet: { url: "#" },
          practice: { url: "#" },
          exam: { url: "#" },
        },
      },
      {
        id: "decimals",
        title: "ทศนิยม",
        documents: {
          slide: { url: "#" },
          worksheet: { url: "#" },
          practice: { url: "#" },
          exam: { url: "#" },
        },
      },
      {
        id: "geometry",
        title: "เรขาคณิต",
        documents: null,
      },
    ],
  },
  {
    id: "science-m2",
    title: "ใบงานวิทยาศาสตร์",
    subject: "วิทยาศาสตร์",
    grade: "ม.2",
    chapters: [
      {
        id: "cells",
        title: "เซลล์และสิ่งมีชีวิต",
        documents: {
          slide: { url: "#" },
          worksheet: { url: "#" },
          practice: { url: "#" },
          exam: { url: "#" },
        },
      },
    ],
  },
];

export const DOC_TYPES = [
  { key: "slide", label: "สไลด์", action: "view", bg: "#faece7" },
  { key: "worksheet", label: "ชีทการเรียน", action: "download", bg: "#e6f1fb" },
  { key: "practice", label: "ชีทตะลุยโจทย์", action: "download", bg: "#eaf3de" },
  { key: "exam", label: "ชีทข้อสอบ", action: "download", bg: "#fcebeb" },
];

export const SUBJECT_ICON = {
  คณิตศาสตร์: { icon: "🔢", bg: "#e6f1fb", color: "#0c447c" },
  วิทยาศาสตร์: { icon: "🧪", bg: "#eaf3de", color: "#27500a" },
};