'use client';

import { useState } from 'react';
import { signup } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData(e.currentTarget);
        const result = await signup(formData);

        if (result.success) {
            setMessage(result.message || '회원가입이 완료되었습니다. 이메일을 확인해주세요.');
            setIsLoading(false);
        } else {
            setError(result.message || '회원가입 실패');
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-stone-950 px-4">
            <div className="w-full max-w-md bg-stone-900 p-8 rounded-2xl shadow-xl border border-stone-800">
                <h1 className="text-2xl font-bold text-stone-100 mb-2 text-center font-serif">회원가입</h1>
                <p className="text-stone-400 text-sm text-center mb-8">도원작명철학원의 회원이 되어주세요</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-stone-400 text-xs font-medium mb-1 ml-1">이메일</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="admin@example.com"
                            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 focus:ring-2 focus:ring-stone-500 outline-none transition-all placeholder:text-stone-700"
                        />
                    </div>
                    <div>
                        <label className="block text-stone-400 text-xs font-medium mb-1 ml-1">비밀번호</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full bg-stone-950 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 focus:ring-2 focus:ring-stone-500 outline-none transition-all placeholder:text-stone-700"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-900/30">{error}</p>
                    )}

                    {message && (
                        <p className="text-emerald-400 text-sm text-center bg-emerald-900/20 py-2 rounded-lg border border-emerald-900/30">{message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-stone-100 text-stone-900 font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : '가입하기'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-stone-500 text-xs">
                        이미 계정이 있으신가요? <Link href="/login" className="text-stone-300 hover:underline">로그인</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
