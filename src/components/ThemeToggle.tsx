"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vss-theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else {
        // Check system preference on first load
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      // Ignore storage access issues.
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage access issues.
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Prebaci na tamnu temu" : "Prebaci na svetlu temu"}
      className={`inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 p-2 text-slate-600 shadow-sm backdrop-blur transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:text-white ${
        className ?? ""
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}
