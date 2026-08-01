import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { BaziResult } from '@/components/bazi/types';
import { createAdminClient } from '@/utils/supabase/server';
import { DEEPSEEK_API_URL, DEEPSEEK_MODEL } from '@/lib/deepseek';
import {
    buildDefaultBaziPrompt,
    buildStepResultsText,
    getBaziPromptPipelineConfig,
    renderBaziPromptTemplate,
    type BaziGenerationMetadata,
    type BaziPromptPipelineConfig,
    type BaziPromptStepConfig,
    type BaziPromptStepResult,
} from '@/lib/bazi-prompt-config';

export type BaziConsultationTable = 'free_bazi_consultations' | 'guest_bazi_consultations';

export async function generateAndStoreBaziInterpretation({
    consultationId,
    result,
    tableName,
    revalidatePaths,
}: {
    consultationId: string;
    result: BaziResult;
    tableName: BaziConsultationTable;
    revalidatePaths: string[];
}) {
    const adminSupabase = await createAdminClient();

    try {
        const generation = await runBaziGenerationPipeline(adminSupabase, result);
        const { error } = await adminSupabase
            .from(tableName)
            .update({
                prompt: generation.prompt,
                result_text: generation.interpretation,
                status: 'completed',
                completed_at: new Date().toISOString(),
                error_message: null,
                prompt_version: generation.promptVersion,
                generation_metadata: generation.metadata,
            })
            .eq('id', consultationId);

        if (error) throw error;

        if (tableName === 'guest_bazi_consultations') {
            await syncClaimedGuestConsultation(adminSupabase, consultationId, {
                prompt: generation.prompt,
                result_text: generation.interpretation,
                status: 'completed',
                completed_at: new Date().toISOString(),
                error_message: null,
                prompt_version: generation.promptVersion,
                generation_metadata: generation.metadata,
            });
        }
    } catch (error) {
        console.error(`Background ${tableName} interpretation failed:`, error);
        const message = error instanceof Error ? error.message : '사주 해설 생성에 실패했습니다.';
        await adminSupabase
            .from(tableName)
            .update({
                status: 'failed',
                error_message: message,
            })
            .eq('id', consultationId);

        if (tableName === 'guest_bazi_consultations') {
            await syncClaimedGuestConsultation(adminSupabase, consultationId, {
                status: 'failed',
                error_message: message,
            });
        }
    } finally {
        revalidatePaths.forEach((path) => revalidatePath(path));
        if (tableName === 'guest_bazi_consultations') {
            revalidatePath('/my/bazi-consultations');
        }
    }
}

export async function getGuestDailyLimit(adminSupabase: SupabaseClient) {
    const fallbackLimit = 50;

    const { data, error } = await adminSupabase
        .from('service_settings')
        .select('value')
        .eq('key', 'guest_bazi_daily_limit')
        .maybeSingle();

    if (error) {
        console.error('Guest bazi daily limit setting query failed:', error);
        return { enabled: true, limit: fallbackLimit };
    }

    const value = data?.value as { enabled?: unknown; limit?: unknown } | null | undefined;
    const enabled = typeof value?.enabled === 'boolean' ? value.enabled : true;
    const limit = typeof value?.limit === 'number' && value.limit > 0 ? Math.floor(value.limit) : fallbackLimit;

    return { enabled, limit };
}

export function buildBaziPrompt(result: BaziResult) {
    return buildDefaultBaziPrompt(result);
}

export function getKstDateString() {
    return getKstNow().toISOString().slice(0, 10);
}

export function normalizeSubjectName(value?: string) {
    const name = value?.trim().slice(0, 30);
    return name || null;
}

async function runBaziGenerationPipeline(adminSupabase: SupabaseClient, result: BaziResult) {
    const config = await getBaziPromptPipelineConfig(adminSupabase);
    const enabledSteps = config.steps.filter((step) => step.enabled);
    const steps = enabledSteps.length > 0 ? enabledSteps : config.steps.slice(0, 1);
    const stepResults = config.executionMode === 'sequential'
        ? await runSequentialBaziAnalysisSteps(steps, config, result)
        : await Promise.all(steps.map((step) => runBaziAnalysisStep(step, config, result)));
    const successfulStepResults = stepResults.filter((step) => step.ok && step.content.trim());

    if (successfulStepResults.length === 0) {
        throw new Error('사주 해설 분석 단계가 모두 실패했습니다.');
    }

    const stepResultsText = buildStepResultsText(successfulStepResults);
    const finalPrompt = renderBaziPromptTemplate(config.finalize.userPromptTemplate, result, {
        stepResults: stepResultsText,
    });
    const interpretation = await requestDeepSeekCompletion({
        model: config.model || DEEPSEEK_MODEL,
        systemPrompt: config.finalize.systemPrompt,
        userPrompt: finalPrompt,
        maxTokens: config.finalize.maxTokens,
        temperature: config.finalize.temperature,
        errorLabel: 'DeepSeek final bazi consultation failed',
    });
    const metadata: BaziGenerationMetadata = {
        promptVersion: config.version,
        model: config.model || DEEPSEEK_MODEL,
        generatedAt: new Date().toISOString(),
        steps: stepResults,
    };

    return {
        interpretation,
        prompt: finalPrompt,
        promptVersion: config.version,
        metadata,
    };
}

async function runBaziAnalysisStep(
    step: BaziPromptStepConfig,
    config: BaziPromptPipelineConfig,
    result: BaziResult,
    previousStepResults = ''
): Promise<BaziPromptStepResult> {
    const userPrompt = renderBaziPromptTemplate(step.userPromptTemplate, result, {
        previousStepResults,
    });

    try {
        const content = await requestDeepSeekCompletion({
            model: config.model || DEEPSEEK_MODEL,
            systemPrompt: step.systemPrompt,
            userPrompt,
            maxTokens: step.maxTokens,
            temperature: step.temperature,
            errorLabel: `DeepSeek bazi step failed: ${step.key}`,
        });

        return {
            key: step.key,
            label: step.label,
            ok: true,
            content,
        };
    } catch (error) {
        return {
            key: step.key,
            label: step.label,
            ok: false,
            content: '',
            error: error instanceof Error ? error.message : '분석 단계 생성에 실패했습니다.',
        };
    }
}

async function runSequentialBaziAnalysisSteps(
    steps: BaziPromptStepConfig[],
    config: BaziPromptPipelineConfig,
    result: BaziResult
) {
    const results: BaziPromptStepResult[] = [];

    for (const step of steps) {
        const previousStepResults = buildStepResultsText(results.filter((item) => item.ok && item.content.trim()));
        const stepResult = await runBaziAnalysisStep(step, config, result, previousStepResults);
        results.push(stepResult);
    }

    return results;
}

async function requestDeepSeekCompletion({
    model,
    systemPrompt,
    userPrompt,
    maxTokens,
    temperature,
    errorLabel,
}: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    maxTokens: number;
    temperature: number;
    errorLabel: string;
}) {
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            max_tokens: maxTokens,
            temperature,
        }),
        cache: 'no-store',
    });
    const data = await response.json();

    if (!response.ok) {
        console.error(errorLabel, data);
        throw new Error('사주 원국 해설 생성에 실패했습니다.');
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('생성된 해설이 비어 있습니다.');
    }

    return content.trim();
}

function getKstNow() {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

async function syncClaimedGuestConsultation(
    adminSupabase: SupabaseClient,
    sourceGuestConsultationId: string,
    values: {
        result_text?: string | null;
        status: string;
        completed_at?: string | null;
        error_message?: string | null;
        prompt?: string | null;
        prompt_version?: string | null;
        generation_metadata?: BaziGenerationMetadata | null;
    },
) {
    const { error } = await adminSupabase
        .from('free_bazi_consultations')
        .update(values)
        .eq('source_guest_consultation_id', sourceGuestConsultationId);

    if (error) {
        console.error('Claimed guest bazi sync error:', error);
    }
}
