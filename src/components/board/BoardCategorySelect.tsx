'use client';

import { useRouter } from 'next/navigation';

type Category = {
    id: number;
    name: string;
};

type BoardCategorySelectProps = {
    categories: Category[];
    selectedCategoryId: string | null;
};

export default function BoardCategorySelect({ categories, selectedCategoryId }: BoardCategorySelectProps) {
    const router = useRouter();

    return (
        <div className="mt-5 md:hidden">
            <label htmlFor="board-category" className="mb-2 block text-sm font-medium text-stone-600">
                카테고리 선택
            </label>
            <select
                id="board-category"
                name="categoryId"
                value={selectedCategoryId || ''}
                onChange={(event) => {
                    const nextCategoryId = event.target.value;
                    router.push(nextCategoryId ? `/board?categoryId=${nextCategoryId}` : '/board');
                }}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-500"
            >
                <option value="">전체</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>
        </div>
    );
}