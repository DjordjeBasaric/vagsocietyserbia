"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/language-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <LanguageProvider>
      {isAdmin ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-black dark:text-white">
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      )}
    </LanguageProvider>
  );
}

