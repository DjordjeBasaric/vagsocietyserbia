"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validators";

export type ProductActionState = {
  ok: boolean;
  message: string;
};

function parsePriceToCents(raw: string) {
  const normalized = raw.replace(/,/g, ".");
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value) || value <= 0) {
    return null;
  }
  return Math.round(value * 100);
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  try {
    const priceCents = parsePriceToCents(String(formData.get("price") || ""));
    if (!priceCents) {
      return { ok: false, message: "Cena mora biti validan broj." };
    }

    const raw = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      priceCents,
      imageUrl: String(formData.get("imageUrl") || ""),
      category: String(formData.get("category") || ""),
      isActive: formData.get("isActive") === "on",
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.errors[0]?.message || "Neispravni podaci.",
      };
    }

    await prisma.product.create({ data: parsed.data });
    revalidatePath("/admin");
    revalidatePath("/shop");
    return { ok: true, message: "Proizvod kreiran." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Ne mozemo da kreiramo proizvod." };
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const productId = String(formData.get("productId") || "");
    const priceCents = parsePriceToCents(String(formData.get("price") || ""));
    if (!productId) {
      return { ok: false, message: "Proizvod nije pronadjen." };
    }
    if (!priceCents) {
      return { ok: false, message: "Cena mora biti validan broj." };
    }

    const raw = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      priceCents,
      imageUrl: String(formData.get("imageUrl") || ""),
      category: String(formData.get("category") || ""),
      isActive: formData.get("isActive") === "on",
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.errors[0]?.message || "Neispravni podaci.",
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: parsed.data,
    });
    revalidatePath("/admin");
    revalidatePath("/shop");
    return { ok: true, message: "Proizvod azuriran." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Ne mozemo da azuriramo proizvod." };
  }
}

export async function deleteProduct(formData: FormData) {
  try {
    const productId = String(formData.get("productId") || "");
    if (!productId) {
      return { ok: false, message: "Proizvod nije pronadjen." };
    }

    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin");
    revalidatePath("/shop");
    return { ok: true, message: "Proizvod obrisan." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Ne mozemo da obrisemo proizvod." };
  }
}
