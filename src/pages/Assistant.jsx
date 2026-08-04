import { Card } from "../components/ui";

export default function Assistant() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">ผู้ช่วย AI</h1>
        <p className="text-slate-500 mt-2">หน้าผู้ช่วยนี้จะช่วยให้คุณจัดการงานสอนด้วย AI ในอนาคต</p>
      </div>
      <Card className="p-8 text-slate-700">
        <p className="text-sm">ฟีเจอร์นี้กำลังพัฒนา คุณสามารถกลับมาใช้งานได้ในเร็วๆ นี้</p>
      </Card>
    </div>
  );
}