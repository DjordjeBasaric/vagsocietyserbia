"use client";

import Image from "next/image";
import { Container } from "@/components/Container";
import { RegistrationForm } from "@/app/events/may/RegistrationForm";
import { useLanguage } from "@/lib/language-context";
import { t } from "@/lib/translations";

export function MayEventPageClient() {
  const { language } = useLanguage();

  const details = [
    {
      key: "date",
      value: "9. i 10. maj 2026",
    },
    {
      key: "location",
      value: (
        <a
          href="https://www.google.com/maps/place/Ковилово+Ризорт/@44.9157588,20.4583177,16.34z/data=!4m9!3m8!1s0x475a639d612b6af3:0x215f1c95ee5f9a0b!5m2!4m1!1i2!8m2!3d44.9140531!4d20.4627906!16s%2Fg%2F11f3wmcshs?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 decoration-black/20 hover:decoration-black/60 dark:decoration-white/20 dark:hover:decoration-white/60"
        >
          Beograd – Kovilovo Resort
        </a>
      ),
    },
    {
      key: "expectations",
      value: language === "sr"
        ? "Izložba, druženje, vožnje i fotografisanje"
        : "Exhibition, socializing, drives and photography",
    },
  ];

  return (
    <main className="py-16 pb-24 md:pb-0">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="section-title fade-up delay-1 text-center lg:text-left">
              {t("event.title", language)}
            </h1>
            <p className="-mx-6 mt-4 px-6 text-center text-slate-600 dark:text-slate-300 fade-up delay-2 lg:mx-0 lg:px-0 lg:text-left">
              {t("event.description", language)}
            </p>
            <div className="mt-6 grid gap-4 text-sm text-slate-600 dark:text-slate-300">
              {details.map((item, index) => (
                <div
                  key={item.key}
                  className="glass-panel rounded-2xl p-4 fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <p className="text-slate-900 dark:text-white">
                    {t(`event.details.${item.key}`, language)}
                  </p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-in overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <Image
              src="/placeholders/car-3.svg"
              alt="Placeholder za događaj"
              width={800}
              height={520}
              className="h-full w-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl text-slate-900 dark:text-white fade-up">
            {t("event.form.title", language)}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 fade-up delay-1">
            {t("event.form.subtitle", language)}
          </p>
          <RegistrationForm />
        </div>
      </Container>
    </main>
  );
}
