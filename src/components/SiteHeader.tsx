import Link from "next/link";
import { Container } from "@/components/Container";

const navItems = [
  {
    href: "/",
    label: "Pocetna",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
        <path
          d="M4 11.5L12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-7.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/shop",
    label: "Prodavnica",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
        <path
          d="M6 7h12l1 5H5l1-5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6 12l1.2 7H16.8l1.2-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/events/may",
    label: "Skup",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
        <path
          d="M7 4v4M17 4v4M4.5 9h15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect
          x="4.5"
          y="7"
          width="15"
          height="13"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export function SiteHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur">
        <Container>
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-900">
                VagSocietySerbia
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </header>

      <nav
        aria-label="Primarna navigacija"
        className="fixed bottom-4 left-1/2 z-40 w-[92%] -translate-x-1/2 rounded-full border border-black/10 bg-white/90 px-4 py-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-slate-500"
            >
              <span className="text-slate-700">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
