<template>
    <div class="tags-all">

        <!-- 标签栏 -->
        <div class="menu">

            <div class="menu-item" v-for="it in tags" :key="it.value" :class="{
                active: currentTag === it.value
            }" @click="setTag(it.value)">
                <span class="tag-name">
                    {{ it.label }}
                </span>

                <span class="tag-count">
                    {{ it.count }}
                </span>
            </div>

        </div>


        <!-- 内容 -->
        <div class="content">

            <CardPost v-for="post in pagedPosts" :key="post.slug" :post="post" />

            <!-- 补齐最后一行 -->
            <div v-for="n in emptyCells" :key="'empty-' + n" class="post-item-placeholder"></div>

        </div>


        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">

            <!-- 上一页 -->
            <div class="page-btn" :class="{
                disabled: currentPage === 1
            }" @click="prevPage">
                ←
            </div>


            <!-- 页码 -->
            <div class="page-btn" v-for="page in totalPages" :key="page" :class="{
                active: page === currentPage
            }" @click="currentPage = page">
                {{ page }}
            </div>


            <!-- 下一页 -->
            <div class="page-btn" :class="{
                disabled:
                    currentPage === totalPages
            }" @click="nextPage">
                →
            </div>

        </div>

    </div>
</template>


<script setup lang="ts">
import {
    computed,
    ref
} from 'vue'

import CardPost from '@/components/CardPost/index.vue'

import {
    usePostsStore
} from '@/stores/posts'


const postsStore = usePostsStore()


/* =========================
   标签
========================= */

const currentTag = ref('all')


const tags = computed(() => {

    // 统计每个标签出现的次数
    const tagMap = new Map<string, number>()

    postsStore.posts.forEach(post => {

        if (!post.tags) {
            return
        }

        post.tags.forEach(tag => {

            tagMap.set(
                tag,
                (tagMap.get(tag) || 0) + 1
            )

        })
    })


    // 转换成菜单数据
    const tagList = Array.from(
        tagMap.entries()
    )
        .map(([tag, count]) => ({
            label: tag,
            value: tag,
            count
        }))
        .sort((a, b) => {

            // 文章数量多的排前面
            if (b.count !== a.count) {
                return b.count - a.count
            }

            // 数量相同时按照名称排序
            return a.label.localeCompare(
                b.label
            )
        })


    return [
        {
            label: '全部文章',
            value: 'all',
            count: postsStore.posts.length
        },

        ...tagList
    ]
})

const setTag = (tag: string) => {

    currentTag.value = tag

    currentPage.value = 1
}


/* =========================
   标签筛选
========================= */

const filteredPosts = computed(() => {

    if (
        currentTag.value === 'all'
    ) {
        return postsStore.posts
    }

    return postsStore.posts.filter(
        post => {

            if (!post.tags) {
                return false
            }

            return post.tags.includes(
                currentTag.value
            )
        }
    )
})


/* =========================
   分页
========================= */

const PAGE_SIZE = 12

const currentPage = ref(1)


const totalPages = computed(() =>
    Math.ceil(
        filteredPosts.value.length /
        PAGE_SIZE
    )
)


const pagedPosts = computed(() => {

    const start =
        (currentPage.value - 1) *
        PAGE_SIZE

    return filteredPosts.value.slice(
        start,
        start + PAGE_SIZE
    )
})


/* =========================
   上一页
========================= */

const prevPage = () => {

    if (
        currentPage.value <= 1
    ) {
        return
    }

    currentPage.value--
}


/* =========================
   下一页
========================= */

const nextPage = () => {

    if (
        currentPage.value >=
        totalPages.value
    ) {
        return
    }

    currentPage.value++
}


/* =========================
   网格补位
========================= */

const columns = 4

const emptyCells = computed(() => {

    const remainder =
        pagedPosts.value.length %
        columns

    return remainder === 0
        ? 0
        : columns - remainder
})
</script>


<style lang="scss" scoped>
.tags-all {

    display: flex;
    flex-direction: column;
    align-items: center;
    // background-color: rebeccapurple;

    /* =========================
       标签菜单
    ========================= */

    .menu {

        display: flex;
        flex-wrap: wrap;
        margin-top: 10px;
        gap: 10px;
        padding: 20px 20px;
        z-index: 999;
        border-radius: 20px;
        background-color:
            var(--bg-color);
        backdrop-filter:
            blur(5px);
        box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.1);

        .menu-item {

            display: inline-flex;
            align-items: center;

            padding: 6px 12px;

            font-size: 13px;

            border-radius: 15px;

            font-weight: 600;
            letter-spacing: 1px;

            color: #666;

            cursor: pointer;
            user-select: none;

            transition: all 0.25s ease;

            background-color: rgba(0, 0, 0, 0.3);

            .tag-name {
                display: inline-flex;
                align-items: center;
            }

            .tag-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;

                min-width: 18px;
                height: 18px;

                margin-left: 6px;
                padding: 0 5px;

                border-radius: 10px;

                font-size: 10px;
                font-weight: 500;
                line-height: 18px;

                color: white;

                background-color: rgba(255, 255, 255, 0.25);

                transition: all 0.25s ease;
            }

            &:hover {

                color: #273c4d;

                background-color:
                    rgba(255, 255, 255, 0.7);

                .tag-count {
                    background-color:
                        rgba(255, 255, 255, 0.6);
                }
            }

            &.active {

                color:
                    rgb(238, 232, 232);

                background-color:
                    #293342;

                .tag-count {

                    color:
                        #293342;

                    background-color:
                        rgba(255, 255, 255, 0.85);
                }
            }
        }
    }


    /* =========================
       文章内容
    ========================= */

    .content {

        width: 100%;

        padding:
            50px 20px;

        margin-top:
            20px;

        border-radius:
            20px;

        background-color:
            var(--bg-color);

        display: grid;

        grid-template-columns:
            repeat(4, auto);

        justify-content:
            center;

        gap:
            30px;


        .post-item-placeholder {

            width:
                320px;

            background-color:
                transparent;
        }
    }


    /* =========================
       分页
    ========================= */

    .pagination {

        width: 100%;

        display: flex;

        justify-content:
            center;

        align-items:
            center;

        gap:
            12px;

        padding:
            10px 0 40px;

        background-color:
            var(--bg-color);


        .page-btn {

            min-width:
                40px;

            height:
                40px;

            padding:
                0 12px;

            display: flex;

            justify-content:
                center;

            align-items:
                center;

            border-radius:
                12px;

            background-color:
                var(--bg-color);

            color:
                #333;

            font-weight:
                600;

            cursor:
                pointer;

            user-select:
                none;

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

                color:
                    rgba(var(--bg-base-color-2),
                        1);

                background:
                    rgba(var(--bg-base-color),
                        0.6);
            }


            &.disabled {

                opacity:
                    0.4;

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