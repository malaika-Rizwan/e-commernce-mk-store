import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProductsLanding } from '@/components/sections/FeaturedProductsLanding';
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection';
import { AboutPreviewSection } from '@/components/sections/AboutPreviewSection';
import { ReviewsSection } from '@/components/sections/ReviewsSection';
import { ContactSection } from '@/components/sections/ContactSection';

export const metadata = {
  title: 'MK Store – Premium E‑commerce',
  description:
    'Shop quality products. Browse catalog, learn about us, read reviews, and get in touch.',
};

export default function HomePage() {
  return (
    <>
      <ScrollProgressBar />
      <HeroSection />
      <SectionDivider />
      <FeaturedProductsLanding />
      <SectionDivider />
      <WhyChooseUsSection />
      <SectionDivider />
      <AboutPreviewSection />
      <SectionDivider />
      <ReviewsSection />
      <SectionDivider />
      <ContactSection />
    </>
  );
}
