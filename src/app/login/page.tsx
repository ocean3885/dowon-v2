'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(password);

        if (result.success) {
            router.push('/admin');
            router.refresh(); // Refresh to update server components with new cookie
        } else {
            setError(result.message || '로그인 실패');
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
            <div className="w-full max-w-md bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-800">
                <h1 className="text-2xl font-bold text-stone-100 mb-6 text-center font-serif">관리자 로그인</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 focus:ring-2 focus:ring-stone-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-stone-100 text-stone-900 font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center pointer-events-auto"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : '로그인'}
                    </button>
                </form>
            </div>
        </main>
    );
}
