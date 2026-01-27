"use client";

import * as React from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const SPONSORS: ReadonlyArray<{ src: string; alt: string }> = [
  { src: "/sponsors/autobarn.jpg", alt: "Autobarn" },
  { src: "/sponsors/comiautomobili.jpg", alt: "Comi Automobili" },
  { src: "/sponsors/eurogips.png", alt: "Eurogips" },
  { src: "/sponsors/friks.jpg", alt: "Friks" },
  { src: "/sponsors/nedic.jpg", alt: "Nedic" },
  { src: "/sponsors/piccolo.png", alt: "Piccolo" },
  { src: "/sponsors/scf.png", alt: "SCF" },
  { src: "/sponsors/simmaster.webp", alt: "SimMaster" },
  { src: "/sponsors/begus.jpg", alt: "Begus" },
  { src: "/sponsors/beltshop.png", alt: "Beltshop" },
  { src: "/sponsors/droplab.jpg", alt: "Droplab" },
  { src: "/sponsors/garage55.png", alt: "Garage55" },
  { src: "/sponsors/hyper.jpg", alt: "Hyper" },
  { src: "/sponsors/jovanovic.png", alt: "Jovanović" },
  { src: "/sponsors/mixa.png", alt: "Mixa" },
  { src: "/sponsors/lake.png", alt: "Lake" },
  { src: "/sponsors/mr.png", alt: "MR" },
  { src: "/sponsors/paun.jpg", alt: "Paun" },
  { src: "/sponsors/reddox.png", alt: "Reddox" },
  { src: "/sponsors/vagsoccg.jpg", alt: "VAG SoC CG" },
  { src: "/sponsors/vagsocljub.jpg", alt: "VAG SoC Ljub" },
  { src: "/sponsors/vagspeedshop.jpg", alt: "VAG Speed Shop" },
  { src: "/sponsors/manojlovic.png", alt: "Manojlović" },
];

const PER_ROW = 7;
const COPIES = 4;
const BASE_SPEED = 0.7;
const EASE_FACTOR = 0.12;
const COOLDOWN_MS = 250;

const ROW_CONFIG = [
  { direction: -1 as const, phase: 0 },
  { direction: 1 as const, phase: 0.33 },
  { direction: -1 as const, phase: 0.66 },
];

function useSponsorsAnimation(direction: 1 | -1, initialPhase: number) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const blockWidthRef = React.useRef(0);
  const currentSpeedRef = React.useRef(0);
  const hoveredRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const cooldownUntilRef = React.useRef(0);
  const initedRef = React.useRef(false);
  const dragStartRef = React.useRef<{ startX: number; startScroll: number } | null>(null);
  const touchMoveHandlerRef = React.useRef<((e: TouchEvent) => void) | null>(null);
  const rafRef = React.useRef<number>(0);
  const directionRef = React.useRef(direction);
  const initialPhaseRef = React.useRef(initialPhase);
  directionRef.current = direction;
  initialPhaseRef.current = initialPhase;

  const measure = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const sw = el.scrollWidth;
    if (sw > 0) blockWidthRef.current = sw / COPIES;
  }, []);

  const initScrollPosition = React.useCallback(() => {
    const el = scrollRef.current;
    const bw = blockWidthRef.current;
    if (!el || bw <= 0 || initedRef.current) return;
    const lo = bw;
    const hi = 3 * bw;
    const center = 2 * bw;
    const phase = initialPhaseRef.current;
    const startOffset = (phase - 0.5) * bw;
    const initialLeft = center + startOffset;
    el.scrollLeft = Math.max(lo, Math.min(hi - 1, initialLeft));
    initedRef.current = true;
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const run = () => measure();
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const loop = React.useCallback(() => {
    measure();
    const el = scrollRef.current;
    const bw = blockWidthRef.current;
    if (!el || bw < 10) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    initScrollPosition();
    const now = Date.now();
    const paused = hoveredRef.current || draggingRef.current || now < cooldownUntilRef.current;
    const targetSpeed = paused ? 0 : BASE_SPEED * directionRef.current;
    currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * EASE_FACTOR;
    if (Math.abs(currentSpeedRef.current) < 0.002) currentSpeedRef.current = 0;
    if (!draggingRef.current) {
      const lo = bw;
      const hi = 3 * bw;
      const step = 2 * bw;
      let next = el.scrollLeft + currentSpeedRef.current;
      while (next < lo) next += step;
      while (next >= hi) next -= step;
      el.scrollLeft = next;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [measure, initScrollPosition]);

  React.useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const setHovered = React.useCallback((v: boolean) => {
    hoveredRef.current = v;
  }, []);

  const removeTouchHandler = React.useCallback(() => {
    const h = touchMoveHandlerRef.current;
    if (h) {
      document.removeEventListener("touchmove", h);
      touchMoveHandlerRef.current = null;
    }
  }, []);

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    dragStartRef.current = { startX: e.clientX, startScroll: el.scrollLeft };
    const handler = (ev: TouchEvent) => {
      if (dragStartRef.current) ev.preventDefault();
    };
    touchMoveHandlerRef.current = handler;
    document.addEventListener("touchmove", handler, { passive: false });
  }, []);

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    const d = dragStartRef.current;
    const el = scrollRef.current;
    if (!d || !el) return;
    el.scrollLeft = d.startScroll - (e.clientX - d.startX);
  }, []);

  const onPointerUp = React.useCallback(() => {
    if (!dragStartRef.current) return;
    draggingRef.current = false;
    dragStartRef.current = null;
    cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
    removeTouchHandler();
  }, [removeTouchHandler]);

  React.useEffect(() => removeTouchHandler, [removeTouchHandler]);

  return { scrollRef, setHovered, onPointerDown, onPointerMove, onPointerUp };
}

export function SponsorsSection() {
  const { language } = useLanguage();
  const row1 = useSponsorsAnimation(
    ROW_CONFIG[0].direction,
    ROW_CONFIG[0].phase
  );
  const row2 = useSponsorsAnimation(
    ROW_CONFIG[1].direction,
    ROW_CONFIG[1].phase
  );
  const row3 = useSponsorsAnimation(
    ROW_CONFIG[2].direction,
    ROW_CONFIG[2].phase
  );

  const rows = [row1, row2, row3];

  return (
    <section className="mt-16 overflow-x-hidden border-t border-black/5 py-12 dark:border-white/10">
      <h2 className="mb-8 text-center text-2xl font-medium text-slate-900 dark:text-white md:text-3xl fade-up">
        {t("event.sponsors.title", language)}
      </h2>
      {/* Na telefonu puna širina ekrana (100vw), na desktopu u okviru kontejnera */}
      <div
        className="relative w-[100vw] max-w-none left-1/2 -translate-x-1/2 overflow-hidden md:w-full md:left-0 md:translate-x-0"
        style={{ touchAction: "none" }}
      >
        {/* Glow samo na desktopu; na telefonu bez glow, kanvas od ivice do ivice */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-56 md:block"
          style={{
            background:
              "linear-gradient(to right, var(--background) 0%, var(--background) 35%, rgba(255,255,255,0) 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-56 md:block"
          style={{
            background:
              "linear-gradient(to left, var(--background) 0%, var(--background) 35%, rgba(255,255,255,0) 100%)",
          }}
          aria-hidden
        />
        {rows.map((row, rowIndex) => {
          const start = rowIndex * PER_ROW;
          const isLastRow = rowIndex === rows.length - 1;
          const sponsors = SPONSORS.slice(
            start,
            isLastRow ? undefined : start + PER_ROW
          );
          return (
            <div
              key={rowIndex}
              className="relative w-full"
              onMouseEnter={() => row.setHovered(true)}
              onMouseLeave={() => row.setHovered(false)}
              onPointerDown={row.onPointerDown}
              onPointerMove={row.onPointerMove}
              onPointerUp={row.onPointerUp}
              onPointerCancel={row.onPointerUp}
            >
              <div
                ref={row.scrollRef}
                className="no-scrollbar flex w-full overflow-x-auto overflow-y-hidden py-3 px-4 md:py-4 md:px-0"
                style={{ scrollBehavior: "auto" }}
              >
                {Array.from({ length: COPIES }).map((_, copyIndex) => (
                  <div
                    key={copyIndex}
                    className="flex shrink-0 items-center justify-center gap-3 md:gap-6 md:px-6 mr-3 md:mr-6 last:mr-0"
                  >
                    {sponsors.map((s) => (
                      <div
                        key={s.src + copyIndex}
                        className="relative h-28 w-[140px] shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:border-black/10 hover:shadow-md dark:border-white/10 dark:bg-[var(--surface)] dark:ring-white/10 dark:hover:border-white/20 md:h-48 md:w-[320px] md:rounded-2xl"
                      >
                        <Image
                          src={s.src}
                          alt={s.alt}
                          fill
                          className="object-contain object-center p-2 md:p-4"
                          sizes="(max-width: 768px) 140px, 320px"
                          unoptimized={s.src.endsWith(".webp")}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
