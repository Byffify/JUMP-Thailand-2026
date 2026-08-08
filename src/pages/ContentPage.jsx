import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FileDown, FileText, ArrowLeft, ClipboardX } from "lucide-react";
import { saveAs } from "file-saver";
import { Card, Button, Pill, SourceBadge, ErrorState, Skeleton, EmptyState } from "../components/ui";
import { SUBJECTS, GRADES, OUTPUT_TYPES } from "../data/constants";
import { contentService } from "../services/contentService";
import { renderBody } from "../utils/bodyRenderer";
import { exportService } from "../services/exportService";

const findLabel = (List, id) => List.find((item) => item.id === id)?.label ?? id;

export default function ContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

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

  const metadata = content.metadata ?? {};
  const outputType = metadata.outputType;
  const subjectLabel = findLabel(SUBJECTS, metadata.subject);
  const gradeLabel = findLabel(GRADES, metadata.grade);
  const typeLabel = findLabel(OUTPUT_TYPES, outputType);

  const view = renderBody({ outputType, body: content.body });

  async function handleExport(format) {
    setExporting(format);
    try {
      const fonts = format === "pdf" ? await exportService.loadPdfFonts() : undefined;
      const { blob, name } = await exportService.export(content, format, { fonts });
      saveAs(blob, name);
    } catch (error) {
      console.error(`Export ${format} failed`, error);
    } finally {
      setExporting(null);
    }
  }

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
            <SourceBadge source={metadata.source} />
          </div>
          <h1 className="text-2xl font-semibold text-krumate-text">{metadata.prompt}</h1>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" disabled={exporting === "pdf"} onClick={() => handleExport("pdf")}>
            <FileDown size={16} /> PDF
          </Button>
          <Button variant="secondary" disabled={exporting === "docx"} onClick={() => handleExport("docx")}>
            <FileDown size={16} /> DOCX
          </Button>
          <Button variant="secondary" disabled={exporting === "pptx"} onClick={() => handleExport("pptx")}>
            <FileDown size={16} /> PPTX
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {!view.ok ? (
          <EmptyState
            icon={ClipboardX}
            title="ไม่พบข้อมูลเนื้อหา"
            description="ไม่สามารถแสดงผลเนื้อหาสื่อการสอนนี้ได้ กรุณากลับไปสร้างชิ้นใหม่"
          />
        ) : (
          <BodySections view={view} />
        )}
      </Card>

      <Card className="mt-4 flex items-center gap-2 p-4 text-sm text-krumate-muted">
        <FileText size={16} />
        สร้างเมื่อ {new Date(content.createdAt ?? content.id).toLocaleString("th-TH")}
      </Card>
    </div>
  );
}

function BodySections({ view }) {
  return (
    <div className="space-y-6 text-krumate-text">
      {view.title ? (
        <h2 className="text-xl font-semibold">{view.title}</h2>
      ) : null}
      {view.sections.map((section, si) => (
        <section key={si}>
          <h3 className="mb-2 font-medium text-krumate-text">{section.label}</h3>
          <div className="space-y-3">
            {section.entries.map((entry, ei) => (
              <div key={ei}>
                {entry.label ? (
                  <p className="mb-1 text-sm font-medium text-krumate-muted">
                    {entry.label}
                  </p>
                ) : null}
                {entry.lines.map((line, li) => (
                  <p key={li} className="text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}