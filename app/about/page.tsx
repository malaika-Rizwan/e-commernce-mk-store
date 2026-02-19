import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'About Our Store',
  description:
    'Learn about our premium e-commerce store. We deliver quality products with a customer-first philosophy, trusted service, and a modern shopping experience.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-pageBg">
      {/* Section 1 — Hero Intro */}
      <section
        className="container mx-auto max-w-4xl px-4 py-20 text-center animate-fade-in"
        aria-labelledby="about-heading"
      >
        <h1
          id="about-heading"
          className="text-4xl font-bold tracking-tight text-darkBase sm:text-5xl"
        >
          About Our Store
        </h1>
        <p className="mt-6 text-lg text-darkBase/80 sm:text-xl">
          We deliver premium products designed to elevate your everyday life.
        </p>
        <div
          className="mx-auto mt-8 h-1 w-16 rounded-full"
          style={{ backgroundColor: '#EBBB69' }}
          aria-hidden
        />
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-darkBase/90">
          We believe in <strong>quality</strong> in every product, <strong>trust</strong> in every
          transaction, and <strong>customer satisfaction</strong> at the heart of what we do. Our
          mission is to support your <strong>modern lifestyle</strong> with thoughtfully curated
          items and a seamless shopping experience.
        </p>
        {/* Optional: minimal illustration placeholder (desktop) */}
        <div className="mt-16 hidden lg:block">
          <div className="mx-auto flex max-w-sm justify-center">
            <div
              className="aspect-square w-full max-w-[280px] rounded-2xl bg-cardBg shadow-soft"
              aria-hidden
            >
              <div className="flex h-full items-center justify-center text-darkBase/30">
                <svg
                  className="h-24 w-24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Our Story */}
      <section
        className="container mx-auto max-w-6xl px-4 py-20 animate-fade-in"
        aria-labelledby="our-story-heading"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cardBg shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
              alt="Our store and team at work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div>
            <h2
              id="our-story-heading"
              className="text-3xl font-bold text-darkBase"
            >
              Our Story
            </h2>
            <div className="mt-6 space-y-4 text-darkBase/90 leading-relaxed">
              <p>
                We started with a simple vision: to offer products that combine quality and
                design without compromise. What began as a small idea grew into a brand built on
                listening to our customers and evolving with their needs.
              </p>
              <p>
                Our <strong>customer-first philosophy</strong> drives every decision—from
                curating our catalog to ensuring fast, reliable delivery and secure payments.
                We are committed to your trust and satisfaction at every step.
              </p>
              <p>
                Today we continue to grow while staying true to our roots: delivering a modern
                shopping experience that puts you first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Why Choose Us */}
      <section
        className="container mx-auto max-w-6xl px-4 py-20"
        aria-labelledby="why-choose-heading"
      >
        <div className="rounded-3xl bg-cardBg p-8 shadow-soft sm:p-12">
          <h2
            id="why-choose-heading"
            className="text-center text-3xl font-bold text-darkBase"
          >
            Why Choose Us
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              }
              title="Premium Quality"
              description="Every product is selected for durability, design, and value so you shop with confidence."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              }
              title="Fast & Reliable Shipping"
              description="We ship quickly and track every order so your items arrive on time and in perfect condition."
            />
            <FeatureCard
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              }
              title="Secure Payments"
              description="Your payment and data are protected with industry-standard encryption and secure checkout."
            />
          </div>
        </div>
      </section>

      {/* Section 4 — Our Values */}
      <section
        className="container mx-auto max-w-6xl px-4 py-20"
        aria-labelledby="values-heading"
      >
        <h2
          id="values-heading"
          className="text-center text-3xl font-bold text-darkBase"
        >
          Our Values
        </h2>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <ValueItem
            title="Integrity"
            description="We act honestly in every interaction and stand behind our products and promises."
          />
          <ValueItem
            title="Innovation"
            description="We continuously improve our range and experience to meet your evolving needs."
          />
          <ValueItem
            title="Customer First"
            description="Your satisfaction and trust guide our decisions and priorities every day."
          />
          <ValueItem
            title="Excellence"
            description="We aim for the highest standards in quality, service, and delivery."
          />
        </div>
      </section>

      {/* Section 5 — Meet Our Team */}
      <section
        className="container mx-auto max-w-6xl px-4 py-20"
        aria-labelledby="team-heading"
      >
        <h2
          id="team-heading"
          className="text-center text-3xl font-bold text-darkBase"
        >
          Meet Our Team
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <TeamCard
            name="Alex Morgan"
            role="Founder & CEO"
            bio="Passionate about building a brand that puts customers and quality first."
            imageSrc="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
          />
          <TeamCard
            name="Jordan Lee"
            role="Head of Operations"
            bio="Ensures every order is fulfilled with care and delivered on time."
            imageSrc="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
          />
          <TeamCard
            name="Sam Taylor"
            role="Customer Experience"
            bio="Dedicated to making your shopping experience smooth and enjoyable."
            imageSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80"
          />
        </div>
      </section>

      {/* Section 6 — CTA */}
      <section
        className="w-full bg-darkBase py-20"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <h2
            id="cta-heading"
            className="text-2xl font-bold text-white sm:text-3xl"
          >
            Ready to Explore Our Products?
          </h2>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-xl bg-[#EBBB69] px-8 py-3.5 font-semibold text-white shadow-soft transition hover:bg-[#e0ae55]"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl bg-white p-6 shadow-soft transition duration-300 hover:scale-[1.02] hover:shadow-card-hover">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: '#EBBB69' }}
        aria-hidden
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-bold text-darkBase">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-darkBase/80">{description}</p>
    </div>
  );
}

function ValueItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center sm:text-left">
      <h3 className="text-lg font-bold text-darkBase">
        <span className="border-b-2 border-primaryAccent pb-1">{title}</span>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-darkBase/80">{description}</p>
    </div>
  );
}

function TeamCard({
  name,
  role,
  bio,
  imageSrc,
}: {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-soft transition duration-300 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cardBg">
        <Image
          src={imageSrc}
          alt={`${name}, ${role}`}
          fill
          className="object-cover transition duration-300 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-darkBase">{name}</h3>
        <p className="mt-0.5 text-sm font-medium text-primaryAccent">{role}</p>
        <p className="mt-3 text-sm leading-relaxed text-darkBase/80">{bio}</p>
      </div>
    </article>
  );
}
