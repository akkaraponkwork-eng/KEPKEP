'use client';

import { useState } from 'react';
import { saveWorkspaceName } from '@/app/actions/onboarding';
import { ArrowRight, Building2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useRouter } from 'next/navigation';

export default function WorkspacePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <div className="glass-card p-10 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
        <Building2 className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2">ยินดีต้อนรับสู่ KepKep!</h1>
      <p className="text-slate-500 mb-8 font-medium">ก่อนเริ่มต้นใช้งาน กรุณาตั้งชื่อสถานที่ทำงาน หรือชื่อทีมของคุณ</p>

      <form 
        action={async (formData) => {
          setLoading(true);
          try {
            const result = await saveWorkspaceName(formData);
            if (result.success) {
              router.push('/onboarding/pricing');
            }
          } catch (e) {
            setLoading(false);
            alert('ไม่สามารถบันทึกได้ โปรดลองอีกครั้ง');
          }
        }} 
        className="space-y-6"
      >
        <div>
          <label htmlFor="workspaceName" className="block text-sm font-bold text-slate-700 mb-2">
            ชื่อสถานที่ทำงาน / องค์กร
          </label>
          <input 
            type="text" 
            id="workspaceName" 
            name="workspaceName" 
            required
            autoFocus
            placeholder="เช่น บริษัท ABC จำกัด, ทีม Marketing..." 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            <>
              ดำเนินการต่อ
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
