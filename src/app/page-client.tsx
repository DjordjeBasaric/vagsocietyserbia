"use client";

import * as React from "react";
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
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const VIDEO_START_AT = 5;
  const [videoReady, setVideoReady] = React.useState(false);

  // Fallback: if Safari never fires loadeddata/canplay, still show the element.
  React.useEffect(() => {
    const t = window.setTimeout(() => setVideoReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const stats = [
    { key: "founded", value: "2023" },
    { key: "members", value: "100+" },
    { key: "nextEvent", value: t("home.nextEventDate", language) },
  ];

  return (
    <main className="pb-24 md:pb-0">
      <section className="relative isolate flex min-h-[80vh] flex-col items-center justify-center overflow-hidden py-14 md:py-20">
        {/* Lift video slightly so iOS overlay (e.g. "1.00") sits under header */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 z-0 md:-top-20"
        >
          <video
            ref={videoRef}
            className={`hero-video h-full w-full object-cover scale-[1.02] saturate-110 contrast-110 brightness-95 transition-opacity duration-300 ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
            src="/frontpage_video.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (!v) return;
              if (Number.isFinite(v.duration) && v.duration > VIDEO_START_AT) {
                v.currentTime = VIDEO_START_AT;
              }
            }}
            onLoadedData={() => setVideoReady(true)}
            onCanPlay={() => setVideoReady(true)}
            onTimeUpdate={() => {
              const v = videoRef.current;
              if (!v) return;
              // Keep start at 7s even if the browser loops back to 0.
              if (
                Number.isFinite(v.duration) &&
                v.duration > VIDEO_START_AT &&
                v.currentTime < VIDEO_START_AT - 0.25
              ) {
                v.currentTime = VIDEO_START_AT;
              }
            }}
          />
          {/* Darken slightly (even on light theme) so video is visible */}
          <div className="absolute inset-0 bg-black/25 dark:bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 dark:from-black/40 dark:via-transparent dark:to-black/70" />
        </div>
        <Container>
          <div className="relative z-10 space-y-10 text-center">
            <div className="space-y-6">
              <div className="fade-up delay-1 flex justify-center lg:-translate-y-8">
                <Image
                  src="/logo/vss_logo_white.png"
                  alt="VagSocietySerbia"
                  width={360}
                  height={360}
                  priority
                  sizes="(min-width: 1280px) 360px, (min-width: 1024px) 320px, (min-width: 768px) 220px, 180px"
                  className="block h-auto w-[180px] md:w-[220px] lg:w-[320px] xl:w-[360px] drop-shadow-[0_6px_24px_rgba(0,0,0,0.55)]"
                />
              </div>
              <h1 className="sr-only">VagSocietySerbia</h1>
              <p className="fade-up delay-3 mx-auto max-w-xl text-base text-white/90 drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] md:text-lg">
                {t("home.tagline", language)}
              </p>
            </div>
            <div className="fade-up delay-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/events/may"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-medium text-black text-center transition hover:bg-black hover:text-white border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
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
