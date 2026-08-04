import { Card } from "../components/ui";

export default function Library() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">คลังสื่อการสอน</h1>
        <p className="text-slate-500 mt-2">ดูรายการสื่อที่คุณสร้างและจัดการเนื้อหาได้จากที่นี่</p>
      </div>
      <Card className="p-8 text-slate-700">
        <p className="text-sm">ยังไม่มีสื่อในคลังของคุณ ลองสร้างสื่อใหม่จากหน้าสร้างสื่อการสอน</p>
      </Card>
    </div>
  );
}