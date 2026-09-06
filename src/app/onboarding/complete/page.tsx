'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CompletePage() {
  return (
    <div className="glass-card p-10 text-center bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-inner">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">ตั้งค่าเสร็จสมบูรณ์!</h1>
      <p className="text-slate-500 mb-8 font-medium">บัญชีของคุณพร้อมใช้งานแล้ว</p>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-left mb-8">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span className="bg-blue-200 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">i</span>
          ขั้นตอนถัดไปที่คุณต้องทำ
        </h3>
        <p className="text-sm text-blue-800 mb-4">
          เพื่อให้บอทสามารถเซฟไฟล์ลง Google Drive ของคุณได้ คุณจะต้องไปกด "เชื่อมต่อ Google Drive" ในหน้า Settings (ตั้งค่า) ก่อนเริ่มใช้งาน
        </p>
      </div>

      <Link 
        href="/dashboard"
        className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all group"
      >
        เข้าสู่ Dashboard
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
