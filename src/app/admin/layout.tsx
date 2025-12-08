import AdminNav from '@/components/AdminNav';
import { logout } from '@/lib/actions';
import { LogOut } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-stone-50 pt-32 pb-12 px-4 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <AdminNav />

                <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                    <h1 className="text-2xl md:text-3xl font-bold text-stone-800 font-serif">관리자 페이지</h1>
                    <form action={logout}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors text-sm font-medium">
                            <LogOut size={16} />
                            로그아웃
                        </button>
                    </form>
                </header>

                {children}
            </div>
        </main>
    );
}
