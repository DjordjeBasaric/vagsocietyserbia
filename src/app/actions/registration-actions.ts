"use server";

import { revalidatePath } from "next/cache";
import { readFileSync } from "fs";
import { join } from "path";
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
  const logoUrl = "https://vagsocietyserbia.com/logo/vss_logo_black.png";
  
  if (lang === "en") {
    return {
      subject: "Registration received - Vag Society Serbia event",
      text: `Hi ${firstName}, your registration has been received and is pending approval. We'll notify you when it's confirmed.`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #000000;">
              <img src="${logoUrl}" alt="VAG Society Serbia" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Registration received!</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Hi ${firstName},</p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Thank you for your registration for VAG Society Event 9–10 May 2026.</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">Our team will review your registration and contact you via email with further information.</p>
              <div style="background-color: #f9f9f9; border-left: 4px solid #000000; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">Your registration is currently pending approval. We'll reach out once it's confirmed.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Best regards,</p>
              <p style="margin: 0; font-size: 14px; color: #666666; font-weight: 600;">VAG Society Serbia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };
  }

  return {
    subject: "Prijava primljena - Vag Society Serbia skup",
    text: `Zdravo ${firstName}, prijava je primljena i čeka odobrenje. Obavestićemo vas kada bude potvrđena.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #000000;">
              <img src="${logoUrl}" alt="VAG Society Serbia" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Prijava je uspešno poslata!</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Poštovani,</p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Hvala vam na prijavi za VAG Society Event 9–10. maj 2026.</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">Naš tim će pregledati vašu prijavu i kontaktirati vas putem emaila sa daljim informacijama.</p>
              <div style="background-color: #f9f9f9; border-left: 4px solid #000000; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">Vaša prijava je trenutno na čekanju. Javićemo se kada bude potvrđena.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Srdačan pozdrav,</p>
              <p style="margin: 0; font-size: 14px; color: #666666; font-weight: 600;">VAG Society Serbia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

function buildApprovedEmail(lang: "sr" | "en", firstName: string) {
  const logoUrl = "https://vagsocietyserbia.com/logo/vss_logo_black.png";
  
  if (lang === "en") {
    return {
      subject: "Registration approved - Vag Society Serbia event",
      text: `Hi ${firstName}, your registration has been approved. See you at the event!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #000000;">
              <img src="${logoUrl}" alt="VAG Society Serbia" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Registration approved!</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Dear ${firstName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">We are pleased to inform you that your registration has been APPROVED and you are officially part of the VAG Society Event 2026, organized by VAG Society Serbia.</p>
              
              <!-- Event Details Box -->
              <div style="background-color: #f0f9f0; border: 2px solid #4caf50; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 20px;">📍</span>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2e7d32;">Location:</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #333333;">Kovilovo Resort, Belgrade</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 20px;">📅</span>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2e7d32;">Date:</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #333333;">May 9 and 10, 2026</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #2e7d32;">📆 Arrival and event schedule</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;"><strong>Arrival and registration:</strong></p>
                      <p style="margin: 4px 0 12px; font-size: 15px; color: #333333;">📌 Saturday, May 9 – from 09:00 to 12:00</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;"><strong>Event duration:</strong></p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;">📌 Saturday: 12:00 – 21:00</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;">📌 Sunday: 9:00 – 13:00</p>
                    </td>
                  </tr>
                </table>
                <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">It is recommended that the vehicle remains at the location during the event day, except in case of prior agreement with the organizer.</p>
              </div>

              <!-- Important Notes -->
              <div style="background-color: #fff9e6; border-left: 4px solid #ff9800; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #e65100;">🚗 Important notes</p>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">The vehicle must arrive clean and ready for display</li>
                  <li style="margin-bottom: 8px;">Respecting the instructions of security and organization is mandatory</li>
                  <li style="margin-bottom: 0;">Leaving the exhibition area without organizer approval during the event is not allowed</li>
                </ul>
              </div>

              <!-- Accommodation Info -->
              <div style="background-color: #e8f4f8; border: 2px solid #2196f3; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1976d2;">🏨 Accommodation</p>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #333333;">If you need accommodation, you can book at the resort located at the event venue itself.</p>
                <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: #333333;">For reservations, please contact:</p>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #333333;">
                  📧 <a href="mailto:info@kovilovoresort.rs" style="color: #1976d2; text-decoration: none;">info@kovilovoresort.rs</a><br>
                  📧 <a href="mailto:pero.radovanac@kovilovoresort.rs" style="color: #1976d2; text-decoration: none;">pero.radovanac@kovilovoresort.rs</a>
                </p>
                <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">The price list is attached to this email.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Best regards,</p>
              <p style="margin: 0; font-size: 14px; color: #666666; font-weight: 600;">VAG Society Serbia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };
  }

  return {
    subject: "Prijava odobrena - Vag Society Serbia skup",
    text: `Zdravo ${firstName}, vaša prijava je odobrena. Vidimo se na skupu!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #000000;">
              <img src="${logoUrl}" alt="VAG Society Serbia" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Prijava odobrena!</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Poštovani,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">Zadovoljstvo nam je da vas obavestimo da je vaša prijava ODOBRENA i da ste zvanično deo VAG Society Eventa 2026, koji organizuje VAG Society Serbia.</p>
              
              <!-- Event Details Box -->
              <div style="background-color: #f0f9f0; border: 2px solid #4caf50; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 20px;">📍</span>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2e7d32;">Lokacija:</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #333333;">Kovilovo Resort, Beograd</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 16px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 30px; vertical-align: top; padding-right: 12px;">
                            <span style="font-size: 20px;">📅</span>
                          </td>
                          <td>
                            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #2e7d32;">Datum:</p>
                            <p style="margin: 4px 0 0; font-size: 15px; color: #333333;">9. i 10. maj 2026.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #2e7d32;">📆 Detalji dolaska i trajanja događaja</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;"><strong>Dolazak i prijava učesnika:</strong></p>
                      <p style="margin: 4px 0 12px; font-size: 15px; color: #333333;">📌 Subota, 9. maj – od 09:00 do 12:00 časova</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;"><strong>Trajanje događaja:</strong></p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;">📌 Subota: 12:00 – 21:00</p>
                      <p style="margin: 4px 0; font-size: 15px; color: #333333;">📌 Nedelja: 9:00 – 13:00</p>
                    </td>
                  </tr>
                </table>
                <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">Preporuka je da vozilo ostane na lokaciji tokom dana događaja, osim u slučaju ranijeg dogovora sa organizatorom.</p>
              </div>

              <!-- Important Notes -->
              <div style="background-color: #fff9e6; border-left: 4px solid #ff9800; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #e65100;">🚗 Važne napomene</p>
                <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Vozilo mora doći čisto i spremno za izlaganje</li>
                  <li style="margin-bottom: 8px;">Poštovanje uputstava redara i organizacije je obavezno</li>
                  <li style="margin-bottom: 0;">Nije dozvoljeno napuštanje izložbenog prostora bez odobrenja organizatora tokom trajanja eventa.</li>
                </ul>
              </div>

              <!-- Accommodation Info -->
              <div style="background-color: #e8f4f8; border: 2px solid #2196f3; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #1976d2;">🏨 Smeštaj</p>
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #333333;">Ako vam je potreban smeštaj, možete rezervisati resort koji se nalazi na samoj lokaciji skupa.</p>
                <p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: #333333;">Za rezervacije, molimo kontaktirajte:</p>
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #333333;">
                  📧 <a href="mailto:info@kovilovoresort.rs" style="color: #1976d2; text-decoration: none;">info@kovilovoresort.rs</a><br>
                  📧 <a href="mailto:pero.radovanac@kovilovoresort.rs" style="color: #1976d2; text-decoration: none;">pero.radovanac@kovilovoresort.rs</a>
                </p>
                <p style="margin: 16px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">Cenovnik je priložen ovom emailu.</p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Srdačan pozdrav,</p>
              <p style="margin: 0; font-size: 14px; color: #666666; font-weight: 600;">VAG Society Serbia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

function buildDeclinedEmail(lang: "sr" | "en", firstName: string) {
  const logoUrl = "https://vagsocietyserbia.com/logo/vss_logo_black.png";
  
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
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 2px solid #000000;">
              <img src="${logoUrl}" alt="VAG Society Serbia" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #000000;">Obaveštenje o prijavi</h1>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Poštovani,</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">Zahvaljujemo vam se na prijavi za VAG Society Event 9–10. maj 2026. i na interesovanju da budete deo našeg događaja.</p>
              
              <!-- Decline Notice Box -->
              <div style="background-color: #fff5f5; border: 2px solid #f44336; border-radius: 6px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #333333;">Nakon pregleda svih prijava, obaveštavamo vas da vaša prijava ovog puta nije odabrana, jer se u ovom izdanju događaja fokusiramo na vozila koja se u najvećoj meri uklapaju u trenutni koncept i selekcione kriterijume Eventa.</p>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">Ova odluka ne umanjuje trud niti kvalitet vašeg vozila i nadamo se da ćemo imati priliku da vas vidimo na nekom od narednih događaja u organizaciji VAG Society Serbia.</p>
              </div>
              
              <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6; color: #333333;">Hvala vam na razumevanju i podršci.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #666666;">Srdačan pozdrav,</p>
              <p style="margin: 0; font-size: 14px; color: #666666; font-weight: 600;">VAG Society Serbia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
    
    // Load price list attachment
    let attachment;
    try {
      const priceListPath = join(process.cwd(), "public", "cenovnik_resort.jpg");
      const priceListBuffer = readFileSync(priceListPath);
      // Resend API accepts Buffer directly
      attachment = [
        {
          filename: "cenovnik_resort.jpg",
          content: priceListBuffer,
        },
      ];
    } catch (attachmentError) {
      console.warn("[Registration] Failed to load price list attachment:", attachmentError);
      // Continue without attachment if file not found
    }
    
    await sendEmail({
      to: registration.email,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
      attachments: attachment,
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
