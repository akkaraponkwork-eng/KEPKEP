'use client';

import { Check, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="glass-card p-10 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="absolute top-6 right-6">
        <Link 
          href="/onboarding/complete" 
          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          ข้ามไปก่อน (Skip)
        </Link>
      </div>

      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/30">
        <Zap className="w-8 h-8 fill-white/20" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">เลือกแพ็กเกจที่เหมาะกับคุณ</h1>
      <p className="text-slate-500 mb-8 font-medium">เริ่มต้นใช้งานฟรี หรืออัปเกรดเพื่อฟีเจอร์ที่ครบครันยิ่งขึ้น</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Free Plan */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Starter</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-extrabold text-slate-900">ฟรี</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span>รองรับ 1 กลุ่ม LINE</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span>พื้นที่เก็บข้อมูลตาม Google Drive ของคุณ</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span>อัปโหลดไฟล์ขนาดสูงสุด 50MB/ไฟล์</span>
            </li>
          </ul>
          <Link href="/onboarding/complete" className="block w-full py-2.5 px-4 rounded-xl text-center border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors">
            เลือกแพ็กเกจนี้
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-blue-500 rounded-2xl p-6 bg-gradient-to-b from-blue-50 to-white relative shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all cursor-pointer">
          <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
            RECOMMENDED
          </div>
          <h3 className="text-xl font-bold text-blue-900 mb-1">Professional</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-extrabold text-slate-900">฿290</span>
            <span className="text-slate-500 font-medium">/เดือน</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="font-bold text-slate-800">ไม่จำกัดกลุ่ม LINE</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span>พื้นที่เก็บข้อมูลตาม Google Drive ของคุณ</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="font-bold text-slate-800">อัปโหลดไฟล์ขนาดสูงสุด 1GB/ไฟล์</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="w-5 h-5 text-blue-500 shrink-0" />
              <span>ดึงไฟล์ย้อนหลังอัตโนมัติ</span>
            </li>
          </ul>
          <Link href="/onboarding/complete" className="block w-full py-2.5 px-4 rounded-xl text-center bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
            อัปเกรดเลย
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
