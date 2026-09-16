import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getAllPosts } from '@/utils/posts'
import type { Post } from '@/types/post'

export const usePostsStore = defineStore('posts', () => {
    // 定义所有 POST 的数据（包括 普通文章 post、生活日常 life、技术文章 tech）
    const posts = ref<Post[]>(getAllPosts().reverse())

    const lives = ref<Post[]>(posts.value.filter(item => item.category === 'life'))

    const articles = ref<Post[]>(posts.value.filter(item => item.category !== 'life'))

    const postCount = computed(() => posts.value.length)

    const articlesCategories = computed(() =>
        [...new Set(
            articles.value.map(
                item => item.category
            )
        )]
    )

    const allCategories = computed(() =>
        [...new Set(
            posts.value.map(
                item => item.category
            )
        )]
    )

    const articlesTags = computed(() =>
        [...new Set(
            articles.value.flatMap(
                item => item.tags
            )
        )]
    )

    const getPost = (
        slug: string
    ) =>
        posts.value.find(
            item => item.slug === slug
        )

    const getArticle = (
        slug: string
    ) =>
        articles.value.find(
            item => item.slug === slug
        )


    const getPostsByCategory = (
        category: string
    ) =>
        posts.value.filter(
            item =>
                item.category === category
        )

    const getArticlesByCategory = (
        category: string
    ) =>
        articles.value.filter(
            item =>
                item.category === category
        )


    const getPostsByTag = (
        tag: string
    ) =>
        posts.value.filter(
            item =>
                item.tags.includes(tag)
        )

    const getArticlesByTag = (
        tag: string
    ) =>
        articles.value.filter(
            item =>
                item.tags.includes(tag)
        )



    const search = (
        keyword: string
    ) => {

        const value =
            keyword
                .trim()
                .toLowerCase()

        return posts.value.filter(
            post =>
                post.title
                    .toLowerCase()
                    .includes(value) ||
                post.intro
                    .toLowerCase()
                    .includes(value)
        )
    }

    // 获取最近 N 天内的 posts
    // 获取最近 N 天内的 posts
    const getPostsWithinDays = (days: number = 30) => {
        const today = new Date()
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - days)

        // 转为八位数字字符串
        const daysAgoStr =
            String(daysAgo.getFullYear()) +
            String(daysAgo.getMonth() + 1).padStart(2, '0') +
            String(daysAgo.getDate()).padStart(2, '0')

        const todayStr =
            String(today.getFullYear()) +
            String(today.getMonth() + 1).padStart(2, '0') +
            String(today.getDate()).padStart(2, '0')

        console.log('今天字符串:', todayStr)
        console.log('30天前字符串:', daysAgoStr)
        console.log('所有文章日期:', posts.value.map(p => p.publishedAt))

        return posts.value.filter(post => {
            const inRange = post.publishedAt >= daysAgoStr && post.publishedAt <= todayStr
            console.log(`文章: ${post.title}, 日期: ${post.publishedAt}, 是否在范围内: ${inRange}`)
            return inRange
        })
    }

    return {
        posts,

        postCount,
        articles,
        lives,
        allCategories,
        articlesCategories,
        articlesTags,

        getPost,
        getArticle,
        getPostsByCategory,
        getArticlesByCategory,
        getPostsByTag,
        getArticlesByTag,
        search,
        getPostsWithinDays
    }
})