import Link from 'next/link'
// import { getPosts } from '@/lib/posts'

const getPosts = async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts')
    return response.json()
}

export default async function Post({ post }: { post: any }) {
    const posts = await getPosts()

    return (
        <ul> 
            {posts.map((post: { slug: string; title: string }) => (
                <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>
                        <a>{post.title}</a>
                    </Link>
                </li>
            ))}
        </ul>
    )
}
