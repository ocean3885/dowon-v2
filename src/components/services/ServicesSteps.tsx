import Image from 'next/image';

export default function ServicesSteps() {
    return (
        <section className="container mx-auto px-6 mb-20">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-800 mb-8 flex items-center gap-2">
                <span className="w-1 h-8 bg-stone-800 rounded-full"></span>
                작명/개명 진행 절차
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Step A */}
                <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                    <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                        <Image
                            src="/jminfo1.jpg"
                            alt="신청서 작성"
                            fill
                            sizes="150px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">1. 신청서 작성</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            생년월일시 (음력/양력 구분) 등 필수 기입 내용을 정확히 기재합니다. 희망 한자, 선호하는 이름 유형 등 추가 정보도 기재 바랍니다.
                        </p>
                    </div>
                </div>

                {/* Step B */}
                <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                    <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                        <Image
                            src="/jminfo2.jpg"
                            alt="작명료 결제"
                            fill
                            sizes="150px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">2. 작명료 결제</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            신청서 및 입금 확인 후 작업 시작 전 연락드립니다. 내용 불분명 시 작업이 보류될 수 있습니다.
                        </p>
                    </div>
                </div>

                {/* Step C */}
                <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                    <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                        <Image
                            src="/jminfo3.jpg"
                            alt="작명 진행 및 추천"
                            fill
                            sizes="150px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">3. 작명 진행 및 발송</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            최적의 이름을 뽑아 <strong>작명추천서 </strong>를 신청서에 기재된 이메일로 보내드립니다.
                        </p>
                    </div>
                </div>

                {/* Step D */}
                <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6 flex flex-col items-center text-center">
                    <div className="relative w-[150px] h-[170px] mb-6 shadow-md rounded-lg overflow-hidden flex-shrink-0 bg-stone-50">
                        <Image
                            src="/jminfo4.jpg"
                            alt="작명 완료"
                            fill
                            sizes="150px"
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2 text-stone-900">4. 작명 완료</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            추천서의 이름 중 하나를 선택하시면 작명신청이 완료됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
