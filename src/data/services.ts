export type ServiceIcon = 'scroll' | 'heart' | 'user' | 'chart' | 'pen' | 'calendar';

export type ServiceDetail = {
    slug: string;
    icon: ServiceIcon;
    title: string;
    subtitle: string;
    description: string;
    heroImage: string;
    detailImage: string;
    items: string[];
    price: string;
    duration: string;
    recommendedFor: string[];
    includes: string[];
    process: {
        title: string;
        description: string;
    }[];
};

export const services: ServiceDetail[] = [
    {
        slug: 'saju',
        icon: 'scroll',
        title: '사주 종합 상담',
        subtitle: '타고난 성향과 운의 흐름을 함께 읽어 지금의 고민이 어디에서 비롯되었는지 살핍니다. 막연한 불안보다 현실적인 선택 기준을 세우고 싶은 분께 필요한 기본 상담입니다.',
        description: '전반적인 인생 흐름과 현재 시기, 앞으로의 방향성을 종합적으로 분석합니다.',
        heroImage: '/counseling/subimage5.webp',
        detailImage: '/home/banner_bg_img800.jpg',
        items: ['성향 분석', '대운 흐름', '재물 · 직업', '인간관계', '시기 해석'],
        price: '40,000원',
        duration: '약 30분',
        recommendedFor: ['현재 인생의 방향이 막막한 분', '중요한 선택을 앞두고 흐름을 확인하고 싶은 분', '자신의 성향과 강점을 객관적으로 알고 싶은 분'],
        includes: ['타고난 사주 구조 해석', '현재 운의 흐름 분석', '현실적인 방향과 주의할 시기 정리'],
        process: [
            { title: '기본 정보 확인', description: '생년월일시와 현재 고민을 함께 확인해 상담의 기준이 되는 명식을 세우고, 집중해서 살펴볼 주제를 정리합니다.' },
            { title: '전체 흐름 분석', description: '타고난 성향과 강점, 대운과 세운의 흐름을 함께 보며 지금의 상황이 어떤 흐름 위에 놓여 있는지 살핍니다.' },
            { title: '현실 방향 정리', description: '재물, 직업, 관계, 중요한 선택의 시기를 현실 조건과 연결해 무리 없이 참고할 수 있는 방향과 주의점을 안내합니다.' },
        ],
    },
    {
        slug: 'love-marriage',
        icon: 'heart',
        title: '연애 · 궁합 상담',
        subtitle: '서로의 성향 차이와 인연의 흐름을 차분히 살펴 관계가 어디로 향하고 있는지 짚어드립니다. 감정만으로 판단하기 어려운 연애와 결혼의 시기, 방향성을 함께 정리합니다.',
        description: '관계의 흐름과 성향, 시기적 조화를 중심으로 상담합니다.',
        heroImage: '/counseling/subimage6.webp',
        detailImage: '/counseling/subimage7.webp',
        items: ['연애운 흐름', '궁합 및 성향 분석', '결혼 시기', '관계 방향성'],
        price: '80,000원',
        duration: '약 50분',
        recommendedFor: ['현재 관계의 방향이 궁금한 분', '결혼 시기와 인연의 흐름을 알고 싶은 분', '상대와의 성향 차이를 이해하고 싶은 분'],
        includes: ['개인 연애운 흐름', '상대와의 성향 및 궁합 해석', '관계에서 조심할 점과 좋은 시기 안내'],
        process: [
            { title: '두 사람의 정보 확인', description: '개인 또는 두 사람의 생년월일시와 현재 관계 상황을 함께 확인해 상담의 기준이 되는 명식을 세우고, 연애와 결혼 중 집중해서 살펴볼 주제를 정리합니다.' },
            { title: '관계 흐름 분석', description: '각자의 성향, 애정 표현 방식, 관계에서 부딪히기 쉬운 지점을 살피고 인연의 흐름과 결혼 시기, 서로에게 필요한 조화의 방향을 함께 분석합니다.' },
            { title: '관계 방향 제안', description: '현재 관계를 이어갈 때 참고할 현실적인 기준과 대화의 방향, 조심해야 할 시기를 정리해 감정에만 치우치지 않고 판단할 수 있도록 안내합니다.' },
        ],
    },
    {
        slug: 'career',
        icon: 'user',
        title: '진로 · 직업 상담',
        subtitle: '타고난 강점과 일의 방식, 변화의 시기를 함께 분석해 지금 선택할 수 있는 진로의 폭을 살핍니다. 이직, 전환, 성장의 방향을 현실적으로 정리하고 싶은 분께 맞춘 상담입니다.',
        description: '현재 흐름과 적성, 직업 방향성을 현실 시기와 함께 살펴봅니다.',
        heroImage: '/counseling/subimage4.webp',
        detailImage: '/home/desk_hand_pen_bg.webp',
        items: ['적성 및 강점', '직업 방향성', '이직 · 전환 시기', '성장 가능성'],
        price: '40,000원',
        duration: '약 30분',
        recommendedFor: ['진로 선택이나 이직을 고민하는 분', '자신에게 맞는 일의 방향을 알고 싶은 분', '직업 전환 시기를 확인하고 싶은 분'],
        includes: ['타고난 적성과 강점 분석', '직업군과 일의 방식 제안', '이직 및 전환 시기 해석'],
        process: [
            { title: '성향과 적성 확인', description: '사주 구조에서 드러나는 기질, 강점, 일 처리 방식, 조직과 독립 업무 중 더 맞는 방향을 함께 살핍니다.' },
            { title: '현재 시기 분석', description: '지금이 유지와 축적에 가까운 시기인지, 이직이나 전환처럼 변화를 시도해볼 만한 시기인지 흐름을 기준으로 점검합니다.' },
            { title: '직업 방향 정리', description: '상담자의 현실 조건과 고민을 바탕으로 직업군, 일하는 방식, 준비 순서까지 무리 없이 선택 가능한 방향으로 정리합니다.' },
        ],
    },
    {
        slug: 'business-money',
        icon: 'chart',
        title: '사업 · 재물 상담',
        subtitle: '재물운과 사업운의 흐름을 바탕으로 시작, 확장, 조정의 타이밍을 살핍니다. 무리한 기대보다 현재 상황에서 지켜야 할 기준과 기회를 함께 검토하는 상담입니다.',
        description: '재물 흐름과 사업 방향, 확장 시기 등을 함께 검토합니다.',
        heroImage: '/counseling/subimage8.webp',
        detailImage: '/home/service_new4.webp',
        items: ['재물운 흐름', '사업 타이밍', '확장 · 투자 시기', '리스크 분석'],
        price: '40,000원',
        duration: '약 30분',
        recommendedFor: ['사업 시작이나 확장을 고민하는 분', '투자와 재물 흐름의 시기를 알고 싶은 분', '현재 사업 방향을 점검하고 싶은 분'],
        includes: ['재물운과 사업운 흐름', '확장과 보수의 타이밍 분석', '주의해야 할 리스크 정리'],
        process: [
            { title: '사업 방향 확인', description: '현재 운영 상황과 준비 중인 계획, 자금 흐름, 가장 고민되는 지점을 먼저 정리해 상담에서 집중해서 살펴볼 사업의 기준점을 세웁니다.' },
            { title: '재물 흐름 분석', description: '사주 구조에서 드러나는 재물운과 사업운의 흐름을 바탕으로 시작, 확장, 투자, 조정이 유리한 시기와 주의해야 할 흐름을 함께 살핍니다.' },
            { title: '실행 기준 제안', description: '무리하게 밀어붙이기보다 현재 조건에서 가능한 확장 범위와 보수적으로 지켜야 할 기준, 리스크를 줄이는 실행 순서를 현실적으로 안내합니다.' },
        ],
    },
    {
        slug: 'naming',
        icon: 'pen',
        title: '작명 · 개명 상담',
        subtitle: '이름은 부르는 소리이자 한 사람의 시작을 담는 그릇입니다. 사주의 균형, 오행의 보완, 발음과 의미를 함께 살펴 오래 불려도 자연스러운 이름을 제안합니다.',
        description: '사주의 흐름과 오행의 균형, 발음과 의미를 함께 고려합니다.',
        heroImage: '/counseling/subimage5.webp',
        detailImage: '/home/service_new1.webp',
        items: ['오행 분석', '이름 후보 제시', '발음 및 의미 검토', '최종 이름 추천'],
        price: '200,000원',
        duration: '개별 안내',
        recommendedFor: ['신생아 이름을 신중하게 짓고 싶은 분', '사주에 맞는 이름 후보가 필요한 분', '이름의 의미와 발음을 함께 고려하고 싶은 분'],
        includes: ['사주와 오행 분석', '이름 후보 제안', '발음, 의미, 어감 검토'],
        process: [
            { title: '사주 구조 분석', description: '생년월일시를 바탕으로 사주 구조와 오행의 균형을 살피고, 이름에서 보완하면 좋은 기운과 피해야 할 방향을 먼저 정리합니다.' },
            { title: '이름 후보 구성', description: '보완이 필요한 오행과 한자의 의미, 발음의 흐름, 부르기 쉬운 어감을 함께 고려해 오래 사용해도 자연스러운 이름 후보를 구성합니다.' },
            { title: '최종 이름 안내', description: '후보 이름의 의미와 쓰임을 비교하며 상담자의 상황에 가장 잘 맞는 이름을 선별하고, 최종 선택에 참고할 기준을 차분히 안내드립니다.' },
        ],
    },
    {
        slug: 'birth-date',
        icon: 'calendar',
        title: '출산 · 택일 상담',
        subtitle: '출산 가능 기간 안에서 날짜와 시간의 흐름을 비교해 아이에게 더 조화로운 시작점을 찾아봅니다. 의학적 일정과 현실적인 조건을 존중하면서 사주적으로 좋은 선택지를 정리합니다.',
        description: '출산 예정일의 범위 안에서 사주의 흐름과 조화를 고려해 좋은 날짜와 시간을 살핍니다.',
        heroImage: '/counseling/subimage3.webp',
        detailImage: '/home/service_new3.webp',
        items: ['출산 예정일 분석', '좋은 날짜 후보', '시간대별 사주 검토', '최종 택일 안내'],
        price: '100,000원',
        duration: '개별 안내',
        recommendedFor: ['출산 예정일 범위 안에서 좋은 날짜를 고르고 싶은 분', '제왕절개 등으로 출산 시간을 선택해야 하는 분', '아이의 시작점에 좋은 기운을 담고 싶은 분'],
        includes: ['출산 가능 기간 내 날짜 검토', '날짜와 시간대별 사주 흐름 비교', '최종 추천일과 유의할 시간대 안내'],
        process: [
            { title: '출산 가능 기간 확인', description: '예정일과 병원에서 선택 가능한 날짜, 시간 범위를 먼저 확인하고 의학적 일정과 현실적인 조건 안에서 살펴볼 후보 기준을 정리합니다.' },
            { title: '날짜와 시간 분석', description: '각 후보 날짜와 시간대의 사주 흐름, 오행의 균형, 아이에게 담길 시작점의 조화를 비교해 상대적으로 안정적인 선택지를 살핍니다.' },
            { title: '최종 택일 안내', description: '검토한 후보 중 가장 적합한 날짜와 시간대를 정리하고, 선택 과정에서 참고하면 좋은 우선순위와 피하면 좋은 시간대를 함께 안내드립니다.' },
        ],
    },
];

export function getServiceBySlug(slug: string) {
    return services.find((service) => service.slug === slug);
}
