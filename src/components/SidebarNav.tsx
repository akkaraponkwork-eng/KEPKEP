"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, FileText } from "lucide-react";

type SidebarNavProps = {
  dict: {
    dashboard: string;
    files: string;
    groups: string;
    settings: string;
    system?: string;
    feedbacks?: string;
  };
  isSuperAdmin?: boolean;
};

export default function SidebarNav({ dict, isSuperAdmin }: SidebarNavProps) {
  const pathname = usePathname();

  const links = [
    { name: dict.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: dict.files, href: "/dashboard/files", icon: FileText },
    { name: dict.groups, href: "/dashboard/groups", icon: Users },
    { name: dict.settings, href: "/dashboard/settings", icon: Settings },
  ];

  if (isSuperAdmin) {
    links.push({ name: dict.system || "System", href: "/dashboard/system", icon: LayoutDashboard });
    links.push({ name: dict.feedbacks || "Feedbacks", href: "/dashboard/system/feedbacks", icon: FileText });
  }

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 mt-4">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = 
          link.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(link.href);
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm">{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
