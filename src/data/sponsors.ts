/**
 * Lista sponzora — samo dodaj novi red ispod.
 *
 * Kako dodati sponzora:
 * 1. Stavite logo u folder public/sponsors/ (npr. novisponzor.png)
 * 2. U listu ispod dodajte: { src: "/sponsors/novisponzor.png", alt: "Naziv" },
 *
 * Redovi se popunjavaju automatski ravnomerno (npr. 8+8+8 ili 8+8+7 — razlika najviše 1).
 * Redosled u listi = redosled prikaza.
 */

export const SPONSORS = [
  { src: "/sponsors/autobarn.jpg", alt: "Autobarn" },
  { src: "/sponsors/autoanaliza.jpg", alt: "AutoAnaliza" },
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
  { src: "/sponsors/cvele.jpg", alt: "Cvele" },
  { src: "/sponsors/ferdinand.png", alt: "Ferdinand" },
] as const;
