'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    RotateCcw,
    Save,
    Search,
    Copy,
    Check,
    Eye,
    X,
    Sparkles,
    Info,
    ChevronDown,
    ChevronUp,
    Code,
    Layers,
    GitBranch,
    Bookmark,
    Trash2,
    CheckCircle2,
    Download,
} from 'lucide-react';
import {
    saveBaziPromptVersionAction,
    deleteBaziPromptVersionAction,
    activateBaziPromptVersionAction,
} from '@/lib/actions';
import {
    BAZI_PROMPT_VARIABLES,
    getSampleBaziPromptContext,
    type BaziPromptPipelineConfig,
    type BaziPromptVariableCategory,
    type BaziPromptVariableDefinition,
    type BaziPromptVersionItem,
} from '@/lib/bazi-prompt-config';

const CATEGORIES: Array<'전체' | BaziPromptVariableCategory> = [
    '전체',
    '명식 기본',
    '오행·원국',
    '신살·기후',
    '적성·진로',
    '운의 흐름',
    '파이프라인',
];

export default function BaziPromptPipelineForm({
    config,
    defaultConfig,
    savedVersions = [],
}: {
    config: BaziPromptPipelineConfig;
    defaultConfig: BaziPromptPipelineConfig;
    savedVersions?: BaziPromptVersionItem[];
}) {
    const router = useRouter();
    const [formConfig, setFormConfig] = useState(config);

    // Multi-version management state
    const [versionsList, setVersionsList] = useState<BaziPromptVersionItem[]>(savedVersions);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('current');
    const [loadedVersionId, setLoadedVersionId] = useState<string>('current');
    const [currentVersionName, setCurrentVersionName] = useState<string>(config.version ? `${config.version} 운영 버전` : '운영 버전');
    const [currentVersionDesc, setCurrentVersionDesc] = useState<string>('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newVersionTag, setNewVersionTag] = useState('');
    const [newVersionName, setNewVersionName] = useState('');
    const [newVersionDesc, setNewVersionDesc] = useState('');
    const [activateOnSave, setActivateOnSave] = useState(false);
    const [isPendingTransition, startTransition] = useTransition();

    // Variable palette state (default: collapsed)
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'전체' | BaziPromptVariableCategory>('전체');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Active textarea tracking for click-to-insert
    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Preview modal state
    const [previewTarget, setPreviewTarget] = useState<'none' | { type: 'step'; index: number } | { type: 'finalize' }>('none');

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage((current) => (current === msg ? null : current)), 3000);
    };

    // Load selected version into form
    const handleLoadVersion = () => {
        if (selectedVersionId === 'current') {
            setFormConfig(config);
            setLoadedVersionId('current');
            setCurrentVersionName(config.version ? `${config.version} 운영 버전` : '운영 버전');
            setCurrentVersionDesc('');
            showToast('현재 운영 중인 프롬프트 설정을 불러왔습니다.');
            return;
        }

        if (selectedVersionId === 'default') {
            setFormConfig(defaultConfig);
            setLoadedVersionId('default');
            setCurrentVersionName('기본 권장 템플릿');
            setCurrentVersionDesc('');
            showToast('기본 권장 템플릿 설정을 불러왔습니다. 수정 후 [새 버전으로 저장]해 주세요.');
            return;
        }

        const found = versionsList.find((v) => v.id === selectedVersionId || v.version === selectedVersionId);
        if (found) {
            setFormConfig(found.config);
            setLoadedVersionId(found.id);
            setCurrentVersionName(found.name || found.version);
            setCurrentVersionDesc(found.description || '');
            showToast(`[${found.version}] 버전을 불러왔습니다. 수정 후 저장하면 이 버전에 저장됩니다.`);
        }
    };

    // Save changes to whichever version is currently loaded (or live active)
    const handleSaveCurrentWorkingVersion = () => {
        if (loadedVersionId === 'default') {
            handleOpenSaveModal();
            return;
        }

        if (loadedVersionId === 'current') {
            startTransition(async () => {
                const res = await activateBaziPromptVersionAction(formConfig);
                if (res.success) {
                    showToast('현재 운영 서비스 프롬프트 설정이 저장되었습니다.');
                    router.refresh();
                } else {
                    alert(res.message);
                }
            });
            return;
        }

        // Saving edits to the loaded version snapshot
        const versionTag = formConfig.version?.trim() || loadedVersionId;
        const versionName = currentVersionName?.trim() || versionTag;
        const versionDesc = currentVersionDesc?.trim() || '';

        startTransition(async () => {
            const res = await saveBaziPromptVersionAction({
                id: loadedVersionId,
                version: versionTag,
                name: versionName,
                description: versionDesc,
                config: formConfig,
                activateNow: false, // Save to snapshot only, without touching live service
            });

            if (res.success) {
                if (res.versions) setVersionsList(res.versions);
                setLoadedVersionId(versionTag);
                setSelectedVersionId(versionTag);
                showToast(`[${versionTag}] 버전 정보 및 프롬프트가 저장되었습니다.`);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    // Open Save As New Version modal
    const handleOpenSaveModal = () => {
        const nextVerNum = versionsList.length + 1;
        setNewVersionTag(`v1.${nextVerNum}`);
        setNewVersionName(`${currentVersionName || formConfig.version || '버전'} 수정본`);
        setNewVersionDesc(currentVersionDesc || '');
        setActivateOnSave(false);
        setIsSaveModalOpen(true);
    };

    // Save as new version
    const handleConfirmSaveVersion = () => {
        if (!newVersionTag.trim()) {
            alert('버전 코드를 입력해 주세요.');
            return;
        }

        startTransition(async () => {
            const res = await saveBaziPromptVersionAction({
                version: newVersionTag.trim(),
                name: newVersionName.trim() || newVersionTag.trim(),
                description: newVersionDesc.trim(),
                config: formConfig,
                activateNow: activateOnSave,
            });

            if (res.success) {
                if (res.versions) setVersionsList(res.versions);
                const savedTag = newVersionTag.trim();
                setSelectedVersionId(savedTag);
                setLoadedVersionId(savedTag);
                setCurrentVersionName(newVersionName.trim() || savedTag);
                setCurrentVersionDesc(newVersionDesc.trim());
                setIsSaveModalOpen(false);
                showToast(res.message);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    // Activate currently loaded form config as live
    const handleActivateCurrentConfig = () => {
        const verLabel = formConfig.version || '현재';
        if (!confirm(`현재 폼에 작성된 설정(버전: ${verLabel})을 실제 서비스(운영 환경)에 즉시 적용하시겠습니까?`)) {
            return;
        }

        startTransition(async () => {
            const res = await activateBaziPromptVersionAction(formConfig);
            if (res.success) {
                showToast(res.message);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    // Delete a saved version
    const handleDeleteVersion = (versionId: string) => {
        if (!confirm(`[${versionId}] 버전을 저장 목록에서 삭제하시겠습니까?`)) {
            return;
        }

        startTransition(async () => {
            const res = await deleteBaziPromptVersionAction(versionId);
            if (res.success) {
                if (res.versions) setVersionsList(res.versions);
                if (selectedVersionId === versionId) setSelectedVersionId('current');
                if (loadedVersionId === versionId) {
                    setLoadedVersionId('current');
                    setFormConfig(config);
                }
                showToast(res.message);
                router.refresh();
            } else {
                alert(res.message);
            }
        });
    };

    const handleInsertVariable = (item: BaziPromptVariableDefinition) => {
        const tag = `{{${item.key}}}`;
        const textarea = activeTextareaRef.current;

        if (textarea && document.body.contains(textarea)) {
            const start = textarea.selectionStart ?? textarea.value.length;
            const end = textarea.selectionEnd ?? textarea.value.length;
            const currentVal = textarea.value;
            const nextVal = currentVal.substring(0, start) + tag + currentVal.substring(end);

            const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
            nativeSetter?.call(textarea, nextVal);
            textarea.dispatchEvent(new Event('input', { bubbles: true }));

            textarea.focus();
            setTimeout(() => {
                textarea.setSelectionRange(start + tag.length, start + tag.length);
            }, 0);

            setCopiedKey(item.key);
            showToast(`${tag} 커서 위치에 삽입되었습니다.`);
        } else {
            navigator.clipboard.writeText(tag);
            setCopiedKey(item.key);
            showToast(`${tag} 클립보드에 복사되었습니다.`);
        }

        setTimeout(() => setCopiedKey(null), 1500);
    };

    const filteredVariables = BAZI_PROMPT_VARIABLES.filter((item) => {
        const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
        const matchesSearch =
            !searchKeyword ||
            item.key.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            item.label.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            item.description.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderPreviewContent = (template: string, isFinalize = false) => {
        const sampleContext = getSampleBaziPromptContext();
        const extra: Record<string, string> = {};
        if (isFinalize) {
            extra.stepResults = [
                '【원국 구조 분석 결과】\n일간 甲목이 월령 戌토의 재성 기운과 시지 未토의 지지를 바탕으로 현실적인 실리 추구와 추진력을 갖추고 있습니다.',
                '【성향 및 관계 분석 결과】\n홍염살과 괴강살이 공존하여 다정한 친화력과 대담한 결단력을 동시에 보유하고 있습니다.',
                '【적성 및 진로 분석 결과】\n주통빈(주➔빈) 구조로, 독자적인 전문성과 성과형 프로젝트 환경에서 역량이 극대화됩니다.',
            ].join('\n\n');
        } else {
            extra.previousStepResults = '이전 단계의 분석 내용이 여기에 순차적으로 누적됩니다.';
        }

        return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
            if (extra[key] !== undefined) return extra[key];
            if (sampleContext[key] !== undefined) return sampleContext[key];
            return `[⚠️ {{${key}}}: 정의되지 않은 변수]`;
        });
    };

    return (
        <form onSubmit={(e) => e.preventDefault()} className="mb-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Version Management Bar */}
            <div className="mb-6 rounded-xl border border-stone-200 bg-gradient-to-r from-stone-50 via-white to-amber-50/30 p-4 shadow-2xs">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                            <GitBranch className="h-4 w-4 text-amber-600" />
                            <span>버전 관리 & 프리셋:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedVersionId}
                                onChange={(e) => setSelectedVersionId(e.target.value)}
                                className="h-9 min-w-[220px] rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-2xs outline-none focus:border-amber-500"
                            >
                                <option value="current">
                                    ● [현재 운영 버전] {config.version || 'v1.0'}
                                </option>
                                <option value="default">
                                    ★ [기본 권장 템플릿] 초기값
                                </option>
                                {versionsList.length > 0 && (
                                    <optgroup label="저장된 버전 스냅샷">
                                        {versionsList.map((ver) => (
                                            <option key={ver.id} value={ver.id}>
                                                {ver.version} - {ver.name} ({ver.updatedAt.slice(0, 10)})
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                            <button
                                type="button"
                                onClick={handleLoadVersion}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 transition-colors"
                            >
                                <Download className="h-3.5 w-3.5 text-stone-500" />
                                <span>불러오기</span>
                            </button>
                            {selectedVersionId !== 'current' && selectedVersionId !== 'default' && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteVersion(selectedVersionId)}
                                    title="선택된 버전 삭제"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {loadedVersionId !== 'current' && loadedVersionId !== 'default' && (
                            <button
                                type="button"
                                onClick={handleSaveCurrentWorkingVersion}
                                disabled={isPendingTransition}
                                title={`수정된 내용을 [${loadedVersionId}] 버전 스냅샷에 덮어쓰기 저장합니다`}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-800 px-3 text-xs font-bold text-white shadow-2xs hover:bg-stone-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="h-3.5 w-3.5" />
                                <span>[{loadedVersionId}] 버전에 저장</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleOpenSaveModal}
                            disabled={isPendingTransition}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                            <Bookmark className="h-3.5 w-3.5 text-amber-600" />
                            <span>새 버전으로 저장</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleActivateCurrentConfig}
                            disabled={isPendingTransition}
                            title="현재 폼의 설정을 실제 서비스(운영 환경)에 즉시 적용합니다"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>서비스 적용</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Header & Controls */}
            <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-stone-400">Prompt Pipeline & Variables</p>
                        {loadedVersionId === 'current' ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                현재 운영 서비스 설정 편집 중
                            </span>
                        ) : loadedVersionId === 'default' ? (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                                ★ 기본 권장 템플릿 (읽기 전용)
                            </span>
                        ) : (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                ✎ [{formConfig.version || loadedVersionId}] {currentVersionName ? `• ${currentVersionName}` : ''} 편집 중
                            </span>
                        )}
                    </div>
                    <h3 className="mt-1 text-xl font-bold text-stone-700">만세력 무료상담 프롬프트 설정</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                        여러 분석 단계(DeepSeek)의 결과를 모은 뒤 최종 통합 편집 단계(Gemini)에서 하나의 완성도 높은 상담문으로 통합합니다.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        disabled={isPendingTransition}
                        onClick={() => {
                            if (confirm('기본 권장 설정으로 되돌리시겠습니까? 현재 작성 중인 변경사항이 초기화됩니다.')) {
                                setFormConfig(defaultConfig);
                                setLoadedVersionId('default');
                                showToast('기본 권장 설정으로 복원되었습니다.');
                            }
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        기본값 복원
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveCurrentWorkingVersion}
                        disabled={isPendingTransition}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-800 px-3.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-stone-700 disabled:opacity-50"
                    >
                        <Save className="h-3.5 w-3.5" />
                        <span>
                            {loadedVersionId === 'current'
                                ? '운영 설정 저장'
                                : loadedVersionId === 'default'
                                ? '새 버전으로 저장'
                                : `[${loadedVersionId}] 버전에 저장`}
                        </span>
                    </button>
                </div>
            </div>

            {/* Variable Palette (Interactive Click-to-Insert) */}
            <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50/70 p-4 transition-all">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                            <Code className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-stone-800">사주 데이터 변수 팔레트 (Click-to-Insert)</h4>
                            <p className="text-xs text-stone-500">
                                텍스트 입력창을 클릭한 뒤 아래 변수 칩을 클릭하면 커서 위치에 즉시 삽입됩니다.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-2xs hover:bg-stone-50 hover:text-stone-900 transition-colors"
                    >
                        {isPaletteOpen ? (
                            <>
                                <span>팔레트 접기</span>
                                <ChevronUp className="h-3.5 w-3.5 text-stone-400" />
                            </>
                        ) : (
                            <>
                                <span>변수 목록 펼치기 ({BAZI_PROMPT_VARIABLES.length}개)</span>
                                <ChevronDown className="h-3.5 w-3.5 text-amber-600" />
                            </>
                        )}
                    </button>
                </div>

                {isPaletteOpen && (
                    <div className="mt-4 border-t border-stone-200/60 pt-3">
                        {/* Categories and search */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
                                {CATEGORIES.map((cat) => {
                                    const count =
                                        cat === '전체'
                                            ? BAZI_PROMPT_VARIABLES.length
                                            : BAZI_PROMPT_VARIABLES.filter((v) => v.category === cat).length;
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                                                selectedCategory === cat
                                                    ? 'bg-stone-800 text-white shadow-2xs'
                                                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100'
                                            }`}
                                        >
                                            {cat} <span className="opacity-70 text-[10px]">({count})</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="relative min-w-[200px]">
                                <input
                                    type="text"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    placeholder="변수명/설명 검색..."
                                    className="w-full rounded-lg border border-stone-200 bg-white py-1 pl-8 pr-3 text-xs text-stone-700 outline-none focus:border-stone-400"
                                />
                                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                                {searchKeyword && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchKeyword('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Chips list */}
                        <div className="mt-3.5 flex flex-wrap gap-2">
                            {filteredVariables.map((item) => {
                                const isCopied = copiedKey === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => handleInsertVariable(item)}
                                        title={`${item.category} • ${item.description}\n예시: ${item.example}`}
                                        className="group relative inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs transition-all hover:border-amber-300 hover:bg-amber-50/70 hover:shadow-xs active:scale-95"
                                    >
                                        <code className="font-mono font-bold text-amber-700 group-hover:text-amber-900">
                                            {`{{${item.key}}}`}
                                        </code>
                                        <span className="text-stone-500 text-[11px] font-medium border-l border-stone-200 pl-1.5">
                                            {item.label}
                                        </span>
                                        {isCopied ? (
                                            <Check className="h-3 w-3 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-3 w-3 opacity-0 group-hover:opacity-60 text-stone-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Pipeline Meta Configuration */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextInput
                    label="버전 코드 (태그)"
                    value={formConfig.version}
                    placeholder="예: v1.1"
                    onChange={(value) => setFormConfig((current) => ({ ...current, version: value }))}
                />
                <TextInput
                    label="버전 이름 (별칭)"
                    value={currentVersionName}
                    placeholder="예: DeepSeek + Gemini 윤문"
                    onChange={setCurrentVersionName}
                />
                <div>
                    <TextInput
                        label="분석 기본 모델 (DeepSeek)"
                        value={formConfig.model}
                        onChange={(value) => setFormConfig((current) => ({ ...current, model: value }))}
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {['deepseek-v4-pro', 'deepseek-flash'].map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setFormConfig((current) => ({ ...current, model: m }))}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                                    formConfig.model === m
                                        ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <label className="block">
                    <span className="mb-2 block text-sm font-bold text-stone-500">실행 방식</span>
                    <select
                        value={formConfig.executionMode}
                        onChange={(event) =>
                            setFormConfig((current) => ({
                                ...current,
                                executionMode: event.target.value === 'sequential' ? 'sequential' : 'parallel',
                            }))
                        }
                        className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                    >
                        <option value="parallel">병렬 실행 (권장: 빠른 속도)</option>
                        <option value="sequential">순차 실행 (이전 단계 누적)</option>
                    </select>
                </label>
            </div>

            {/* Step Analysis Pipelines */}
            <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <h4 className="text-base font-bold text-stone-700 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-stone-500" />
                        <span>개별 분석 단계 (총 {formConfig.steps.length}단계)</span>
                    </h4>
                    <span className="text-xs text-stone-400">병렬 또는 순차로 DeepSeek이 실행합니다.</span>
                </div>

                {formConfig.steps.map((step, index) => (
                    <section key={step.key} className="rounded-lg border border-stone-100 bg-stone-50/60 p-4 transition-colors">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                                <TextInput
                                    label="단계 키"
                                    value={step.key}
                                    onChange={(value) => updateStep(index, { key: value })}
                                />
                                <TextInput
                                    label="단계 이름"
                                    value={step.label}
                                    onChange={(value) => updateStep(index, { label: value })}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPreviewTarget({ type: 'step', index })}
                                    className="inline-flex items-center gap-1 rounded border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                                >
                                    <Eye className="h-3.5 w-3.5 text-stone-500" />
                                    미리보기
                                </button>
                                <label className="inline-flex items-center gap-2 text-sm font-bold text-stone-600">
                                    <input
                                        type="checkbox"
                                        checked={step.enabled}
                                        onChange={(event) => updateStep(index, { enabled: event.target.checked })}
                                        className="h-4 w-4 rounded border-stone-300"
                                    />
                                    사용
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                            <Textarea
                                label="System Prompt"
                                value={step.systemPrompt}
                                rows={7}
                                onFocusRef={activeTextareaRef}
                                onChange={(value) => updateStep(index, { systemPrompt: value })}
                            />
                            <Textarea
                                label="User Prompt Template"
                                value={step.userPromptTemplate}
                                rows={7}
                                onFocusRef={activeTextareaRef}
                                onChange={(value) => updateStep(index, { userPromptTemplate: value })}
                            />
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <NumberInput
                                label="Temperature"
                                value={step.temperature}
                                step="0.05"
                                min="0"
                                max="2"
                                onChange={(value) => updateStep(index, { temperature: value })}
                            />
                            <NumberInput
                                label="Max Tokens"
                                value={step.maxTokens}
                                step="100"
                                min="256"
                                max="8000"
                                onChange={(value) => updateStep(index, { maxTokens: value })}
                            />
                        </div>
                    </section>
                ))}
            </div>

            {/* Final Integration Step */}
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50/30 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-3">
                    <div>
                        <h4 className="text-base font-bold text-stone-800 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            <span>최종 통합 편집 단계 (Finalize)</span>
                        </h4>
                        <p className="mt-1 text-xs text-stone-500">
                            모든 분석 단계의 결과를 `{'{{stepResults}}'}` 변수로 취합하여 최종 사용자에게 전달할 완성된 상담문으로 가공합니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setPreviewTarget({ type: 'finalize' })}
                        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100"
                    >
                        <Eye className="h-3.5 w-3.5 text-amber-600" />
                        최종 프롬프트 미리보기
                    </button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Textarea
                        label="Finalize System Prompt"
                        value={formConfig.finalize.systemPrompt}
                        rows={8}
                        onFocusRef={activeTextareaRef}
                        onChange={(value) =>
                            setFormConfig((current) => ({
                                ...current,
                                finalize: { ...current.finalize, systemPrompt: value },
                            }))
                        }
                    />
                    <Textarea
                        label="Finalize User Prompt Template"
                        value={formConfig.finalize.userPromptTemplate}
                        rows={8}
                        onFocusRef={activeTextareaRef}
                        onChange={(value) =>
                            setFormConfig((current) => ({
                                ...current,
                                finalize: { ...current.finalize, userPromptTemplate: value },
                            }))
                        }
                    />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block">
                        <span className="mb-2 block text-sm font-bold text-stone-600">정리 AI 제공자</span>
                        <select
                            value={formConfig.finalize.provider || 'gemini'}
                            onChange={(event) =>
                                setFormConfig((current) => ({
                                    ...current,
                                    finalize: {
                                        ...current.finalize,
                                        provider: event.target.value as 'gemini' | 'deepseek',
                                        model: event.target.value === 'deepseek' ? 'deepseek-v4-pro' : 'gemini-2.5-flash',
                                    },
                                }))
                            }
                            className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                        >
                            <option value="gemini">Google Gemini (권장: 빠른 속도/문장력)</option>
                            <option value="deepseek">DeepSeek</option>
                        </select>
                    </label>
                    <div>
                        <TextInput
                            label="정리 모델명 (Model)"
                            value={formConfig.finalize.model || (formConfig.finalize.provider === 'deepseek' ? 'deepseek-v4-pro' : 'gemini-2.5-flash')}
                            onChange={(value) =>
                                setFormConfig((current) => ({
                                    ...current,
                                    finalize: { ...current.finalize, model: value },
                                }))
                            }
                        />
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {(formConfig.finalize.provider === 'deepseek'
                                ? ['deepseek-v4-pro', 'deepseek-flash']
                                : ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
                            ).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() =>
                                        setFormConfig((current) => ({
                                            ...current,
                                            finalize: { ...current.finalize, model: m },
                                        }))
                                    }
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                                        (formConfig.finalize.model || (formConfig.finalize.provider === 'deepseek' ? 'deepseek-v4-pro' : 'gemini-2.5-flash')) === m
                                            ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <NumberInput
                        label="Temperature"
                        value={formConfig.finalize.temperature}
                        step="0.05"
                        min="0"
                        max="2"
                        onChange={(value) =>
                            setFormConfig((current) => ({
                                ...current,
                                finalize: { ...current.finalize, temperature: value },
                            }))
                        }
                    />
                    <NumberInput
                        label="Max Tokens"
                        value={formConfig.finalize.maxTokens}
                        step="100"
                        min="256"
                        max="8000"
                        onChange={(value) =>
                            setFormConfig((current) => ({
                                ...current,
                                finalize: { ...current.finalize, maxTokens: value },
                            }))
                        }
                    />
                </div>
            </section>

            {/* Bottom Actions Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">
                        현재 작업 대상:
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                        {loadedVersionId === 'current'
                            ? '● 현재 운영 서비스 설정'
                            : loadedVersionId === 'default'
                            ? '★ 기본 권장 템플릿'
                            : `✎ [${loadedVersionId}] 버전 스냅샷`}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSaveCurrentWorkingVersion}
                        disabled={isPendingTransition}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-stone-800 px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-stone-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-3.5 w-3.5" />
                        <span>
                            {loadedVersionId === 'current'
                                ? '운영 설정 저장'
                                : loadedVersionId === 'default'
                                ? '새 버전으로 저장'
                                : `[${loadedVersionId}] 버전에 저장`}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={handleOpenSaveModal}
                        disabled={isPendingTransition}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                        <Bookmark className="h-3.5 w-3.5 text-amber-600" />
                        <span>새 버전으로 저장</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleActivateCurrentConfig}
                        disabled={isPendingTransition}
                        title="현재 폼의 설정을 실제 서비스(운영 환경)에 즉시 적용합니다"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>서비스 적용</span>
                    </button>
                </div>
            </div>

            {/* Save As New Version Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl p-6 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                                <Bookmark className="h-5 w-5 text-amber-600" />
                                <span>새 파이프라인 버전으로 저장</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsSaveModalOpen(false)}
                                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <TextInput
                                label="버전 코드 (식별자)"
                                value={newVersionTag}
                                onChange={setNewVersionTag}
                            />
                            <TextInput
                                label="버전 이름 (별칭)"
                                value={newVersionName}
                                onChange={setNewVersionName}
                            />
                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-stone-600">설명 / 변경 메모 (선택)</span>
                                <textarea
                                    value={newVersionDesc}
                                    onChange={(e) => setNewVersionDesc(e.target.value)}
                                    rows={3}
                                    placeholder="예: 성향 분석 프롬프트에 신살 변수 보강 및 Gemini 정리 모델 적용"
                                    className="w-full rounded-md border border-stone-200 bg-white p-3 text-xs text-stone-700 outline-none focus:border-stone-400"
                                />
                            </label>

                            <label className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs font-semibold text-stone-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activateOnSave}
                                    onChange={(e) => setActivateOnSave(e.target.checked)}
                                    className="h-4 w-4 rounded border-stone-300 text-amber-600"
                                />
                                <span>저장 후 즉시 실제 서비스(운영 환경)에 활성화 적용</span>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-stone-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsSaveModalOpen(false)}
                                className="rounded-md border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSaveVersion}
                                disabled={isPendingTransition}
                                className="rounded-md bg-stone-800 px-4 py-2 text-xs font-bold text-white hover:bg-stone-700 disabled:opacity-50"
                            >
                                {isPendingTransition ? '저장 중...' : '버전 저장하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Prompt Preview Modal */}
            {previewTarget !== 'none' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
                    <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-stone-200 p-4">
                            <div>
                                <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-amber-600" />
                                    <span>
                                        {previewTarget.type === 'finalize'
                                            ? '최종 통합 편집 프롬프트 실시간 렌더링 미리보기'
                                            : `[${formConfig.steps[previewTarget.index]?.label || '단계'}] 프롬프트 렌더링 미리보기`}
                                    </span>
                                </h3>
                                <p className="text-xs text-stone-400 mt-0.5">
                                    실제 샘플 사주 데이터(1990년생 남성 명식)를 대입하여 AI에게 전송될 최종 텍스트를 미리 점검합니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewTarget('none')}
                                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
                            <div>
                                <span className="block font-bold text-stone-600 mb-1.5 uppercase tracking-wide">
                                    [System Prompt]
                                </span>
                                <div className="rounded-lg border border-stone-200 bg-stone-50 p-3.5 whitespace-pre-wrap text-stone-700 leading-relaxed font-sans">
                                    {previewTarget.type === 'finalize'
                                        ? formConfig.finalize.systemPrompt
                                        : formConfig.steps[previewTarget.index]?.systemPrompt}
                                </div>
                            </div>

                            <div>
                                <span className="block font-bold text-stone-600 mb-1.5 uppercase tracking-wide">
                                    [Rendered User Prompt] (변수 치환 결과)
                                </span>
                                <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-4 whitespace-pre-wrap text-stone-800 leading-relaxed font-sans">
                                    {renderPreviewContent(
                                        previewTarget.type === 'finalize'
                                            ? formConfig.finalize.userPromptTemplate
                                            : formConfig.steps[previewTarget.index]?.userPromptTemplate,
                                        previewTarget.type === 'finalize'
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-stone-200 p-3.5 bg-stone-50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setPreviewTarget('none')}
                                className="rounded-md bg-stone-800 px-4 py-2 text-xs font-bold text-white hover:bg-stone-700"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );

    function updateStep(index: number, values: Partial<BaziPromptPipelineConfig['steps'][number]>) {
        setFormConfig((current) => ({
            ...current,
            steps: current.steps.map((step, stepIndex) => (stepIndex === index ? { ...step, ...values } : step)),
        }));
    }
}

function TextInput({
    label,
    value,
    placeholder,
    onChange,
}: {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <input
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}

function NumberInput({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min: string;
    max: string;
    step: string;
    onChange: (value: number) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}

function Textarea({
    label,
    value,
    rows,
    onFocusRef,
    onChange,
}: {
    label: string;
    value: string;
    rows: number;
    onFocusRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold text-stone-500">{label}</span>
            <textarea
                value={value}
                rows={rows}
                onFocus={(e) => {
                    if (onFocusRef) onFocusRef.current = e.target;
                }}
                onChange={(event) => onChange(event.target.value)}
                className="w-full resize-y rounded-md border border-stone-200 bg-white px-3 py-3 font-mono text-xs leading-6 text-stone-700 outline-none transition focus:border-stone-400"
            />
        </label>
    );
}
