import Hero from '@/components/Hero';
import Director from '@/components/Director';
import Services from '@/components/Services';
import CertificateSection from '@/components/CertificateSection';
import ConsultationForm from '@/components/ConsultationForm';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Director />
      <Services />
      <CertificateSection />
      <ConsultationForm />

      <footer className="bg-stone-950 text-stone-500 py-8 text-center text-sm border-t border-stone-900">
        <div className="container mx-auto px-4">
          <p className="mb-2">도원작명철학원 | 대표: 김종찬</p>
          <p>예약 문의: 010-XXXX-XXXX | 사업자등록번호: XXX-XX-XXXXX</p>
          <p className="mt-4 opacity-50">&copy; {new Date().getFullYear()} Dowon Naming Philosophy Center. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
