'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatContentToHtml } from '@/lib/contentFormatter';

type Category = {
    id: number;
    name: string;
};

type BoardPost = {
    id: number;
    categoryId: number | null;
    title: string;
    content: string;
    author: string | null;
    imageUrl: string | null;
    thumbnailUrl: string | null;
};

type BoardPostFormProps = {
    categories: Category[];
    mode: 'create' | 'edit';
    post?: BoardPost;
};

const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const resizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(resizedFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.85);
                } else {
                    resolve(file);
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

function extractImageUrls(content: string): string[] {
    if (!content) return [];
    const urls = new Set<string>();

    const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        if (match[1]) urls.add(match[1]);
    }

    const mdRegex = /!\[.*?\]\((https?:\/\/[^\s)]+|\/uploads\/[^\s)]+)\)/g;
    while ((match = mdRegex.exec(content)) !== null) {
        if (match[1]) urls.add(match[1]);
    }

    return Array.from(urls);
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function BoardPostForm({ categories, mode, post }: BoardPostFormProps) {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const [file, setFile] = useState<File | null>(null);
    const [deleteMainImage, setDeleteMainImage] = useState(false);
    const [existingAttachedImages, setExistingAttachedImages] = useState<{ url: string; isDeleted: boolean }[]>(() => {
        if (!post?.content) return [];
        const urls = extractImageUrls(post.content);
        return urls
            .filter((url) => url !== post.imageUrl && url !== post.thumbnailUrl)
            .map((url) => ({ url, isDeleted: false }));
    });
    const [formData, setFormData] = useState({
        categoryId: post?.categoryId ? String(post.categoryId) : categories[0] ? String(categories[0].id) : '',
        title: post?.title || '',
        content: post?.content || '',
        author: post?.author || '관리자',
        imageUrl: post?.imageUrl || '',
        thumbnailUrl: post?.thumbnailUrl || '',
    });

    const insertAtCursor = (prefix: string, suffix: string = '', placeholder: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setFormData(prev => ({ ...prev, content: prev.content + prefix + placeholder + suffix }));
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end) || placeholder;

        const replacement = prefix + selectedText + suffix;
        const newContent = formData.content.substring(0, start) + replacement + formData.content.substring(end);

        setFormData(prev => ({ ...prev, content: newContent }));

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + prefix.length + selectedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const insertImageAtCursor = (imageUrl: string) => {
        insertAtCursor(`\n\n![이미지](${imageUrl})\n\n`);
        setActiveTab('write');
    };

    const [extraImageFiles, setExtraImageFiles] = useState<{ id: string; file: File | null; url: string | null; uploading: boolean }[]>([]);

    const handleAddExtraImageRow = () => {
        setExtraImageFiles(prev => [...prev, { id: crypto.randomUUID(), file: null, url: null, uploading: false }]);
    };

    const handleRemoveExtraImageRow = (id: string) => {
        setExtraImageFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleExtraImageFileChange = (id: string, file: File | null) => {
        setExtraImageFiles(prev => prev.map(f => f.id === id ? { ...f, file, url: null } : f));
    };

    const handleUploadExtraImages = async () => {
        const toUpload = extraImageFiles.filter(f => f.file && !f.url);
        if(toUpload.length === 0) {
            alert("업로드할 새 이미지가 없습니다. (파일을 먼저 선택해주세요)");
            return;
        }

        const newExtraImages = [...extraImageFiles];

        for (let index = 0; index < newExtraImages.length; index++) {
            const item = newExtraImages[index];
            if (item.file && !item.url) {
                newExtraImages[index] = { ...item, uploading: true };
                setExtraImageFiles([...newExtraImages]);

                try {
                    const resizedFile = await resizeImage(item.file, 800);
                    const uploadData = new FormData();
                    uploadData.append('file', resizedFile);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: uploadData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        newExtraImages[index] = { ...item, url: result.url, uploading: false };
                    } else {
                        newExtraImages[index] = { ...item, uploading: false };
                        alert("이미지 업로드 중 실패가 발생했습니다.");
                    }
                } catch (error) {
                    newExtraImages[index] = { ...item, uploading: false };
                    console.error(error);
                    alert("이미지 처리 및 업로드 에러가 발생했습니다.");
                }
                setExtraImageFiles([...newExtraImages]);
            }
        }

        // 업로드 전체 완료 후, 성공한 url들만 모아서 자동으로 클립보드에 복사해줍니다.
        const completedUrls = newExtraImages.filter(f => f.url);
        if (completedUrls.length > 0) {
            const textToCopy = completedUrls.map((f, i) => `이미지 ${i + 1}: ${f.url}`).join('\n');
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert("선택한 이미지 업로드가 완료되었으며, 주소가 자동으로 복사되었습니다!");
            } catch (err) {
                alert("업로드는 완료되었으나 자동 복사에 실패했습니다. 복사 버튼을 직접 눌러주세요.");
            }
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('복사되었습니다.');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('복사 실패');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setDeleteMainImage(false);
        }
    };

    const handleCancelNewFile = () => {
        setFile(null);
    };

    const handleDeleteMainImage = () => {
        setDeleteMainImage(true);
        setFile(null);
    };

    const handleRestoreMainImage = () => {
        setDeleteMainImage(false);
    };

    const handleDeleteExistingAttachedImage = (targetUrl: string) => {
        if (!confirm('이 이미지를 삭제 목록에 추가하시겠습니까?\n본문 텍스트에 포함된 이미지 태그도 함께 제거됩니다.')) {
            return;
        }

        const escaped = escapeRegex(targetUrl);
        const mdPattern = new RegExp(`!\\[.*?\\]\\(${escaped}\\)`, 'g');
        const htmlPattern = new RegExp(`<p>\\s*<img[^>]+src=["']${escaped}["'][^>]*>\\s*<\\/p>|<img[^>]+src=["']${escaped}["'][^>]*>`, 'g');

        setFormData((prev) => ({
            ...prev,
            content: prev.content.replace(mdPattern, '').replace(htmlPattern, '').trim(),
        }));

        setExistingAttachedImages((prev) =>
            prev.map((item) => (item.url === targetUrl ? { ...item, isDeleted: true } : item))
        );
    };

    const handleRestoreExistingAttachedImage = (targetUrl: string) => {
        setExistingAttachedImages((prev) =>
            prev.map((item) => (item.url === targetUrl ? { ...item, isDeleted: false } : item))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.imageUrl;
            let thumbnailUrl = formData.thumbnailUrl;

            if (file) {
                let fileToUpload = file;
                try {
                    fileToUpload = await resizeImage(file, 1200);
                } catch (resizeErr) {
                    console.warn('대표이미지 리사이징 실패, 원본 사용:', resizeErr);
                }

                const uploadData = new FormData();
                uploadData.append('file', fileToUpload);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed');
                }

                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
                thumbnailUrl = uploadResult.thumbnailUrl;
            }

            const deletedImageUrls = existingAttachedImages
                .filter((item) => item.isDeleted)
                .map((item) => item.url);

            const endpoint = mode === 'edit' && post ? `/api/posts/${post.id}` : '/api/posts';
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const formattedContent = formatContentToHtml(formData.content);

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: formData.categoryId,
                    title: formData.title,
                    content: formattedContent,
                    author: formData.author,
                    imageUrl: deleteMainImage ? null : imageUrl,
                    thumbnailUrl: deleteMainImage ? null : thumbnailUrl,
                    deleteMainImage,
                    deletedImageUrls,
                }),
            });

            if (!response.ok) {
                throw new Error(mode === 'edit' ? 'Post update failed' : 'Post creation failed');
            }

            alert(mode === 'edit' ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
            router.push('/admin/board');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">카테고리</label>
                    <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        required
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">작성자</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 mb-2">제목</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                />
            </div>

            {/* 대표 이미지 섹션 */}
            <div className="mb-6 p-5 rounded-xl border border-stone-200 bg-stone-50">
                <label className="block text-sm font-bold text-stone-800 mb-3">대표 이미지 (썸네일)</label>

                {/* 1. 기존 대표 이미지가 등록되어 있는 경우 */}
                {post?.imageUrl && (
                    <div className="mb-4 bg-white p-3.5 rounded-lg border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={post.thumbnailUrl || post.imageUrl}
                                alt="기존 대표 이미지"
                                className={`w-16 h-16 rounded-md object-cover border shrink-0 transition-all ${
                                    deleteMainImage ? 'opacity-30 grayscale border-red-300' : 'border-stone-200'
                                }`}
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-stone-700">기존 등록된 대표 이미지</span>
                                    {deleteMainImage ? (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                                            삭제 예정 (저장 시 서버 영구 삭제)
                                        </span>
                                    ) : file ? (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
                                            새 파일로 대체 예정
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                                            현재 유지 중
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs truncate max-w-sm sm:max-w-md mt-1 font-mono ${
                                    deleteMainImage ? 'line-through text-stone-400' : 'text-stone-500'
                                }`}>
                                    {post.imageUrl}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {deleteMainImage ? (
                                <button
                                    type="button"
                                    onClick={handleRestoreMainImage}
                                    className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors"
                                >
                                    삭제 취소 (기존 이미지 유지)
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleDeleteMainImage}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                >
                                    대표 이미지 삭제
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* 2. 새 대표 이미지 파일 업로드 */}
                <div className="space-y-2">
                    <span className="text-xs font-medium text-stone-600 block">
                        {post?.imageUrl ? '새 대표 이미지로 변경하려면 파일을 선택하세요' : '대표 이미지 파일을 선택하세요'}
                    </span>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="flex-1 px-4 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                        />
                        {file && (
                            <button
                                type="button"
                                onClick={handleCancelNewFile}
                                className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors shrink-0"
                            >
                                파일 선택 취소
                            </button>
                        )}
                    </div>
                    {file && (
                        <p className="text-xs text-amber-700 font-medium">
                            선택된 새 파일: <span className="font-bold">{file.name}</span> (저장 시 대표 이미지가 이 파일로 교체됩니다)
                        </p>
                    )}
                </div>
            </div>

            {/* 기존 본문 첨부 이미지 관리 (수정 모드) */}
            {mode === 'edit' && existingAttachedImages.length > 0 && (
                <div className="mb-6 p-5 bg-amber-50/40 border border-amber-200/70 rounded-xl">
                    <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-amber-200/60">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-stone-800">기존 본문 첨부 이미지</h3>
                                <span className="px-2 py-0.5 text-xs font-bold bg-amber-200/70 text-amber-900 rounded-full">
                                    {existingAttachedImages.length}개
                                </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">
                                본문 내용에 포함되어 있던 이미지들입니다. 개별 삭제하거나 본문 커서 위치에 다시 삽입할 수 있습니다.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {existingAttachedImages.map((img) => {
                            const isPresentInContent = formData.content.includes(img.url);

                            return (
                                <div
                                    key={img.url}
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
                                        img.isDeleted
                                            ? 'bg-red-50/70 border-red-200 text-stone-500'
                                            : 'bg-white border-stone-200 shadow-2xs'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt="첨부 이미지"
                                            className={`w-14 h-14 rounded-md object-cover border shrink-0 ${
                                                img.isDeleted ? 'opacity-30 grayscale border-red-200' : 'border-stone-200'
                                            }`}
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                {img.isDeleted ? (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-md">
                                                        삭제 예정 (저장 시 서버 영구 삭제)
                                                    </span>
                                                ) : isPresentInContent ? (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-md">
                                                        본문 사용 중
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-bold bg-stone-100 text-stone-600 rounded-md">
                                                        본문 미포함
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className={`text-xs truncate max-w-sm sm:max-w-md mt-1 font-mono cursor-pointer hover:underline ${
                                                    img.isDeleted ? 'line-through text-stone-400' : 'text-stone-600'
                                                }`}
                                                onClick={() => copyToClipboard(img.url)}
                                                title="클릭하여 주소 복사"
                                            >
                                                {img.url}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {img.isDeleted ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRestoreExistingAttachedImage(img.url)}
                                                className="px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors"
                                            >
                                                삭제 취소
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => insertImageAtCursor(img.url)}
                                                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                                                    title="본문 커서 위치에 이 이미지를 삽입합니다"
                                                >
                                                    + 본문 재삽입
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingAttachedImage(img.url)}
                                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                                                    title="본문에서 제거하고 저장 시 서버 파일도 완전히 삭제합니다"
                                                >
                                                    이미지 삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 본문 중간 삽입용 이미지 추가 기능 */}
            <div className="mb-6 p-5 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-3">
                    <div>
                        <label className="block text-base font-bold text-stone-800">본문 삽입용 추가 이미지 다중 업로더</label>
                        <p className="text-xs text-stone-500 mt-1">파일 추가 후 일괄 업로드하고 [본문 삽입] 버튼을 누르면 커서 위치에 바로 들어갑니다.</p>
                    </div>
                    <button type="button" onClick={handleAddExtraImageRow} className="px-3 py-1.5 bg-stone-200 text-stone-700 rounded-md text-sm hover:bg-stone-300 font-bold transition-colors">
                        + 파일 첨부 추가
                    </button>
                </div>
                <div className="space-y-3 mb-4">
                    {extraImageFiles.map((row) => (
                        <div key={row.id} className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm transition-all">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleExtraImageFileChange(row.id, e.target.files ? e.target.files[0] : null)}
                                className="flex-1 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
                            />
                            {row.uploading && <span className="text-xs text-amber-600 font-bold px-2">최적화 & 업로드 중...</span>}
                            {row.url && (
                                <div className="flex-1 flex items-center gap-2 mt-2 md:mt-0">
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold whitespace-nowrap">업로드 완료</span>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={row.url} 
                                        className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-md bg-stone-50 text-stone-600 focus:outline-none cursor-pointer hover:border-amber-400 focus:border-amber-500 transition-colors" 
                                        onClick={() => copyToClipboard(row.url as string)} 
                                        title="클릭하여 주소 복사" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => insertImageAtCursor(row.url as string)}
                                        className="text-xs whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-2 rounded-md transition-colors shadow-xs flex items-center gap-1"
                                        title="현재 작성 중인 본문에 바로 삽입"
                                    >
                                        <span>+ 본문 삽입</span>
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => copyToClipboard(row.url as string)}
                                        className="text-xs whitespace-nowrap bg-stone-100 px-3 py-2 rounded-md hover:bg-stone-200 text-stone-600 font-medium"
                                    >복사</button>
                                </div>
                            )}
                            <button type="button" onClick={() => handleRemoveExtraImageRow(row.id)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-md text-sm font-bold flex-shrink-0 mt-2 md:mt-0">
                                - 제거
                            </button>
                        </div>
                    ))}
                    {extraImageFiles.length === 0 && (
                        <div className="text-sm text-stone-400 text-center py-6 bg-white border border-stone-200 border-dashed rounded-lg">
                            &quot; + 파일 첨부 추가 &quot; 를 눌러 원하는 만큼의 이미지를 등록할 수 있습니다.
                        </div>
                    )}
                </div>
                {extraImageFiles.length > 0 && (
                    <div className="flex justify-end pt-2">
                        {extraImageFiles.every(f => f.url !== null) ? (
                            <button 
                                type="button" 
                                onClick={() => {
                                    const text = extraImageFiles.map((f, i) => `이미지 ${i + 1}: ${f.url}`).join('\n');
                                    copyToClipboard(text);
                                }} 
                                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                전체 이미지 주소 일괄 복사 완료! (클릭하여 다시 복사)
                            </button>
                        ) : (
                            <button type="button" onClick={handleUploadExtraImages} className="px-5 py-2.5 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-700 transition-colors text-sm shadow-sm">
                                선택된 이미지 모두 업로드 & 주소 발급
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 본문 에디터 (마크다운 간편 입력 + 서식 툴바 + 실시간 미리보기) */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-stone-700">본문 내용</label>
                    <span className="text-xs text-stone-500">
                        마크다운 문법(# 대제목, ## 소제목, **굵게**) 및 HTML 모두 지원
                    </span>
                </div>

                {/* 에디터 툴바 & 탭 */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-stone-100 border border-b-0 border-stone-300 rounded-t-lg">
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n# ', '\n', '대제목')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-200 transition-colors"
                            title="대제목 (#)"
                        >
                            H1 대제목
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n## ', '\n', '소제목')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-200 transition-colors"
                            title="소제목 (##)"
                        >
                            H2 소제목
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n### ', '\n', '소소제목')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-bold rounded border border-stone-200 transition-colors"
                            title="소소제목 (###)"
                        >
                            H3 소소제목
                        </button>
                        <span className="w-px h-4 bg-stone-300 mx-1" />
                        <button
                            type="button"
                            onClick={() => insertAtCursor('**', '**', '굵은 텍스트')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-900 font-bold rounded border border-stone-200 transition-colors"
                            title="굵게 (**텍스트**)"
                        >
                            B 굵게
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n> ', '\n', '인용 문구')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-medium rounded border border-stone-200 transition-colors"
                            title="인용구 (>)"
                        >
                            ” 인용
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n- ', '\n', '목록 내용')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-medium rounded border border-stone-200 transition-colors"
                            title="목록 (-)"
                        >
                            • 목록
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('\n---\n', '')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-medium rounded border border-stone-200 transition-colors"
                            title="구분선 (---)"
                        >
                            — 구분선
                        </button>
                        <button
                            type="button"
                            onClick={() => insertAtCursor('[링크이름](', ')', 'https://')}
                            className="px-2.5 py-1 bg-white hover:bg-stone-200 text-stone-700 font-medium rounded border border-stone-200 transition-colors"
                            title="링크 [이름](URL)"
                        >
                            🔗 링크
                        </button>
                    </div>

                    {/* 작성 모드 vs 실시간 미리보기 탭 전환 */}
                    <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-md text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('write')}
                            className={`px-3 py-1 rounded font-bold transition-all ${
                                activeTab === 'write'
                                    ? 'bg-white text-stone-900 shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            ✏️ 작성 모드
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 rounded font-bold transition-all ${
                                activeTab === 'preview'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            👁️ 실시간 미리보기
                        </button>
                    </div>
                </div>

                {/* 에디터 본문 영역 */}
                {activeTab === 'write' ? (
                    <textarea
                        ref={textareaRef}
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={16}
                        placeholder={`간편하게 작성하세요. 마크다운 스타일과 줄글이 모두 지원됩니다:

# 대제목
내용을 자연스럽게 작성하시면 됩니다. 엔터 2번으로 문단이 나뉩니다.

## 소제목
**굵은 글씨**나 > 인용문도 자유롭게 사용할 수 있습니다.

이미지 주소를 한 줄에 붙여넣거나, 위의 다중 업로더에서 [+ 본문 삽입] 버튼을 누르면 이미지가 바로 들어갑니다.`}
                        className="w-full px-4 py-3 border border-stone-300 rounded-b-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-serif text-stone-800 leading-relaxed text-base"
                        required
                    />
                ) : (
                    <div className="border border-stone-300 rounded-b-lg p-6 bg-stone-50/40 min-h-[420px]">
                        <div className="text-xs font-semibold text-stone-400 mb-4 pb-2 border-b border-stone-200 flex justify-between items-center">
                            <span>실제 사용자 상세 화면 미리보기</span>
                            <span className="text-[11px] text-amber-700 font-normal">※ 폰트, 여백, 스타일이 실제 화면과 동일하게 적용됩니다.</span>
                        </div>
                        <div
                            className="prose prose-lg prose-stone max-w-none font-serif text-stone-700 leading-relaxed
                                prose-headings:font-bold prose-headings:text-stone-900 prose-headings:font-sans
                                prose-p:leading-8 prose-p:mb-6
                                prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700 hover:prose-a:underline
                                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                                prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-stone-600
                                prose-li:marker:text-amber-500
                                prose-strong:text-stone-900 prose-strong:font-bold"
                            dangerouslySetInnerHTML={{
                                __html: formatContentToHtml(formData.content) || '<p class="text-stone-400 italic py-12 text-center">내용을 작성하시면 여기에 실시간 미리보기가 표시됩니다.</p>'
                            }}
                        />
                    </div>
                )}

                {/* 하단 작성 팁 가이드 */}
                <div className="mt-2 text-xs text-stone-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-stone-700">💡 간편 문법 안내:</span>
                    <span><code># 제목</code> (대제목)</span>
                    <span><code>## 제목</code> (소제목)</span>
                    <span><code>### 제목</code> (소소제목)</span>
                    <span><code>**텍스트**</code> (굵게)</span>
                    <span><code>&gt; 내용</code> (인용구)</span>
                    <span><code>- 항목</code> (목록)</span>
                    <span>빈 줄 1개로 문단 구분, 일반 엔터로 줄바꿈 유지</span>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-stone-300 text-stone-600 font-bold rounded-lg hover:bg-stone-50 transition-colors"
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (mode === 'edit' ? '수정 중...' : '등록 중...') : (mode === 'edit' ? '게시글 수정' : '게시글 등록')}
                </button>
            </div>
        </form>
    );
}