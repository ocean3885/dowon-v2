'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        { name: '상담 내역', href: '/admin' },
        { name: '회원 관리', href: '/admin/members' },
        { name: '게시판 관리', href: '/admin/board' },
        { name: '사주 관계 해설', href: '/admin/saju-relations' },
    ];

    return (
        <nav className="flex items-center gap-6 border-b border-stone-200 mb-8 overflow-x-auto">
            {navItems.map((item) => (
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
            ))}
        </nav>
    );
}
