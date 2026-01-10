import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { RegistrationForm } from "@/app/events/may/RegistrationForm";

export const metadata: Metadata = {
  title: "Majski skup",
  description:
    "Prijava za VagSocietySerbia majski skup. Ogranicen broj mesta, kurirano iskustvo, potrebno odobrenje.",
};

export default function MayEventPage() {
  return (
    <div className="min-h-screen text-slate-900">
      <SiteHeader />
      <main className="py-16 pb-24 md:pb-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="section-subtitle fade-up">Majski skup 2025</p>
              <h1 className="section-title fade-up delay-1">
                Prijava i odobravanje
              </h1>
              <p className="mt-4 text-slate-600 fade-up delay-2">
                Majski skup je nase glavno okupljanje sa kuriranim prezentacijama,
                voznjama u koloni i partnerskim aktivacijama. Prijave se
                pregledaju kako bi postava ostala fokusirana i vrhunska.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-slate-600">
                {[
                  {
                    label: "Datumi",
                    value: "24-26 maj 2025",
                  },
                  {
                    label: "Lokacija",
                    value: "Beograd - lokacija nakon odobrenja",
                  },
                  {
                    label: "Sta da ocekujete",
                    value: "Izlozba, reliji, kurirana foto snimanja",
                  },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="glass-panel rounded-2xl p-4 fade-in"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <p className="text-slate-900">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="fade-in overflow-hidden rounded-3xl border border-black/10 bg-white">
              <Image
                src="/placeholders/car-3.svg"
                alt="Placeholder za dogadjaj"
                width={800}
                height={520}
                className="h-full w-full object-cover grayscale"
              />
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl text-slate-900 fade-up">
              Forma za prijavu
            </h2>
            <p className="mt-2 text-sm text-slate-500 fade-up delay-1">
              Posaljite podatke i slike automobila. Dobicete email potvrdu da
              je prijava na cekanju.
            </p>
            <RegistrationForm />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
