"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiCheck, FiClock, FiX } from "react-icons/fi";

type Tab = "pending" | "approved" | "declined";

const tabs: { key: Tab; label: string; count: number }[] = [
  { key: "pending", label: "Na čekanju", count: 0 },
  { key: "approved", label: "Odobrene", count: 0 },
  { key: "declined", label: "Odbijene", count: 0 },
];

export function AdminEventTabs({
  pendingCount,
  approvedCount,
  declinedCount,
}: {
  pendingCount: number;
  approvedCount: number;
  declinedCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams?.get("status");
  
  const activeTab: Tab =
    statusParam === "approved"
      ? "approved"
      : statusParam === "declined"
        ? "declined"
        : "pending";

  const handleTabClick = (tabKey: Tab) => {
    const params = new URLSearchParams(searchParams?.toString());

    // Keep default view clean (no query param) for pending.
    if (tabKey === "pending") {
      params.delete("status");
    } else {
      params.set("status", tabKey);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    // Ensure server components refetch when query changes
    router.refresh();
  };

  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count:
      tab.key === "pending"
        ? pendingCount
        : tab.key === "approved"
          ? approvedCount
          : declinedCount,
  }));

  const activeIndex = tabsWithCounts.findIndex((tab) => tab.key === activeTab);

  return (
    <div className="-mx-6 w-[calc(100%+3rem)] md:mx-0 md:w-auto">
      <div
        className="relative inline-flex w-full items-center gap-1 rounded-full border border-black/10 bg-white p-1 md:w-auto md:p-1.5"
        role="tablist"
        aria-label="Filter prijava"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-black transition-transform duration-300 ease-out"
          style={{
            width: `${100 / Math.max(1, tabsWithCounts.length)}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {tabsWithCounts.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              role="tab"
              aria-selected={isActive}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition md:flex-none md:px-5 md:py-2.5 ${
                isActive
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              style={isActive ? { color: "white" } : undefined}
            >
              <span className="inline-flex items-center gap-2">
                {tab.key === "pending" ? (
                  <FiClock className="h-4 w-4" aria-hidden />
                ) : tab.key === "approved" ? (
                  <FiCheck className="h-4 w-4" aria-hidden />
                ) : (
                  <FiX className="h-4 w-4" aria-hidden />
                )}
                <span>{tab.count}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
