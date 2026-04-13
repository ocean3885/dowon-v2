import React from 'react';
import BookingSection from '@/components/BookingSection';
import ProcessHero from '@/components/process/ProcessHero';
import ProcessWhyUs from '@/components/process/ProcessWhyUs';
import ProcessMajorServices from '@/components/process/ProcessMajorServices';
import ProcessSteps from '@/components/process/ProcessSteps';
import ProcessInquiry from '@/components/process/ProcessInquiry';

export default function ProcessPage() {
    return (
        <main className="relative pt-24 min-h-screen bg-stone-50">
            <ProcessHero />
            <ProcessWhyUs />
            <ProcessMajorServices />
            <ProcessSteps />
            <ProcessInquiry />
            <BookingSection />
        </main>
    );
}
