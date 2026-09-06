"use client";

import { ArrowLeft } from 'lucide-react';
import { Dictionary } from '@/i18n/en';

export default function BackButton({ dict }: { dict: Dictionary }) {
  return (
    <a 
      href="/dashboard/files"
      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium mb-2 group cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
      {dict.files.backToFiles}
    </a>
  );
}
