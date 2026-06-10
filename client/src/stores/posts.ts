import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getAllPosts } from '@/utils/posts'
import type { Post } from '@/types/post'

export const usePostsStore = defineStore('posts', () => {

    const posts = ref<Post[]>(
        getAllPosts()
    )

    const lives = ref<Post[]>(
        posts.value.filter(
            item => item.category === 'life'
        )
    )

    const articles = ref<Post[]>(
        posts.value.filter(
            item => item.category !== 'life'
        )
    )

    const startRecommendedList =
        computed(() =>
            articles.value.slice(0, 4)
        )

    const postCount = computed(
        () => posts.value.length
    )

    const articlesCategories = computed(() =>
        [...new Set(
            articles.value.map(
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

    return {
        posts,
        startRecommendedList,
        postCount,
        articles,
        lives,
        articlesCategories,
        articlesTags,

        getPost,
        getArticle,
        getPostsByCategory,
        getArticlesByCategory,
        getPostsByTag,
        getArticlesByTag,
        search
    }
})