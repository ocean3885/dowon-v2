'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

import { User } from '@supabase/supabase-js';

const navItems = [
    { name: '철학원소개', href: '/about' },
    { name: '상담안내', href: '/services' },
    { name: '상담신청', href: '/submit' },
    { name: '인명용한자', href: '/hanja' },
    { name: '만세력', href: '/calendar' },
    { name: '게시판', href: '/board' },
];

export default function Header({ initialUser }: { initialUser: User | null }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(initialUser);
    const pathname = usePathname();
    const router = useRouter();
    // Use useState to ensure the supabase client is only created once
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                router.refresh();
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    // Sync state when initialUser prop changes during navigation
    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

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
                <div className="w-full px-6 lg:px-12 xl:px-20 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="z-50 group"
                        onClick={(e) => {
                            if (pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    >
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
                                    "text-sm font-medium tracking-widest hover:text-amber-500 transition-colors font-sans whitespace-nowrap",
                                    pathname === item.href ? "text-amber-500" : "text-stone-300"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="ml-4 px-4 py-2 border border-stone-700 rounded-full text-xs font-medium text-stone-400 hover:bg-stone-800 transition-all duration-300 tracking-widest flex items-center gap-2"
                            >
                                LOGOUT <LogOut size={12} />
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-4 px-4 py-2 border border-amber-500/30 rounded-full text-xs font-medium text-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-all duration-300 tracking-widest whitespace-nowrap"
                            >
                                LOGIN
                            </Link>
                        )}
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
                        className="fixed inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center space-y-8 nav820:hidden"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={clsx(
                                    "text-2xl font-sans font-bold tracking-widest",
                                    pathname === item.href ? "text-amber-500" : "text-stone-300"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {user ? (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mt-4 px-8 py-3 border border-stone-700 text-stone-300 rounded-full text-lg font-bold tracking-widest hover:bg-stone-900 transition-colors flex items-center gap-2"
                            >
                                LOGOUT <LogOut size={18} />
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-4 px-8 py-3 bg-amber-600 text-stone-950 rounded-full text-lg font-bold tracking-widest hover:bg-amber-500 transition-colors"
                            >
                                LOGIN
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
