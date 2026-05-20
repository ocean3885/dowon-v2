'use client';

import { useRouter } from 'next/navigation';

type Category = {
    id: number;
    name: string;
};

type BoardCategorySelectProps = {
    categories: Category[];
    selectedCategoryId: string | null;
    searchQuery?: string;
};

export default function BoardCategorySelect({ categories, selectedCategoryId, searchQuery = '' }: BoardCategorySelectProps) {
    const router = useRouter();

    function buildCategoryHref(categoryId: string) {
        const params = new URLSearchParams();

        if (categoryId) {
            params.set('categoryId', categoryId);
        }

        if (searchQuery) {
            params.set('search', searchQuery);
        }

        const query = params.toString();
        return query ? `/board?${query}` : '/board';
    }

    return (
        <div className="md:hidden">
            <label htmlFor="board-category" className="mb-2 block text-sm font-semibold text-[#6f6256]">
                카테고리 선택
            </label>
            <select
                id="board-category"
                name="categoryId"
                value={selectedCategoryId || ''}
                onChange={(event) => {
                    const nextCategoryId = event.target.value;
                    router.push(buildCategoryHref(nextCategoryId));
                }}
                className="h-12 w-full rounded-md border border-[#d8c8ae] bg-[#fffaf2] px-3 text-sm font-medium text-[#4f4338] outline-none transition-colors focus:border-[#b7894a] focus:ring-2 focus:ring-[#b7894a]/15"
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
