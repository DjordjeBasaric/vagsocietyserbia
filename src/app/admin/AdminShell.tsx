 "use client";

import Link from "next/link";
import type { ReactNode } from "react";
import * as React from "react";
import { Container } from "@/components/Container";
import { SignOutButton } from "@/app/admin/SignOutButton";

const navItems = [
  {
    key: "events",
    label: "Prijave za skup",
    href: "/admin/events",
  },
  {
    key: "products",
    label: "Održavanje proizvoda",
    href: "/admin/products",
  },
  {
    key: "orders",
    label: "Narudžbine",
    href: "/admin/orders",
  },
] as const;

type AdminSection = "overview" | (typeof navItems)[number]["key"];

export function AdminShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active: AdminSection;
  children: ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-controls="admin-nav"
                className="button-ghost inline-flex items-center gap-2"
              >
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-700">
                  Meni
                </span>
              </button>

              {open ? (
                <div
                  id="admin-nav"
                  className="absolute left-0 mt-3 w-[min(320px,calc(100vw-3rem))] rounded-3xl border border-black/10 bg-white p-2 shadow-lg"
                >
                  <nav aria-label="Administratorska navigacija" className="grid gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={item.key === active ? "page" : undefined}
                        className={
                          item.key === active
                            ? "rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                            : "rounded-2xl px-4 py-3 text-sm text-slate-700 hover:bg-black/5"
                        }
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-2 border-t border-black/10 pt-2">
                    <SignOutButton />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="py-10">
          <p className="section-subtitle">Administratorski panel</p>
          <h1 className="section-title">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="pb-16">{children}</div>
      </Container>
    </div>
  );
}
