<template>
    <div class="articles-all">

        <!-- 筛选区：搜索 / 分类 / 标签 三行纵向排列 -->
        <div class="filters">

            <!-- 第一行：搜索 -->
            <div class="filter-row search-row">
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input v-model="keyword" class="search-input" type="text" placeholder="搜索文章标题 / 摘要 / 标签"
                        @keyup.esc="clearKeyword" />
                    <span v-if="keyword" class="search-clear" title="清空" @click="clearKeyword">
                        ✕
                    </span>
                </div>
            </div>

            <!-- 第二行：分类 -->
            <div class="filter-row category-row">
                <div class="row-label">分类</div>
                <div class="category-list">
                    <div v-for="it in categories" :key="it.value" class="category-item"
                        :class="{ active: currentCategory === it.value }" @click="setCategory(it.value || '')">
                        <span class="category-dot"></span>
                        <span class="category-name">{{ it.label }}</span>
                    </div>
                </div>
            </div>

            <!-- 第三行：标签 -->
            <div class="filter-row tag-row" :class="{ expanded: tagExpanded }">
                <div class="row-label tag-label" @click="toggleTagExpanded">
                    <span class="tag-label-text">标签</span>
                    <span class="tag-label-arrow">▾</span>
                </div>
                <div v-show="tagExpanded" class="tag-list">
                    <div v-for="it in tags" :key="it.value" class="tag-item"
                        :class="{ active: currentTag === it.value }" @click="setTag(it.value)">
                        <span class="tag-name">{{ it.label }}</span>
                        <span class="tag-count">{{ it.count }}</span>
                    </div>
                </div>
                <div v-if="!tagExpanded" class="tag-collapsed-hint" @click="toggleTagExpanded">
                    {{ currentTag === 'all' ? '全部标签' : `已选：${currentTag}` }}
                </div>
            </div>

        </div>

        <!-- 内容 -->
        <div class="content">
            <template v-if="pagedPosts.length">
                <CardPost v-for="post in pagedPosts" :key="post.slug" :post="post" />
                <div v-for="n in emptyCells" :key="'empty-' + n" class="post-item-placeholder"></div>
            </template>

            <div v-else class="empty-state">
                <div class="empty-emoji">🗂️</div>
                <p class="empty-title">没有找到匹配的文章</p>
                <p class="empty-tip">
                    关键词：<b>{{ keyword || '—' }}</b>
                    <template v-if="currentCategory !== 'all'">
                        ｜ 分类：<b>{{ currentCategoryLabel }}</b>
                    </template>
                    <template v-if="currentTag !== 'all'">
                        ｜ 标签：<b>{{ currentTag }}</b>
                    </template>
                </p>
                <button class="empty-reset" @click="resetAll">重置筛选</button>
            </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
            <div class="page-btn" :class="{ disabled: currentPage === 1 }" @click="prevPage">←</div>
            <div v-for="page in totalPages" :key="page" class="page-btn" :class="{ active: page === currentPage }"
                @click="currentPage = page">
                {{ page }}
            </div>
            <div class="page-btn" :class="{ disabled: currentPage === totalPages }" @click="nextPage">→</div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CATEGORY_MAP } from '@/constants/categories'
import CardPost from '@/components/CardPost/index.vue'
import { usePostsStore } from '@/stores/posts'

const postsStore = usePostsStore()
const route = useRoute()
const router = useRouter()

/* =========================
   常量
========================= */

const PAGE_SIZE = 12
const COLUMNS = 4
/** 列表页路由：已无 /tags，统一走 /articles */
const LIST_PATH = '/articles'

/* =========================
   状态初始化
========================= */

const pickQueryString = (v: unknown): string => {
    if (Array.isArray(v)) return String(v[0] ?? '')
    return v == null ? '' : String(v)
}

const queryCategory = pickQueryString(route.query.category) || 'all'
const queryTag = pickQueryString(route.query.tag) || 'all'
const queryKeyword = pickQueryString(route.query.q)

const currentCategory = ref(queryCategory)
const currentTag = ref(queryTag)
const keyword = ref(queryKeyword)
const currentPage = ref(Math.max(1, Number(pickQueryString(route.query.page)) || 1))

const tagExpanded = ref(!!queryTag && queryTag !== 'all')

const toggleTagExpanded = () => {
    tagExpanded.value = !tagExpanded.value
}

/* 供 CardPost 通过 inject 调用：点击卡片标签时展开标签栏并同步筛选 */
provide('expandTags', () => {
    tagExpanded.value = true
})

/* =========================
   分类
========================= */

const allCategories = computed(() => [
    { label: '最新文章', value: 'all' },
    ...postsStore.allCategories.map(item => ({
        label: CATEGORY_MAP[item as keyof typeof CATEGORY_MAP] || item,
        value: item
    }))
])

const categories = computed(() => allCategories.value)

const currentCategoryLabel = computed(() => {
    return allCategories.value.find(it => it.value === currentCategory.value)?.label || currentCategory.value
})

const setCategory = (category: string) => {
    currentCategory.value = category || 'all'
    currentPage.value = 1
}

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
        { label: '全部标签', value: 'all', count: postsStore.posts.length },
        ...tagList
    ]
})

const setTag = (tag: string) => {
    currentTag.value = tag
    currentPage.value = 1
    tagExpanded.value = true
}

/* =========================
   筛选
========================= */

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
        if (currentCategory.value !== 'all' && post.category !== currentCategory.value) {
            return false
        }
        if (currentTag.value !== 'all') {
            if (!post.tags || !post.tags.includes(currentTag.value)) return false
        }
        return matchKeyword(post, kw)
    })
})

/* =========================
   分页
========================= */

const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredPosts.value.length / PAGE_SIZE))
)

const pagedPosts = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredPosts.value.slice(start, start + PAGE_SIZE)
})

watch([keyword, currentCategory, currentTag], () => {
    currentPage.value = 1
})

watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
})

/* =========================
   交互
========================= */

const clearKeyword = () => {
    keyword.value = ''
}

const resetAll = () => {
    keyword.value = ''
    currentCategory.value = 'all'
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
   状态同步到 URL（改到 /articles）
========================= */

watch(
    [currentCategory, currentTag, keyword, currentPage],
    () => {
        const query: Record<string, string> = {}

        if (currentCategory.value !== 'all') query.category = currentCategory.value
        if (currentTag.value !== 'all') query.tag = currentTag.value
        if (keyword.value.trim()) query.q = keyword.value.trim()
        if (currentPage.value > 1) query.page = String(currentPage.value)

        const same =
            pickQueryString(route.query.category) === (query.category ?? '') &&
            pickQueryString(route.query.tag) === (query.tag ?? '') &&
            pickQueryString(route.query.q) === (query.q ?? '') &&
            pickQueryString(route.query.page) === (query.page ?? '')

        if (same) return

        router.replace({ path: LIST_PATH, query })
    },
    { flush: 'post' }
)

/** 响应浏览器前进 / 后退（或同页面 query 变化） */
watch(
    () => route.query,
    (q) => {
        const c = pickQueryString(q.category) || 'all'
        const t = pickQueryString(q.tag) || 'all'
        const k = pickQueryString(q.q)
        const p = Math.max(1, Number(pickQueryString(q.page)) || 1)

        if (c !== currentCategory.value) currentCategory.value = c
        if (t !== currentTag.value) currentTag.value = t
        if (k !== keyword.value) keyword.value = k
        if (p !== currentPage.value) currentPage.value = p

        if (t !== 'all') tagExpanded.value = true
    }
)

/* =========================
   网格补位
========================= */

const emptyCells = computed(() => {
    const remainder = pagedPosts.value.length % COLUMNS
    return remainder === 0 ? 0 : COLUMNS - remainder
})
</script>

<style lang="scss" scoped>
/* =========================================================
 * 设计令牌
 * ========================================================= */

$gap: 20px;

/* 筛选容器：玻璃胶囊 */
$menu-bg: rgba(14, 16, 21, 0.5);
$menu-border: rgba(255, 255, 255, 0.12);
$blur: blur(16px) saturate(150%);

/* 内容区 */
$content-bg: rgba(16, 18, 24, 0.72);
$content-border: rgba(255, 255, 255, 0.12);

/* 行内文字 */
$row-label-color: rgba(255, 255, 255, 0.45);


$cat-fc: rgba(226, 232, 240, 0.92);
$cat-bg: #3d63947e;
$cat-border: #3d6394;
$cat-bar: #7093c0;
/* hover */
$cat-fc-hover: #ffffff;
$cat-bg-hover: #3d6394;

$cat-fc-active: white;
$cat-bg-active: #3d6394;
$cat-ring-active: rgba(245, 158, 11, 0.45);

/* 标签：低调胶囊 */
$tag-fc: rgba(255, 255, 255, 0.66);
$tag-bg: rgba(255, 255, 255, 0.05);
$tag-border: rgba(255, 255, 255, 0.1);
$tag-fc-hover: #ffffff;
$tag-bg-hover: rgba(255, 255, 255, 0.12);
$tag-fc-active: #ffffff;
$tag-bg-active: rgba(255, 255, 255, 0.18);

/* 分页 */
$page-fc: rgba(255, 255, 255, 0.82);
$page-bg-hover: rgba(255, 255, 255, 0.12);
$page-bg-active: rgba(255, 255, 255, 0.2);
$page-ring-active: rgba(79, 156, 255, 0.45);

/* =========================================================
 * 根
 * ========================================================= */

.articles-all {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-top: 20px;
    padding: 0 80px;
    position: relative;
}

/* =========================================================
 * 筛选区
 * ========================================================= */

.filters {
    width: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 14px;

    margin-top: 10px;
    padding: 18px 22px;
    border-radius: 20px;

    background: $menu-bg;
    border: 1px solid $menu-border;
    backdrop-filter: $blur;
    -webkit-backdrop-filter: $blur;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.row-label {
    flex: 0 0 44px;

    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    color: $row-label-color;
    user-select: none;
}

.tag-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: color 0.25s ease;

    &:hover {
        color: #fff;
    }

    .tag-label-arrow {
        font-size: 10px;
        transition: transform 0.3s ease;
        transform: rotate(-90deg);
    }
}

.tag-row.expanded .tag-label .tag-label-arrow {
    transform: rotate(0deg);
}

.category-row {
    padding-bottom: 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* ---------- 搜索 ---------- */

.search-row {
    padding-bottom: 4px;
}

.search-box {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    width: 100%;
    max-width: 420px;
    height: 36px;
    padding: 0 12px;

    border-radius: 18px;

    background-color: rgba(0, 0, 0, 0.32);
    border: 1px solid rgba(255, 255, 255, 0.1);

    transition: all 0.25s ease;

    &:focus-within {
        background-color: rgba(0, 0, 0, 0.45);
        border-color: rgba(124, 147, 255, 0.55);
        box-shadow: 0 0 0 3px rgba(124, 147, 255, 0.22);
    }

    .search-icon {
        font-size: 13px;
        line-height: 1;
        opacity: 0.7;
    }

    .search-input {
        flex: 1;
        min-width: 0;

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

/* ---------- 分类 ---------- */

.category-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.category-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    padding: 8px 16px 8px 14px;

    font-weight: 700;
    letter-spacing: 1px;

    color: $cat-fc;
    background: $cat-bg;
    border: 1px solid $cat-border;
    border-radius: 8px;

    cursor: pointer;
    user-select: none;

    transition: all 0.25s ease;

    .category-dot {
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: $cat-bar;
        transition: all 0.25s ease;
    }

    &:hover {
        color: $cat-fc-hover;
        background: $cat-bg-hover;
        transform: translateX(2px);
    }

    &.active {
        color: $cat-fc-active;
        background: $cat-bg-active;
        border-color: transparent;

        transform: translateX(2px);

        .category-dot {
            background: $cat-fc-active;
        }
    }
}

/* ---------- 标签 ---------- */

.tag-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.tag-item {
    display: inline-flex;
    align-items: center;

    padding: 5px 12px;

    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;

    color: $tag-fc;
    background: $tag-bg;
    border: 1px solid $tag-border;
    border-radius: 14px;

    cursor: pointer;
    user-select: none;

    transition: all 0.25s ease;

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
        line-height: 1;

        color: rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.12);

        transition: all 0.25s ease;
    }

    &:hover {
        color: $tag-fc-hover;
        background: $tag-bg-hover;
    }

    &.active {
        color: $tag-fc-active;
        background: $tag-bg-active;
        border-color: rgba(255, 255, 255, 0.3);

        .tag-count {
            color: #293342;
            background-color: rgba(255, 255, 255, 0.85);
        }
    }
}

.tag-collapsed-hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.42);
    letter-spacing: 0.5px;
    cursor: pointer;
    user-select: none;
    transition: color 0.25s ease;

    &:hover {
        color: rgba(255, 255, 255, 0.8);
    }
}

/* =========================================================
 * 内容区
 * ========================================================= */

.content {
    width: 100%;
    max-width: 100%;

    margin-top: 24px;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid $content-border;

    background: $content-bg;
    backdrop-filter: blur(22px) saturate(160%);
    -webkit-backdrop-filter: blur(22px) saturate(160%);

    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    justify-items: stretch;
    align-items: stretch;
    gap: $gap;

    :deep(.card-post),
    >* {
        width: 100%;
        box-sizing: border-box;
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(1, minmax(0, 1fr));
        padding: 12px;
        gap: 16px;
    }
}

.post-item-placeholder {
    width: 100%;
    height: 100%;
    min-height: 1px;
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
        color: rgba(255, 255, 255, 0.78);
    }

    .empty-tip {
        margin: 0 0 20px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.5);

        b {
            color: #9db1ff;
        }
    }

    .empty-reset {
        padding: 8px 18px;
        border: none;
        border-radius: 12px;

        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #0b0d12;

        background-color: #7c93ff;
        cursor: pointer;
        transition: all 0.25s ease;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(124, 147, 255, 0.35);
        }
    }
}

/* =========================================================
 * 分页
 * ========================================================= */

.pagination {
    width: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    gap: 12px;
    padding: 10px 0 40px;
}

.page-btn {
    min-width: 30px;
    min-height: 30px;

    padding: 0 10px;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 40%;

    color: $page-fc;
    font-weight: 600;

    cursor: pointer;
    user-select: none;

    transition:
        transform 0.25s ease,
        background 0.25s ease,
        box-shadow 0.25s ease;

    &:hover {
        transform: translateY(-2px);
        background: $page-bg-hover;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
    }

    &.active {
        background: $page-bg-active;
        box-shadow: 0 0 0 1px $page-ring-active;
    }

    &.disabled {
        opacity: 0.4;
        cursor: not-allowed;
        pointer-events: none;
        transform: none !important;
        box-shadow: none !important;
    }
}

/* =========================================================
 * 小屏适配
 * ========================================================= */

@media (max-width: 768px) {
    .articles-all {
        padding: 0 10px;
        border-radius: 10px;
    }

    .filters {
        padding: 14px;
        border-radius: 0;
        gap: 12px;
    }

    .filter-row {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
    }

    .row-label {
        flex: none;
    }

    .content {
        border-radius: 0;
    }

    .category-item {
        padding: 6px 12px;
        font-size: 13px;
    }

    .tag-item {
        padding: 4px 10px;
        font-size: 12px;
    }
}
</style>