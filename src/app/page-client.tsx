"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SponsorsSection } from "@/components/SponsorsSection";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";
import { getCloudinaryVideoUrl } from "@/lib/cloudinary-video";

const allGalleryImages = Array.from(
  { length: 37 },
  (_, i) => `/gallery/${i + 1}.jpg`
);

function pickRandomUnique<T>(items: T[], count: number) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, Math.min(count, copy.length)));
}

export function HomePageClient() {
  const { language } = useLanguage();

  // Hero video - use Cloudinary URL with optimizations
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const VIDEO_START_AT = 0; // Start from beginning
  
  // Get optimized Cloudinary video URL with cache-busting
  // Add version query parameter to ensure latest version is loaded after upload
  // Kad zameniš video (Cloudinary ili public/), povećaj VIDEO_CACHE_BUST pa push + deploy
  const VIDEO_CACHE_BUST = "4";
  const videoUrl = React.useMemo(() => {
    const baseUrl = getCloudinaryVideoUrl("frontpage_video", {
      width: 1920,
      quality: "auto",
      format: "mp4",
    });
    const v =
      (typeof process.env.NEXT_PUBLIC_VIDEO_VERSION === "string" &&
        process.env.NEXT_PUBLIC_VIDEO_VERSION.trim()) ||
      VIDEO_CACHE_BUST ||
      new Date().toISOString().split("T")[0];
    return `${baseUrl}?v=${v}`;
  }, []);

  // Try to play video when ready
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = async () => {
      try {
        await video.play();
      } catch (error) {
        // Autoplay blocked, user will need to interact
        console.log("Video autoplay blocked:", error);
      }
    };

    if (video.readyState >= 3) {
      tryPlay();
    }

    video.addEventListener("canplay", tryPlay, { once: true });

    return () => {
      video.removeEventListener("canplay", tryPlay);
    };
  }, [videoUrl]);

  // Stats
  const stats = [
    { key: "founded", value: "2023" },
    { key: "members", value: "100+" },
    { key: "nextEvent", value: t("home.nextEventDate", language) },
  ];

  // Gallery images: 8 random
  const [galleryImages, setGalleryImages] = React.useState<string[]>(
    allGalleryImages.slice(0, 8)
  );
  React.useEffect(() => {
    setGalleryImages(pickRandomUnique(allGalleryImages, 8));
  }, []);

  // Carousel animation metrics
  const galleryRef = React.useRef<HTMLDivElement | null>(null);
  const [galleryMetrics, setGalleryMetrics] = React.useState<{
    step: number;
    width: number;
  }>({ step: 1, width: 1 });
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [isAtStart, setIsAtStart] = React.useState(true);
  const [isAtEnd, setIsAtEnd] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    // Safari fallback
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  React.useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const left = el.scrollLeft;
        setScrollLeft(left);
        const max = el.scrollWidth - el.clientWidth;
        setIsAtStart(left <= 2);
        setIsAtEnd(left >= max - 2);
      });
    };

    const compute = () => {
      const cards = el.querySelectorAll<HTMLElement>("[data-gallery-card]");
      const first = cards[0];
      const second = cards[1];
      const width = el.clientWidth || 1;
      let step = width;
      if (first && second) {
        step = Math.max(1, second.offsetLeft - first.offsetLeft);
      } else if (first) {
        step = Math.max(1, first.offsetWidth);
      }
      setGalleryMetrics({ step, width });
    };

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    compute();
    // Initialize start/end flags
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [galleryImages.length]);

  return (
    <>
      <main className="pb-24 md:pb-0">
      <section className="relative isolate flex min-h-[80vh] flex-col items-center justify-center overflow-hidden py-14 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 z-0 md:-top-20"
        >
          <video
            key={videoUrl}
            ref={videoRef}
            className="hero-video relative h-full w-full object-cover scale-[1.02] saturate-110 contrast-110 brightness-95"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            controlsList="nodownload noplaybackrate noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            onLoadedMetadata={() => {
              // Video metadata loaded, ready to play from start (VIDEO_START_AT = 0)
            }}
          />
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
                  <p className="mt-3 text-2xl text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
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
        </Container>

        {/* Mobile: full-bleed. Desktop: peek carousel + arrows. */}
        <div className="relative left-1/2 right-1/2 mt-8 w-screen -translate-x-1/2">
          <button
            type="button"
            aria-label={language === "sr" ? "Prethodna slika" : "Previous image"}
            onClick={() =>
              (() => {
                const el = galleryRef.current;
                if (!el) return;
                const step = galleryMetrics.step || el.clientWidth;
                const index = Math.round(el.scrollLeft / step);
                const next = Math.max(0, index - 1);
                el.scrollTo({ left: next * step, behavior: "smooth" });
              })()
            }
            className={`hidden md:flex absolute left-4 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/75 h-11 w-11 transition ${
              isAtStart ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span aria-hidden className="text-2xl leading-none">‹</span>
          </button>
          <button
            type="button"
            aria-label={language === "sr" ? "Sledeća slika" : "Next image"}
            onClick={() =>
              (() => {
                const el = galleryRef.current;
                if (!el) return;
                const step = galleryMetrics.step || el.clientWidth;
                const index = Math.round(el.scrollLeft / step);
                const next = index + 1;
                el.scrollTo({ left: next * step, behavior: "smooth" });
              })()
            }
            className={`hidden md:flex absolute right-4 top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/75 h-11 w-11 transition ${
              isAtEnd ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span aria-hidden className="text-2xl leading-none">›</span>
          </button>

          <div
            ref={galleryRef}
            className="no-scrollbar flex w-screen gap-0 overflow-x-auto pb-6 snap-x snap-mandatory [perspective:1200px] md:gap-8 md:px-[6vw]"
            style={{
              scrollPaddingLeft: "6vw",
              scrollPaddingRight: "6vw",
            }}
          >
            {galleryImages.map((src, index) => {
              const step = galleryMetrics.step || 1;
              const width = galleryMetrics.width || 1;
              const center = scrollLeft + width / 2;
              const itemCenter = index * step + step / 2;
              const dist = (itemCenter - center) / width; // -1..1ish
              const clamped = Math.max(-1.25, Math.min(1.25, dist));
              const abs = Math.abs(clamped);

              const scale = isDesktop ? 1 - abs * 0.12 : 1;
              const rotateY = isDesktop ? clamped * 10 : 0;
              const rotateZ = isDesktop ? -clamped * 0.8 : 0;
              const translateY = isDesktop ? abs * 6 : 0;
              const opacity = isDesktop ? 1 - abs * 0.2 : 1;

              return (
                <div
                  key={src}
                  data-gallery-card
                  className="snap-center shrink-0 w-screen md:w-[90vw] lg:w-[920px] xl:w-[1100px]"
                  style={{
                    transform: `translateY(${translateY}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    transformStyle: "preserve-3d",
                    opacity,
                    transition: "transform 120ms ease-out, opacity 120ms ease-out",
                    scrollSnapStop: "always",
                    willChange: "transform, opacity",
                  }}
                >
                  <Image
                    src={src}
                    alt={language === "sr" ? "Fotografija projekta" : "Project photo"}
                    width={1280}
                    height={720}
                    sizes="(min-width: 1280px) 1100px, (min-width: 1024px) 920px, (min-width: 768px) 90vw, 100vw"
                    className="h-[240px] w-screen object-contain md:h-[420px] md:w-full lg:h-[520px]"
                    style={{ transform: "translateZ(1px)" }}
                    priority={index === 0}
                    quality={85}
                  />
                </div>
              );
            })}
          </div>
        </div>
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

      <Container>
        <SponsorsSection />
      </Container>
    </main>
    </>
  );
}

