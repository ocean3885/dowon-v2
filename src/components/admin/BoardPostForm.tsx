'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function BoardPostForm({ categories, mode, post }: BoardPostFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        categoryId: post?.categoryId ? String(post.categoryId) : categories[0] ? String(categories[0].id) : '',
        title: post?.title || '',
        content: post?.content || '',
        author: post?.author || '관리자',
        imageUrl: post?.imageUrl || '',
        thumbnailUrl: post?.thumbnailUrl || '',
    });

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
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = formData.imageUrl;
            let thumbnailUrl = formData.thumbnailUrl;

            if (file) {
                const uploadData = new FormData();
                uploadData.append('file', file);

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

            const endpoint = mode === 'edit' && post ? `/api/posts/${post.id}` : '/api/posts';
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: formData.categoryId,
                    title: formData.title,
                    content: formData.content,
                    author: formData.author,
                    imageUrl,
                    thumbnailUrl,
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

            <div className="mb-6">
                <label className="block text-sm font-bold text-stone-700 mb-2">대표 이미지</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                />
                {formData.imageUrl && !file && (
                    <p className="mt-2 text-xs text-stone-500">현재 이미지가 유지됩니다.</p>
                )}
            </div>

            {/* 본문 중간 삽입용 이미지 추가 기능 */}
            <div className="mb-6 p-5 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex justify-between items-center mb-4 border-b border-stone-200 pb-3">
                    <div>
                        <label className="block text-base font-bold text-stone-800">본문 삽입용 추가 이미지 다중 업로더</label>
                        <p className="text-xs text-stone-500 mt-1">파일 추가 후 일괄 업로드하고 주소를 복사하여 내용에 HTML로 첨부하세요.</p>
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
                                        title="클릭하여 복사" 
                                    />
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
                            " + 파일 첨부 추가 " 를 눌러 원하는 만큼의 이미지를 등록할 수 있습니다.
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

            <div className="mb-8">
                <label className="block text-sm font-bold text-stone-700 mb-2">내용</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={15}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-serif"
                    required
                ></textarea>
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