import { Star, Quote } from 'lucide-react';

const reviews = [
    {
        id: 1,
        category: '신생아 작명',
        content: '첫 아이라 이름을 어떻게 지을지 고민이 많았는데, 원장님께서 사주에 부족한 오행을 채워주는 좋은 이름을 지어주셨습니다. 뜻도 너무 좋고 부르기도 예뻐서 정말 만족합니다. 아이가 건강하게 잘 자랄 것 같아요.',
        author: '김**님',
        date: '2025.12.10',
        rating: 5
    },
    {
        id: 2,
        category: '개명',
        content: '오랫동안 일이 잘 풀리지 않아 답답한 마음에 개명을 결심했습니다. 상담도 꼼꼼하게 해주시고 저에게 딱 맞는 이름을 추천해 주셔서 믿음이 갔습니다. 개명 후 마음가짐도 달라지고 좋은 일들이 생기는 것 같습니다.',
        author: '이**님',
        date: '2025.12.05',
        rating: 5
    },
    {
        id: 3,
        category: '진로 상담',
        content: '취업 준비 기간이 길어지면서 자존감도 떨어지고 어떤 길로 가야 할지 막막했는데, 제 적성과 운의 흐름을 정확하게 짚어주셔서 놀랐습니다. 조언해 주신 대로 준비해서 좋은 결과를 얻고 싶습니다.',
        author: '박**님',
        date: '2025.11.28',
        rating: 5
    },
    {
        id: 4,
        category: '결혼운 상담',
        content: '결혼을 앞두고 예비 신랑과의 궁합이 궁금해서 방문했습니다. 서로의 성향 차이와 조심해야 할 부분들을 현실적으로 조언해 주셔서 큰 도움이 되었습니다. 덕분에 서로 더 이해하고 배려하며 결혼 준비를 잘 하고 있습니다.',
        author: '최**님',
        date: '2025.11.15',
        rating: 5
    }
];

export default function ReviewSection() {
    return (
        <section className="py-12 md:py-24 bg-stone-50">
            <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4 font-serif">생생한 상담 후기</h2>
                    <p className="text-stone-500 font-light">
                        도원작명철학원을 다녀가신 분들의 소중한 이야기입니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-stone-100 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                                    {review.category}
                                </span>
                                <div className="flex text-amber-500">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} size={12} fill="currentColor" />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6 flex-grow relative">
                                <Quote className="absolute -top-2 -left-2 w-6 h-6 text-stone-100 rotate-180" />
                                <p className="text-stone-600 text-sm leading-relaxed relative z-10 pt-2">
                                    {review.content}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-stone-50 mt-auto">
                                <span className="text-sm font-medium text-stone-900">{review.author}</span>
                                <span className="text-xs text-stone-400">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
