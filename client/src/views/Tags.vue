<template>
    <div class="tags-all">
        <!-- 搜索 + 标签栏 -->
        <div class="menu">
            <!-- 搜索框 -->
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input v-model="keyword" class="search-input" type="text" placeholder="搜索文章标题 / 摘要 / 标签"
                    @keyup.esc="clearKeyword" />
                <span v-if="keyword" class="search-clear" title="清空" @click="clearKeyword">
                    ✕
                </span>
            </div>

            <!-- 标签 -->
            <div v-for="it in tags" :key="it.value" class="menu-item" :class="{ active: currentTag === it.value }"
                @click="setTag(it.value)">
                <span class="tag-name">{{ it.label }}</span>
                <span class="tag-count">{{ it.count }}</span>
            </div>
        </div>

        <!-- 内容 -->
        <div class="content">
            <template v-if="pagedPosts.length">
                <CardPost v-for="post in pagedPosts" :key="post.slug" :post="post" />

                <!-- 补齐最后一行 -->
                <div v-for="n in emptyCells" :key="'empty-' + n" class="post-item-placeholder"></div>
            </template>

            <!-- 空状态 -->
            <div v-else class="empty-state">
                <div class="empty-emoji">🗂️</div>
                <p class="empty-title">没有找到匹配的文章</p>
                <p class="empty-tip">
                    关键词：<b>{{ keyword || '—' }}</b>
                    <template v-if="currentTag !== 'all'">
                        ｜ 标签：<b>{{ currentTag }}</b>
                    </template>
                </p>
                <button class="empty-reset" @click="resetAll">重置筛选</button>
            </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
            <!-- 上一页 -->
            <div class="page-btn" :class="{ disabled: currentPage === 1 }" @click="prevPage">
                ←
            </div>

            <!-- 页码 -->
            <div v-for="page in totalPages" :key="page" class="page-btn" :class="{ active: page === currentPage }"
                @click="currentPage = page">
                {{ page }}
            </div>

            <!-- 下一页 -->
            <div class="page-btn" :class="{ disabled: currentPage === totalPages }" @click="nextPage">
                →
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardPost from '@/components/CardPost/index.vue'
import { usePostsStore } from '@/stores/posts'

const postsStore = usePostsStore()
const route = useRoute()
const router = useRouter()

/* =========================
   状态初始化：从 URL query 读取（支持刷新/分享/后退）
========================= */

/** 从 query 中安全解析出字符串（query 可能是数组） */
const pickQueryString = (v: unknown): string => {
    if (Array.isArray(v)) return String(v[0] ?? '')
    return v == null ? '' : String(v)
}

const queryTag = pickQueryString(route.query.tag)
const queryKeyword = pickQueryString(route.query.q)

const currentTag = ref(queryTag || 'all')
const keyword = ref(queryKeyword)
const currentPage = ref(
    Math.max(1, Number(pickQueryString(route.query.page)) || 1)
)

/* =========================
   标签
========================= */

const tags = computed(() => {
    const tagMap = new Map<string, number>()

    postsStore.posts.forEach((post) => {
        if (!post.tags) return
        post.tags.forEach((tag) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
        })
    })

    const tagList = Array.from(tagMap.entries())
        .map(([tag, count]) => ({ label: tag, value: tag, count }))
        .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count
            return a.label.localeCompare(b.label)
        })

    return [
        { label: '全部文章', value: 'all', count: postsStore.posts.length },
        ...tagList
    ]
})

/* =========================
   筛选（标签 + 搜索）
========================= */

/** 判断文章是否命中关键词 */
function matchKeyword(post: any, kw: string) {
    if (!kw) return true

    const target = [post.title, post.summary, post.description, ...(post.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

    return target.includes(kw)
}

const filteredPosts = computed(() => {
    const kw = keyword.value.trim().toLowerCase()

    return postsStore.posts.filter((post) => {
        // 1. 标签筛选
        if (currentTag.value !== 'all') {
            if (!post.tags || !post.tags.includes(currentTag.value)) {
                return false
            }
        }
        // 2. 关键词搜索
        return matchKeyword(post, kw)
    })
})

/* =========================
   分页
========================= */

const PAGE_SIZE = 12

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE))
)

const pagedPosts = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

/* 搜索或标签变化时回到第一页 */
watch([keyword, currentTag], () => {
    currentPage.value = 1
})

/* 页码越界修正 */
watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
})

/* =========================
   交互
========================= */

const setTag = (tag: string) => {
    currentTag.value = tag
    currentPage.value = 1
}

const clearKeyword = () => {
    keyword.value = ''
}

const resetAll = () => {
    keyword.value = ''
    currentTag.value = 'all'
    currentPage.value = 1
}

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
}

/* =========================
   状态同步到 URL
========================= */

/** 把当前筛选状态写回 query，便于分享 / 刷新 / 前进后退 */
watch(
    [currentTag, keyword, currentPage],
    () => {
        const query: Record<string, string> = {}

        if (currentTag.value !== 'all') query.tag = currentTag.value
        if (keyword.value.trim()) query.q = keyword.value.trim()
        if (currentPage.value > 1) query.page = String(currentPage.value)

        // 与当前 query 完全一致时跳过，避免重复导航
        const same =
            pickQueryString(route.query.tag) === (query.tag ?? '') &&
            pickQueryString(route.query.q) === (query.q ?? '') &&
            pickQueryString(route.query.page) === (query.page ?? '')

        if (same) return

        router.replace({ path: '/tags', query })
    },
    { flush: 'post' }
)

/** 响应浏览器前进 / 后退（或同页面 query 变化） */
watch(
    () => route.query,
    (q) => {
        const t = pickQueryString(q.tag) || 'all'
        const k = pickQueryString(q.q)
        const p = Math.max(1, Number(pickQueryString(q.page)) || 1)

        if (t !== currentTag.value) currentTag.value = t
        if (k !== keyword.value) keyword.value = k
        if (p !== currentPage.value) currentPage.value = p
    }
)

/* =========================
   网格补位
========================= */

const columns = 4

const emptyCells = computed(() => {
    const remainder = pagedPosts.value.length % columns
    return remainder === 0 ? 0 : columns - remainder
})
</script>

<style lang="scss" scoped>
.tags-all {
    display: flex;
    flex-direction: column;
    align-items: center;

    /* =========================
       标签菜单 + 搜索
    ========================= */
    .menu {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 10px;
        gap: 10px;
        padding: 20px;
        z-index: 999;
        border-radius: 20px;
        background-color: var(--bg-color);
        backdrop-filter: blur(5px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        /* ---------- 搜索框 ---------- */
        .search-box {
            display: inline-flex;
            align-items: center;
            gap: 6px;

            height: 30px;
            padding: 0 10px;
            margin-right: 6px;

            border-radius: 15px;
            background-color: rgba(0, 0, 0, 0.3);

            transition: all 0.25s ease;

            &:focus-within {
                background-color: rgba(0, 0, 0, 0.45);
                box-shadow: 0 0 0 2px rgba(124, 147, 255, 0.35);
            }

            .search-icon {
                font-size: 13px;
                line-height: 1;
                opacity: 0.7;
            }

            .search-input {
                width: 180px;
                border: none;
                outline: none;
                background: transparent;
                font-size: 13px;
                font-weight: 500;
                letter-spacing: 0.5px;
                color: #eee;

                &::placeholder {
                    color: #888;
                }
            }

            .search-clear {
                display: inline-flex;
                align-items: center;
                justify-content: center;

                width: 18px;
                height: 18px;
                border-radius: 50%;

                font-size: 11px;
                line-height: 1;
                color: #ccc;

                cursor: pointer;
                transition: all 0.25s ease;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: #fff;
                }
            }
        }

        /* ---------- 标签项 ---------- */
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

            &:hover,

            &.active {
                color: rgb(238, 232, 232);
                background-color: #293342;

                .tag-count {
                    color: #293342;
                    background-color: rgba(255, 255, 255, 0.85);
                }
            }
        }
    }

    /* =========================
       文章内容
    ========================= */
    .content {
        width: 100%;
        padding: 50px 20px;
        margin-top: 20px;
        border-radius: 20px;
        background-color: var(--bg-color);

        display: grid;
        grid-template-columns: repeat(4, auto);
        justify-content: center;
        gap: 30px;

        .post-item-placeholder {
            width: 320px;
            background-color: transparent;
        }

        /* ---------- 空状态 ---------- */
        .empty-state {
            grid-column: 1 / -1;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            padding: 60px 20px;
            text-align: center;

            .empty-emoji {
                font-size: 46px;
                line-height: 1;
                margin-bottom: 14px;
                opacity: 0.85;
            }

            .empty-title {
                margin: 0 0 8px;
                font-size: 16px;
                font-weight: 600;
                color: #555;
            }

            .empty-tip {
                margin: 0 0 20px;
                font-size: 13px;
                color: #888;

                b {
                    color: #293342;
                }
            }

            .empty-reset {
                padding: 8px 18px;
                border: none;
                border-radius: 12px;

                font-size: 13px;
                font-weight: 600;
                letter-spacing: 1px;
                color: #eee;

                background-color: #293342;
                cursor: pointer;
                transition: all 0.25s ease;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
                }
            }
        }
    }

    /* =========================
       分页
    ========================= */
    .pagination {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        padding: 10px 0 40px;
        background-color: var(--bg-color);

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
            transition: all 0.25s ease;

            &:hover {
                transform: translateY(-2px);
                background-color: white;
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
            }

            &.active {
                color: rgba(var(--bg-base-color-2), 1);
                background: rgba(var(--bg-base-color), 0.6);
            }

            &.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                pointer-events: none;
                transform: none !important;
                box-shadow: none !important;
            }
        }
    }
}
</style>