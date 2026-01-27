"use client";

import * as React from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

const SPONSORS = [
  { src: "/sponsors/autobarn.jpg", alt: "Autobarn" },
  { src: "/sponsors/comiautomobili.jpg", alt: "Comi Automobili" },
  { src: "/sponsors/eurogips.png", alt: "Eurogips" },
  { src: "/sponsors/friks.jpg", alt: "Friks" },
  { src: "/sponsors/nedic.jpg", alt: "Nedic" },
  { src: "/sponsors/piccolo.png", alt: "Piccolo" },
  { src: "/sponsors/scf.png", alt: "SCF" },
  { src: "/sponsors/simmaster.webp", alt: "SimMaster" },
] as const;

const COPIES = 4;
const BASE_SPEED = 0.45;
const EASE_FACTOR = 0.075;
const COOLDOWN_MS = 250;
const DIRECTION = -1; // scroll LEFT

function useSponsorsAnimation() {
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
    const left = el.scrollLeft;
    if (left < lo || left >= hi) {
      el.scrollLeft = center;
      initedRef.current = true;
    }
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const run = () => {
      measure();
    };
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
    const targetSpeed = paused ? 0 : BASE_SPEED * DIRECTION;

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
    const start = () => {
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(start);
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
  const { scrollRef, setHovered, onPointerDown, onPointerMove, onPointerUp } =
    useSponsorsAnimation();

  return (
    <section className="mt-12 border-t border-black/5 py-10 dark:border-white/10">
      <h2 className="mb-6 text-2xl text-slate-900 dark:text-white fade-up">
        {t("event.sponsors.title", language)}
      </h2>
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
      >
        <div
          ref={scrollRef}
          className="no-scrollbar flex w-full overflow-x-auto overflow-y-hidden py-4"
          style={{ scrollBehavior: "auto" }}
        >
          {Array.from({ length: COPIES }).map((_, copyIndex) => (
            <div
              key={copyIndex}
              className="flex shrink-0 items-center justify-center gap-10 px-6 md:gap-14 md:px-10"
            >
              {SPONSORS.map((s) => (
                <div
                  key={s.src + copyIndex}
                  className="relative h-60 w-[480px] shrink-0 md:h-96 md:w-[720px]"
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-contain object-center"
                    sizes="720px"
                    unoptimized={s.src.endsWith(".webp")}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
