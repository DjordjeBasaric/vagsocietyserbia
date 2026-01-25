"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Neispravni podaci. Pokušajte ponovo.");
    } else {
      router.push("/admin");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Container>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center">
          <div className="glass-panel rounded-3xl p-8">
            <p className="section-subtitle">Administratorski pristup</p>
            <h1 className="section-title">VagSocietySerbia administracija</h1>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <input
                name="email"
                type="email"
                placeholder="Email adresa"
                className="field"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Lozinka"
                className="field"
                required
              />
              {error ? <p className="feedback">{error}</p> : null}
              <button
                type="submit"
                className="button-primary w-full disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Prijavljivanje..." : "Prijavi se"}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
