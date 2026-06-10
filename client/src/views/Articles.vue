<template>
    <div class="articles-all">

        <!-- 分类栏 -->
        <div class="menu">

            <div class="menu-item" v-for="it in categories" :key="it.value" :class="{
                active:
                    currentCategory ===
                    it.value
            }" @click="
                setCategory(it.value || 'all')
                ">
                {{ it.label }}
            </div>

        </div>

        <!-- banner -->
        <div class="banner">
            HENGQIANFAN
        </div>

        <!-- 内容 -->
        <div class="content">

            <CardPost v-for="post in pagedPosts" :key="post.slug" :post="post" />

            <div v-for="n in emptyCells" :key="'empty-' + n" class="post-item-placeholder"></div>

        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">

            <!-- 上一页 -->
            <div class="page-btn" :class="{
                disabled:
                    currentPage === 1
            }" @click="prevPage">
                ←
            </div>

            <!-- 页码 -->
            <div class="page-btn" :class="{
                active:
                    page === currentPage
            }" v-for="page in totalPages" :key="page" @click="
                currentPage = page
                ">
                {{ page }}
            </div>

            <!-- 下一页 -->
            <div class="page-btn" :class="{
                disabled:
                    currentPage ===
                    totalPages
            }" @click="nextPage">
                →
            </div>

        </div>

    </div>

    <Footer />
</template>

<script setup lang="ts">
import {
    computed,
    ref
} from 'vue'
import { CATEGORY_MAP } from '@/constants/categories'
import CardPost from '@/components/CardPost/index.vue'
import Footer from '@/components/Footer/index.vue'

import { usePostsStore } from '@/stores/posts'

const postsStore =
    usePostsStore()

/* =========================
   分类
========================= */

const currentCategory =
    ref('all')

const categories = computed(
    () => [
        {
            label: '最新文章',
            value: 'all'
        },

        ...postsStore.articlesCategories.map(
            item => ({
                label:
                    CATEGORY_MAP[item as keyof typeof CATEGORY_MAP]
                    || item,
                value: item
            })
        )
    ]
)

const setCategory = (
    category: string
) => {

    currentCategory.value =
        category

    currentPage.value = 1
}

/* =========================
   分类筛选
========================= */

const filteredPosts = computed(
    () => {

        if (
            currentCategory.value ===
            'all'
        ) {
            return postsStore.articles
        }

        return postsStore.articles.filter(
            post =>
                post.category ===
                currentCategory.value
        )
    }
)

/* =========================
   分页
========================= */

const PAGE_SIZE = 8

const currentPage = ref(1)

const totalPages = computed(
    () =>
        Math.ceil(
            filteredPosts.value.length /
            PAGE_SIZE
        )
)

const pagedPosts = computed(
    () => {

        const start =
            (currentPage.value - 1) *
            PAGE_SIZE

        return filteredPosts.value.slice(
            start,
            start + PAGE_SIZE
        )
    }
)

/* =========================
   上一页
========================= */

const prevPage = () => {

    if (
        currentPage.value <= 1
    ) return

    currentPage.value--
}

/* =========================
   下一页
========================= */

const nextPage = () => {

    if (
        currentPage.value >=
        totalPages.value
    ) return

    currentPage.value++
}


// 假设每页固定 4 列
const columns = 4;
// 计算需要填充多少个空元素
const emptyCells = computed(() => {
    const remainder = postsStore.articles.length % columns;
    return remainder === 0 ? 0 : columns - remainder;
});
</script>

<style lang="scss" scoped>
.articles-all {
    display: flex;
    flex-direction: column;
    align-items: center;

    --bg-one: #eff1f4;

    .menu {
        display: flex;

        gap: 20px;

        margin: 20px auto;
        padding: 10px 20px;

        position: fixed;
        z-index: 999;

        border-radius: 30px;

        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .menu-item {
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: 600;
            letter-spacing: 1px;

            color: #666;

            cursor: pointer;

            transition:
                all 0.25s ease;

            &:hover {
                color: #3d6c92;

                background-color:
                    rgba(255,
                        255,
                        255,
                        0.7);
            }

            &.active {
                color: white;

                background-color:
                    #81aeec;
            }
        }
    }

    .banner {
        width: 100%;
        height: 45vh;

        background-color:
            var(--bg-one);

        display: flex;

        justify-content: center;
        align-items: center;

        font-size: 50px;
        font-weight: 600;

        letter-spacing: 10px;

        color: #555;

        opacity: 0.5;
    }

    .content {
        width: 100%;

        display: flex;
        flex-wrap: wrap;

        justify-content: center;

        gap: 20px;

        padding:
            50px 20px;

        background-color:
            var(--bg-one);

        .post-item-placeholder {
            width: 320px;
            // height: 200px;
            background-color: transparent;
        }
    }

    .pagination {
        width: 100%;

        display: flex;

        justify-content: center;
        align-items: center;

        gap: 12px;

        padding:
            10px 0 40px;

        background-color:
            var(--bg-one);

        .page-btn {
            min-width: 40px;

            height: 40px;

            padding: 0 12px;

            display: flex;

            justify-content: center;
            align-items: center;

            border-radius: 12px;

            background-color:
                rgba(255,
                    255,
                    255,
                    0.8);

            color: #666;

            font-weight: 600;

            cursor: pointer;

            user-select: none;

            transition:
                all 0.25s ease;

            &:hover {
                transform:
                    translateY(-2px);

                background-color:
                    white;

                box-shadow:
                    0 6px 18px rgba(0,
                        0,
                        0,
                        0.08);
            }

            &.active {
                color: white;

                background:
                    linear-gradient(135deg,
                        #5b8cff,
                        #6ba8ff);

                box-shadow:
                    0 6px 18px rgba(91,
                        140,
                        255,
                        0.35);
            }

            &.disabled {
                opacity: 0.4;

                cursor:
                    not-allowed;

                pointer-events:
                    none;

                transform:
                    none !important;

                box-shadow:
                    none !important;
            }
        }
    }
}
</style>