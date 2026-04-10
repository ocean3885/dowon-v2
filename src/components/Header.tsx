'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: '홈', href: '/' },
    { name: '원장소개', href: '/about' },
    { name: '작명/개명', href: '/services' },
    { name: '상담안내', href: '/process' },
    { name: '게시판', href: '/board' },
    { name: '오시는길', href: '/contact' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = pathname === '/';
    // Dark header on non-home pages or when scrolled
    const isDark = isScrolled || !isHome;

    return (
        <>
            <motion.header
                className={clsx(
                    "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
                    isDark ? "bg-stone-950/90 backdrop-blur-md shadow-lg border-b border-stone-800" : "bg-transparent"
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-full px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="z-50 group">
                        <Image
                            src="/dowon_logo.png"
                            alt="도원작명철학원"
                            width={220}
                            height={64}
                            className="h-10 md:h-12 lg:h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
                            priority
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden nav820:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "text-sm font-medium tracking-widest hover:text-amber-500 transition-colors font-serif",
                                    pathname === item.href ? "text-amber-500" : "text-stone-300"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="nav820:hidden z-50 text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ duration: 0.3, type: "tween" }}
                        className="fixed inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center space-y-8 min-[820px]:hidden"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "text-2xl font-serif font-bold tracking-widest",
                                    pathname === item.href ? "text-amber-500" : "text-stone-300"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
