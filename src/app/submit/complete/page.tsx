import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, Check, Clock3, MessageCircle, MoveRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

const guideItems = [
    {
        icon: Clock3,
        title: '평균 답변 시간',
        value: '약 1~3시간',
        description: '원장님 상황에 따라 달라질 수 있습니다.',
    },
    {
        icon: MessageCircle,
        title: '안내 방법',
        value: '문자 또는 연락처',
        description: '남겨주신 연락처로 안내드리겠습니다.',
    },
    {
        icon: CalendarCheck,
        title: '상담 신청 확인',
        value: '신청서 확인',
        description: '회원은 상담내역에서, 비회원은 신청서 조회에서 확인할 수 있습니다.',
    },
];

export default async function SubmitCompletePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const applicationLink = user ? '/my/applications' : '/submit/lookup';

    return (
        <main className="min-h-screen overflow-hidden bg-[#f8f2e9] pt-20 text-[#211b16]">
            <section className="relative py-10 md:py-14">
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_24%,rgba(177,132,77,0.10),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(45,35,25,0.08),transparent_24%),linear-gradient(120deg,rgba(255,255,255,0.7),transparent_42%)]" />

                <div className="relative mx-auto max-w-6xl">
                    <div className="pointer-events-none absolute right-0 top-0 h-28 w-44 opacity-[0.72] sm:h-36 sm:w-56 md:h-44 md:w-72">
                        <Image
                            src="/bg_source/cloud_moon1.webp"
                            alt=""
                            fill
                            priority
                            sizes="(min-width: 768px) 288px, 224px"
                            className="object-contain object-right-top"
                        />
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-36 opacity-[0.48] sm:h-20 sm:w-44 md:h-24 md:w-56">
                        <Image
                            src="/bg_source/fly_birds1.webp"
                            alt=""
                            fill
                            priority
                            sizes="(min-width: 768px) 224px, 176px"
                            className="object-contain object-left-bottom"
                        />
                    </div>

                    <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-6 lg:px-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#a87943] text-[#a87943]">
                            <Check className="h-6 w-6" strokeWidth={1.5} />
                        </div>
                        <h1 className="mt-5 font-serif text-3xl font-light leading-[1.3] tracking-normal text-[#211b16] break-keep md:text-5xl">
                            상담 신청이
                            <br />
                            접수되었습니다
                        </h1>
                        <div className="mx-auto mt-5 flex w-24 items-center justify-center gap-3">
                            <span className="h-px flex-1 bg-[#b1844d]" />
                            <span className="h-2 w-2 rounded-full bg-[#b1844d]" />
                            <span className="h-px flex-1 bg-[#b1844d]" />
                        </div>
                        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#554b42] break-keep md:text-lg">
                            입력해주신 내용을 바탕으로 도원에서 차분히 상담을 준비하겠습니다.
                        </p>
                    </div>
                </div>

                <div className="relative mt-5 h-[300px] w-full sm:h-[330px] md:mt-7 md:h-[360px]">
                    <div className="absolute bottom-0 left-0 h-28 w-56 opacity-[0.34] sm:h-36 sm:w-72 md:h-44 md:w-[360px]">
                        <Image
                            src="/bg_source/bg_mount1.webp"
                            alt=""
                            fill
                            priority
                            sizes="(min-width: 768px) 360px, 288px"
                            className="object-contain object-left-bottom"
                        />
                    </div>
                    <div className="absolute right-0 top-0 h-24 w-48 opacity-[0.28] mix-blend-multiply sm:h-32 sm:w-64 md:h-40 md:w-[320px]">
                        <Image
                            src="/bg_source/bg_mount3.webp"
                            alt=""
                            fill
                            priority
                            sizes="(min-width: 768px) 320px, 256px"
                            className="object-contain object-right-top"
                        />
                    </div>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center sm:bottom-4 md:bottom-5">
                        <div className="relative h-60 w-72 sm:h-[272px] sm:w-80">
                            <Image
                                src="/bg_source/crane_writer.webp"
                                alt=""
                                fill
                                sizes="(min-width: 640px) 320px, 288px"
                                className="object-contain drop-shadow-[0_20px_45px_rgba(120,84,44,0.18)]"
                            />
                        </div>
                        <p className="mt-2 text-center font-serif text-lg text-[#6f4d27] break-keep sm:text-xl">
                            당신의 흐름을 차분히 살펴보고 있습니다.
                        </p>
                        <div className="relative mt-2 h-6 w-6 opacity-[0.82] sm:h-8 sm:w-8">
                            <Image
                                src="/bg_source/stemp1.webp"
                                alt=""
                                fill
                                sizes="48px"
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-10">
                    <div className="mt-6 rounded-lg border border-[#ded4c8] bg-white/62 p-5 shadow-[0_18px_55px_rgba(70,54,36,0.08)] sm:p-6">
                        <div className="grid gap-4 md:grid-cols-3 md:divide-x md:divide-[#e4dbd1]">
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

                    <div className="my-9 flex flex-col items-center justify-center gap-3 sm:my-10 sm:flex-row">
                        <Link
                            href="/"
                            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-md bg-[#bd8a4c] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#aa793d] sm:h-16 sm:w-80"
                        >
                            메인으로 돌아가기
                            <MoveRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={applicationLink}
                            className="inline-flex h-14 w-full items-center justify-center rounded-md border border-[#b1844d] px-8 text-sm font-semibold text-[#6f4d27] transition-colors hover:bg-[#fffaf2] sm:h-16 sm:w-80"
                        >
                            신청서 확인
                        </Link>
                    </div>

                    <div className="relative overflow-hidden rounded-lg border border-[#d8c8b5] bg-[linear-gradient(135deg,rgba(255,250,242,0.86),rgba(255,255,255,0.52))] px-6 py-6 shadow-[0_16px_45px_rgba(70,54,36,0.06)] sm:px-8">
                        <div className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-[#bd8a4c]" />
                        <div className="absolute right-6 top-6 h-12 w-12 rounded-full border border-[#bd8a4c]/20" />
                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="pl-2">
                                <p className="text-xs font-semibold tracking-[0.22em] text-[#a87943]">DOWON</p>
                                <p className="mt-2 font-serif text-2xl text-[#2a2119]">좋은 흐름은, 바른 이해에서 시작됩니다.</p>
                                <p className="mt-3 text-sm leading-7 text-[#746a61]">
                                    도원은 언제나 당신의 삶이 더 단단하고 빛나기를 바랍니다.
                                </p>
                            </div>
                            <Link
                                href="/about"
                                className="inline-flex h-11 items-center justify-center gap-3 rounded-md border border-[#b1844d]/45 bg-white/55 px-5 text-sm font-semibold text-[#6f4d27] transition-colors hover:bg-[#fffaf2] hover:text-[#a87943] md:self-center"
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
