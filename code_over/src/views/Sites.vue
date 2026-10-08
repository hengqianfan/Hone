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
/** 标签/搜索面板是否展开（默认收起） */
const filtersOpen = ref(false);
/** 选中的标签（多选） */
const activeTags = ref<string[]>([]);

/* ============ ② 搜索防抖 ============ */
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, (v) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (debouncedKeyword.value = v), 200);
});
onBeforeUnmount(() => clearTimeout(debounceTimer));

/* ============ ③ 标签池 ============ */
const allTags = computed(() => {
    const set = new Set<string>();
    sites.forEach((s) => {
        if (s.kind) set.add(s.kind);
        (s.tags ?? []).forEach((t) => t && set.add(t));
    });
    return [...set];
});

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

            <div class="np-tools">
                <button class="np-btn np-btn--ghost" type="button" :aria-expanded="filtersOpen" aria-controls="np-panel"
                    :class="{ 'is-on': filtersOpen }" @click="filtersOpen = !filtersOpen">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                        aria-hidden="true">
                        <path d="M3 5h18M6 12h12M10 19h4" stroke-linecap="round" />
                    </svg>
                    筛选
                    <span v-if="activeTags.length" class="np-badge">{{ activeTags.length }}</span>
                </button>

                <button v-if="hasFilter" class="np-btn np-btn--ghost" type="button" @click="resetAll">
                    重置
                </button>
            </div>
        </header>

        <!-- 可折叠：搜索 + 标签 -->
        <transition name="np-drop">
            <div v-show="filtersOpen" id="np-panel" class="np-panel">
                <div class="np-search">
                    <svg class="np-search__icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                        stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" stroke-linecap="round" />
                    </svg>
                    <input v-model="keyword" class="np-search__input" type="search" aria-label="搜索站点名称、标签或类型"
                        placeholder="搜索站点名称、标签或类型…" />
                    <button v-if="keyword" class="np-search__clear" type="button" aria-label="清空搜索"
                        @click="keyword = ''">
                        ✕
                    </button>
                </div>

                <div class="np-tags">
                    <button class="np-chip" type="button" :aria-pressed="!activeTags.length"
                        :class="{ 'is-on': !activeTags.length }" @click="clearTags()">
                        全部标签
                    </button>
                    <button v-for="tag in allTags" :key="tag" class="np-chip" type="button"
                        :aria-pressed="activeTags.includes(tag)" :class="{ 'is-on': activeTags.includes(tag) }"
                        @click="toggleTag(tag)">
                        {{ tag }}
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
   主题变量统一声明区（全部集中在最前面）
   默认：白色透明玻璃（light glassmorphism）
   - 覆盖方式 A（全局）：:root { --np-accent: #1677ff; }
   - 覆盖方式 B（局部）：父级元素上写同名变量
   ================================================================== */
.np {
    /* ---------- 玻璃面（核心） ---------- */
    --np-glass-bg: rgba(255, 255, 255, 0.55); // 玻璃主面
    --np-glass-bg-strong: rgba(255, 255, 255, 0.72); // 顶部栏/不透明区
    --np-glass-bg-soft: rgba(255, 255, 255, 0.36); // 次级玻璃（搜索框、chip）
    --np-glass-bg-hover: rgba(255, 255, 255, 0.82); // 悬停面
    --np-glass-blur: 18px; // 毛玻璃强度
    --np-glass-saturate: 160%; // 色彩饱和增强，玻璃更通透

    /* ---------- 页面底色（玻璃后面那层，需有色彩/图案才好看） ---------- */
    --np-page-bg: #eef2fb;

    /* ---------- 描边 / 分割线（玻璃用白色高光描边） ---------- */
    --np-line: rgba(255, 255, 255, 0.85); // 高光描边
    --np-line-soft: rgba(15, 30, 70, 0.07); // 内部分割线
    --np-line-strong: rgba(255, 255, 255, 0.95);
    --np-scrollbar: rgba(15, 30, 70, 0.18);
    --np-scrollbar-hover: rgba(15, 30, 70, 0.3);

    /* ---------- 文字 ---------- */
    --np-text: #1b2230;
    --np-text-dim: #4a5568;
    --np-text-mute: #7b8698;
    --np-text-invert: #ffffff;

    /* ---------- 强调色 ---------- */
    --np-accent: #5566f0;
    --np-accent-hover: #4353e8;
    --np-accent-soft: rgba(85, 102, 240, 0.12);
    --np-accent-line: rgba(85, 102, 240, 0.35);
    --np-accent-glow: rgba(85, 102, 240, 0.25);

    /* ---------- 尺寸 / 间距 ---------- */
    --np-space-1: 4px;
    --np-space-2: 8px;
    --np-space-3: 12px;
    --np-space-4: 16px;
    --np-space-5: 22px;
    --np-space-6: 28px;
    --np-space-7: 40px;
    --np-space-8: 56px;

    --np-radius-sm: 8px;
    --np-radius-md: 11px;
    --np-radius-lg: 14px;
    --np-radius-xl: 18px;
    --np-radius-pill: 999px;

    --np-font-sm: 12.5px;
    --np-font-base: 14px;
    --np-font-md: 13.5px;
    --np-font-lg: 16px;
    --np-font-title: 19px;

    --np-page-max: 1680px;
    --np-side-w: 190px;
    --np-shell-pad-y: 60px;
    --np-shell-pad-x: 80px;

    --np-transition: 0.18s ease;

    /* ---------- 玻璃阴影（浅色下要非常轻） ---------- */
    --np-shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.04);
    --np-shadow-md: 0 10px 30px -12px rgba(16, 24, 40, 0.18);
    --np-shadow-glass: 0 12px 40px -16px rgba(31, 45, 90, 0.28),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    --np-shadow-accent: 0 2px 10px -2px var(--np-accent-glow);

    /* ---------- 主题基础 ---------- */
    color-scheme: light;
    height: 100vh;
    height: 100dvh;
    box-sizing: border-box;
    padding: var(--np-shell-pad-y) var(--np-shell-pad-x);

    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;

    color: var(--np-text);
    background: transparent;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
        Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* 供外部主题切换的挂载点：父级或 :root 上设置 data-np-theme="dark" 整体切暗 */
:global([data-np-theme='dark']) .np,
:global(.dark) .np {
    --np-glass-bg: rgba(23, 28, 38, 0.55);
    --np-glass-bg-strong: rgba(23, 28, 38, 0.72);
    --np-glass-bg-soft: rgba(23, 28, 38, 0.36);
    --np-glass-bg-hover: rgba(35, 42, 55, 0.82);
    --np-page-bg: #0f131b;
    --np-line: rgba(255, 255, 255, 0.12);
    --np-line-soft: rgba(255, 255, 255, 0.08);
    --np-line-strong: rgba(255, 255, 255, 0.2);
    --np-scrollbar: rgba(255, 255, 255, 0.18);
    --np-scrollbar-hover: rgba(255, 255, 255, 0.32);
    --np-text: #e6e9ef;
    --np-text-dim: #9aa4b2;
    --np-text-mute: #6b7482;
    --np-accent: #7c8cff;
    --np-accent-soft: rgba(124, 140, 255, 0.14);
    --np-accent-line: rgba(124, 140, 255, 0.4);
    --np-accent-glow: rgba(124, 140, 255, 0.3);
    --np-shadow-glass: 0 12px 40px -16px rgba(0, 0, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    color-scheme: dark;
}

/* 不支持毛玻璃的浏览器回退：提高不透明度，避免文字糊在背景上 */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .np {
        --np-glass-bg: rgba(255, 255, 255, 0.9);
        --np-glass-bg-strong: rgba(255, 255, 255, 0.95);
        --np-glass-bg-soft: rgba(255, 255, 255, 0.82);
        --np-glass-bg-hover: rgba(255, 255, 255, 0.98);
    }
}

/* ============ 通用按钮 ============ */
.np-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: var(--np-space-2) var(--np-space-3);
    font-size: var(--np-font-md);
    font-family: inherit;
    border-radius: var(--np-radius-md);
    border: 1px solid transparent;
    cursor: pointer;
    transition: color var(--np-transition), background var(--np-transition),
        border-color var(--np-transition), box-shadow var(--np-transition);
}

.np-btn--ghost {
    color: var(--np-text-dim);
    background: var(--np-glass-bg-soft);
    border-color: var(--np-line);
    backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    -webkit-backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    box-shadow: var(--np-shadow-sm);
}

.np-btn--ghost:hover {
    color: var(--np-text);
    border-color: var(--np-accent-line);
    background: var(--np-glass-bg-hover);
}

.np-btn--ghost.is-on {
    color: var(--np-accent);
    background: var(--np-accent-soft);
    border-color: var(--np-accent-line);
}

.np-btn--primary {
    color: var(--np-text-invert);
    background: var(--np-accent);
    border-color: var(--np-accent);
    box-shadow: var(--np-shadow-accent);
}

.np-btn--primary:hover {
    background: var(--np-accent-hover);
    border-color: var(--np-accent-hover);
}

.np-badge {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    font-size: 11px;
    line-height: 17px;
    text-align: center;
    color: var(--np-text-invert);
    background: var(--np-accent);
    border-radius: var(--np-radius-pill);
}

/* ============ 顶部：固定不滚动（玻璃主面） ============ */
.np-header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--np-space-4);
    max-width: var(--np-page-max);
    width: 100%;
    margin: 0 auto;
    padding: var(--np-space-3) var(--np-space-4);
    box-sizing: border-box;
    border-radius: var(--np-radius-xl) var(--np-radius-xl) 0 0;
    border: 1px solid var(--np-line);
    border-bottom: 1px solid var(--np-line-soft);
    background: var(--np-glass-bg-strong);
    backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    -webkit-backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    box-shadow: inset 0 1px 0 var(--np-line-strong);
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
    background: var(--np-accent);
    box-shadow: 0 0 0 4px var(--np-accent-soft);
}

.np-title {
    margin: 0;
    font-size: var(--np-font-title);
    font-weight: 650;
    letter-spacing: 0.2px;
    color: var(--np-text);
}

.np-tools {
    display: flex;
    gap: 10px;
}

/* ============ 折叠面板（玻璃） ============ */
.np-panel {
    flex: none;
    display: grid;
    gap: var(--np-space-4);
    max-width: var(--np-page-max);
    width: 100%;
    margin: 0 auto;
    padding: var(--np-space-4) var(--np-space-4) var(--np-space-2);
    box-sizing: border-box;
    border-left: 1px solid var(--np-line);
    border-right: 1px solid var(--np-line);
    border-bottom: 1px solid var(--np-line-soft);
    background: var(--np-glass-bg);
    backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    -webkit-backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    max-height: 40%;
    overflow-y: auto;
}

.np-search {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--np-glass-bg-soft);
    border: 1px solid var(--np-line);
    border-radius: var(--np-radius-lg);
    transition: border-color var(--np-transition), box-shadow var(--np-transition);
}

.np-search:focus-within {
    border-color: var(--np-accent-line);
    box-shadow: 0 0 0 3px var(--np-accent-soft);
}

.np-search__icon {
    flex: none;
    margin-left: var(--np-space-3);
    color: var(--np-text-mute);
}

.np-search__input {
    flex: 1;
    min-width: 0;
    padding: 11px var(--np-space-3);
    font-size: var(--np-font-base);
    font-family: inherit;
    color: var(--np-text);
    background: transparent;
    border: none;
    outline: none;
}

.np-search__input::placeholder {
    color: var(--np-text-mute);
}

.np-search__clear {
    margin-right: var(--np-space-2);
    padding: var(--np-space-1) var(--np-space-2);
    font-size: 12px;
    color: var(--np-text-mute);
    background: transparent;
    border: none;
    border-radius: var(--np-radius-sm);
    cursor: pointer;
    transition: color var(--np-transition), background var(--np-transition);
}

.np-search__clear:hover {
    color: var(--np-text);
    background: var(--np-glass-bg-hover);
}

.np-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--np-space-2);
    padding-bottom: var(--np-space-3);
}

.np-chip {
    padding: 5px var(--np-space-3);
    font-size: var(--np-font-sm);
    font-family: inherit;
    color: var(--np-text-dim);
    background: var(--np-glass-bg-soft);
    border: 1px solid var(--np-line);
    border-radius: var(--np-radius-pill);
    cursor: pointer;
    transition: color var(--np-transition), background var(--np-transition),
        border-color var(--np-transition);
}

.np-chip:hover {
    color: var(--np-text);
    border-color: var(--np-accent-line);
    background: var(--np-glass-bg-hover);
}

.np-chip.is-on {
    color: var(--np-accent);
    background: var(--np-accent-soft);
    border-color: var(--np-accent-line);
    font-weight: 600;
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
    grid-template-columns: var(--np-side-w) minmax(0, 1fr);
    gap: var(--np-space-5);
    max-width: var(--np-page-max);
    width: 100%;
    margin: 0 auto;
    padding: 0 var(--np-space-4) var(--np-space-4);
    box-sizing: border-box;
    overflow: hidden;
    border-left: 1px solid var(--np-line);
    border-right: 1px solid var(--np-line);
    border-bottom: 1px solid var(--np-line);
    border-radius: 0 0 var(--np-radius-xl) var(--np-radius-xl);
    background: var(--np-glass-bg);
    backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    -webkit-backdrop-filter: blur(var(--np-glass-blur)) saturate(var(--np-glass-saturate));
    box-shadow: var(--np-shadow-glass);
}

/* 一级分类侧栏 */
.np-side {
    position: sticky;
    top: 0;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: var(--np-space-5) 0;
    border-right: 1px solid var(--np-line-soft);
    max-height: 100%;
    overflow-y: auto;
}

.np-cat {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 9px var(--np-space-3) 9px var(--np-space-4);
    font-size: var(--np-font-md);
    font-family: inherit;
    color: var(--np-text-dim);
    background: transparent;
    border: none;
    border-radius: var(--np-radius-sm);
    cursor: pointer;
    text-align: left;
    transition: color var(--np-transition), background var(--np-transition);
}

.np-cat::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 0;
    background: var(--np-accent);
    border-radius: 2px;
    transform: translateY(-50%);
    transition: height 0.2s ease;
}

.np-cat:hover {
    color: var(--np-text);
    background: var(--np-glass-bg-soft);
}

.np-cat.is-on {
    color: var(--np-text);
    background: var(--np-accent-soft);
    font-weight: 600;
}

.np-cat.is-on::before {
    height: 18px;
}

.np-cat__count {
    font-size: 11.5px;
    font-weight: 400;
    color: var(--np-text-mute);
    font-variant-numeric: tabular-nums;
}

.np-cat.is-on .np-cat__count {
    color: var(--np-accent);
}

/* 主内容：唯一滚动容器 */
.np-main {
    position: relative;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--np-space-5) var(--np-space-1) var(--np-space-8) 0;
    overscroll-behavior: contain;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: var(--np-scrollbar) transparent;
}

.np-main::-webkit-scrollbar {
    width: 8px;
}

.np-main::-webkit-scrollbar-thumb {
    background: var(--np-scrollbar);
    border-radius: var(--np-radius-pill);
}

.np-main::-webkit-scrollbar-thumb:hover {
    background: var(--np-scrollbar-hover);
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
    padding: var(--np-space-2);
    margin-bottom: var(--np-space-6);
    background: var(--np-glass-bg-soft);
    border: 1px solid var(--np-line);
    border-radius: var(--np-radius-md);
    backdrop-filter: blur(calc(var(--np-glass-blur) * 0.6));
    -webkit-backdrop-filter: blur(calc(var(--np-glass-blur) * 0.6));
}

.np-kind {
    padding: 5px var(--np-space-3);
    font-size: var(--np-font-sm);
    font-family: inherit;
    color: var(--np-text-dim);
    background: transparent;
    border: none;
    border-radius: var(--np-radius-sm);
    cursor: pointer;
    transition: color var(--np-transition), background var(--np-transition);
}

.np-kind:hover {
    color: var(--np-text);
    background: var(--np-glass-bg-hover);
}

.np-kind.is-on {
    color: var(--np-text-invert);
    background: var(--np-accent);
    box-shadow: var(--np-shadow-accent);
    font-weight: 600;
}

/* 一级分类区块 */
.np-section {
    margin-bottom: var(--np-space-7);
    scroll-margin-top: var(--np-space-4);
}

.np-section__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 var(--np-space-5);
    font-size: var(--np-font-lg);
    font-weight: 650;
    color: var(--np-text);
}

.np-section__bar {
    width: 3px;
    height: 15px;
    background: var(--np-accent);
    border-radius: 2px;
}

.np-section__count {
    font-size: 12px;
    font-weight: 400;
    color: var(--np-text-mute);
}

/* 二级分类小节 */
.np-sub {
    margin-bottom: var(--np-space-6);
    scroll-margin-top: var(--np-space-4);
}

.np-sub__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 var(--np-space-3);
    font-size: var(--np-font-sm);
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--np-text-dim);
}

.np-sub__line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--np-line-soft), transparent);
}

.np-sub__count {
    font-size: 11.5px;
    font-weight: 400;
    color: var(--np-text-mute);
    font-variant-numeric: tabular-nums;
}

/* ============ 网格 ============ */
.np-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--np-space-4);
}

@media (min-width: 900px) {
    .np-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--np-space-4);
    }
}

@media (min-width: 1250px) {
    .np-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: var(--np-space-5);
    }
}

@media (min-width: 1600px) {
    .np-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: var(--np-space-5);
    }
}

@media (min-width: 1920px) {
    .np-grid {
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: var(--np-space-5);
    }
}

/* ============ 空状态 ============ */
.np-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--np-space-3);
    padding: var(--np-space-8) 0;
    color: var(--np-text-mute);
}

.np-empty__text {
    margin: 0;
    font-size: var(--np-font-base);
}

/* ============ 无障碍：键盘焦点可见 ============ */
.np :focus-visible {
    outline: 2px solid var(--np-accent);
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
        --np-shell-pad-y: 28px;
        --np-shell-pad-x: 28px;
    }
}

@media (max-width: 720px) {
    .np {
        --np-shell-pad-y: 0px;
        --np-shell-pad-x: 0px;
        --np-side-w: 100%;
        --np-glass-blur: 14px;
    }

    .np-header {
        border-radius: 0;
        border-left: none;
        border-right: none;
        padding: var(--np-space-3) var(--np-space-4);
    }

    .np-panel {
        border-left: none;
        border-right: none;
        padding-left: var(--np-space-4);
        padding-right: var(--np-space-4);
    }

    .np-body {
        grid-template-columns: 1fr;
        gap: 0;
        padding: 0 var(--np-space-4) var(--np-space-4);
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
        padding: var(--np-space-3) 0;
        border-right: none;
        border-bottom: 1px solid var(--np-line-soft);
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
        border: 1px solid var(--np-accent-line);
    }

    .np-main {
        padding: var(--np-space-4) 0 var(--np-space-7);
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