"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import {
  submitEventRegistration,
  type RegistrationActionState,
} from "@/app/actions/registration-actions";

const initialState: RegistrationActionState = { ok: false, message: "" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending || disabled}
    >
      {pending ? "Slanje..." : "Posalji prijavu"}
    </button>
  );
}

function FloatingField({
  id,
  label,
  name,
  type = "text",
  disabled,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        className="field peer"
        placeholder=" "
        required
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
      >
        {label}
      </label>
    </div>
  );
}

export function RegistrationForm() {
  const [state, formAction] = React.useActionState(
    submitEventRegistration,
    initialState
  );
  const [fileCount, setFileCount] = React.useState(0);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-6"
    >
      {state.ok ? (
        <div className="glass-panel rounded-3xl p-6">
          <p className="section-subtitle">Prijava primljena</p>
          <p className="mt-2 text-base text-slate-600">
            Hvala na prijavi. Pregledacemo podatke i poslati potvrdu kada
            prijava bude odobrena.
          </p>
        </div>
      ) : null}

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500">Korak 1</p>
        <h3 className="mt-2 text-xl text-slate-900">Kontakt podaci</h3>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FloatingField
              id="firstName"
              name="firstName"
              label="Ime"
              disabled={state.ok}
            />
            <FloatingField
              id="lastName"
              name="lastName"
              label="Prezime"
              disabled={state.ok}
            />
          </div>
          <FloatingField
            id="email"
            name="email"
            type="email"
            label="Email adresa"
            disabled={state.ok}
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500">Korak 2</p>
        <h3 className="mt-2 text-xl text-slate-900">Podaci o vozilu</h3>
        <div className="mt-4 grid gap-4">
          <FloatingField
            id="carModel"
            name="carModel"
            label="Model automobila"
            disabled={state.ok}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <FloatingField
              id="country"
              name="country"
              label="Drzava"
              disabled={state.ok}
            />
            <FloatingField
              id="city"
              name="city"
              label="Grad"
              disabled={state.ok}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3">
            <div>
              <p className="text-sm text-slate-900">Dolazak sa prikolicom</p>
              <p className="text-xs text-slate-500">
                Ukljucite ako je primenljivo
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                name="arrivingWithTrailer"
                className="peer sr-only"
                disabled={state.ok}
              />
              <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-slate-900" />
              <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          <div className="relative">
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              className="textarea peer h-28"
              placeholder=" "
              disabled={state.ok}
            />
            <label
              htmlFor="additionalInfo"
              className="pointer-events-none absolute left-4 top-3 bg-white px-1 text-sm text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs peer-focus:text-slate-500"
            >
              Dodatne informacije o automobilu
            </label>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6">
        <p className="text-sm text-slate-500">Korak 3</p>
        <h3 className="mt-2 text-xl text-slate-900">Dodavanje fotografija</h3>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-slate-50 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-slate-600">
            +
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Dodirnite da dodate slike automobila
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {fileCount ? `${fileCount} odabrano` : "PNG, JPG, HEIC"}
          </p>
          <input
            type="file"
            name="carImages"
            accept="image/*"
            multiple
            className="hidden"
            disabled={state.ok}
            onChange={(event) => setFileCount(event.target.files?.length ?? 0)}
          />
        </label>
      </div>

      {state.message ? <p className="feedback">{state.message}</p> : null}

      <SubmitButton disabled={state.ok} />
    </form>
  );
}
