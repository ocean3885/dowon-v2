import BaziPromptPipelineForm from '@/components/admin/BaziPromptPipelineForm';
import { createAdminClient } from '@/utils/supabase/server';
import {
    defaultBaziPromptPipelineConfig,
    getBaziPromptPipelineConfig,
} from '@/lib/bazi-prompt-config';

export default async function AdminBaziPromptsPage() {
    const adminSupabase = await createAdminClient();
    const promptConfig = await getBaziPromptPipelineConfig(adminSupabase);

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-semibold text-stone-400">Prompt Pipeline</p>
                <h2 className="mt-1 text-2xl font-bold text-stone-700">만세력 프롬프트</h2>
                <p className="mt-2 text-sm text-stone-500">
                    무료 만세력 상담에 사용되는 DeepSeek 분석 단계와 최종 통합 편집 프롬프트를 관리합니다.
                </p>
            </div>

            <BaziPromptPipelineForm
                config={promptConfig}
                defaultConfig={defaultBaziPromptPipelineConfig}
            />
        </section>
    );
}
