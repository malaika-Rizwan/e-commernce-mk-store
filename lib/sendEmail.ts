/**
 * Reusable email utility for MK Store.
 * Prefers Resend when RESEND_API_KEY is set; otherwise uses SMTP (Nodemailer).
 * Env: RESEND_API_KEY (optional), or SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
 */

import nodemailer from 'nodemailer';

const MAX_RETRIES = 2;
const POOL_OPTIONS = {
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
};

let cachedTransporter: nodemailer.Transporter | null | undefined = undefined;
let resendClient: { emails: { send: (opts: { from: string; to: string; subject: string; html: string; text?: string }) => Promise<{ error?: { message: string } }> } } | null = null;

function getResend(): typeof resendClient {
  if (resendClient !== null) return resendClient;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resend } = require('resend');
    resendClient = new Resend(key);
    return resendClient;
  } catch {
    resendClient = null;
    return null;
  }
}

function getTransporter(): nodemailer.Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    cachedTransporter = null;
    return null;
  }

  cachedTransporter = nodemailer.createTransport(
    {
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      ...POOL_OPTIONS,
    },
    { from: process.env.SMTP_FROM ?? process.env.SMTP_USER }
  );
  return cachedTransporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email with retry (up to 2 retries). Uses Resend if RESEND_API_KEY set, else SMTP.
 * @returns true if sent, false if no provider or all retries failed
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<boolean> {
  const from = process.env.SMTP_FROM ?? process.env.RESEND_FROM ?? 'MK Store <onboarding@resend.dev>';
  const resend = getResend();

  if (resend) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { error } = await resend.emails.send({
          from: from.includes('<') ? from : `MK Store <${from}>`,
          to: [to],
          subject,
          html,
          ...(text && { text }),
          ...(replyTo && { reply_to: replyTo }),
        });
        if (error) throw new Error(error.message);
        return true;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          console.warn('[sendEmail] Resend attempt', attempt + 1, 'failed, retrying:', (err as Error)?.message);
        } else {
          console.error('[sendEmail] Resend failed after', MAX_RETRIES + 1, 'attempts:', { to, subject }, lastError);
        }
      }
    }
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[sendEmail] No email provider. Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, SMTP_PASS. Skipping email to', to);
    return false;
  }

  const fromAddr = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await transporter.sendMail({
        from: fromAddr,
        to,
        subject,
        html,
        text: text ?? undefined,
        replyTo: replyTo ?? undefined,
      });
      return true;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        console.warn('[sendEmail] SMTP attempt', attempt + 1, 'failed, retrying:', (err as Error)?.message);
      } else {
        console.error('[sendEmail] SMTP failed after', MAX_RETRIES + 1, 'attempts:', { to, subject }, lastErr);
      }
    }
  }
  return false;
}

/**
 * Trigger send without awaiting. Use when you want to return API response immediately.
 * Logs errors; does not crash. Use for OTP, verification, password reset.
 */
export function sendEmailNonBlocking(options: SendEmailOptions): void {
  sendEmail(options).catch((err) => {
    console.error('[sendEmail] Non-blocking send failed:', { to: options.to, subject: options.subject }, err);
  });
}
