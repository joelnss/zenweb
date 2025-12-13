import HeroSection from '@/components/home/HeroSection';
import ProductCards from '@/components/home/ProductCards';
import ServicesDetail from '@/components/home/ServicesDetail';
import ClientPortalPreview from '@/components/home/ClientPortalPreview';
import WhyChooseUs from '@/components/home/WhyChooseUs';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProductCards />
      <ServicesDetail />
      <ClientPortalPreview />
      <WhyChooseUs />
    </>
  );
}
