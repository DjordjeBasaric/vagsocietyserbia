"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const galleryImages = [
  "/placeholders/car-1.svg",
  "/placeholders/car-2.svg",
  "/placeholders/car-3.svg",
  "/placeholders/car-4.svg",
  "/placeholders/car-5.svg",
  "/placeholders/car-6.svg",
];

export function HomePageClient() {
  const { language } = useLanguage();

  const stats = [
    { key: "founded", value: "2023" },
    { key: "members", value: "100+" },
    { key: "nextEvent", value: t("home.nextEventDate", language) },
  ];

  return (
    <main className="pb-24 md:pb-0">
      <section className="flex min-h-[80vh] flex-col items-center justify-center py-14 md:py-20">
        <Container>
          <div className="space-y-10 text-center">
            <div className="space-y-6">
              <div className="fade-up delay-1 flex justify-center">
                <Logo size={180} />
              </div>
              <h1 className="sr-only">VagSocietySerbia</h1>
              <p className="fade-up delay-3 mx-auto max-w-xl text-base text-slate-600 dark:text-slate-400 md:text-lg">
                {t("home.tagline", language)}
              </p>
            </div>
            <div className="fade-up delay-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/events/may"
                className="button-primary text-white hover:text-black"
              >
                {t("home.registerButton", language)}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.key}
                  className={`glass-panel rounded-3xl p-6 ${
                    stat.key === "nextEvent" ? "col-span-2" : ""
                  }`}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t(`home.stats.${stat.key}`, language)}
                  </p>
                  <p className="mt-3 text-2xl text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="fade-in overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <Image
                src="/placeholders/car-1.svg"
                alt="VagSocietySerbia naslovna"
                width={1200}
                height={760}
                className="h-full w-full object-cover grayscale"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="space-y-4">
            <div className="space-y-4">
              <p className="section-subtitle">{t("home.story.subtitle", language)}</p>
              <h2 className="section-title">{t("home.story.title", language)}</h2>
              <p className="text-slate-600 dark:text-slate-300">
                {t("home.story.paragraph1", language)}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {t("home.story.paragraph2", language)}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-subtitle">{t("home.gallery.subtitle", language)}</p>
              <h2 className="section-title">{t("home.gallery.title", language)}</h2>
            </div>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              {t("home.gallery.placeholder", language)}
            </p>
          </div>
          <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {galleryImages.map((src, index) => (
              <div
                key={src}
                className="fade-in min-w-[240px] snap-center overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black md:min-w-[280px]"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <Image
                  src={src}
                  alt="Placeholder automobil"
                  width={800}
                  height={520}
                  className="h-full w-full object-cover grayscale"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="glass-panel rounded-3xl p-10 md:p-14">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="section-subtitle">{t("home.join.subtitle", language)}</p>
                <h2 className="section-title">{t("home.join.title", language)}</h2>
                <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
                  {t("home.join.description", language)}
                </p>
              </div>
              <a
                href="https://www.instagram.com/vag_society_serbia/"
                target="_blank"
                rel="noreferrer"
                className="button-primary"
              >
                Instagram
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
