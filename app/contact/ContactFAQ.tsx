'use client';

import { useState } from 'react';

const ITEMS: { question: string; answer: string }[] = [
  {
    question: 'How long does shipping take?',
    answer:
      'Standard delivery takes 3–7 business days. Express options are available at checkout for faster delivery. You’ll receive tracking information once your order ships.',
  },
  {
    question: 'Can I return a product?',
    answer:
      'Yes. We offer a 30-day return policy for most items in unused condition with original packaging. Start a return from your account or contact us and we’ll guide you through the process.',
  },
  {
    question: 'How do I track my order?',
    answer:
      'After your order ships, we’ll send you an email with a tracking link. You can also view order status and tracking in your account under Order History.',
  },
];

export function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-bold text-darkBase">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 space-y-2">
        {ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow duration-300"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primaryAccent focus:ring-inset rounded-2xl"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                <span className="font-semibold text-darkBase">{item.question}</span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white transition duration-300 ${
                    isOpen ? 'bg-primaryAccent rotate-180' : 'bg-darkBase/20 text-darkBase'
                  }`}
                  aria-hidden
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-darkBase/10 px-5 py-4 text-sm leading-relaxed text-darkBase/90">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
