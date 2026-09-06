"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Dictionary } from "@/i18n/en";

export default function SearchInput({ dict }: { dict: Dictionary }) {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = new URLSearchParams(searchParams.toString());
      if (query) {
        currentParams.set("q", query);
      } else {
        currentParams.delete("q");
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${currentParams.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="text"
        placeholder={dict.files.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
      />
      {isPending && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
