import fm from 'front-matter'
import { renderMarkdown } from './renderMarkdown'
import type { Post, FrontMatterAttributes } from '@/types/post'
import { getPostTitle, getPostPublishAt } from './textFormat'

const modules = import.meta.glob('@/posts/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true
})

export function getAllPosts(): Post[] {
    const posts: Post[] = []

    for (const [path, raw] of Object.entries(modules)) {
        // 1. 优先解析 Front Matter 的属性
        const { attributes, body } = fm<FrontMatterAttributes>(raw as string)

        // 2. 🚧 核心拦截逻辑：不公开的文章直接跳过（不执行下方的 Markdown 渲染）

        // 👉 情况一：如果你使用了布尔值（默认不写 isPublic 的视为公开）
        if (attributes.visibility === false) {
            continue
        }
        attributes.visibility = true // 明确标记为公开，方便后续逻辑使用

        // 👉 情况二：如果你使用了状态字符串（如果是草稿或私有则跳过）
        // if (attributes.status === 'draft' || attributes.status === 'private') {
        //     continue
        // }

        // 3. 只有通过检查的文章，才会进行繁重的渲染工作
        const { html, toc } = renderMarkdown(body)

        const slug =
            path
                .split('/')
                .pop()
                ?.replace('.md', '') || ''

        posts.push({
            slug,
            title: getPostTitle(slug) || attributes.title || '',
            intro: attributes.intro || '',
            category: attributes.category || 'post',
            tags: attributes.tags || [],
            icon: attributes.icon || '',
            summary: attributes.summary || '',
            publishedAt: getPostPublishAt(slug) || attributes.publishedAt || '',
            updatedAt: attributes.updatedAt || '',
            content: html,
            toc
        })
    }

    // 4. 最后统一按时间排序并返回
    return posts.sort(
        (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
    )
}


// 💡 新增：手动处理 Vite 的热更新 (HMR)
// 请注意！项目彻底上线时需要删除！
if (import.meta.hot) {
    // 监听当前模块及其依赖的变化
    import.meta.hot.accept((newModule) => {
        if (newModule) {
            // 简单粗暴但极度有效：内容变了就直接刷新浏览器
            window.location.reload()
        }
    })
}