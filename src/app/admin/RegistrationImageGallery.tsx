"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  url: string;
};

export function RegistrationImageGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeImage = useMemo(() => {
    if (activeIndex === null) return null;
    return images[activeIndex] ?? null;
  }, [activeIndex, images]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (activeIndex === null) return;
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => {
          if (index === null) return 0;
          return (index + 1) % images.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => {
          if (index === null) return images.length - 1;
          return (index - 1 + images.length) % images.length;
        });
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, images.length]);

  function showNext() {
    setActiveIndex((index) => {
      if (index === null) return 0;
      return (index + 1) % images.length;
    });
  }

  function showPrev() {
    setActiveIndex((index) => {
      if (index === null) return images.length - 1;
      return (index - 1 + images.length) % images.length;
    });
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative overflow-hidden rounded-xl border border-black/10 bg-white"
          >
            <Image
              src={image.url}
              alt="Slika automobila"
              width={300}
              height={225}
              sizes="(max-width: 768px) 33vw, 200px"
              className="aspect-[4/3] h-auto w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5" />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="overflow-hidden rounded-3xl bg-white">
              <Image
                src={activeImage.url}
                alt="Uvecana slika automobila"
                width={1200}
                height={900}
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-white">
              <span>
                {activeIndex !== null ? activeIndex + 1 : 0} / {images.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPrev}
                  className="rounded-full border border-white/40 px-4 py-2 text-xs font-medium"
                >
                  Nazad
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="rounded-full border border-white/40 px-4 py-2 text-xs font-medium"
                >
                  Napred
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
