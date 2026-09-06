import { ReactNode } from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  
  if (!session?.adminId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 left-6 flex items-center gap-3">
         <img src="/logo.png" alt="KepKep Logo" className="w-8 h-8 object-contain rounded-lg bg-blue-50" />
         <span className="text-lg font-bold tracking-tight text-slate-800">Kep<span className="text-blue-600">Kep</span></span>
      </div>
      
      <div className="w-full max-w-xl">
        {children}
      </div>
    </div>
  );
}
