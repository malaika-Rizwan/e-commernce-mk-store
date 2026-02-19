import { ScrollReveal } from '@/components/ui/ScrollReveal';

const ITEMS = [
  {
    title: 'Fast Shipping',
    description: 'We ship quickly and track every order so your items arrive on time.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: 'Secure Payment',
    description: 'Your payment and data are protected with industry-standard encryption.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
  },
  {
    title: 'Premium Quality',
    description: 'Every product is selected for durability, design, and value.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    ),
  },
  {
    title: '24/7 Support',
    description: 'Our team is here to help with orders, returns, and any questions.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="w-full py-20 sm:py-24" style={{ backgroundColor: '#BEB9B4' }} aria-labelledby="why-heading">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal className="text-center">
          <h2 id="why-heading" className="text-3xl font-bold tracking-tight text-[#49474D] sm:text-4xl">
            Why Choose Us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#49474D]/80">We put quality and your experience first.</p>
          <div
            className="mx-auto mt-6 h-1 w-16 rounded-full"
            style={{ backgroundColor: '#EBBB69' }}
            aria-hidden
          />
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ITEMS.map(({ title, description, icon }, i) => (
              <div
                key={title}
                className="rounded-2xl bg-white/80 p-8 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: '#EBBB69' }}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#49474D]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#49474D]/80">{description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
