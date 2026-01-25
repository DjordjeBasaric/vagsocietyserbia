 "use client";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

export function SiteFooter() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/5 dark:border-white/10 bg-white dark:bg-black py-12 pb-24 md:pb-12">
      <Container>
        <div className="flex justify-center">
          <Logo size={84} />
          <span className="sr-only">VagSocietySerbia</span>
        </div>

        <div className="mt-8 grid gap-6 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
          <div>
            <p className="mt-2 max-w-md">
              {t("footer.description", language)}
            </p>
          </div>
          <div className="space-y-2 text-slate-600 dark:text-slate-300">
            <p className="text-lg text-slate-900 dark:text-white">
              {t("footer.contactTitle", language)}
            </p>
            <p>Email: info@vagsocietyserbia.com</p>
            <p>Instagram: @vagsocietyserbia</p>
            <p>{t("footer.location", language)}</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
          {t("footer.rights", language, { year })}
        </p>
      </Container>
    </footer>
  );
}
