'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        { name: '상담 내역', href: '/admin' },
        { name: '블로그 관리', href: '/admin/blog' },
        { name: '게시판 관리', href: '/admin/board' },
        { name: '홈페이지 설정', href: '/admin/settings', disabled: true },
    ];

    return (
        <nav className="flex items-center gap-6 border-b border-stone-200 mb-8 overflow-x-auto">
            {navItems.map((item) => (
                item.disabled ? (
                    <button
                        key={item.name}
                        className="pb-3 text-stone-400 font-medium whitespace-nowrap border-b-2 border-transparent cursor-not-allowed opacity-50"
                    >
                        {item.name}
                    </button>
                ) : (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "pb-3 font-bold whitespace-nowrap transition-colors border-b-2",
                            pathname === item.href || pathname.startsWith(item.href + '/') && item.href !== '/admin'
                                ? "border-stone-800 text-stone-800"
                                : "border-transparent text-stone-400 hover:text-stone-600"
                        )}
                    >
                        {item.name}
                    </Link>
                )
            ))}
        </nav>
    );
}
