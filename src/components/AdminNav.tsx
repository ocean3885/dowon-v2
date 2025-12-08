'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-6 border-b border-stone-200 mb-8 overflow-x-auto">
            <Link
                href="/admin"
                className={clsx(
                    "pb-3 font-bold whitespace-nowrap transition-colors border-b-2",
                    pathname === '/admin'
                        ? "border-stone-800 text-stone-800"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                )}
            >
                상담 내역
            </Link>
            <Link
                href="/admin/blog"
                className={clsx(
                    "pb-3 font-bold whitespace-nowrap transition-colors border-b-2",
                    pathname === '/admin/blog'
                        ? "border-stone-800 text-stone-800"
                        : "border-transparent text-stone-400 hover:text-stone-600"
                )}
            >
                블로그 관리
            </Link>
            <button className="pb-3 text-stone-400 hover:text-stone-600 font-medium transition-colors whitespace-nowrap border-b-2 border-transparent cursor-not-allowed opacity-50">
                홈페이지 설정
            </button>
        </nav>
    );
}
