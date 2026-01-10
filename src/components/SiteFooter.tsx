import { Container } from "@/components/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white py-12 pb-24 md:pb-12">
      <Container>
        <div className="grid gap-6 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <p className="text-lg text-slate-900">VagSocietySerbia</p>
            <p className="mt-2 max-w-md">
              Zvanicni automobilski klub koji slavi VAG kulturu u Srbiji i sire.
              Pridruzi se dogadjajima, upoznaj clanove i nosi klupsku opremu.
            </p>
          </div>
          <div className="space-y-2 text-slate-600">
            <p className="text-lg text-slate-900">Kontakt</p>
            <p>Email: info@vagsocietyserbia.com</p>
            <p>Instagram: @vagsocietyserbia</p>
            <p>Beograd, Srbija</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} VagSocietySerbia. Sva prava zadrzana.
        </p>
      </Container>
    </footer>
  );
}
