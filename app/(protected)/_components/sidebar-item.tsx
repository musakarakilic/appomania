"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  isCollapsed?: boolean;
  hasLightning?: boolean;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isCollapsed,
  hasLightning
}: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-x-3 text-slate-500 text-sm font-medium p-3 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-300",
        isActive && "text-blue-700 bg-blue-50/80 hover:bg-blue-100/80"
      )}
    >
      <div className="relative">
        <Icon className={cn(
          "h-5 w-5",
          isActive ? "text-blue-700" : "text-slate-500"
        )} />
        {hasLightning && (
          <Zap className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
        )}
      </div>
      {!isCollapsed && (
        <span>{label}</span>
      )}
    </Link>
  );
}; 