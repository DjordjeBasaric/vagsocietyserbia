import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || "no-reply@vagsocietyserbia.com";
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

function getTransporter() {
  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("Nedostaje SMTP konfiguracija");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendEmail(payload: EmailPayload) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: smtpFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
