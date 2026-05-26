import RecentPostsSection from '@/components/home/RecentPostsSection';
import BookingSection from '@/components/common/BookingSection';
import HeroSection from '@/components/home/HeroSection';
import CounselingPhilosophySection from '@/components/home/CounselingPhilosophySection';
import CounselingCategorySection from '@/components/home/CounselingCategorySection';
import BaziServiceSection from '@/components/home/BaziServiceSection';
import PhilosophySection from '@/components/home/PhilosophySection';
import NamingSection from '@/components/home/NamingSection';
import ReviewSection from '@/components/home/ReviewSection';
import NamingInfoSection from '@/components/home/NamingInfoSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <CounselingPhilosophySection />
      <CounselingCategorySection />
      <BaziServiceSection />
      <PhilosophySection />
      <NamingSection />
      <NamingInfoSection />
      <ReviewSection />
      <RecentPostsSection />
      <BookingSection />
    </main>
  );
}
