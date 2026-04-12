import Hero from '@/components/Hero';
import Director1 from '@/components/Director1';
import Services from '@/components/Services';
import NamingPhilosophy from '@/components/NamingPhilosophy';
import NamingBenefits from '@/components/NamingBenefits';
import CertificateSection from '@/components/CertificateSection';
import ConsultationForm from '@/components/ConsultationForm';
import BlogSection from '@/components/BlogSection';
import RecentPostsSection from '@/components/RecentPostsSection';
import ReviewSection from '@/components/ReviewSection';
import BookingSection from '@/components/BookingSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Director1 />
      <Services />
      <NamingPhilosophy />
      <NamingBenefits />
      <CertificateSection />
      <BlogSection />
      <RecentPostsSection />
      <ReviewSection />
      <BookingSection />
      <ConsultationForm />

    </main>
  );
}
