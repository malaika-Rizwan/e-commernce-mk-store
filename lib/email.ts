/**
 * Email utility for auth flows (e.g. password reset).
 * In development, logs the link to console. In production, wire to SendGrid/Resend/etc.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export interface SendResetEmailOptions {
  email: string;
  resetToken: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
  userName,
}: SendResetEmailOptions): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_PROVIDER) {
    // Integrate your email provider (Resend, SendGrid, etc.)
    // await resend.emails.send({ to: email, subject: '...', html: `...` });
    console.warn('Email provider not implemented; reset link:', resetUrl);
    return;
  }

  // Development: log link to console (never send real email with token in dev by default)
  console.log('--- Password reset (dev) ---');
  console.log('To:', email);
  console.log('Reset URL:', resetUrl);
  console.log('----------------------------');
}
