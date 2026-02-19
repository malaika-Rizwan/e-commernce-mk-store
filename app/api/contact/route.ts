import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { successResponse, errorResponse } from '@/lib/api-response';
import { getClientIdentifier, rateLimit } from '@/lib/rate-limit';
import { sendContactToStore, sendContactAutoReply } from '@/lib/nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_SUBJECT = 300;
const MAX_MESSAGE = 10000;

/** Remove script-like content; keep plain text for storage. Escape when displaying in UI. */
function sanitizeMessage(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .trim()
    .slice(0, MAX_MESSAGE);
}

function sanitizeText(value: string, maxLen: number): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const limit = rateLimit(identifier, 'contact', { windowMs: 60 * 1000, max: 5 });
    if (!limit.success) {
      return errorResponse('Too many requests. Please try again later.', 429);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid request body', 400);
    }

    // Honeypot: if filled, treat as spam (silent success to not leak)
    const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
    if (honeypot) {
      return successResponse({ message: 'Message sent successfully' });
    }

    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const rawSubject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const rawMessage = typeof body.message === 'string' ? body.message : '';

    if (!rawName) return errorResponse('Full name is required', 400);
    if (!rawEmail) return errorResponse('Email is required', 400);
    if (!EMAIL_REGEX.test(rawEmail)) return errorResponse('Invalid email address', 400);
    if (!rawMessage) return errorResponse('Message is required', 400);

    const name = sanitizeText(rawName, MAX_NAME);
    const email = sanitizeText(rawEmail, MAX_EMAIL);
    const subject = sanitizeText(rawSubject, MAX_SUBJECT);
    const message = sanitizeMessage(rawMessage);

    if (!name) return errorResponse('Full name is required', 400);
    if (!email) return errorResponse('Email is required', 400);
    if (!message) return errorResponse('Message is required', 400);

    await connectDB();

    const contact = await Contact.create({
      name,
      email,
      subject: subject || undefined,
      message,
      status: 'new',
    });

    const data = { name, email, subject: subject || '(No subject)', message };
    await sendContactAutoReply(data).catch((err) => {
      console.error('[Contact] Auto-reply failed:', err);
    });
    await sendContactToStore(data).catch((err) => {
      console.error('[Contact] Admin notification failed:', err);
    });

    return successResponse({
      message: 'Message sent successfully',
      id: contact._id.toString(),
    });
  } catch (err) {
    console.error('Contact API error:', err);
    return errorResponse('Failed to send message. Please try again.', 500);
  }
}
