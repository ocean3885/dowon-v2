'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Search, X, Calendar, User, Eye, Sparkles } from 'lucide-react';
import { SajuChart } from '@/components/bazi/SajuChart';
import type { BaziResult } from '@/components/bazi/types';

export type BaziInquiryItem = {
    id: string;
    userId: string | null;
    userEmail: string | null;
    userName: string | null;
    subjectName: string | null;
    gender: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour: number;
    birthMin: number;
    calendarType: string;
    baziResult: BaziResult;
    clientIp: string | null;
    createdAt: string;
};

export default function AdminBaziInquiryList({
    inquiries,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    searchQuery,
    genderFilter,
}: {
    inquiries: BaziInquiryItem[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    searchQuery: string;
    genderFilter: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchQuery);
    const [selectedInquiry, setSelectedInquiry] = useState<BaziInquiryItem | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim());
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        router.push(`/admin/bazi-inquiries?${params.toString()}`);
    };

    const handleGenderChange = (gender: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (gender) {
            params.set('gender', gender);
        } else {
            params.delete('gender');
        }
        params.set('page', '1');
        router.push(`/admin/bazi-inquiries?${params.toString()}`);
    };

    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(page));
        return `/admin/bazi-inquiries?${params.toString()}`;
    };

    return (
        <div className="mt-8 rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            {/* Header & Controls */}
            <div className="border-b border-stone-100 p-5 bg-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-stone-800">만세력 조회 내역</h3>
                        <p className="mt-1 text-xs text-stone-400">
                            총 {totalCount.toLocaleString('ko-KR')}건의 조회 이력이 기록되어 있습니다.
                        </p>
                    </div>

                    {/* Search & Gender filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Gender filter tabs */}
                        <div className="inline-flex rounded-lg border border-stone-200 p-1 bg-stone-50 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => handleGenderChange('')}
                                className={`px-2.5 py-1 rounded transition-colors ${
                                    !genderFilter ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                전체
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGenderChange('남')}
                                className={`px-2.5 py-1 rounded transition-colors ${
                                    genderFilter === '남' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                남성
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGenderChange('여')}
                                className={`px-2.5 py-1 rounded transition-colors ${
                                    genderFilter === '여' ? 'bg-red-500 text-white shadow-xs' : 'text-stone-400 hover:text-stone-600'
                                }`}
                            >
                                여성
                            </button>
                        </div>

                        {/* Search form */}
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="이름 검색..."
                                    className="w-40 sm:w-48 pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 bg-stone-50/50"
                                />
                                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                검색
                            </button>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete('search');
                                        params.set('page', '1');
                                        router.push(`/admin/bazi-inquiries?${params.toString()}`);
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-stone-600 text-xs"
                                    title="검색 초기화"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500">
                        <tr>
                            <th className="px-5 py-3.5">조회 일시</th>
                            <th className="px-5 py-3.5">이름 / 성별</th>
                            <th className="px-5 py-3.5">생년월일시</th>
                            <th className="px-5 py-3.5">사주 원국 (시주 · 일주 · 월주 · 년주)</th>
                            <th className="px-5 py-3.5">방문자 구분</th>
                            <th className="px-5 py-3.5 text-right">사주 차트</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                        {inquiries.map((item) => {
                            const pillars = item.baziResult?.four_pillars;
                            return (
                                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-stone-500 font-mono">
                                        {format(new Date(item.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-stone-800">
                                                {item.subjectName || '이름 미입력'}
                                            </span>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                                    item.gender === '남'
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                }`}
                                            >
                                                {item.gender}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-stone-600">
                                        <div>
                                            <span>
                                                {item.birthYear}년 {String(item.birthMonth).padStart(2, '0')}월 {String(item.birthDay).padStart(2, '0')}일
                                            </span>
                                            <span className="ml-1 text-stone-400">
                                                {String(item.birthHour).padStart(2, '0')}:{String(item.birthMin).padStart(2, '0')}
                                            </span>
                                            <span className="ml-1.5 px-1.5 py-0.5 bg-stone-100 rounded text-[10px] text-stone-500">
                                                {item.calendarType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        {pillars ? (
                                            <div className="flex items-center gap-1.5 text-xs font-serif font-bold">
                                                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700" title="시주">
                                                    {pillars.hour?.gan?.ch || '?'}{pillars.hour?.ji?.ch || '?'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs" title="일주 (본인/일간)">
                                                    {pillars.day?.gan?.ch || '?'}{pillars.day?.ji?.ch || '?'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700" title="월주">
                                                    {pillars.month?.gan?.ch || '?'}{pillars.month?.ji?.ch || '?'}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700" title="년주">
                                                    {pillars.year?.gan?.ch || '?'}{pillars.year?.ji?.ch || '?'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-stone-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                                        {item.userId ? (
                                            <div className="flex items-center gap-1.5 text-stone-700">
                                                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold">
                                                    회원
                                                </span>
                                                <span className="font-medium text-stone-800">
                                                    {item.userName || item.userEmail?.split('@')[0] || '회원'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-stone-400">비회원</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedInquiry(item)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>차트 열람</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {inquiries.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-16 text-center text-stone-400">
                                    만세력 조회 내역이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3.5 text-xs text-stone-500">
                    <div>
                        {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} / 총 {totalCount}건
                    </div>
                    <div className="flex items-center gap-1">
                        {currentPage > 1 ? (
                            <Link
                                href={buildPageUrl(currentPage - 1)}
                                className="px-2.5 py-1 border border-stone-200 rounded hover:bg-stone-50 transition-colors"
                            >
                                이전
                            </Link>
                        ) : (
                            <span className="px-2.5 py-1 border border-stone-100 rounded text-stone-300">이전</span>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                            .map((p, idx, arr) => (
                                <span key={p} className="flex items-center">
                                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                                        <span className="px-1 text-stone-300">...</span>
                                    )}
                                    <Link
                                        href={buildPageUrl(p)}
                                        className={`px-2.5 py-1 rounded font-bold transition-colors ${
                                            p === currentPage
                                                ? 'bg-stone-800 text-white'
                                                : 'border border-stone-200 hover:bg-stone-50 text-stone-700'
                                        }`}
                                    >
                                        {p}
                                    </Link>
                                </span>
                            ))}

                        {currentPage < totalPages ? (
                            <Link
                                href={buildPageUrl(currentPage + 1)}
                                className="px-2.5 py-1 border border-stone-200 rounded hover:bg-stone-50 transition-colors"
                            >
                                다음
                            </Link>
                        ) : (
                            <span className="px-2.5 py-1 border border-stone-100 rounded text-stone-300">다음</span>
                        )}
                    </div>
                </div>
            )}

            {/* Saju Chart Detail Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-50 rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-bold text-stone-800 font-serif">
                                        {selectedInquiry.subjectName || '이름 미입력'}의 사주 정국
                                    </h4>
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                                            selectedInquiry.gender === '남'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {selectedInquiry.gender}성
                                    </span>
                                </div>
                                <p className="text-xs text-stone-500 mt-1">
                                    {selectedInquiry.birthYear}년 {selectedInquiry.birthMonth}월 {selectedInquiry.birthDay}일 {selectedInquiry.birthHour}시 {selectedInquiry.birthMin}분 ({selectedInquiry.calendarType})
                                    · 조회일시: {format(new Date(selectedInquiry.createdAt), 'yyyy.MM.dd HH:mm:ss', { locale: ko })}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedInquiry(null)}
                                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: SajuChart */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {selectedInquiry.baziResult ? (
                                <SajuChart result={selectedInquiry.baziResult} />
                            ) : (
                                <div className="py-12 text-center text-stone-400">
                                    사주 상세 결과 데이터가 없습니다.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 bg-white border-t border-stone-200 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedInquiry(null)}
                                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
