import Link from "next/link";
import type { ReactNode } from "react";
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
    label: "Odrzavanje proizvoda",
    href: "/admin/products",
  },
  {
    key: "orders",
    label: "Narudzbine",
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
  return (
    <div className="min-h-screen text-slate-900">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-6 py-12">
          <div>
            <p className="section-subtitle">Administratorski panel</p>
            <h1 className="section-title">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <SignOutButton />
        </div>

        <div className="flex flex-wrap gap-2 rounded-3xl border border-black/5 bg-white p-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.key === active ? "page" : undefined}
              className={
                item.key === active
                  ? "rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-black/10 px-4 py-2 text-sm text-slate-600"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-10 pb-16">{children}</div>
      </Container>
    </div>
  );
}
