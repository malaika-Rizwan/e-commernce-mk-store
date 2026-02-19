import { ContactForm } from './ContactForm';
import { ContactFAQ } from './ContactFAQ';

export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with our team. We\'re here to help with orders, returns, and any questions. Reach us by form, email, or phone.',
};

const STORE_ADDRESS = 'Block 5, Clifton, Karachi, Pakistan';
const STORE_PHONE = '+92 21 35890123';
const STORE_EMAIL = 'support@mkstore.com';
const GOOGLE_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.383269514!2d67.0285!3d24.8165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06651d4bbf%3A0x9a92b64a3af9c3e!2sClifton%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1635000000000!5m2!1sen!2s';

function ContactInfoCard() {
  const items = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
      ),
      label: 'Address',
      value: STORE_ADDRESS,
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      label: 'Email',
      value: STORE_EMAIL,
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      ),
      label: 'Phone',
      value: STORE_PHONE,
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      label: 'Working Hours',
      value: 'Mon - Sat, 9AM - 6PM',
    },
  ];

  return (
    <div className="rounded-2xl bg-cardBg p-6 shadow-soft sm:p-8">
      <h2 className="text-xl font-bold text-darkBase">Store Information</h2>
      <div className="mt-6 space-y-0">
        {items.map((item, i) => (
          <div key={i}>
            {i > 0 && <hr className="border-darkBase/10 my-5" />}
            <div className="flex gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: '#EBBB69' }}
                aria-hidden
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-darkBase/60">
                  {item.label}
                </p>
                <p className="mt-0.5 text-darkBase">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-darkBase/80">Find us on the map</p>
        <div className="overflow-hidden rounded-xl border border-darkBase/10">
          <iframe
            src={GOOGLE_MAP_EMBED_URL}
            width="100%"
            height="280"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MK Store location - Karachi, Pakistan"
            className="min-h-[240px] w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-pageBg w-full">
      {/* Section 1 — Hero Header (full width, internal padding) */}
      <header
        className="w-full pt-20 pb-12 text-center animate-fade-in px-4 sm:px-6"
        aria-labelledby="contact-heading"
      >
        <h1
          id="contact-heading"
          className="text-4xl font-bold tracking-tight text-darkBase sm:text-5xl"
        >
          Get In Touch
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-darkBase/80">
          We&apos;d love to hear from you. Our team is always here to help.
        </p>
        <div
          className="mx-auto mt-8 h-1 w-16 rounded-full"
          style={{ backgroundColor: '#EBBB69' }}
          aria-hidden
        />
      </header>

      {/* Section 2 — Contact Grid (full width, internal padding) */}
      <section
        className="w-full py-12 px-4 sm:px-6"
        aria-label="Contact options"
      >
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10 max-w-[1200px] mx-auto">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
          <div className="lg:col-span-2">
            <ContactInfoCard />
          </div>
        </div>
      </section>

      {/* FAQ (full width, internal padding) */}
      <section className="w-full py-12 pb-20 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <ContactFAQ />
        </div>
      </section>
    </div>
  );
}
