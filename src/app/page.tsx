import Director1 from '@/components/Director1';
import Services from '@/components/Services';
import NamingPhilosophy from '@/components/NamingPhilosophy';
import ServicesPhilosophy from '@/components/services/ServicesPhilosophy';
import ServicesProcess from '@/components/services/ServicesProcess';
import NamingBenefits from '@/components/NamingBenefits';
import CertificateSection from '@/components/CertificateSection';
import ConsultationForm from '@/components/ConsultationForm';
import BlogSection from '@/components/BlogSection';
import RecentPostsSection from '@/components/RecentPostsSection';
import PhoneConsultation from '@/components/PhoneConsultation';
import BookingSection from '@/components/BookingSection';
import HeroSection from '@/components/home/HeroSection';
import CounselingPhilosophySection from '@/components/home/CounselingPhilosophySection';
import CounselingCategorySection from '@/components/home/CounselingCategorySection';
import PhilosophySection from '@/components/home/PhilosophySection';
import NamingSection from '@/components/home/NamingSection';
import ReviewSection from '@/components/home/ReviewSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CounselingPhilosophySection />
      <CounselingCategorySection />
      <PhilosophySection />
      <NamingSection />
      <ReviewSection />
      {/* <Director1 /> */}
      {/* <Services /> */}
      <NamingPhilosophy />
      <ServicesPhilosophy />
      <ServicesProcess />
      <PhoneConsultation />
      <NamingBenefits />
      <CertificateSection />
      {/* <BlogSection /> */}
      {/* <RecentPostsSection /> */}
      {/* <ReviewSection /> */}
      <BookingSection />
      {/* <ConsultationForm /> */}
    </main>
  );
}
