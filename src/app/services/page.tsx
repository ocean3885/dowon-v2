import React from 'react';
import BookingSection from '@/components/BookingSection';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesPhilosophy from '@/components/services/ServicesPhilosophy';
import ServicesProcess from '@/components/services/ServicesProcess';
import ServicesPricing from '@/components/services/ServicesPricing';
import ServicesSteps from '@/components/services/ServicesSteps';

export default function ServicesPage() {
    return (
        <main className="relative pt-24 min-h-screen bg-stone-50">
            <ServicesHero />
            <ServicesPhilosophy />
            <ServicesProcess />
            <ServicesPricing />
            <ServicesSteps />
            <BookingSection />
        </main>
    );
}
