<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { CATEGORIES, type CategoryId, type Site } from '@/types/site';
import { sites } from '@/config/sites';
import SiteCard from '@/components/CardSiteP/index.vue';

/* ============ ① 基础状态 ============ */
const keyword = ref('');
const debouncedKeyword = ref('');
const activeId = ref<CategoryId | 'all'>('all');
/** 当前选中的二级分类：'all' | kind 名 */
const activeKind = ref<string>('all');
/** 标签栏是否展开（默认收起，点击搜索/输入关键词时展开） */
const tagsOpen = ref(false);
/** 选中的标签（多选） */
const activeTags = ref<string[]>([]);

/* 搜索框引用，便于点击「搜索」按钮时聚焦 */
const searchInput = ref<HTMLInputElement | null>(null);

/* ============ ② 搜索防抖 ============ */
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, (v) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (debouncedKeyword.value = v), 200);
    // 搜索时自动显示标签栏
    if (v) tagsOpen.value = true;
});
onBeforeUnmount(() => clearTimeout(debounceTimer));

/* 点击「搜索」：展开标签栏并聚焦输入框 */
const openSearch = () => {
    tagsOpen.value = true;
    searchInput.value?.focus();
};

/* ============ ③ 标签池（带同标签数量统计） ============ */
/**
 * 统计口径：一个站点若同时命中 kind 与 tags 中的同名标签，只计一次。
 * 数量基于「关键词过滤后的结果集」，因此会随搜索实时变化。
 */
const allTags = computed(() => {
    const map = new Map<string, number>();

    const kw = debouncedKeyword.value.trim().toLowerCase();

    sites.forEach((s) => {
        // 关键词预过滤：让标签数量与当前搜索结果保持一致
        if (kw) {
            const hit =
                s.name.toLowerCase().includes(kw) ||
                (s.tags ?? []).some((t) => t.toLowerCase().includes(kw)) ||
                s.kind.toLowerCase().includes(kw);
            if (!hit) return;
        }

        // 该站点涉及的标签集合（去重，避免 kind 与 tags 同名重复计数）
        const names = new Set<string>();
        if (s.kind) names.add(s.kind);
        (s.tags ?? []).forEach((t) => t && names.add(t));

        names.forEach((name) => {
            map.set(name, (map.get(name) ?? 0) + 1);
        });
    });

    return [...map.entries()]
        .map(([tag, count]) => ({ tag, count }))
        // 数量多的靠前，数量相同按字典序
        .sort((a, b) => (b.count - a.count) || a.tag.localeCompare(b.tag));
});

/** 标签总数（标签栏头部展示） */
const tagTotalCount = computed(() => allTags.value.length);

const toggleTag = (tag: string) => {
    if (activeTags.value.includes(tag)) {
        activeTags.value = activeTags.value.filter((t) => t !== tag);
    } else {
        activeTags.value = [...activeTags.value, tag];
    }
    activeKind.value = 'all';
};

const clearTags = () => {
    activeTags.value = [];
    activeKind.value = 'all';
};

const resetAll = () => {
    keyword.value = '';
    debouncedKeyword.value = '';
    activeTags.value = [];
    activeKind.value = 'all';
    activeId.value = 'all';
};

const hasFilter = computed(
    () => !!debouncedKeyword.value || activeTags.value.length > 0,
);

/* ============ ④ 过滤 ============ */
const filtered = computed<Site[]>(() => {
    const kw = debouncedKeyword.value.trim().toLowerCase();
    let list = sites;
    if (kw) {
        list = list.filter(
            (s) =>
                s.name.toLowerCase().includes(kw) ||
                (s.tags ?? []).some((t) => t.toLowerCase().includes(kw)) ||
                s.kind.toLowerCase().includes(kw),
        );
    }
    if (activeTags.value.length) {
        list = list.filter(
            (s) =>
                activeTags.value.includes(s.kind) ||
                (s.tags ?? []).some((t) => activeTags.value.includes(t)),
        );
    }
    return list;
});

/* ============ ⑤ 计数预聚合 ============ */
const countMap = computed(() => {
    const map = new Map<string, number>();
    for (const s of filtered.value) {
        map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
    }
    return map;
});
const countOf = (id: CategoryId) => countMap.value.get(id) ?? 0;

/* ============ ⑥ 二级分组 ============ */
const buildSubGroups = (list: Site[]) => {
    const map = new Map<string, Site[]>();
    list.forEach((s) => {
        if (!map.has(s.kind)) map.set(s.kind, []);
        map.get(s.kind)!.push(s);
    });
    return [...map.entries()].map(([kind, items]) => ({ kind, items }));
};

const groups = computed(() =>
    CATEGORIES.map((cat) => {
        const items = filtered.value.filter((s) => s.categoryId === cat.id);
        return { ...cat, items, subGroups: buildSubGroups(items) };
    }),
);

const visibleGroups = computed(() =>
    activeId.value === 'all'
        ? groups.value
        : groups.value.filter((g) => g.id === activeId.value),
);

const kindOptions = computed(() => {
    const set = new Set<string>();
    visibleGroups.value.forEach((g) =>
        g.subGroups.forEach((sub) => set.add(sub.kind)),
    );
    return [...set];
});

watch(kindOptions, (opts) => {
    if (activeKind.value !== 'all' && !opts.includes(activeKind.value)) {
        activeKind.value = 'all';
    }
});

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

/* ============ ⑦ 内部滚动定位 ============ */
const scrollContainer = ref<HTMLElement | null>(null);

const scrollTo = (id: string) => {
    const container = scrollContainer.value;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!target) return;
    const top =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
    container.scrollTo({ top, behavior: 'smooth' });
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
    <div class="np">
        <!-- 顶部栏：固定不滚动 -->
        <header class="np-header">
            <div class="np-brand">
                <span class="np-brand__dot" aria-hidden="true" />
                <h1 class="np-title">网站导航</h1>
            </div>

            <!-- 常驻搜索框 -->
            <div class="np-searchbar">
                <div class="np-search">
                    <svg class="np-search__icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                        stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                    </svg>
                    <input ref="searchInput" v-model="keyword" class="np-search__input" type="search"
                        aria-label="搜索站点名称、标签或类型" placeholder="搜索站点名称、标签或类型…" @focus="tagsOpen = true" />
                    <button v-if="keyword" class="np-search__clear" type="button" aria-label="清空搜索"
                        @click="keyword = ''">
                        ✕
                    </button>
                </div>

                <button class="np-btn np-btn--ghost np-search-btn" type="button" aria-label="搜索并展开标签"
                    @click="openSearch">
                    搜索
                </button>

                <button v-if="hasFilter" class="np-btn np-btn--ghost" type="button" @click="resetAll">
                    重置
                </button>
            </div>
        </header>

        <!-- 可折叠：标签栏（默认收起，点击搜索 / 输入关键词时显示） -->
        <transition name="np-drop">
            <div v-show="tagsOpen" id="np-panel" class="np-panel">
                <div class="np-tags__head">
                    <span class="np-tags__title">标签</span>
                    <span class="np-tags__total">共 {{ tagTotalCount }} 个</span>
                    <button class="np-tags__close" type="button" aria-label="收起标签" @click="tagsOpen = false">
                        ✕
                    </button>
                </div>

                <div class="np-tags">
                    <button class="np-chip" type="button" :aria-pressed="!activeTags.length"
                        :class="{ 'is-on': !activeTags.length }" @click="clearTags()">
                        全部标签
                        <span class="np-chip__count">{{ sites.length }}</span>
                    </button>
                    <button v-for="item in allTags" :key="item.tag" class="np-chip" type="button"
                        :aria-pressed="activeTags.includes(item.tag)"
                        :class="{ 'is-on': activeTags.includes(item.tag) }" @click="toggleTag(item.tag)">
                        {{ item.tag }}
                        <span class="np-chip__count">{{ item.count }}</span>
                    </button>
                </div>
            </div>
        </transition>

        <!-- 可滚动主体：侧栏固定 + 右侧卡片滚动 -->
        <div class="np-body">
            <aside class="np-side" aria-label="一级分类">
                <button class="np-cat" type="button" :aria-pressed="activeId === 'all'"
                    :class="{ 'is-on': activeId === 'all' }" @click="pickCategory('all')">
                    <span class="np-cat__name">全部</span>
                    <span class="np-cat__count">{{ filtered.length }}</span>
                </button>
                <button v-for="cat in CATEGORIES" :key="cat.id" class="np-cat" type="button"
                    :aria-pressed="activeId === cat.id" :class="{ 'is-on': activeId === cat.id }"
                    @click="pickCategory(cat.id)">
                    <span class="np-cat__name">{{ cat.name }}</span>
                    <span class="np-cat__count">{{ countOf(cat.id) }}</span>
                </button>
            </aside>

            <!-- 主内容：唯一的滚动容器 -->
            <main ref="scrollContainer" class="np-main">
                <div id="nav-top" class="np-anchor" aria-hidden="true" />

                <div v-if="kindOptions.length > 1" class="np-kinds" role="tablist" aria-label="二级类型">
                    <button class="np-kind" type="button" role="tab" :aria-selected="activeKind === 'all'"
                        :class="{ 'is-on': activeKind === 'all' }" @click="pickKind('all')">
                        全部类型
                    </button>
                    <button v-for="kind in kindOptions" :key="kind" class="np-kind" type="button" role="tab"
                        :aria-selected="activeKind === kind" :class="{ 'is-on': activeKind === kind }"
                        @click="pickKind(kind)">
                        {{ kind }}
                    </button>
                </div>

                <section v-for="group in renderedGroups" :id="`cat-${group.id}`" :key="group.id" class="np-section">
                    <h2 class="np-section__title">
                        <span class="np-section__bar" aria-hidden="true" />
                        {{ group.name }}
                        <span class="np-section__count">{{ group.items.length }}</span>
                    </h2>

                    <div v-for="sub in group.subGroups" :id="`kind-${sub.kind}`" :key="sub.kind" class="np-sub">
                        <h3 class="np-sub__title">
                            {{ sub.kind }}
                            <span class="np-sub__line" aria-hidden="true" />
                            <span class="np-sub__count">{{ sub.items.length }}</span>
                        </h3>

                        <div class="np-grid">
                            <SiteCard v-for="site in sub.items" :key="site.name" :site="site" />
                        </div>
                    </div>
                </section>

                <div v-if="!renderedGroups.length" class="np-empty">
                    <p class="np-empty__text">
                        {{ hasFilter ? '没有符合当前筛选条件的站点' : '暂无站点数据' }}
                    </p>
                    <button v-if="hasFilter" class="np-btn np-btn--primary" type="button" @click="resetAll">
                        清空全部筛选
                    </button>
                </div>
            </main>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* ==================================================================
   黑色玻璃主题（全部写死色值，无 CSS 变量依赖）
   ================================================================== */
.np {
    color-scheme: dark;
    height: 100vh;
    height: 100dvh;
    box-sizing: border-box;
    padding: 60px 80px;

    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    color: #e8e8ea;
    background: transparent;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
        Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ============ 通用按钮 ============ */
.np-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    font-size: 13.5px;
    font-family: inherit;
    border-radius: 11px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease,
        border-color 0.18s ease, box-shadow 0.18s ease;
}

.np-btn--ghost {
    color: #9a9aa2;
    background: rgba(28, 28, 32, 0.45);
    border-color: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

.np-btn--ghost:hover {
    color: #e8e8ea;
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(40, 40, 46, 0.85);
}

.np-btn--ghost.is-on {
    color: #8b8bff;
    background: rgba(139, 139, 255, 0.14);
    border-color: rgba(139, 139, 255, 0.45);
}

.np-btn--primary {
    color: #ffffff;
    background: #8b8bff;
    border-color: #8b8bff;
    box-shadow: 0 2px 10px -2px rgba(139, 139, 255, 0.35);
}

.np-btn--primary:hover {
    background: #7676f5;
    border-color: #7676f5;
}

.np-badge {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 17px;
    text-align: center;
    color: #ffffff;
    background: #8b8bff;
    border-radius: 999px;
}

/* ============ 顶部：固定不滚动（玻璃主面） ============ */
.np-header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 1680px;
    width: 100%;
    margin: 0 auto;
    padding: 12px 16px;
    box-sizing: border-box;
    border-radius: 18px 18px 0 0;
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(18, 18, 20, 0.72);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

.np-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: none;
}

.np-brand__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #8b8bff;
    box-shadow: 0 0 0 4px rgba(139, 139, 255, 0.14);
}

.np-title {
    margin: 0;
    font-size: 19px;
    font-weight: 650;
    letter-spacing: 0.2px;
    color: #e8e8ea;
    white-space: nowrap;
}

/* 顶部搜索区：搜索框 + 搜索按钮 + 重置 */
.np-searchbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
}

/* ============ 搜索框 ============ */
.np-search {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    max-width: 460px;
    background: rgba(28, 28, 32, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 14px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.np-search:focus-within {
    border-color: rgba(139, 139, 255, 0.45);
    box-shadow: 0 0 0 3px rgba(139, 139, 255, 0.14);
}

.np-search__icon {
    flex: none;
    margin-left: 12px;
    color: #6b6b74;
}

.np-search__input {
    flex: 1;
    min-width: 0;
    padding: 9px 12px;
    font-size: 13.5px;
    font-family: inherit;
    color: #e8e8ea;
    background: transparent;
    border: none;
    outline: none;
}

.np-search__input::placeholder {
    color: #6b6b74;
}

.np-search__clear {
    margin-right: 8px;
    padding: 4px 8px;
    font-size: 12px;
    color: #6b6b74;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease;
}

.np-search__clear:hover {
    color: #e8e8ea;
    background: rgba(40, 40, 46, 0.85);
}

.np-search-btn {
    flex: none;
}

/* ============ 折叠标签栏（玻璃） ============ */
.np-panel {
    flex: none;
    display: grid;
    gap: 10px;
    max-width: 1680px;
    width: 100%;
    margin: 0 auto;
    padding: 12px 16px;
    box-sizing: border-box;
    border-left: 1px solid rgba(255, 255, 255, 0.10);
    border-right: 1px solid rgba(255, 255, 255, 0.10);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(18, 18, 20, 0.55);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    max-height: 40%;
    overflow-y: auto;
}

.np-tags__head {
    display: flex;
    align-items: center;
    gap: 8px;
}

.np-tags__title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #9a9aa2;
}

.np-tags__total {
    font-size: 11.5px;
    color: #6b6b74;
}

.np-tags__close {
    margin-left: auto;
    padding: 2px 8px;
    font-size: 12px;
    color: #6b6b74;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease;
}

.np-tags__close:hover {
    color: #e8e8ea;
    background: rgba(40, 40, 46, 0.85);
}

.np-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

/* 标签胶囊 + 数量角标 */
.np-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px 5px 12px;
    font-size: 12.5px;
    font-family: inherit;
    color: #9a9aa2;
    background: rgba(28, 28, 32, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 999px;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease,
        border-color 0.18s ease;
}

.np-chip:hover {
    color: #e8e8ea;
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(40, 40, 46, 0.85);
}

.np-chip.is-on {
    color: #8b8bff;
    background: rgba(139, 139, 255, 0.14);
    border-color: rgba(139, 139, 255, 0.45);
    font-weight: 600;
}

/* 数量角标 */
.np-chip__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 17px;
    padding: 0 5px;
    font-size: 10.5px;
    font-weight: 500;
    line-height: 1;
    color: rgba(255, 255, 255, 0.75);
    background: rgba(255, 255, 255, 0.10);
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
    transition: color 0.18s ease, background 0.18s ease;
}

.np-chip.is-on .np-chip__count {
    color: #ffffff;
    background: rgba(139, 139, 255, 0.55);
}

/* 折叠动画 */
.np-drop-enter-active,
.np-drop-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.np-drop-enter-from,
.np-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

/* ============ 主体两栏（玻璃大面） ============ */
.np-body {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 190px minmax(0, 1fr);
    gap: 22px;
    max-width: 1680px;
    width: 100%;
    margin: 0 auto;
    padding: 0 16px 16px;
    box-sizing: border-box;
    overflow: hidden;
    border-left: 1px solid rgba(255, 255, 255, 0.10);
    border-right: 1px solid rgba(255, 255, 255, 0.10);
    border-bottom: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 0 0 18px 18px;
    background: rgba(18, 18, 20, 0.55);
    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);
    box-shadow: 0 12px 40px -16px rgba(0, 0, 0, 0.75),
        inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

/* 一级分类侧栏 */
.np-side {
    position: sticky;
    top: 0;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 22px 0;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    max-height: 100%;
    overflow-y: auto;
}

.np-cat {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 12px 9px 16px;
    font-size: 13.5px;
    font-family: inherit;
    color: #9a9aa2;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: color 0.18s ease, background 0.18s ease;
}

.np-cat::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 0;
    background: #8b8bff;
    border-radius: 2px;
    transform: translateY(-50%);
    transition: height 0.2s ease;
}

.np-cat:hover {
    color: #e8e8ea;
    background: rgba(28, 28, 32, 0.45);
}

.np-cat.is-on {
    color: #e8e8ea;
    background: rgba(139, 139, 255, 0.14);
    font-weight: 600;
}

.np-cat.is-on::before {
    height: 18px;
}

.np-cat__count {
    font-size: 11.5px;
    font-weight: 400;
    color: #6b6b74;
    font-variant-numeric: tabular-nums;
}

.np-cat.is-on .np-cat__count {
    color: #8b8bff;
}

/* 主内容：唯一滚动容器 */
.np-main {
    position: relative;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 22px 4px 56px 0;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

.np-main::-webkit-scrollbar {
    width: 8px;
}

.np-main::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
}

.np-main::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.32);
}

/* 顶部锚点 */
.np-anchor {
    height: 0;
    overflow: hidden;
}

/* 二级分类 pill（玻璃） */
.np-kinds {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 8px;
    margin-bottom: 28px;
    background: rgba(28, 28, 32, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 11px;
    backdrop-filter: blur(11px);
    -webkit-backdrop-filter: blur(11px);
}

.np-kind {
    padding: 5px 12px;
    font-size: 12.5px;
    font-family: inherit;
    color: #9a9aa2;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: color 0.18s ease, background 0.18s ease;
}

.np-kind:hover {
    color: #e8e8ea;
    background: rgba(40, 40, 46, 0.85);
}

.np-kind.is-on {
    color: #ffffff;
    background: #8b8bff;
    box-shadow: 0 2px 10px -2px rgba(139, 139, 255, 0.35);
    font-weight: 600;
}

/* 一级分类区块 */
.np-section {
    margin-bottom: 40px;
    scroll-margin-top: 16px;
}

.np-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 22px;
    font-size: 16px;
    font-weight: 650;
    color: #e8e8ea;
}

.np-section__bar {
    width: 3px;
    height: 15px;
    background: #8b8bff;
    border-radius: 2px;
}

.np-section__count {
    font-size: 12px;
    font-weight: 400;
    color: #6b6b74;
}

/* 二级分类小节 */
.np-sub {
    margin-bottom: 28px;
    scroll-margin-top: 16px;
}

.np-sub__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 12px;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #9a9aa2;
}

.np-sub__line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.06), transparent);
}

.np-sub__count {
    font-size: 11.5px;
    font-weight: 400;
    color: #6b6b74;
    font-variant-numeric: tabular-nums;
}

/* ============ 网格 ============ */
.np-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
}

@media (min-width: 900px) {
    .np-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }
}

@media (min-width: 1250px) {
    .np-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 22px;
    }
}

@media (min-width: 1600px) {
    .np-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 22px;
    }
}

@media (min-width: 1920px) {
    .np-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 22px;
    }
}

/* ============ 空状态 ============ */
.np-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 56px 0;
    color: #6b6b74;
}

.np-empty__text {
    margin: 0;
    font-size: 14px;
}

/* ============ 无障碍：键盘焦点可见 ============ */
.np :focus-visible {
    outline: 2px solid #8b8bff;
    outline-offset: 2px;
}

/* 尊重减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
    .np-main {
        scroll-behavior: auto;
    }

    .np *,
    .np *::before,
    .np *::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}

/* ============ 响应式 ============ */
@media (max-width: 1024px) {
    .np {
        padding: 28px;
    }
}

@media (max-width: 720px) {
    .np {
        padding: 0;
    }

    .np-header {
        flex-wrap: wrap;
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: 12px 16px;
    }

    .np-searchbar {
        order: 3;
        flex: 1 1 100%;
        justify-content: stretch;
    }

    .np-search {
        max-width: none;
    }

    .np-panel {
        border-left: none;
        border-right: none;
        padding-left: 16px;
        padding-right: 16px;
    }

    .np-body {
        grid-template-columns: 1fr;
        gap: 0;
        padding: 0 16px 16px;
        border-left: none;
        border-right: none;
        border-bottom: none;
        border-radius: 0;
        box-shadow: none;
    }

    .np-side {
        flex-direction: row;
        gap: 6px;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 12px 0;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        max-height: none;
    }

    .np-side::-webkit-scrollbar {
        display: none;
    }

    .np-cat {
        flex: none;
        white-space: nowrap;
    }

    .np-cat::before {
        display: none;
    }

    .np-cat.is-on {
        border: 1px solid rgba(139, 139, 255, 0.45);
    }

    .np-main {
        padding: 16px 0 40px;
    }
}

/* ============ 打印 ============ */
@media print {
    .np {
        height: auto;
        overflow: visible;
        padding: 0;
    }

    .np-header,
    .np-panel,
    .np-side,
    .np-kinds {
        display: none;
    }

    .np-main {
        height: auto;
        overflow: visible;
        padding: 0;
    }
}
</style>