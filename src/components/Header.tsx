'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, User as UserIcon, Shield } from 'lucide-react';
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
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    // Use useState to ensure the supabase client is only created once
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            if (currentUser) {
                const { data: member } = await supabase.from('members').select('role').eq('id', currentUser.id).single();
                setUserRole(member?.role || 'user');
            } else {
                setUserRole(null);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: member } = await supabase.from('members').select('role').eq('id', session.user.id).single();
                setUserRole(member?.role || 'user');
            } else {
                setUserRole(null);
            }
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
        const { logout } = await import('@/lib/actions');
        await logout();
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUserMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

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
                            <div className="relative user-menu-container">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-700 hover:bg-stone-800 transition-colors group"
                                >
                                    <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-600 flex items-center justify-center overflow-hidden group-hover:border-amber-500/50 text-stone-400 group-hover:text-amber-500 transition-colors">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image
                                                src={user.user_metadata.avatar_url}
                                                alt="Profile"
                                                width={28}
                                                height={28}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon size={16} />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-stone-300 tracking-tight">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-3 w-48 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden py-1.5"
                                        >
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 transition-colors"
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                                    <UserIcon size={16} />
                                                </div>
                                                프로필 설정
                                            </Link>
                                            {userRole === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-amber-500 hover:bg-stone-800 transition-colors"
                                                >
                                                    <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                                        <Shield size={16} />
                                                    </div>
                                                    관리자 페이지
                                                </Link>
                                            )}
                                            <div className="h-px bg-stone-800 my-1 mx-2" />
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsUserMenuOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 transition-colors"
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                                    <LogOut size={16} />
                                                </div>
                                                로그아웃
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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
                            <div className="flex flex-col items-center gap-6 w-full px-8">
                                <div className="flex flex-col items-center gap-3 py-6 border-b border-stone-800 w-full">
                                    <div className="w-20 h-20 rounded-full bg-stone-800 border-2 border-amber-500/30 overflow-hidden shadow-xl flex items-center justify-center text-stone-400">
                                        {user.user_metadata?.avatar_url ? (
                                            <Image
                                                src={user.user_metadata.avatar_url}
                                                alt="Profile"
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserIcon size={40} />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-stone-100">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
                                        <p className="text-sm text-stone-500 mt-1">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 w-full">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center justify-center gap-3 px-8 py-3 bg-stone-900 text-stone-300 rounded-full text-lg font-bold tracking-widest hover:bg-stone-800 transition-colors"
                                    >
                                        프로필 설정
                                    </Link>
                                    {userRole === 'admin' && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center justify-center gap-3 px-8 py-3 border border-amber-500/30 text-amber-500 rounded-full text-lg font-bold tracking-widest hover:bg-amber-500/10 transition-colors"
                                        >
                                            관리자 페이지
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-center gap-3 px-8 py-3 border border-red-900/30 text-red-400 rounded-full text-lg font-bold tracking-widest hover:bg-red-950/20 transition-colors"
                                    >
                                        LOGOUT <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
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
