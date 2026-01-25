type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let resendClientPromise: Promise<import("resend").Resend> | null = null;

async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  if (!resendClientPromise) {
    resendClientPromise = (async () => {
      const { Resend } = await import("resend");
      return new Resend(apiKey);
    })();
  }

  return await resendClientPromise;
}

export async function sendEmail(payload: EmailPayload) {
  const resend = await getResendClient();
  const from = process.env.RESEND_FROM;

  if (!resend || !from) {
    console.warn(
      "[Email] Email nije poslat - nedostaje RESEND_API_KEY ili RESEND_FROM"
    );
    return;
  }

  try {
    await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  } catch (error) {
    console.error("[Email] Greška pri slanju emaila:", error);
    throw error; // Baci grešku da bi se znalo da email nije poslat
  }
}
