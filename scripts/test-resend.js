const { Resend } = require("resend");

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.TEST_EMAIL_TO || process.env.ADMIN_EMAIL;

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY");
    process.exit(1);
  }
  if (!from) {
    console.error("Missing RESEND_FROM");
    process.exit(1);
  }
  if (!to) {
    console.error("Missing TEST_EMAIL_TO or ADMIN_EMAIL");
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from,
    to,
    subject: "VagSocietySerbia - Resend test",
    html: "<p>Resend test email.</p>",
    text: "Resend test email.",
  });

  console.log("Sent:", result);
}

main().catch((err) => {
  console.error("Resend error:", err);
  process.exit(1);
});

