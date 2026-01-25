 "use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiShoppingCart } from "react-icons/fi";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

function getNavItems(lang: "sr" | "en") {
  return [
    {
      href: "/",
      label: t("nav.home", lang),
      icon: (
        <FiHome aria-hidden className="h-6 w-6" strokeWidth={1.4} />
      ),
    },
    {
      href: "/shop",
      label: t("nav.shop", lang),
      icon: (
        <FiShoppingCart aria-hidden className="h-6 w-6" strokeWidth={1.5} />
      ),
    },
    {
      href: "/events/may",
      label: t("nav.event", lang),
      icon: (
        <span
          aria-hidden
          className="inline-flex h-6 w-12 translate-y-[5px] items-center justify-center"
        >
          <Image
            src="/navbar/corrado_skup_black.png"
            alt=""
            width={96}
            height={48}
            className="block h-6 w-auto object-contain dark:hidden"
            sizes="48px"
          />
          <Image
            src="/navbar/corrado_skup_white.png"
            alt=""
            width={96}
            height={48}
            className="hidden h-6 w-auto object-contain dark:block"
            sizes="48px"
          />
        </span>
      ),
    },
  ];
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { language } = useLanguage();
  const navItems = getNavItems(language);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navByHref = new Map(navItems.map((item) => [item.href, item]));
  const mobileNav = ["/shop", "/", "/events/may"]
    .map((href) => navByHref.get(href))
    .filter(Boolean) as typeof navItems;

  const activeMobileIndex = Math.max(
    0,
    mobileNav.findIndex((item) => isActive(item.href))
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <Container>
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute left-0 flex items-center gap-4">
              <LanguageToggle />
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 transition hover:opacity-80"
              aria-label="VagSocietySerbia"
            >
              <Logo size={72} />
              <span className="sr-only">VagSocietySerbia</span>
            </Link>
            <div className="absolute right-0 flex items-center gap-4">
              <nav className="hidden items-center gap-6 text-sm md:flex">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`transition hover:text-slate-900 dark:hover:text-white ${
                      isActive(item.href)
                        ? "text-slate-900 dark:text-white font-medium"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </Container>
      </header>

      <nav
        aria-label="Primarna navigacija"
        className="fixed bottom-4 left-1/2 z-40 w-[92%] -translate-x-1/2 rounded-full border border-black/10 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 p-1 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] backdrop-blur md:hidden"
      >
        <div className="relative flex items-stretch">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-full bg-black/5 dark:bg-white/10 transition-transform duration-300 ease-out"
            style={{
              width: `${100 / Math.max(1, mobileNav.length)}%`,
              transform: `translateX(${activeMobileIndex * 100}%)`,
            }}
          />
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              aria-label={item.label}
              className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-3 py-3 transition ${
                isActive(item.href)
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span
                className={
                  item.href === "/" || item.href === "/shop"
                    ? "text-black dark:text-white"
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
