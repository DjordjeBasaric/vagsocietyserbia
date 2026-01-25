"use client";

import { Container } from "@/components/Container";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

export function ShopPageClient() {
  const { language } = useLanguage();

  return (
    <main className="py-16 pb-24 md:pb-0">
      <Container>
        <div className="space-y-6 text-left md:text-center">
          <p className="section-subtitle fade-up">
            {t("shop.comingSoon.subtitle", language)}
          </p>
          <h1 className="section-title fade-up delay-1">
            {t("shop.comingSoon.title", language)}
          </h1>
          <p className="fade-up delay-2 mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            {t("shop.comingSoon.description", language)}
          </p>
          <div className="fade-up delay-3 mx-auto max-w-2xl bg-slate-50 dark:bg-slate-900 border-l-4 border-slate-900 dark:border-white p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              {t("shop.comingSoon.whatTitle", language)}
            </h3>
            <ul className="space-y-2 text-left text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-white">✓</span>
                <span>{t("shop.comingSoon.bullet1", language)}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-white">✓</span>
                <span>{t("shop.comingSoon.bullet2", language)}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-white">✓</span>
                <span>{t("shop.comingSoon.bullet3", language)}</span>
              </li>
            </ul>
          </div>
          <p className="fade-up delay-4 text-sm text-slate-500 dark:text-slate-400 italic">
            {t("shop.comingSoon.follow", language)}
          </p>
        </div>
      </Container>
    </main>
  );
}

