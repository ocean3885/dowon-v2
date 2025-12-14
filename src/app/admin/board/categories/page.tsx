'use client';

import { useState, useEffect } from 'react';

export default function CategoryManagePage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', displayOrder: 0, postLimit: 5 });

    const fetchCategories = () => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(setCategories);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleUpdate = async (id: number, field: string, value: any) => {
        await fetch('/api/categories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, [field]: value })
        });
        fetchCategories();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory)
            });
            setNewCategory({ name: '', displayOrder: 0, postLimit: 5 });
            fetchCategories();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-stone-800 mb-6">카테고리 관리</h2>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 mb-8">
                <h3 className="text-lg font-bold text-stone-700 mb-4">새 카테고리 추가</h3>
                <form onSubmit={handleCreate} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-stone-600 mb-1">카테고리명</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded"
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-sm text-stone-600 mb-1">순서</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border rounded"
                            value={newCategory.displayOrder}
                            onChange={e => setNewCategory({ ...newCategory, displayOrder: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="w-24">
                        <label className="block text-sm text-stone-600 mb-1">노출수</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border rounded"
                            value={newCategory.postLimit}
                            onChange={e => setNewCategory({ ...newCategory, postLimit: parseInt(e.target.value) })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-stone-800 text-white rounded font-bold hover:bg-stone-700"
                    >
                        추가
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-stone-500">ID</th>
                            <th className="px-6 py-3 text-sm font-medium text-stone-500">카테고리명</th>
                            <th className="px-6 py-3 text-sm font-medium text-stone-500">순서 (낮은순)</th>
                            <th className="px-6 py-3 text-sm font-medium text-stone-500">메인 노출 수</th>
                            <th className="px-6 py-3 text-sm font-medium text-stone-500 text-right">상태</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {categories.map((cat) => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 text-stone-500">{cat.id}</td>
                                <td className="px-6 py-4 font-medium text-stone-800">
                                    <input
                                        type="text"
                                        value={cat.name}
                                        className="w-full px-2 py-1 border rounded text-sm bg-transparent focus:bg-white transition-colors"
                                        onChange={(e) => {
                                            const newCategories = categories.map(c =>
                                                c.id === cat.id ? { ...c, name: e.target.value } : c
                                            );
                                            setCategories(newCategories);
                                        }}
                                        onBlur={(e) => handleUpdate(cat.id, 'name', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={cat.displayOrder}
                                        className="w-20 px-2 py-1 border rounded text-sm"
                                        onChange={(e) => {
                                            const newCategories = categories.map(c =>
                                                c.id === cat.id ? { ...c, displayOrder: parseInt(e.target.value) } : c
                                            );
                                            setCategories(newCategories);
                                        }}
                                        onBlur={(e) => handleUpdate(cat.id, 'displayOrder', parseInt(e.target.value))}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={cat.postLimit}
                                        className="w-20 px-2 py-1 border rounded text-sm"
                                        onChange={(e) => {
                                            const newCategories = categories.map(c =>
                                                c.id === cat.id ? { ...c, postLimit: parseInt(e.target.value) } : c
                                            );
                                            setCategories(newCategories);
                                        }}
                                        onBlur={(e) => handleUpdate(cat.id, 'postLimit', parseInt(e.target.value))}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleUpdate(cat.id, 'isActive', cat.isActive ? 0 : 1)}
                                            className={`px-3 py-1 rounded text-xs font-bold ${cat.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-stone-100 text-stone-500'
                                                }`}
                                        >
                                            {cat.isActive ? '사용중' : '사용안함'}
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('정말 삭제하시겠습니까? 게시글이 있는 카테고리는 삭제할 수 없습니다.')) return;
                                                const res = await fetch('/api/categories', {
                                                    method: 'DELETE',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ id: cat.id })
                                                });
                                                if (!res.ok) {
                                                    const data = await res.json();
                                                    alert(data.error || '삭제 실패');
                                                } else {
                                                    fetchCategories();
                                                }
                                            }}
                                            className="px-3 py-1 rounded text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
