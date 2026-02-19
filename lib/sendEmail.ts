/**
 * Reusable email utility for MK Store.
 * Uses SMTP env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.
 * Safe to use in signup, orders, contact, etc. Does not throw; logs errors.
 */

import nodemailer from 'nodemailer';

function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const missing = []; if (!host) missing.push('SMTP_HOST'); if (!user) missing.push('SMTP_USER'); if (!pass) missing.push('SMTP_PASS');
    console.warn('[sendEmail] SMTP not configured. Missing:', missing.join(', '));
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send an email. Uses SMTP from env. Does not crash the app on failure.
 * @returns true if sent, false if transporter missing or send failed
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('[sendEmail] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local. Skipping email to', to);
      return false;
    }

    const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text ?? undefined,
      replyTo: replyTo ?? undefined,
    });
    return true;
  } catch (err) {
    console.error('[sendEmail] Failed to send:', { to, subject }, err);
    return false;
  }
}
