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


</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CATEGORY_MAP } from '@/constants/categories'
import CardPost from '@/components/CardPost/index.vue'


import { usePostsStore } from '@/stores/posts'



const postsStore = usePostsStore()

/* =========================
   分类
========================= */

const currentCategory = ref('all')

const categories = computed(
    () => [
        {
            label: '最新文章',
            value: 'all'
        },

        ...postsStore.allCategories.map(
            item => ({
                label:
                    CATEGORY_MAP[item as keyof typeof CATEGORY_MAP]
                    || item,
                value: item
            })
        )
    ]
)

const setCategory = (category: string) => {
    currentCategory.value = category
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
            return postsStore.posts
        }

        return postsStore.posts.filter(
            post =>
                post.category ===
                currentCategory.value
        )
    }
)

/* =========================
   分页
========================= */

const PAGE_SIZE = 12

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


    .menu {
        display: flex;

        gap: 20px;
        // margin: 20px auto;
        padding: 10px 20px;
        position: fixed;
        z-index: 999;

        border-radius: 30px;
        background-color: var(--bg-color);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .menu-item {
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: 600;
            letter-spacing: 1px;
            z-index: 10;
            color: #666;

            cursor: pointer;

            transition:
                all 0.25s ease;

            &:hover {
                color: #273c4d;

                background-color:
                    rgba(255,
                        255,
                        255,
                        0.7);
            }

            &.active {
                color: rgb(238, 232, 232);
                background-color:
                    #293342;
            }
        }
    }



    .content {
        width: 100%;
        border-radius: 20px;
        padding: 50px 20px;
        margin-top: 65px;
        background-color: var(--bg-color);
        display: grid;
        grid-template-columns: repeat(4, auto);
        /* 2列，宽度自适应内容 */
        justify-content: center;
        /* 整个网格水平居中 */
        gap: 30px;
        /* 卡片间距 */

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
            var(--bg-color);

        .page-btn {
            min-width: 40px;

            height: 40px;

            padding: 0 12px;

            display: flex;

            justify-content: center;
            align-items: center;

            border-radius: 12px;

            background-color: var(--bg-color);

            color: #333;

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
                color: rgba(var(--bg-base-color-2), 1);

                background: rgba(var(--bg-base-color), 0.6);

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