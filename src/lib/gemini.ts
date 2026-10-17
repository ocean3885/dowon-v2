export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export async function requestGeminiCompletion({
    model = DEFAULT_GEMINI_MODEL,
    systemPrompt,
    userPrompt,
    temperature = 0.4,
    maxTokens = 5000,
    errorLabel = 'Gemini completion failed',
}: {
    model?: string;
    systemPrompt?: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    errorLabel?: string;
}): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const trimmedModel = (model || DEFAULT_GEMINI_MODEL).trim().replace(/^models\//, '');
    const url = `${GEMINI_API_URL}/${trimmedModel}:generateContent?key=${apiKey}`;

    const generationConfig: Record<string, unknown> = {
        temperature,
        maxOutputTokens: maxTokens,
    };

    // For gemini-2.5-flash models, disable thinking budget to ensure instant response and full token budget for output
    if (trimmedModel.includes('2.5') && trimmedModel.includes('flash')) {
        generationConfig.thinkingConfig = {
            thinkingBudget: 0,
        };
    }

    const payload: Record<string, unknown> = {
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }],
            },
        ],
        generationConfig,
    };

    if (systemPrompt && systemPrompt.trim()) {
        payload.systemInstruction = {
            parts: [{ text: systemPrompt.trim() }],
        };
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(errorLabel, data);
        const errMsg = data?.error?.message || `HTTP ${response.status}`;
        throw new Error(`사주 최종 해설 생성(Gemini)에 실패했습니다: ${errMsg}`);
    }

    const candidate = data?.candidates?.[0];
    const textPart = candidate?.content?.parts
        ?.filter((p: any) => !p.thought && typeof p.text === 'string')
        ?.map((p: any) => p.text)
        ?.join('\n')
        || candidate?.content?.parts?.[0]?.text;

    if (typeof textPart !== 'string' || !textPart.trim()) {
        console.error(`${errorLabel} - empty response:`, data);
        throw new Error('Gemini에서 생성된 최종 해설이 비어 있습니다.');
    }

    return textPart.trim();
}
