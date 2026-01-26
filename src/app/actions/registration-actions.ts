"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { eventRegistrationSchema } from "@/lib/validators";
import { storeEventImages } from "@/lib/file-storage";
import { sendEmail } from "@/lib/email";

export type RegistrationActionState = {
  ok: boolean;
  message: string;
};

function normalizeLanguage(value: unknown): "sr" | "en" {
  return String(value).toLowerCase() === "en" ? "en" : "sr";
}

function buildPendingEmail(lang: "sr" | "en", firstName: string) {
  if (lang === "en") {
    return {
      subject: "Registration received - Vag Society Serbia event",
      text: `Hi ${firstName}, your registration has been received and is pending approval. We'll notify you when it's confirmed.`,
      html: `
        <h2>Registration received</h2>
        <p>Hi ${firstName},</p>
        <p>Your event registration is pending approval. We'll reach out once it's confirmed.</p>
      `,
    };
  }

  return {
    subject: "Prijava primljena - Vag Society Serbia skup",
    text: `Zdravo ${firstName}, prijava je primljena i čeka odobrenje. Obavestićemo vas kada bude potvrđena.`,
    html: `
      <h2>Prijava primljena</h2>
      <p>Zdravo ${firstName},</p>
      <p>Vaša prijava za skup je na čekanju. Javićemo se kada bude potvrđena.</p>
    `,
  };
}

function buildApprovedEmail(lang: "sr" | "en", firstName: string) {
  if (lang === "en") {
    return {
      subject: "Registration approved - Vag Society Serbia event",
      text: `Hi ${firstName}, your registration has been approved. See you at the event!`,
      html: `
        <h2>Registration approved</h2>
        <p>Hi ${firstName},</p>
        <p>Your registration has been approved. See you soon!</p>
      `,
    };
  }

  return {
    subject: "Prijava odobrena - Vag Society Serbia skup",
    text: `Zdravo ${firstName}, vaša prijava je odobrena. Vidimo se na skupu!`,
    html: `
      <h2>Prijava odobrena</h2>
      <p>Zdravo ${firstName},</p>
      <p>Vaša prijava za skup je odobrena. Vidimo se uskoro!</p>
    `,
  };
}

function buildDeclinedEmail(lang: "sr" | "en", firstName: string) {
  if (lang === "en") {
    return {
      subject: "Registration declined - Vag Society Serbia event",
      text: `Hi ${firstName}, thanks for applying. Unfortunately, we can’t confirm participation this time. See you at one of the next meetups!`,
      html: `
        <h2>Registration declined</h2>
        <p>Hi ${firstName},</p>
        <p>Thanks for applying. Unfortunately, we can’t confirm participation this time.</p>
        <p>See you at one of the next meetups!</p>
      `,
    };
  }

  return {
    subject: "Prijava odbijena - Vag Society Serbia skup",
    text: `Zdravo ${firstName}, hvala na prijavi. Ovog puta nismo u mogućnosti da potvrdimo učešće. Vidimo se na nekom od narednih okupljanja!`,
    html: `
      <h2>Prijava odbijena</h2>
      <p>Zdravo ${firstName},</p>
      <p>Hvala na prijavi. Ovog puta nismo u mogućnosti da potvrdimo učešće.</p>
      <p>Vidimo se na nekom od narednih okupljanja!</p>
    `,
  };
}

function isAllowedCarImage(file: File) {
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isJpeg =
    type === "image/jpeg" ||
    type === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg");
  const isPng = type === "image/png" || name.endsWith(".png");
  const isHeic =
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif");
  return isJpeg || isPng || isHeic;
}

export async function submitEventRegistration(
  _prevState: RegistrationActionState,
  formData: FormData
): Promise<RegistrationActionState> {
  try {
    // Debug: loguj sve ključeve iz FormData
    console.log("[Registration] FormData keys:", Array.from(formData.keys()));
    
    // Pokušaj da dobiješ podatke sa i bez prefiksa (Next.js dodaje prefiks)
    const getValue = (key: string) => {
      // Prvo probaj bez prefiksa
      let value = formData.get(key);
      if (!value) {
        // Probaj sa prefiksom 1_
        value = formData.get(`1_${key}`);
      }
      return value;
    };

    const getAllValues = (key: string) => {
      // Prvo probaj bez prefiksa
      let values = formData.getAll(key);
      if (values.length === 0) {
        // Probaj sa prefiksom 1_
        values = formData.getAll(`1_${key}`);
      }
      return values;
    };

    const raw = {
      fullName: String(getValue("fullName") || ""),
      email: String(getValue("email") || ""),
      phone: String(getValue("phone") || ""),
      carModel: String(getValue("carModel") || ""),
      country: String(getValue("country") || ""),
      city: String(getValue("city") || ""),
      arrivingWithTrailer: getValue("arrivingWithTrailer") === "on",
      additionalInfo: String(getValue("additionalInfo") || ""),
    };
    const language = normalizeLanguage(getValue("language"));

    console.log("[Registration] Parsed raw data:", raw);

    const parsed = eventRegistrationSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[Registration] Validation error:", parsed.error);
      return {
        ok: false,
        message: parsed.error.issues[0]?.message || "Neispravni podaci.",
      };
    }

    const allCarImages = getAllValues("carImages");
    const files = allCarImages.filter((file) => {
      return file instanceof File && file.size > 0;
    }) as File[];

    const invalid = files.find((f) => !isAllowedCarImage(f));
    if (invalid) {
      return {
        ok: false,
        message:
          language === "en"
            ? "Only JPG/JPEG, PNG and HEIC/HEIF image formats are allowed."
            : "Dozvoljeni su samo JPG/JPEG, PNG i HEIC/HEIF formati slika.",
      };
    }

    // Check file sizes (Vercel max request body is 4.5MB, use 4MB total with margin)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB per file
    const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB total

    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      return {
        ok: false,
        message:
          language === "en"
            ? `File "${oversized.name}" is too large (max 2MB per image). Please select smaller images.`
            : `Fajl "${oversized.name}" je prevelik (max 2MB po slici). Molimo izaberite manje slike.`,
      };
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return {
        ok: false,
        message:
          language === "en"
            ? "Total size of all images is too large (max 4MB). Please select fewer or smaller images."
            : "Ukupna veličina svih slika je prevelika (max 4MB). Molimo izaberite manje ili manje slika.",
      };
    }

    console.log(`[Registration] Received ${allCarImages.length} carImages entries, ${files.length} valid files`);

    if (files.length < 3) {
      return {
        ok: false,
        message:
          language === "en"
            ? `At least 3 photos are required. Received: ${files.length}.`
            : `Potrebno je najmanje 3 fotografije. Primljeno: ${files.length}.`,
      };
    }

    if (files.length > 5) {
      return {
        ok: false,
        message:
          language === "en"
            ? "You can upload a maximum of 5 photos."
            : "Maksimalno je moguće poslati 5 fotografija.",
      };
    }

    const nameParts = parsed.data.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    // Note: if Prisma Client types are stale in-editor, keep the call permissive.
    // Runtime is validated by the database schema/migrations.
    const registration = await (prisma.eventRegistration as any).create({
      data: {
        firstName,
        lastName,
        email: parsed.data.email.toLowerCase(),
        language,
        carModel: parsed.data.carModel,
        country: parsed.data.country,
        city: parsed.data.city,
        arrivingWithTrailer: parsed.data.arrivingWithTrailer,
        additionalInfo: parsed.data.additionalInfo || "",
      },
    });

    const stored = await storeEventImages(files, registration.id);
    if (stored.length) {
      await prisma.carImage.createMany({
        data: stored.map((file) => ({
          url: file.url,
          registrationId: registration.id,
        })),
      });
    }

    // Pokušaj da pošalješ email, ali ne dozvoli da greška spreči čuvanje prijave
    try {
      const emailPayload = buildPendingEmail(language, registration.firstName);
      await sendEmail({
        to: registration.email,
        subject: emailPayload.subject,
        text: emailPayload.text,
        html: emailPayload.html,
      });
    } catch (emailError) {
      console.error("[Registration] Failed to send confirmation email:", emailError);
      // Ne baci grešku - prijava je već sačuvana
    }

    revalidatePath("/events/may");
    return {
      ok: true,
      message: "",
    };
  } catch (error) {
    console.error("[Registration] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Nije moguće poslati prijavu.";
    return { ok: false, message: errorMessage };
  }
}

export async function approveRegistration(formData: FormData): Promise<void> {
  try {
    const id = String(formData.get("registrationId") || "");
    if (!id) {
      return;
    }

    const registration = await (prisma.eventRegistration as any).update({
      where: { id },
      data: { status: "APPROVED" },
    });

    const lang = normalizeLanguage(registration.language);
    const emailPayload = buildApprovedEmail(lang, registration.firstName);
    await sendEmail({
      to: registration.email,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error(error);
  }
}

export async function declineRegistration(formData: FormData): Promise<void> {
  try {
    const id = String(formData.get("registrationId") || "");
    if (!id) {
      return;
    }

    const registration = await (prisma.eventRegistration as any).update({
      where: { id },
      data: { status: "DECLINED" },
    });

    const lang = normalizeLanguage(registration.language);
    const emailPayload = buildDeclinedEmail(lang, registration.firstName);
    await sendEmail({
      to: registration.email,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error(error);
  }
}
