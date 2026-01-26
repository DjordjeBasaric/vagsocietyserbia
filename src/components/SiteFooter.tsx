 "use client";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { FiInstagram, FiMail, FiMapPin } from "react-icons/fi";

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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiMail aria-hidden className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <a
                  href="mailto:vagsocietyserbia@gmail.com"
                  className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60 dark:decoration-white/20 dark:hover:decoration-white/60"
                >
                  vagsocietyserbia@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiInstagram aria-hidden className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <a
                  href="https://www.instagram.com/vag_society_serbia/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60 dark:decoration-white/20 dark:hover:decoration-white/60"
                >
                  @vag_society_serbia
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin aria-hidden className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>{t("footer.location", language)}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
          {t("footer.rights", language, { year })} · Developed by{" "}
          <a
            href="https://www.instagram.com/djordjebasaric/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 decoration-slate-400/50 hover:decoration-slate-400 dark:decoration-slate-500/50 dark:hover:decoration-slate-500"
          >
            Đorđe Basarić
          </a>
        </p>
      </Container>
    </footer>
  );
}
