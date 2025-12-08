import { redirect } from 'next/navigation';
import { getConsultations } from '@/lib/actions';

export default async function AdminPage() {
    let consultations = [];
    try {
        consultations = await getConsultations();
    } catch (error) {
        redirect('/login');
    }

    return (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-bold text-stone-700">상담 신청 목록</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultations.length === 0 ? (
                    <div className="col-span-full bg-white p-8 rounded-xl shadow-sm border border-stone-200 text-center text-stone-400">
                        아직 신청된 상담 내역이 없습니다.
                    </div>
                ) : (
                    consultations.map((item: any) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 mr-4">
                                    <h3 className="font-bold text-stone-800 text-lg mb-1">{item.name}</h3>
                                    <p className="text-xs text-stone-500">{new Date(item.createdAt).toLocaleString('ko-KR')}</p>
                                </div>
                                <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold whitespace-nowrap">
                                    {item.serviceType === 'saju' && '사주'}
                                    {item.serviceType === 'naming' && '작명'}
                                    {item.serviceType === 'rename' && '개명'}
                                    {item.serviceType === 'gunghap' && '궁합'}
                                    {item.serviceType === 'date' && '택일'}
                                    {item.serviceType === 'other' && '기타'}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4 flex-grow">
                                <div className="flex items-center text-sm text-stone-600">
                                    <span className="w-16 font-medium text-stone-400 text-xs">연락처</span>
                                    <span className="flex-1">{item.contact}</span>
                                </div>
                                <div className="flex items-center text-sm text-stone-600">
                                    <span className="w-16 font-medium text-stone-400 text-xs">생년월일</span>
                                    <span className="flex-1">{item.birthDate || '-'}</span>
                                </div>
                            </div>

                            {item.notes && (
                                <div className="pt-4 border-t border-stone-100 mt-auto">
                                    <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed">
                                        {item.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
