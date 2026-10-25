export type PillarKey = 'time' | 'day' | 'month' | 'year';
export type PillarDetailKey = PillarKey | 'hour';
export type BaziAuthStatus = 'checking' | 'guest' | 'member';

export type BaziSubject = {
    name?: string | null;
};

export type GanJiDetail = {
    kr?: string;
    ch?: string;
    element?: string;
    element_ch?: string;
    yin_yang?: string;
    color?: string;
    ten_god?: string;
};

export type JijangganDetail = {
    kr?: string;
    ch?: string;
    element?: string;
    element_ch?: string;
    yin_yang?: string;
    color?: string;
    ten_god?: string;
    type?: string;
    ratio?: string;
};

export type PillarStructure = {
    gan?: GanJiDetail;
    ji?: GanJiDetail;
    unseong?: string;
    unseong_self?: string;
    jijanggan?: JijangganDetail[];
};

export type FiveElementsAnalysis = {
    counts?: Record<string, number>;
    percentages?: Record<string, number>;
    scores?: Record<string, number>;
    dominant?: string[];
    deficient?: string[];
    summary?: string;
};

export type SpecialStar = {
    name: string;
    pillar?: string;
    position?: string;
    char?: string;
    type?: string;
    description?: string;
};

export type InteractionMatrixItem = {
    relation_id?: string | null;
    relation_scope?: 'pairwise' | 'group';
    participants?: string[];
    formations?: string[][];
    category?: string;
    type?: string;
    name?: string;
    from_pillar?: string;
    to_pillar?: string;
    is_adjacent?: boolean;
    weight?: number;
    score?: number;
    transformed_element?: string;
    description?: string;
};

export type XuShiRootEvidence = {
    pillar?: string;
    position?: string;
    branch_char?: string;
    score?: number;
    effective_score?: number;
    is_affected?: boolean;
    interactions?: InteractionMatrixItem[];
};

export type XuShiPillarInfo = {
    effective_score?: number;
    transition_code?: 'maintained' | 'real_to_empty';
    transition_reasons?: string[];
    root_evidence?: XuShiRootEvidence[];
    root_structure?: {
        primary_root_pillars?: string[];
        remaining_root_pillars?: string[];
        excluded_root_pillars?: string[];
        remaining_support?: 'none' | 'below_threshold' | 'meets_threshold';
    };
    position?: string;
    char?: string;
    ten_star?: string;
    score?: number;
    original_status?: string;
    current_status?: string;
    is_transformed?: boolean;
    reason?: string;
    meaning?: string;
};

export type BinZhuStructure = {
    scope?: string;
    elements?: Record<string, { stem?: string; branch?: string }>;
};

export type CycleYearItem = {
    year: number;
    age: number;
    gan: GanJiDetail;
    ji: GanJiDetail;
    unseong?: string;
};

export type BaziResult = {
    calendar?: {
        solar?: { year?: number; month?: string | number; day?: string | number };
        lunar?: { year?: number; month?: string | number; day?: string | number };
        solar_plan?: string | null;
        lunar_plan?: string | null;
    };
    four_pillars?: Partial<Record<PillarKey | 'hour', PillarStructure>>;
    ten_gods?: Record<string, string | undefined>;
    daewoon?: {
        direction?: string;
        start_age?: number;
        current?: DaewoonItem | null;
        list?: DaewoonItem[];
    };
    cycles?: {
        future_100?: CycleYearItem[];
        baby_10?: CycleYearItem[];
    };
    meta?: {
        gender?: string;
        ddi?: string;
        birth_date_solar?: string;
        birth_time?: string;
        age_man?: number;
        age_korean?: number;
        birth_weekday?: string;
    };
    birth_params?: {
        year: string;
        month: string;
        day: string;
        hour: string;
        min: string;
        sl: string;
        gen: string;
    };
    analysis?: {
        summary?: {
            branch_interactions?: string[];
            stem_interactions?: string[];
            total_energy_balance?: string;
        };
        details?: Partial<Record<PillarDetailKey, PillarDetail>>;
    };
    advanced_analysis?: {
        five_elements?: FiveElementsAnalysis;
        special_stars?: SpecialStar[];
        special_stars_by_pillar?: Record<string, string[]>;
        interactions?: {
            rule_version?: string;
            summary_list?: string[];
            matrix?: InteractionMatrixItem[];
            tension_score?: number;
            harmony_score?: number;
            climate?: string;
        };
        xu_shi_dynamics?: XuShiDynamics;
        bin_zhu_dynamics?: BinZhuDynamics;
        ai_consultation_prompts?: string[];
    };
};

export type PillarDetail = {
    stem?: {
        char?: string;
        score?: number;
        status?: string;
        unseong?: string;
        root_info?: RootInfo[];
    };
    branch?: {
        char?: string;
        jijanggan?: string[];
        transmitted?: StemInfo[];
        hidden?: StemInfo[];
    };
    jahab?: {
        exists?: boolean;
        active?: boolean;
        combined_element?: string;
    } | null;
};

export type RootInfo = {
    branch_char?: string;
    position?: string;
    ten_star?: string;
    score?: number;
};

export type StemInfo = {
    stem?: string;
    stem_pos?: string;
    stem_ten_star?: string;
};

export type DaewoonItem = {
    index?: number;
    start_age?: number;
    end_age?: number;
    start_year?: number;
    end_year?: number;
    gan?: string;
    ji?: string;
    year?: number;
    age?: number;
    gan_detail?: GanJiDetail;
    ji_detail?: GanJiDetail;
    gan_ten_god?: string;
    ji_ten_god?: string;
    unseong?: string;
};

// New fields remain optional so saved responses from earlier API versions still render.
export type XuShiDynamics = {
    analysis_scope?: string;
    rule_version?: string;
    pillars?: Record<string, XuShiPillarInfo>;
    real_count?: number;
    transformed_empty_count?: number;
    hollow_penetrate_count?: number;
    weak_count?: number;
    overall_status?: string;
    shared_roots?: Array<{
        root_pillar?: string;
        branch_char?: string;
        is_affected?: boolean;
        interactions?: InteractionMatrixItem[];
        dependents?: Array<{
            stem_pillar?: string;
            score?: number;
            effective_score?: number;
            current_status?: string;
        }>;
    }>;
    impact_groups?: Array<{
        interaction?: InteractionMatrixItem;
        affected_root_pillars?: string[];
        affected_stem_pillars?: string[];
    }>;
};

export type BinZhuDynamics = {
    rule_version?: string;
    interaction_scope?: string;
    guest_structure?: BinZhuStructure;
    host_structure?: BinZhuStructure;
    control_flow?: { direction?: string; summary_meaning?: string; career_advice?: string };
    pairwise_scores?: { combination?: number; conflict?: number };
    guest_host_links?: Array<{
        relation_id?: string | null;
        type?: string;
        detail?: string;
        target_guest?: string;
        source_host?: string;
    }>;
    group_connections?: Array<{
        relation_id?: string | null;
        type?: string;
        participants?: string[];
        guest_participants?: string[];
        host_participants?: string[];
        included_in_score?: boolean;
        description?: string;
    }>;
    excluded_interactions?: Array<InteractionMatrixItem & { reason_code?: string }>;
    ai_prompt_bullets?: string[];
};
