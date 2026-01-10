"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createProduct,
  type ProductActionState,
} from "@/app/actions/product-actions";

const initialState: ProductActionState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="button-primary w-fit disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Cuvanje..." : "Kreiraj"}
    </button>
  );
}

export function ProductCreateForm() {
  const [state, formAction] = React.useActionState(
    createProduct,
    initialState
  );
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          placeholder="Naziv proizvoda"
          className="field"
          required
        />
        <input
          name="price"
          placeholder="Cena (EUR)"
          className="field"
          required
        />
        <select name="category" className="field" required>
          <option value="">Izaberi kategoriju</option>
          <option value="APPAREL">Odeca</option>
          <option value="ACCESSORIES">Aksesoari</option>
          <option value="STICKERS">Nalepnice</option>
        </select>
        <input
          name="imageUrl"
          placeholder="URL slike (npr. /placeholders/product.svg)"
          className="field md:col-span-2"
          required
        />
      </div>
      <textarea
        name="description"
        placeholder="Opis"
        className="textarea h-28"
        required
      />
      <label className="flex items-center gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          name="isActive"
          className="h-4 w-4"
          defaultChecked
        />
        Aktivan proizvod
      </label>
      {state.message ? <p className="feedback">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
}
