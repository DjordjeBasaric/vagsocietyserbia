import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Pocetna",
  description:
    "Upoznaj VagSocietySerbia - nasu pricu, galeriju i kako da se pridruzis narednim klupskim dogadjajima.",
};

const galleryImages = [
  "/placeholders/car-1.svg",
  "/placeholders/car-2.svg",
  "/placeholders/car-3.svg",
  "/placeholders/car-4.svg",
  "/placeholders/car-5.svg",
  "/placeholders/car-6.svg",
];

const stats = [
  { label: "Osnovani", value: "2014" },
  { label: "Aktivni clanovi", value: "350+" },
  { label: "Sledeci skup", value: "24-26 maj" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen text-slate-900">
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <section className="flex min-h-[80vh] flex-col items-center justify-center py-14 md:py-20">
          <Container>
            <div className="space-y-10 text-center">
              <div className="space-y-4">
                <p className="section-subtitle fade-up">Zvanicni auto klub</p>
                <h1 className="fade-up delay-1 text-4xl font-semibold tracking-tight md:text-6xl">
                  VagSocietySerbia
                </h1>
                <p className="fade-up delay-2 mx-auto max-w-xl text-base text-slate-600 md:text-lg">
                  Kurirana zajednica VAG entuzijasta fokusirana na izradu, ciste
                  prepravke i nezaboravne voznje kroz Srbiju i Evropu.
                </p>
              </div>
              <div className="fade-up delay-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/events/may"
                  className="button-primary text-white hover:text-black"
                >
                  Prijava za majski skup
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-3xl p-6">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-3 text-2xl text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="fade-in overflow-hidden rounded-3xl border border-black/10 bg-white">
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
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <p className="section-subtitle">Nasa prica</p>
                <h2 className="section-title">Na temeljima VAG nasledja</h2>
                <p className="text-slate-600">
                  VagSocietySerbia je poceo kao nocni razgovor izmedju Audi i VW
                  vozaca. Danas organizujemo vrhunske skupove, relije i
                  prezentacije koje cuvaju kulturu autenticnom i na visokom nivou.
                </p>
                <p className="text-slate-600">
                  Svaki dogadjaj je pazljivo kuriran da istakne ljude iza
                  prepravki, detalje i samu voznju.
                </p>
              </div>
              <div className="glass-panel rounded-3xl p-8">
                <p className="section-subtitle">Fokus</p>
                <ul className="mt-6 space-y-4 text-slate-600">
                  <li>Manji skupovi sa vrhunskom postavom</li>
                  <li>Kreativna snimanja i filmske voznje</li>
                  <li>Izdanja opreme koja finansiraju klupske inicijative</li>
                  <li>Partnerske aktivacije sa pouzdanim brendovima</li>
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-subtitle">Galerija</p>
                <h2 className="section-title">Istaknuti projekti</h2>
              </div>
              <p className="max-w-md text-sm text-slate-500">
                Privremene slike dok ne stigne galerija sezone 2025.
              </p>
            </div>
            <div className="no-scrollbar mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {galleryImages.map((src, index) => (
                <div
                  key={src}
                  className="fade-in min-w-[240px] snap-center overflow-hidden rounded-3xl border border-black/10 bg-white md:min-w-[280px]"
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
                  <p className="section-subtitle">Pridruzi se klubu</p>
                  <h2 className="section-title">Prijava za majski skup</h2>
                  <p className="mt-3 max-w-xl text-slate-600">
                    Prijavi se sada i dobij potvrdu nakon pregleda prijava.
                    Broj mesta je ogranicen da bi dozivljaj ostao fokusiran.
                  </p>
                </div>
                <Link href="/events/may" className="button-primary">
                  Prijavi se
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
