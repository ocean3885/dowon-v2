import React from 'react';
import BookingSection from '@/components/BookingSection';
import AboutHero from '@/components/about/AboutHero';
import AboutIntroduction from '@/components/about/AboutIntroduction';
import AboutPhilosophy from '@/components/about/AboutPhilosophy';
import AboutPromise from '@/components/about/AboutPromise';

export default function AboutPage() {
    return (
        <main className="relative pt-24 min-h-screen bg-stone-50">
            <AboutHero />
            <AboutIntroduction />
            <AboutPhilosophy />
            <AboutPromise />
            <BookingSection />
        </main>
    );
}
