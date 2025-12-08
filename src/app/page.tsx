import Hero from '@/components/Hero';
import Director from '@/components/Director';
import Services from '@/components/Services';
import CertificateSection from '@/components/CertificateSection';
import ConsultationForm from '@/components/ConsultationForm';
import BlogSection from '@/components/BlogSection';
import BookingSection from '@/components/BookingSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Director />
      <Services />
      <CertificateSection />
      <BlogSection />
      <BookingSection />
      <ConsultationForm />

    </main>
  );
}
