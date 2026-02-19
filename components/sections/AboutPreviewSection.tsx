import Image from 'next/image';
import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export function AboutPreviewSection() {
  return (
    <section className="w-full py-20 sm:py-24" style={{ backgroundColor: '#E6E2DE' }} aria-labelledby="about-preview-heading">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                alt="Our store and team"
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <h2 id="about-preview-heading" className="text-3xl font-bold tracking-tight text-[#49474D] sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-6 leading-relaxed text-[#49474D]/90">
                We started with a simple vision: to offer products that combine quality and design without compromise.
                Our customer-first philosophy drives every decision—from curating our catalog to ensuring fast, reliable delivery.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center rounded-xl px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: '#EBBB69' }}
              >
                Read More
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
