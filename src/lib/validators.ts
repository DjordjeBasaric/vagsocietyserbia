import { z } from "zod";

export const orderSchema = z.object({
  productId: z.string().uuid(),
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  email: z.string().email("Unesite ispravan email"),
  phone: z.string().min(6, "Telefon je obavezan"),
  shippingAddress: z.string().min(10, "Adresa za isporuku je obavezna"),
});

export const eventRegistrationSchema = z.object({
  fullName: z
    .string()
    // Can be a single word (e.g. only first name)
    .min(2, "Ime (i prezime) su obavezni"),
  email: z.string().email("Unesite ispravan email"),
  phone: z.string().min(6, "Telefon je obavezan"),
  carModel: z.string().min(2, "Model automobila je obavezan"),
  country: z.string().min(2, "Država je obavezna"),
  city: z.string().min(2, "Grad je obavezan"),
  arrivingWithTrailer: z.boolean(),
  additionalInfo: z.string().max(1000).optional().default(""),
});

export const productSchema = z.object({
  name: z.string().min(2, "Naziv je obavezan"),
  description: z.string().min(10, "Opis je obavezan"),
  priceCents: z.number().int().positive("Cena mora biti pozitivna"),
  imageUrl: z
    .string()
    .min(1, "URL slike je obavezan")
    .refine(
      (value) => value.startsWith("/") || value.startsWith("http"),
      "URL slike mora biti validan"
    ),
  category: z.enum(["APPAREL", "ACCESSORIES", "STICKERS"]),
  isActive: z.boolean().optional().default(true),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const cartOrderSchema = z.object({
  fullName: z.string().min(2, "Ime i prezime je obavezno"),
  email: z.string().email("Unesite ispravan email"),
  phone: z.string().min(6, "Telefon je obavezan"),
  shippingAddress: z.string().min(10, "Adresa za isporuku je obavezna"),
  items: z.array(cartItemSchema).min(1, "Korpa je prazna"),
});
