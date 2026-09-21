<script setup lang="ts">
import { computed, ref } from 'vue';
import { CATEGORIES, type CategoryId } from '@/types/site';
import { sites } from '@/config/sites';
import SiteCard from '@/components/CardSiteP/index.vue';

const keyword = ref('');
const activeId = ref<CategoryId | 'all'>('all');
/** 当前选中的二级分类：'all' | kind 名 */
const activeKind = ref<string>('all');

/** 标签/搜索面板是否展开（默认收起） */
const filtersOpen = ref(false);

/** 所有可用标签（kind 与 tags 合并去重） */
const allTags = computed(() => {
    const set = new Set<string>();
    sites.forEach((s) => {
        set.add(s.kind);
        s.tags.forEach((t) => set.add(t));
    });
    return [...set];
});
/** 选中的标签（多选） */
const activeTags = ref<string[]>([]);

const toggleTag = (tag: string) => {
    const i = activeTags.value.indexOf(tag);
    i > -1 ? activeTags.value.splice(i, 1) : activeTags.value.push(tag);
    activeKind.value = 'all';
};

const clearTags = () => {
    activeTags.value = [];
};

// 关键字 + 标签过滤
const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase();
    let list = sites;
    if (kw) {
        list = list.filter(
            (s) =>
                s.name.toLowerCase().includes(kw) ||
                s.tags.some((t) => t.toLowerCase().includes(kw)) ||
                s.kind.toLowerCase().includes(kw),
        );
    }
    if (activeTags.value.length) {
        list = list.filter(
            (s) =>
                activeTags.value.includes(s.kind) ||
                s.tags.some((t) => activeTags.value.includes(t)),
        );
    }
    return list;
});

// 给一个站点列表按 kind 拆成二级分组（保持首次出现顺序）
const buildSubGroups = (list: typeof sites) => {
    const map = new Map<string, typeof sites>();
    list.forEach((s) => {
        if (!map.has(s.kind)) map.set(s.kind, []);
        map.get(s.kind)!.push(s);
    });
    return [...map.entries()].map(([kind, items]) => ({ kind, items }));
};

// 一级分类分组 -> 内含二级分组
const groups = computed(() =>
    CATEGORIES.map((cat) => {
        const items = filtered.value.filter((s) => s.categoryId === cat.id);
        return { ...cat, items, subGroups: buildSubGroups(items) };
    }),
);

// 一级分类筛选
const visibleGroups = computed(() =>
    activeId.value === 'all'
        ? groups.value
        : groups.value.filter((g) => g.id === activeId.value),
);

// 当前可见分组内实际渲染的二级分组（支持二级筛选）
const renderedGroups = computed(() =>
    visibleGroups.value
        .map((g) => ({
            ...g,
            subGroups: g.subGroups.filter(
                (sub) => activeKind.value === 'all' || sub.kind === activeKind.value,
            ),
        }))
        .filter((g) => g.subGroups.length > 0),
);

// 当前一级分类下可用的二级分类
const kindOptions = computed(() => {
    const set = new Set<string>();
    visibleGroups.value.forEach((g) => g.subGroups.forEach((sub) => set.add(sub.kind)));
    return [...set];
});

const countOf = (id: CategoryId) =>
    filtered.value.filter((s) => s.categoryId === id).length;

const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const pickCategory = (id: CategoryId | 'all') => {
    activeId.value = id;
    activeKind.value = 'all';
    scrollTo('nav-top');
};

const pickKind = (kind: string) => {
    activeKind.value = kind;
    if (kind === 'all') {
        scrollTo(activeId.value === 'all' ? 'nav-top' : `cat-${activeId.value}`);
    } else {
        scrollTo(`kind-${kind}`);
    }
};
</script>

<template>
    <div id="nav-top" class="np">
        <!-- 顶部栏：标题 + 展开筛选按钮 -->
        <header class="np-header">
            <div class="np-brand">
                <span class="np-brand__dot" />
                <h1 class="np-title">网站导航</h1>
            </div>

            <div class="np-tools">
                <button class="np-icon-btn" :class="{ 'is-on': filtersOpen }" type="button"
                    @click="filtersOpen = !filtersOpen">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" />
                    </svg>
                    筛选
                    <span v-if="activeTags.length" class="np-badge">{{ activeTags.length }}</span>
                </button>
            </div>
        </header>

        <!-- 可折叠：搜索 + 标签 -->
        <transition name="np-drop">
            <div v-show="filtersOpen" class="np-panel">
                <div class="np-search">
                    <svg class="np-search__icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                    </svg>
                    <input v-model="keyword" class="np-search__input" type="search" placeholder="搜索站点名称、标签或类型…" />
                    <button v-if="keyword" class="np-search__clear" type="button" @click="keyword = ''">✕</button>
                </div>

                <div class="np-tags">
                    <button class="np-tag" :class="{ 'is-on': !activeTags.length }" type="button" @click="clearTags()">
                        全部标签
                    </button>
                    <button v-for="tag in allTags" :key="tag" class="np-tag"
                        :class="{ 'is-on': activeTags.includes(tag) }" type="button" @click="toggleTag(tag)">
                        {{ tag }}
                    </button>
                </div>
            </div>
        </transition>

        <div class="np-body">
            <!-- 一级分类：左侧竖向导航 -->
            <aside class="np-side">
                <button class="np-cat" :class="{ 'is-on': activeId === 'all' }" type="button"
                    @click="pickCategory('all')">
                    <span class="np-cat__name">全部</span>
                    <span class="np-cat__count">{{ filtered.length }}</span>
                </button>
                <button v-for="cat in CATEGORIES" :key="cat.id" class="np-cat" :class="{ 'is-on': activeId === cat.id }"
                    type="button" @click="pickCategory(cat.id)">
                    <span class="np-cat__name">{{ cat.name }}</span>
                    <span class="np-cat__count">{{ countOf(cat.id) }}</span>
                </button>
            </aside>

            <!-- 主内容 -->
            <main class="np-main">
                <!-- 二级分类：分段 pill -->
                <div v-if="kindOptions.length > 1" class="np-kinds">
                    <button class="np-kind" :class="{ 'is-on': activeKind === 'all' }" type="button"
                        @click="pickKind('all')">
                        全部类型
                    </button>
                    <button v-for="kind in kindOptions" :key="kind" class="np-kind"
                        :class="{ 'is-on': activeKind === kind }" type="button" @click="pickKind(kind)">
                        {{ kind }}
                    </button>
                </div>

                <section v-for="group in renderedGroups" :id="`cat-${group.id}`" :key="group.id" class="np-section">
                    <h2 class="np-section__title">
                        <span class="np-section__bar" />
                        {{ group.name }}
                        <span class="np-section__count">{{ group.items.length }}</span>
                    </h2>

                    <div v-for="sub in group.subGroups" :id="`kind-${sub.kind}`" :key="sub.kind" class="np-sub">
                        <h3 class="np-sub__title">
                            {{ sub.kind }}
                            <span class="np-sub__line" />
                            <span class="np-sub__count">{{ sub.items.length }}</span>
                        </h3>

                        <div class="np-grid">
                            <SiteCard v-for="site in sub.items" :key="site.name" :site="site" />
                        </div>
                    </div>
                </section>

                <p v-if="!renderedGroups.length" class="np-empty">暂无匹配站点</p>
            </main>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* ============ 主题变量：写死的深色 ============ */
.np {
    --bg: var(--main-bg);
    --bg-soft: #12161f;
    --bg-raise: #171c26;
    --line: #232a36;
    --line-soft: #1b212b;
    --text: #e6e9ef;
    --text-dim: #9aa4b2;
    --text-mute: #6b7482;
    --accent: #7c8cff;
    --accent-soft: rgba(124, 140, 255, .14);
    --accent-line: rgba(124, 140, 255, .4);

    /* 页面内容最大宽度：宽屏时放开，让网格能排更多列 */
    --page-max: 1680px;
    /* 侧栏宽度，用于主内容宽度计算 */
    --side-w: 190px;

    min-height: 100vh;
    background: var(--main-bg);
    color: var(--text);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    color-scheme: dark;

    border-radius: 25px;
    background-color: var(--page-site-bg-color);
}

/* ============ 顶部 ============ */
.np-header {
    border-radius: 30px 30px 0 0;
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: 18px 24px;

    backdrop-filter: blur(4px);
    border-bottom: 1px solid var(--line-soft);
    background-color: var(--page-sites-top-bg);
}

.np-brand {
    display: flex;
    align-items: center;
    gap: 10px;
}

.np-brand__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-soft);
}

.np-title {
    margin: 0;
    font-size: 19px;
    font-weight: 650;
    letter-spacing: .2px;
    color: var(--text);
}

.np-tools {
    display: flex;
    gap: 10px;
}

.np-icon-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    font-size: 13px;
    color: var(--text-dim);
    background: var(--bg-soft);
    border: 1px solid var(--line);
    border-radius: 10px;
    cursor: pointer;
    transition: .18s;
}

.np-icon-btn:hover {
    color: var(--text);
    border-color: var(--accent-line);
}

.np-icon-btn.is-on {
    color: var(--accent);
    background: var(--accent-soft);
    border-color: var(--accent-line);
}

.np-badge {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 17px;
    text-align: center;
    color: #fff;
    background: var(--accent);
    border-radius: 999px;
}

/* ============ 折叠面板 ============ */
.np-panel {
    max-width: var(--page-max);
    margin: 0 auto;
    padding: 18px 24px 6px;
    display: grid;
    gap: 14px;
    border-bottom: 1px solid var(--line-soft);
    background-color: var(--main-bg);
}

.np-search {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--bg-soft);
    border: 1px solid var(--line);
    border-radius: 12px;
    transition: .18s;
}

.np-search:focus-within {
    border-color: var(--accent-line);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.np-search__icon {
    margin-left: 14px;
    color: var(--text-mute);
    flex: none;
}

.np-search__input {
    flex: 1;
    padding: 11px 12px;
    font-size: 14px;
    color: var(--text);
    background: transparent;
    border: none;
    outline: none;
}

.np-search__input::placeholder {
    color: var(--text-mute);
}

.np-search__clear {
    margin-right: 8px;
    padding: 4px 8px;
    font-size: 12px;
    color: var(--text-mute);
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 6px;
}

.np-search__clear:hover {
    color: var(--text);
    background: var(--bg-raise);
}

.np-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 12px;
}

.np-tag {
    padding: 5px 12px;
    font-size: 12.5px;
    color: var(--text-dim);
    background: var(--bg-soft);
    border: 1px solid var(--line);
    border-radius: 999px;
    cursor: pointer;
    transition: .16s;
}

.np-tag:hover {
    color: var(--text);
    border-color: var(--accent-line);
}

.np-tag.is-on {
    color: var(--accent);
    background: var(--accent-soft);
    border-color: var(--accent-line);
    font-weight: 600;
}

/* 折叠动画 */
.np-drop-enter-active,
.np-drop-leave-active {
    transition: opacity .2s, transform .2s;
}

.np-drop-enter-from,
.np-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ============ 主体：侧栏 + 内容 ============ */
.np-body {
    display: grid;
    grid-template-columns: var(--side-w) minmax(0, 1fr);
    gap: 32px;
    max-width: var(--page-max);
    margin: 0 auto;
    padding: 26px 24px 72px;
    background-color: var(--main-bg);
}

/* 一级分类：竖向导航 */
.np-side {
    position: sticky;
    top: 84px;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding-right: 8px;
    border-right: 1px solid var(--line-soft);
}

.np-cat {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 12px;
    font-size: 13.5px;
    color: var(--text-dim);
    background: transparent;
    border: none;
    border-radius: 9px;
    cursor: pointer;
    text-align: left;
    transition: .16s;
}

.np-cat::before {
    content: '';
    position: absolute;
    left: -9px;
    top: 50%;
    width: 3px;
    height: 0;
    background: var(--accent);
    border-radius: 2px;
    transform: translateY(-50%);
    transition: height .2s;
}

.np-cat:hover {
    color: var(--text);
    background: var(--bg-soft);
}

.np-cat.is-on {
    color: var(--text);
    background: var(--accent-soft);
    font-weight: 600;
}

.np-cat.is-on::before {
    height: 18px;
}

.np-cat__count {
    font-size: 11.5px;
    font-weight: 400;
    color: var(--text-mute);
    font-variant-numeric: tabular-nums;
}

.np-cat.is-on .np-cat__count {
    color: var(--accent);
}

/* 二级分类：分段 pill */
.np-kinds {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 8px;
    margin-bottom: 28px;
    background: var(--bg-soft);
    border: 1px solid var(--line);
    border-radius: 11px;

}

.np-kind {
    padding: 3px 12px;
    font-size: 12.5px;
    color: var(--text-dim);
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: .16s;
    margin: 3px;
}

.np-kind:hover {
    color: var(--text);
}

.np-kind.is-on {
    color: #fff;
    background: var(--accent);
    box-shadow: 0 2px 10px -2px var(--accent-line);
}

/* 一级分类区块 */
.np-section {
    margin-bottom: 40px;
    scroll-margin-top: 90px;
}

.np-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 18px;
    font-size: 16px;
    font-weight: 650;
    color: var(--text);
}

.np-section__bar {
    width: 3px;
    height: 15px;
    background: var(--accent);
    border-radius: 2px;
}

.np-section__count {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-mute);
}

/* 二级分类小节 */
.np-sub {
    margin-bottom: 26px;
    scroll-margin-top: 90px;
}

.np-sub__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 12px;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: .8px;
    text-transform: uppercase;
    color: var(--text-dim);
}

.np-sub__line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--line), transparent);
}

.np-sub__count {
    font-size: 11.5px;
    font-weight: 400;
    color: var(--text-mute);
    font-variant-numeric: tabular-nums;
}

/* ============ 网格：卡片固定宽度，列数随屏幕增长 ============ */
.np-grid {
    display: grid;
    /*
     * 核心两行：
     * 1) repeat(auto-fill, minmax(240px, 1fr))
     *    仍然是「最少 240px、可拉伸」，但在宽容器下 1fr 会把卡片拉宽
     * 2) 因此配合 n 列上限，用媒体查询在宽屏固定列数，卡片宽度保持稳定，
     *    增加的是列数而不是卡片宽度
     */
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
}

/* -------- 断点：逐级增加列数，而非拉宽卡片 -------- */

/* ≥ 900px：3 列 */
@media (min-width: 900px) {
    .np-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 18px;
    }
}

/* ≥ 1250px：4 列 */
@media (min-width: 1250px) {
    .np-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 20px;
    }
}

/* ≥ 1600px：5 列 */
@media (min-width: 1600px) {
    .np-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 20px;
    }
}

/* ≥ 1920px：6 列 */
@media (min-width: 1920px) {
    .np-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 22px;
    }
}

.np-empty {
    padding: 56px 0;
    text-align: center;
    color: var(--text-mute);
    font-size: 14px;
}

/* 响应式：窄屏侧栏转为横向滚动 */
@media (max-width: 720px) {
    .np-body {
        grid-template-columns: 1fr;
        gap: 18px;
        padding: 18px 16px 56px;
    }

    .np-side {
        position: static;
        flex-direction: row;
        gap: 6px;
        overflow-x: auto;
        padding: 0 0 12px;
        border-right: none;
        border-bottom: 1px solid var(--line-soft);
        /* iOS 惯性滚动 */
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }

    .np-side::-webkit-scrollbar {
        display: none;
    }

    .np-cat {
        white-space: nowrap;
        flex: none;
    }

    .np-cat::before {
        display: none;
    }

    .np-cat.is-on {
        border: 1px solid var(--accent-line);
    }

    .np-header,
    .np-panel {
        padding-left: 16px;
        padding-right: 16px;
    }
}
</style>