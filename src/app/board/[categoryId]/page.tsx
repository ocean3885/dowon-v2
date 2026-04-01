import { redirect } from 'next/navigation';

export default async function CategoryPage(
    { params, searchParams }: {
        params: Promise<{ categoryId: string }>,
        searchParams: Promise<{ page?: string }>
    }
) {
    const { categoryId } = await params;
    const { page } = await searchParams;

    const targetPage = Math.max(1, parseInt(page || '1', 10) || 1);
    const query = new URLSearchParams({ categoryId });

    if (targetPage > 1) {
        query.set('page', String(targetPage));
    }

    redirect(`/board?${query.toString()}`);
}
