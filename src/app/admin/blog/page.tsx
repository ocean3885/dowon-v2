import { redirect } from 'next/navigation';
import { getBlogPosts } from '@/lib/actions';
import BlogManagementClient from './BlogManagementClient';

export default async function AdminBlogPage() {
    let posts = [];
    try {
        posts = await getBlogPosts();
    } catch (error) {
        redirect('/login');
    }

    return <BlogManagementClient posts={posts} />;
}
