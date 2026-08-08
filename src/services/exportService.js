import { renderBody } from "../utils/bodyRenderer.js";

const FORMATS = ["pdf", "docx", "pptx"];

const PDF_FONT = {
  regularFile: "Sarabun.ttf",
  boldFile: "SarabunBold.ttf",
  family: "Sarabun",
};

const PAGE = { width: 210, height: 297, margin: 15 };

function toView(record) {
  const body = record?.body ?? {};
  const outputType = record?.metadata?.outputType;
  return renderBody({ outputType, body });
}

function titleFor(record) {
  const view = toView(record);
  return view.title || record?.metadata?.prompt || "KruMate";
}

function slug(text) {
  return (
    String(text ?? "krumate")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9ก-๙_-]/g, "")
      .slice(0, 60) || "krumate"
  );
}

function buildName(record, ext) {
  const outputType = record?.metadata?.outputType ?? "document";
  return `${slug(titleFor(record))}-${outputType}.${ext}`;
}

function injectPdfFont(doc, fonts) {
  if (typeof fonts?.regular === "string" && fonts.regular.length > 0) {
    doc.addFileToVFS(PDF_FONT.regularFile, fonts.regular);
    doc.addFont(PDF_FONT.regularFile, PDF_FONT.family, "normal");
  }
  if (typeof fonts?.bold === "string" && fonts.bold.length > 0) {
    doc.addFileToVFS(PDF_FONT.boldFile, fonts.bold);
    doc.addFont(PDF_FONT.boldFile, PDF_FONT.family, "bold");
  }
}

function setPdfStyle(doc, { size = 11, bold = false }) {
  doc.setFont(PDF_FONT.family, bold ? "bold" : "normal");
  doc.setFontSize(size);
}

export async function buildPdf({ record, fonts }) {
  const { jsPDF } = await import("jspdf");
  const view = toView(record);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  injectPdfFont(doc, fonts);

  const width = PAGE.width - PAGE.margin * 2;
  const maxY = PAGE.height - PAGE.margin;
  let y = PAGE.margin;

  function ensure(needed) {
    if (y + needed > maxY) {
      doc.addPage();
      y = PAGE.margin;
    }
  }

  if (view.title) {
    ensure(14);
    setPdfStyle(doc, { size: 16, bold: true });
    const lines = doc.splitTextToSize(view.title, width);
    doc.text(lines, PAGE.margin, y);
    y = nextPdfY(y, lines.length, 8) + 4;
  }

  for (const section of view.sections) {
    ensure(12);
    setPdfStyle(doc, { size: 13, bold: true });
    const labelLines = doc.splitTextToSize(section.label, width);
    doc.text(labelLines, PAGE.margin, y);
    y = nextPdfY(y, labelLines.length, 7);

    for (const entry of section.entries) {
      if (entry.label) {
        ensure(10);
        setPdfStyle(doc, { size: 11, bold: true });
        const entryLines = doc.splitTextToSize(entry.label, width);
        doc.text(entryLines, PAGE.margin, y);
        y = nextPdfY(y, entryLines.length, 6);
      }
      for (const line of entry.lines) {
        ensure(9);
        setPdfStyle(doc, { size: 11, bold: false });
        const lineParts = doc.splitTextToSize(line, width);
        doc.text(lineParts, PAGE.margin, y);
        y = nextPdfY(y, lineParts.length, 5);
      }
    }
  }

  const blob = doc.output("blob");
  return { blob, name: buildName(record, "pdf") };
}

function nextPdfY(currentY, linesCount, gap) {
  if (linesCount > 1 && currentY + (linesCount - 1) * gap > PAGE.height - PAGE.margin) {
    return PAGE.height - PAGE.margin + gap;
  }
  return currentY + linesCount * gap;
}

export async function buildDocx({ record }) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
  const view = toView(record);
  const children = [];

  if (view.title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: view.title })],
      }),
    );
  }

  for (const section of view.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun(section.label)],
      }),
    );
    for (const entry of section.entries) {
      if (entry.label) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: entry.label, bold: true })],
          }),
        );
      }
      for (const line of entry.lines) {
        children.push(new Paragraph({ children: [new TextRun(line)] }));
      }
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  return { blob, name: buildName(record, "docx") };
}

export async function buildPptx({ record }) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const view = toView(record);
  const pptx = new PptxGenJS();

  const cover = pptx.addSlide();
  cover.addText(
    [
      { text: titleFor(record), options: { bold: true, fontSize: 28, color: "2563EB" } },
      { text: "KruMate OS — สื่อการสอน", options: { fontSize: 16, color: "64748B" } },
    ],
    { x: 0.8, y: 2.0, w: 9.5, h: 3, align: "center", valign: "middle" },
  );

  for (const section of view.sections) {
    const slide = pptx.addSlide();
    const bullets = [
      { text: section.label, options: { bold: true, fontSize: 24, color: "2563EB" } },
    ];
    for (const entry of section.entries) {
      if (entry.label) {
        bullets.push({ text: `• ${entry.label}`, options: { fontSize: 18, color: "0F172A" } });
      }
      for (const line of entry.lines) {
        bullets.push({ text: line, options: { fontSize: 18, color: "0F172A" } });
      }
    }
    slide.addText(bullets, { x: 0.8, y: 0.6, w: 9.5, h: 4.8, valign: "top", gutter: 0.2 });
  }

  const blob = await pptx.write("blob");
  return { blob, name: buildName(record, "pptx") };
}

export async function exportDocument(record, format = "pdf", options = {}) {
  if (!FORMATS.includes(format)) {
    throw new Error(`Unsupported export format: ${format}`);
  }
  if (format === "pdf") return buildPdf({ record, fonts: options.fonts });
  if (format === "docx") return buildDocx({ record });
  return buildPptx({ record });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function loadPdfFonts() {
  const base = import.meta.env?.BASE_URL ?? "/";
  const toBase64 = async (file) => {
    const response = await fetch(`${base}fonts/${file}`);
    if (!response.ok) {
      throw new Error(`font load failed: ${file}`);
    }
    const buffer = await response.arrayBuffer();
    return arrayBufferToBase64(buffer);
  };
  return {
    regular: await toBase64("Sarabun-Regular.ttf"),
    bold: await toBase64("Sarabun-Bold.ttf"),
  };
}

export const exportService = {
  FORMATS,
  buildPdf,
  buildDocx,
  buildPptx,
  loadPdfFonts,
  export: exportDocument,
};