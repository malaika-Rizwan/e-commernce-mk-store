import { sendEmail, sendEmailNonBlocking } from '@/lib/sendEmail';

const ADMIN_EMAIL = 'malaikarizwan121@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const SUPPORT_EMAIL = process.env.SMTP_FROM ?? 'support@mkstore.com';

const OTP_EXPIRY_MINUTES = 10;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shared professional OTP email template – MK Store branding, #EBBB69 highlight, 10 min expiry. */
function getOtpEmailHtml(options: {
  userName: string;
  otpCode: string;
  title: string;
  bodyMessage: string;
  expiryMinutes?: number;
  extraHtml?: string;
}): string {
  const { userName, otpCode, title, bodyMessage, expiryMinutes = OTP_EXPIRY_MINUTES, extraHtml = '' } = options;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} - MK Store</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:#EBBB69;padding:24px 28px;">
      <h1 style="margin:0;font-size:22px;color:#49474D;font-weight:700;">MK Store</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#49474D;opacity:0.95;">${escapeHtml(title)}</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">${bodyMessage}</p>
      <div style="background:#f9fafb;border:2px solid #EBBB69;border-radius:10px;padding:20px 24px;text-align:center;margin:0 0 24px;">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;">Your code</p>
        <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#49474D;font-family:ui-monospace,monospace;">${escapeHtml(otpCode)}</p>
      </div>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">This code expires in <strong>${expiryMinutes} minutes</strong>. Do not share it with anyone.</p>
      ${extraHtml}
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} MK Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface OrderConfirmationData {
  to: string;
  userName: string;
  orderId: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  totalPrice: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export async function sendOrderConfirmation(
  data: OrderConfirmationData
): Promise<void> {
  const estimatedDelivery =
    data.estimatedDelivery ??
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    })();

  const itemsRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(i.quantity * i.price).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your MK Store Order Confirmation</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <div style="border-bottom: 2px solid #EBBB69; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store</h1>
  </div>
  <h2 style="color: #49474D; font-size: 20px;">Your order is confirmed</h2>
  <p>Hi ${escapeHtml(data.userName)},</p>
  <p>Thank you for your order. We&apos;ve received it and will get it to you soon.</p>
  <p><strong>Order ID:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${escapeHtml(data.orderId)}</span></p>
  ${data.trackingNumber ? `<p><strong>Tracking number:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${escapeHtml(data.trackingNumber)}</span></p>` : ''}
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
    <thead>
      <tr style="background: #49474D; color: #fff;">
        <th style="padding: 12px; text-align: left;">Product</th>
        <th style="padding: 12px; text-align: center;">Qty</th>
        <th style="padding: 12px; text-align: right;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
    <tfoot>
      <tr style="background: #f9fafb; font-weight: 600;">
        <td colspan="2" style="padding: 12px;">Total</td>
        <td style="padding: 12px; text-align: right;">$${data.totalPrice.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 8px; font-weight: 600; color: #49474D;">Shipping address</p>
    <p style="margin: 0;">
      ${escapeHtml(data.shippingAddress.fullName)}<br/>
      ${escapeHtml(data.shippingAddress.address)}<br/>
      ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.postalCode)}<br/>
      ${escapeHtml(data.shippingAddress.country)}
      ${data.shippingAddress.phone ? `<br/>${escapeHtml(data.shippingAddress.phone)}` : ''}
    </p>
  </div>
  <p><strong>Estimated delivery:</strong> ${estimatedDelivery}</p>
  <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
    Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #EBBB69;">${SUPPORT_EMAIL}</a>
  </p>
  <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
    &copy; ${new Date().getFullYear()} MK Store. All rights reserved.
  </p>
</body>
</html>
  `.trim();

  const text = `
MK Store – Order Confirmation

Hi ${data.userName},

Order ID: ${data.orderId}
${data.trackingNumber ? `Tracking: ${data.trackingNumber}\n` : ''}Total: $${data.totalPrice.toFixed(2)}

Items:
${data.items.map((i) => `  ${i.name} x ${i.quantity} — $${(i.quantity * i.price).toFixed(2)}`).join('\n')}

Shipping address:
${data.shippingAddress.fullName}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.postalCode}
${data.shippingAddress.country}
${data.shippingAddress.phone ? data.shippingAddress.phone + '\n' : ''}

Estimated delivery: ${estimatedDelivery}

Support: ${SUPPORT_EMAIL}
  `.trim();

  await sendEmail({
    to: data.to,
    subject: 'Your Order is Confirmed - MK Store',
    html,
    text,
  });
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Send email verification link (signup). Token expires in 24 hours. Returns true if sent. */
export async function sendVerificationLinkEmail(data: {
  email: string;
  userName: string;
  verificationToken: string;
}): Promise<boolean> {
  const verifyUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(data.verificationToken)}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify your email - MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <div style="background: #EBBB69; padding: 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store</h1>
    <p style="margin: 8px 0 0; font-size: 14px; color: #49474D;">Verify your email</p>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p>Hi ${escapeHtml(data.userName)},</p>
    <p>Please verify your email to activate your account. This link expires in 24 hours.</p>
    <p style="margin: 24px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background: #EBBB69; color: #49474D; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify my email</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${escapeHtml(verifyUrl)}</p>
    <p style="color: #6b7280; font-size: 14px;">If you didn&apos;t create an account, you can ignore this email.</p>
    <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">&copy; ${new Date().getFullYear()} MK Store.</p>
  </div>
</body>
</html>
  `.trim();
  const text = `Verify your email - MK Store\n\nHi ${data.userName},\n\nClick to verify: ${verifyUrl}\n\nThis link expires in 24 hours.\n\n© ${new Date().getFullYear()} MK Store.`;
  return sendEmail({ to: data.email, subject: 'Verify your email - MK Store', html, text });
}

/** Send email verification with 6-digit code (signup). Uses shared OTP template, 10 min expiry. */
export async function sendVerificationEmail(data: {
  email: string;
  userName: string;
  verificationToken?: string;
  verificationCode: string;
}): Promise<boolean> {
  const verifyUrl = data.verificationToken
    ? `${APP_URL}/verify-email?token=${encodeURIComponent(data.verificationToken)}`
    : null;
  const extraHtml = verifyUrl
    ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Or <a href="${verifyUrl}" style="color:#EBBB69;font-weight:600;">click here</a> to verify with the link.</p>`
    : '';
  const html = getOtpEmailHtml({
    userName: data.userName,
    otpCode: data.verificationCode,
    title: 'Confirm your email',
    bodyMessage: 'Use the code below to complete your registration and activate your account.',
    expiryMinutes: OTP_EXPIRY_MINUTES,
    extraHtml,
  });
  const text = `Confirm your email - MK Store\n\nHi ${data.userName},\n\nYour verification code is: ${data.verificationCode}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n${verifyUrl ? `Or open this link: ${verifyUrl}\n\n` : ''}© ${new Date().getFullYear()} MK Store.`;
  return sendEmail({ to: data.email, subject: 'Your verification code - MK Store', html, text });
}

/** Non-blocking: trigger verification email send without awaiting. Use after saving OTP to DB. */
export function sendVerificationEmailNonBlocking(data: {
  email: string;
  userName: string;
  verificationToken?: string;
  verificationCode: string;
}): void {
  const verifyUrl = data.verificationToken
    ? `${APP_URL}/verify-email?token=${encodeURIComponent(data.verificationToken)}`
    : null;
  const extraHtml = verifyUrl
    ? `<p style="margin:0 0 16px;font-size:14px;color:#6b7280;">Or <a href="${verifyUrl}" style="color:#EBBB69;font-weight:600;">click here</a> to verify with the link.</p>`
    : '';
  const html = getOtpEmailHtml({
    userName: data.userName,
    otpCode: data.verificationCode,
    title: 'Confirm your email',
    bodyMessage: 'Use the code below to complete your registration and activate your account.',
    expiryMinutes: OTP_EXPIRY_MINUTES,
    extraHtml,
  });
  const text = `Confirm your email - MK Store\n\nHi ${data.userName},\n\nYour verification code is: ${data.verificationCode}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.\n\n${verifyUrl ? `Or open: ${verifyUrl}\n\n` : ''}© ${new Date().getFullYear()} MK Store.`;
  sendEmailNonBlocking({ to: data.email, subject: 'Your verification code - MK Store', html, text });
}

/** Professional password reset email – MK Store branding, #EBBB69, 1 hour expiry. */
export async function sendPasswordResetEmail(data: {
  email: string;
  resetToken: string;
  userName?: string;
}): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(data.resetToken)}`;
  const userName = data.userName?.trim() || 'there';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your password - MK Store</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f3f4f6;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:#EBBB69;padding:24px 28px;">
      <h1 style="margin:0;font-size:22px;color:#49474D;font-weight:700;">MK Store</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#49474D;opacity:0.95;">Reset your password</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <p style="margin:0 0 24px;">
        <a href="${resetUrl}" style="display:inline-block;background:#EBBB69;color:#49474D;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a>
      </p>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">If you didn&apos;t request this, you can ignore this email.</p>
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} MK Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  const text = `Reset your password - MK Store\n\nHi ${userName},\n\nReset link: ${resetUrl}\n\nThis link expires in 1 hour.\n\n© ${new Date().getFullYear()} MK Store.`;
  await sendEmail({ to: data.email, subject: 'Reset your password - MK Store', html, text });
}

/** Non-blocking: trigger password reset email without awaiting. */
export function sendPasswordResetEmailNonBlocking(data: {
  email: string;
  resetToken: string;
  userName?: string;
}): void {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(data.resetToken)}`;
  const userName = data.userName?.trim() || 'there';
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset your password - MK Store</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f3f4f6;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
    <div style="background:#EBBB69;padding:24px 28px;">
      <h1 style="margin:0;font-size:22px;color:#49474D;font-weight:700;">MK Store</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#49474D;opacity:0.95;">Reset your password</p>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">Hi ${escapeHtml(userName)},</p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">You requested a password reset. Click the button below. This link expires in <strong>1 hour</strong>.</p>
      <p style="margin:0 0 24px;">
        <a href="${resetUrl}" style="display:inline-block;background:#EBBB69;color:#49474D;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;">Reset password</a>
      </p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">&copy; ${new Date().getFullYear()} MK Store.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
  const text = `Reset your password - MK Store\n\nReset link: ${resetUrl}\n\nExpires in 1 hour.\n\n© ${new Date().getFullYear()} MK Store.`;
  sendEmailNonBlocking({ to: data.email, subject: 'Reset your password - MK Store', html, text });
}

/** Send contact form submission to admin. */
export async function sendContactToStore(data: ContactFormData): Promise<void> {
  const now = new Date();
  const dateTime = now.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Contact Message - MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <div style="border-bottom: 2px solid #EBBB69; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store – Contact</h1>
  </div>
  <h2 style="color: #49474D; font-size: 18px;">New contact message</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D; width: 100px;">Name</td><td style="padding: 8px 0;">${escapeHtml(data.name)}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Subject</td><td style="padding: 8px 0;">${escapeHtml(data.subject)}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Date &amp; Time</td><td style="padding: 8px 0;">${escapeHtml(dateTime)}</td></tr>
  </table>
  <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #EBBB69;">
    <p style="margin: 0 0 8px; font-weight: 600; color: #49474D;">Message</p>
    <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
  </div>
</body>
</html>
  `.trim();

  const text = `New Contact Message - MK Store\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\nDate & Time: ${dateTime}\n\nMessage:\n${data.message}`;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: 'New Contact Message - MK Store',
    html,
    text,
    replyTo: data.email,
  });
}

/** Send auto-reply to the user who submitted the contact form. */
export async function sendContactAutoReply(data: ContactFormData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Thank you for contacting MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #374151; line-height: 1.6;">
  <div style="background: #EBBB69; padding: 24px 24px 20px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D; font-weight: 700;">MK Store</h1>
    <p style="margin: 8px 0 0; font-size: 14px; color: #49474D; opacity: 0.9;">We received your message</p>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #49474D; font-size: 20px; margin: 0 0 16px;">Thank you for contacting MK Store</h2>
    <p>Hi ${escapeHtml(data.name)},</p>
    <p>We have received your message and our team will get back to you as soon as possible.</p>
    <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #EBBB69; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: 600; color: #49474D; font-size: 13px;">Your message:</p>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px;">${escapeHtml(data.message)}</p>
    </div>
    <p>If your matter is urgent, you can reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #EBBB69; font-weight: 600;">${SUPPORT_EMAIL}</a>.</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">&copy; ${new Date().getFullYear()} MK Store. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();

  const text = `Thank you for contacting MK Store\n\nHi ${data.name},\n\nWe have received your message and will respond soon.\n\nYour message:\n${data.message}\n\nSupport: ${SUPPORT_EMAIL}`;

  await sendEmail({
    to: data.email,
    subject: 'Thank you for contacting MK Store 💛',
    html,
    text,
  });
}

// ---------- Welcome & Admin Alerts ----------

/** Welcome email sent to user after signup. */
export async function sendWelcomeEmail(to: string, userName: string): Promise<void> {
  const storeUrl = APP_URL;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Welcome to MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px;">
    <tr><td style="border-bottom: 2px solid #EBBB69; padding-bottom: 16px; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store</h1>
    </td></tr>
    <tr><td style="padding: 24px 0;">
      <h2 style="color: #49474D; font-size: 20px;">Welcome to MK Store 🎉</h2>
      <p>Hi ${escapeHtml(userName)},</p>
      <p>Thank you for registering. We&apos;re glad to have you!</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Name</td><td style="padding: 8px 0;">${escapeHtml(userName)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Email</td><td style="padding: 8px 0;">${escapeHtml(to)}</td></tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${storeUrl}" style="display: inline-block; background: #EBBB69; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Visit MK Store</a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #EBBB69;">${SUPPORT_EMAIL}</a></p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">&copy; ${new Date().getFullYear()} MK Store. All rights reserved.</p>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
  const text = `Welcome to MK Store 🎉\n\nHi ${userName},\n\nThank you for registering. Visit us at ${storeUrl}\n\nSupport: ${SUPPORT_EMAIL}`;
  await sendEmail({ to, subject: 'Welcome to MK Store 🎉', html, text });
}

/** Notify admin when a new user registers. */
export async function sendAdminNewUserAlert(data: {
  name: string;
  email: string;
  registeredAt: Date;
}): Promise<void> {
  const registeredAt = data.registeredAt.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
  const dashboardUrl = `${APP_URL}/admin/users`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New User Registered - MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <div style="border-bottom: 2px solid #EBBB69; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store – Admin</h1>
  </div>
  <h2 style="color: #49474D; font-size: 18px;">New User Registered</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D; width: 140px;">Name</td><td style="padding: 8px 0;">${escapeHtml(data.name)}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Registration</td><td style="padding: 8px 0;">${escapeHtml(registeredAt)}</td></tr>
  </table>
  <p style="margin: 20px 0;">
    <a href="${dashboardUrl}" style="display: inline-block; background: #EBBB69; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Admin Dashboard</a>
  </p>
  <p style="color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} MK Store.</p>
</body>
</html>
  `.trim();
  const text = `New User Registered - MK Store\n\nName: ${data.name}\nEmail: ${data.email}\nRegistered: ${registeredAt}\nDashboard: ${dashboardUrl}`;
  await sendEmail({ to: ADMIN_EMAIL, subject: 'New User Registered - MK Store', html, text });
}

export interface AdminNewOrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalPrice: number;
  paymentMethod: string;
  orderTime: Date;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

/** Notify admin when a new order is placed. */
export async function sendAdminNewOrderAlert(data: AdminNewOrderData): Promise<void> {
  const orderTime = data.orderTime.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
  const dashboardUrl = `${APP_URL}/admin/orders`;
  const itemsRows = data.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(i.name)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(i.quantity * i.price).toFixed(2)}</td>
        </tr>`
    )
    .join('');
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Order Received - MK Store</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #374151; line-height: 1.6;">
  <div style="border-bottom: 2px solid #EBBB69; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 24px; color: #49474D;">MK Store – Admin</h1>
  </div>
  <h2 style="color: #49474D; font-size: 18px;">New Order Received</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D; width: 120px;">Order ID</td><td style="padding: 8px 0;">#${data.orderId.slice(-8).toUpperCase()}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Customer</td><td style="padding: 8px 0;">${escapeHtml(data.customerName)}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.customerEmail)}">${escapeHtml(data.customerEmail)}</a></td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Payment</td><td style="padding: 8px 0;">${escapeHtml(data.paymentMethod)}</td></tr>
    <tr><td style="padding: 8px 0; font-weight: 600; color: #49474D;">Time</td><td style="padding: 8px 0;">${escapeHtml(orderTime)}</td></tr>
  </table>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; border: 1px solid #e5e7eb;">
    <thead>
      <tr style="background: #49474D; color: #fff;">
        <th style="padding: 12px; text-align: left;">Product</th>
        <th style="padding: 12px; text-align: center;">Qty</th>
        <th style="padding: 12px; text-align: right;">Price</th>
      </tr>
    </thead>
    <tbody>${itemsRows}</tbody>
    <tfoot>
      <tr style="background: #f9fafb; font-weight: 600;">
        <td colspan="2" style="padding: 12px;">Total</td>
        <td style="padding: 12px; text-align: right;">$${data.totalPrice.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #EBBB69;">
    <p style="margin: 0 0 8px; font-weight: 600; color: #49474D;">Shipping address</p>
    <p style="margin: 0;">
      ${escapeHtml(data.shippingAddress.fullName)}<br/>
      ${escapeHtml(data.shippingAddress.address)}<br/>
      ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.postalCode)}<br/>
      ${escapeHtml(data.shippingAddress.country)}
      ${data.shippingAddress.phone ? `<br/>${escapeHtml(data.shippingAddress.phone)}` : ''}
    </p>
  </div>
  <p style="margin: 20px 0;">
    <a href="${dashboardUrl}" style="display: inline-block; background: #EBBB69; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: 600;">View Orders</a>
  </p>
  <p style="color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} MK Store.</p>
</body>
</html>
  `.trim();
  const text = `New Order Received - MK Store\n\nOrder: #${data.orderId.slice(-8).toUpperCase()}\nCustomer: ${data.customerName} (${data.customerEmail})\nPayment: ${data.paymentMethod}\nTime: ${orderTime}\nTotal: $${data.totalPrice.toFixed(2)}\n\nDashboard: ${dashboardUrl}`;
  await sendEmail({ to: ADMIN_EMAIL, subject: 'New Order Received - MK Store', html, text });
}
