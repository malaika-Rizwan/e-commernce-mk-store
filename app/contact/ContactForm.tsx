'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX_LENGTH = 2000;

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successVisible, setSuccessVisible] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-hide success after 5 seconds
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccessVisible(false), 5000);
    return () => clearTimeout(t);
  }, [success]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) next.name = 'Full name is required';
    if (!trimmedEmail) next.email = 'Email is required';
    else if (!EMAIL_REGEX.test(trimmedEmail)) next.email = 'Please enter a valid email address';
    if (!trimmedSubject) next.subject = 'Subject is required';
    if (!trimmedMessage) next.message = 'Message is required';
    else if (trimmedMessage.length > MESSAGE_MAX_LENGTH) next.message = `Message must be under ${MESSAGE_MAX_LENGTH} characters`;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    if (honeypot) return; // Spam
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          website: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setHoneypot('');
      } else {
        const msg =
          data.error ??
          (res.status === 429 ? 'Too many requests. Please try again later.' : 'Something went wrong. Please try again.');
        setFormError(msg);
      }
    } catch {
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const messageLength = message.trim().length;

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-xl p-8 shadow-lg sm:p-10"
        style={{ backgroundColor: '#E6E2DE' }}
      >
        <AnimatePresence>
          {successVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-green-800 shadow-sm"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: '#16a34a' }}
                  aria-hidden
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Message sent</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!successVisible && (
          <p className="mt-4 text-sm text-darkBase/70">
            Want to send another message?{' '}
            <button
              type="button"
              onClick={() => { setSuccess(false); setSuccessVisible(true); }}
              className="font-medium transition hover:underline"
              style={{ color: '#EBBB69' }}
            >
              Send again
            </button>
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="rounded-xl p-8 shadow-lg sm:p-10"
      style={{ backgroundColor: '#E6E2DE' }}
    >
      {/* Honeypot - must be hidden from users */}
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {formError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
            role="alert"
          >
            {formError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-darkBase">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => errors.name && validate()}
            placeholder="John Doe"
            disabled={loading}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-darkBase placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/40 disabled:opacity-70 ${
              errors.name ? 'border-red-400' : 'border-gray-300 focus:border-[#EBBB69]'
            }`}
            aria-required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name && (
            <p id="contact-name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-darkBase">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => errors.email && validate()}
            placeholder="you@example.com"
            disabled={loading}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-darkBase placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/40 disabled:opacity-70 ${
              errors.email ? 'border-red-400' : 'border-gray-300 focus:border-[#EBBB69]'
            }`}
            aria-required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email && (
            <p id="contact-email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-darkBase">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => errors.subject && validate()}
            placeholder="How can we help?"
            disabled={loading}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-darkBase placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/40 disabled:opacity-70 ${
              errors.subject ? 'border-red-400' : 'border-gray-300 focus:border-[#EBBB69]'
            }`}
            aria-required
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
          />
          {errors.subject && (
            <p id="contact-subject-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="contact-message" className="block text-sm font-medium text-darkBase">
              Message <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs tabular-nums ${
                messageLength > MESSAGE_MAX_LENGTH ? 'text-red-600' : 'text-darkBase/60'
              }`}
            >
              {messageLength} / {MESSAGE_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => errors.message && validate()}
            placeholder="Tell us what's on your mind..."
            rows={5}
            disabled={loading}
            maxLength={MESSAGE_MAX_LENGTH + 100}
            className={`w-full resize-y rounded-lg border bg-white px-4 py-3 text-darkBase placeholder:text-gray-400 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#EBBB69]/40 disabled:opacity-70 ${
              errors.message ? 'border-red-400' : 'border-gray-300 focus:border-[#EBBB69]'
            }`}
            aria-required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
          />
          {errors.message && (
            <p id="contact-message-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { y: -2 } : undefined}
          whileTap={!loading ? { y: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className="w-full rounded-lg py-3.5 font-semibold text-white shadow-md transition duration-200 hover:brightness-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[180px]"
          style={{ backgroundColor: '#EBBB69' }}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            'Send Message'
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
