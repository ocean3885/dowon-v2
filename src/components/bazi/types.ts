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
    special_stars?: string[];
};

export type FiveElementsAnalysis = {
    distribution_basis?: string;
    score_meaning?: string;
    counts?: Record<string, number>;
    percentages?: Record<string, number>;
    scores?: Record<string, number>;
    frequent_elements?: string[];
    absent_elements?: string[];
    dominant?: string[];
    deficient?: string[];
    summary?: string;
};

export type SpecialStarBasisItem = {
    pillar?: string;
    kind?: string;
    char?: string;
    display_name?: string;
};

export type SpecialStar = {
    rule_id?: string;
    basis?: SpecialStarBasisItem[];
    interpretation_scope?: string;
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
    root_impact_status?: string;
    root_impact_score?: number | null;
    related_interactions?: InteractionMatrixItem[];
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
        selection_year?: number;
        selection_status?: 'selected' | 'before_first_period' | 'after_last_period' | 'unavailable';
        period_basis?: string;
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
            rooting_summary?: string;
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
        branch_dynamics?: BranchDynamics;
        xu_shi_dynamics?: XuShiDynamics;
        bin_zhu_dynamics?: BinZhuDynamics;
        ai_consultation_prompts?: string[];
    };
};

export type BranchStrengthItem = {
    branch?: string;
    element?: string;
    base_power?: number;
    after_stem_power?: number;
    effective_power?: number;
    stem_branch_relation?: {
        stem?: string;
        stem_element?: string;
        relation?: string;
        branch_effect?: string;
        adjustment?: number;
    };
    components?: {
        position_weight?: number;
        seasonal_factor?: number;
        stem_adjustment_ratio?: number;
    };
};

export type BranchDynamics = {
    rule_profile?: string;
    rule_version?: string;
    scope?: string;
    score_meaning?: string;
    branch_strengths?: Partial<Record<PillarDetailKey, BranchStrengthItem>>;
};

export type PillarDetail = {
    stem?: {
        char?: string;
        position?: string;
        score?: number;
        status?: string;
        unseong?: string;
        root_info?: RootInfo[];
        root_scope?: string;
        same_pillar_root_exists?: boolean;
        external_support_score?: number;
        external_support_info?: RootInfo[];
    };
    branch?: {
        char?: string;
        storehouse?: { type?: string; stored_element?: string } | null;
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
    selection_start_year?: number;
    selection_end_year_exclusive?: number;
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

export type BaziCharacterDisplayItem = {
    text: string;
    character_ids?: string[];
    relation_ids?: string[];
    detail_lines?: string[];
};

export type BaziCharacterDisplayGroup = {
    key: string;
    title: string;
    items: BaziCharacterDisplayItem[];
};

export type BaziCharacterDisplaySection = {
    key: string;
    title: string;
    items: BaziCharacterDisplayItem[];
};

export type BaziCharacterDisplay = {
    version?: string;
    title?: string;
    subtitle?: string;
    relation_groups?: BaziCharacterDisplayGroup[];
    sections?: BaziCharacterDisplaySection[];
};

export type BaziCharacter = {
    context_id: string;
    position: string;
    kind: 'stem' | 'branch';
    char: string;
    attributes: GanJiDetail;
    pillar_attributes: { unseong?: string; unseong_self?: string; jijanggan?: JijangganDetail[]; special_stars?: string[] };
    analysis: Record<string, unknown>;
    rooting: {
        original_status: string;
        current_status: string;
        root_score: number;
        remaining_score: number;
        has_same_pillar_root: boolean;
        root_branch_ids: string[];
        external_support_score: number;
        external_support_branch_ids: string[];
        validation_status: string;
        root_impact_status: string;
        root_impact_score: number | null;
        reason?: string;
        transition_reasons?: string[];
    } | null;
    relation_ids: string[];
    transmission_relation_ids: string[];
    display?: BaziCharacterDisplay;
};

export type BaziRelationReason = {
    code?: string;
    category?: string;
    text?: string;
    character_ids?: string[];
    relation_ids?: string[];
};

export type BaziRelationPresentation = {
    rule_version?: string;
    title?: string;
    status_label?: string;
    description?: string;
    reasons?: BaziRelationReason[];
    explanation_status?: string;
};

export type BaziRelationParticipantDetail = {
    character_id?: string;
    context_id?: string;
    scope?: string;
    position?: string;
    kind?: 'stem' | 'branch';
    char?: string;
    ten_god?: string;
    display_name?: string;
};

export type BaziRelation = {
    relation_id: string;
    type: string;
    participants: string[];
    context_ids: string[];
    activation_status: string;
    status_reason: string | null;
    direction?: { from_character?: string; to_character?: string; basis?: string } | null;
    candidate_element?: string | null;
    hidden_stem?: string | null;
    formation_candidates?: string[][];
    participant_details?: BaziRelationParticipantDetail[];
    presentation?: BaziRelationPresentation;
};

export type BaziCharacterGraph = {
    schema_version: string;
    contexts: Record<string, { scope: 'natal' | 'daewoon' | 'sewoon'; label: string; calculation_status: string; selection?: Record<string, unknown> }>;
    characters: Record<string, BaziCharacter>;
    relations: Record<string, BaziRelation>;
    coverage: { not_evaluated_mechanisms?: string[]; power_effects_included?: boolean };
    selection?: {
        mode: 'daewoon' | 'sewoon';
        daewoon_index: number | null;
        sewoon_year: number | null;
        daewoon_status: 'selected' | 'before_first_period';
        sewoon_basis?: string;
        cycle_relations_status?: string;
    };
};

// New fields remain optional so saved responses from earlier API versions still render.
export type XuShiDynamics = {
    analysis_scope?: string;
    rule_version?: string;
    root_scope?: string;
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

export type BinZhuEndpoint = {
    pillar?: string;
    char?: string;
    ten_god?: string;
    display_name?: string;
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
        category?: string;
        type?: string;
        participants?: string[];
        detail?: string;
        target_guest?: string;
        source_host?: string;
        guest?: BinZhuEndpoint;
        host?: BinZhuEndpoint;
        activation_status?: string;
        distance?: number;
        is_adjacent?: boolean;
    }>;
    group_connections?: Array<{
        relation_id?: string | null;
        type?: string;
        participants?: string[];
        formations?: string[][];
        guest_participants?: string[];
        host_participants?: string[];
        included_in_score?: boolean;
        activation_status?: string;
        description?: string;
    }>;
    excluded_interactions?: Array<InteractionMatrixItem & { reason_code?: string }>;
    ai_prompt_bullets?: string[];
};
