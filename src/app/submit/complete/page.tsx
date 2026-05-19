import Link from 'next/link';
import { CalendarCheck, Check, Clock3, MessageCircle, MoveRight } from 'lucide-react';

const guideItems = [
    {
        icon: Clock3,
        title: '평균 답변 시간',
        value: '약 1~3시간',
        description: '상담사 상황에 따라 달라질 수 있습니다.',
    },
    {
        icon: MessageCircle,
        title: '안내 방법',
        value: '문자 또는 연락처',
        description: '남겨주신 연락처로 안내드리겠습니다.',
    },
    {
        icon: CalendarCheck,
        title: '상담 예약 확인',
        value: '상담내역',
        description: '로그인 회원은 상담내역에서 확인할 수 있습니다.',
    },
];

export default function SubmitCompletePage() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#f8f2e9] pt-20 text-[#211b16]">
            <section className="relative px-5 py-14 sm:px-6 md:py-20 lg:px-10">
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_24%,rgba(177,132,77,0.10),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(45,35,25,0.08),transparent_24%),linear-gradient(120deg,rgba(255,255,255,0.7),transparent_42%)]" />
                <div className="absolute right-[-80px] top-8 h-56 w-56 rounded-full border border-[#b1844d]/20" />
                <div className="absolute bottom-28 left-[-120px] h-72 w-72 rounded-full border border-[#b1844d]/15" />

                <div className="relative mx-auto max-w-6xl">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#a87943] text-[#a87943]">
                            <Check className="h-9 w-9" strokeWidth={1.5} />
                        </div>
                        <h1 className="mt-8 font-serif text-4xl font-light leading-[1.35] tracking-normal text-[#211b16] break-keep md:text-6xl">
                            상담 신청이
                            <br />
                            접수되었습니다
                        </h1>
                        <div className="mx-auto mt-8 flex w-24 items-center justify-center gap-3">
                            <span className="h-px flex-1 bg-[#b1844d]" />
                            <span className="h-2 w-2 rounded-full bg-[#b1844d]" />
                            <span className="h-px flex-1 bg-[#b1844d]" />
                        </div>
                        <p className="mx-auto mt-8 max-w-xl text-base leading-8 text-[#554b42] break-keep md:text-lg">
                            입력해주신 내용을 바탕으로 도원에서 차분히 상담을 준비하겠습니다.
                        </p>
                    </div>

                    <div className="relative mx-auto mt-12 max-w-2xl">
                        <div className="absolute inset-x-8 top-8 h-44 rounded-full border border-[#b1844d]/25" />
                        <div className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full bg-white/45 shadow-[0_20px_80px_rgba(120,84,44,0.12)]">
                            <div className="text-center">
                                <div className="mx-auto h-24 w-24 rounded-full border border-[#d4bea0] bg-[#fffaf2]" />
                                <p className="mt-7 font-serif text-2xl text-[#6f4d27]">당신의 흐름을</p>
                                <p className="mt-2 text-sm text-[#746a61]">차분히 살펴보고 있습니다.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 rounded-lg border border-[#ded4c8] bg-white/62 p-5 shadow-[0_18px_55px_rgba(70,54,36,0.08)] sm:p-7">
                        <div className="grid gap-5 md:grid-cols-3 md:divide-x md:divide-[#e4dbd1]">
                            {guideItems.map((item) => (
                                <div key={item.title} className="flex gap-4 md:px-5 first:md:pl-0 last:md:pr-0">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f1e6d7] text-[#a87943]">
                                        <item.icon className="h-7 w-7" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#6f665d]">{item.title}</p>
                                        <p className="mt-2 text-xl font-semibold text-[#2a2119]">{item.value}</p>
                                        <p className="mt-2 text-xs leading-6 text-[#746a61] break-keep">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#bd8a4c] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d] sm:w-72"
                        >
                            메인으로 돌아가기
                            <MoveRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/services"
                            className="inline-flex h-14 w-full items-center justify-center rounded-md border border-[#b1844d] px-8 text-sm font-semibold text-[#6f4d27] transition-colors hover:bg-[#fffaf2] sm:w-72"
                        >
                            상담 안내 보기
                        </Link>
                    </div>

                    <div className="mt-12 rounded-lg border border-[#ded4c8] bg-white/48 px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="font-serif text-2xl text-[#2a2119]">좋은 흐름은, 바른 이해에서 시작됩니다.</p>
                                <p className="mt-3 text-sm leading-7 text-[#746a61]">
                                    도원은 언제나 당신의 삶이 더 단단하고 빛나기를 바랍니다.
                                </p>
                            </div>
                            <Link
                                href="/about"
                                className="inline-flex items-center gap-3 text-sm font-semibold text-[#6f4d27] transition-colors hover:text-[#a87943]"
                            >
                                도원 소개 보기
                                <MoveRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
