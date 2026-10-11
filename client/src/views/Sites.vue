<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { CATEGORIES, type CategoryId, type Site } from '@/types/site';
import { sites } from '@/config/sites';
import SiteCard from '@/components/CardSiteP/index.vue';

/* ============ ⓪ 星标分组 ============ */
const PIN_ID = 'pin';
const ALL_ID = 'all';
type NavId = CategoryId | typeof ALL_ID | typeof PIN_ID;

interface NavSubGroup {
    kind: string;
    items: Site[];
}
interface NavGroup {
    id: string;
    name: string;
    items: Site[];
    subGroups: NavSubGroup[];
}

const pinnedSites = computed<Site[]>(() =>
    sites
        .filter((s) => typeof s.pin === 'number' && s.pin > 0)
        .slice()
        .sort((a, b) => (b.pin as number) - (a.pin as number) || a.name.localeCompare(b.name)),
);

/* ============ ① 基础状态 ============ */
const keyword = ref('');
const debouncedKeyword = ref('');
const activeId = ref<NavId>(PIN_ID);
const activeKind = ref<string>(PIN_ID);
const tagsOpen = ref(false);
const activeTags = ref<string[]>([]);

const searchInput = ref<HTMLInputElement | null>(null);

/* ============ ② 搜索防抖 ============ */
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(keyword, (v) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => (debouncedKeyword.value = v), 200);
    if (v) tagsOpen.value = true;
});
onBeforeUnmount(() => clearTimeout(debounceTimer));

const openSearch = () => {
    tagsOpen.value = true;
    searchInput.value?.focus();
};

/* ============ ③ 标签池 ============ */
const allTags = computed(() => {
    const map = new Map<string, number>();
    const kw = debouncedKeyword.value.trim().toLowerCase();

    sites.forEach((s) => {
        if (kw) {
            const hit =
                s.name.toLowerCase().includes(kw) ||
                (s.tags ?? []).some((t) => t.toLowerCase().includes(kw)) ||
                s.kind.toLowerCase().includes(kw);
            if (!hit) return;
        }

        const names = new Set<string>();
        if (s.kind) names.add(s.kind);
        (s.tags ?? []).forEach((t) => t && names.add(t));

        names.forEach((name) => {
            map.set(name, (map.get(name) ?? 0) + 1);
        });
    });

    return [...map.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
});

const tagTotalCount = computed(() => allTags.value.length);

const toggleTag = (tag: string) => {
    if (activeTags.value.includes(tag)) {
        activeTags.value = activeTags.value.filter((t) => t !== tag);
    } else {
        activeTags.value = [...activeTags.value, tag];
    }
    activeKind.value = ALL_ID;
};

const clearTags = () => {
    activeTags.value = [];
    activeKind.value = ALL_ID;
};

const resetAll = () => {
    keyword.value = '';
    debouncedKeyword.value = '';
    activeTags.value = [];
    activeKind.value = ALL_ID;
    activeId.value = ALL_ID;
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

const filteredPinned = computed<Site[]>(() =>
    filtered.value
        .filter((s) => typeof s.pin === 'number' && s.pin > 0)
        .slice()
        .sort((a, b) => (b.pin as number) - (a.pin as number) || a.name.localeCompare(b.name)),
);

/* ============ ⑤ 计数预聚合 ============ */
const countMap = computed(() => {
    const map = new Map<string, number>();
    for (const s of filtered.value) {
        map.set(s.categoryId, (map.get(s.categoryId) ?? 0) + 1);
    }
    return map;
});
const countOf = (id: CategoryId) => countMap.value.get(id) ?? 0;

const pinCount = computed(() => filteredPinned.value.length);

/* ============ ⑥ 二级分组 ============ */
const buildSubGroups = (list: Site[]): NavSubGroup[] => {
    const map = new Map<string, Site[]>();
    list.forEach((s) => {
        if (!map.has(s.kind)) map.set(s.kind, []);
        map.get(s.kind)!.push(s);
    });
    return [...map.entries()].map(([kind, items]) => ({ kind, items }));
};

const groups = computed<NavGroup[]>(() =>
    CATEGORIES.map((cat) => {
        const items = filtered.value.filter((s) => s.categoryId === cat.id);
        return {
            id: cat.id as string,
            name: cat.name,
            items,
            subGroups: buildSubGroups(items),
        };
    }),
);

const visibleGroups = computed<NavGroup[]>(() => {
    if (activeId.value === PIN_ID) {
        return filteredPinned.value.length
            ? [
                {
                    id: PIN_ID,
                    name: '星标',
                    items: filteredPinned.value,
                    subGroups: [],
                },
            ]
            : [];
    }
    if (activeId.value === ALL_ID) {
        return groups.value;
    }
    return groups.value.filter((g) => g.id === (activeId.value as string));
});

const isPinGroup = (group: NavGroup) => group.id === PIN_ID;
const isAllId = (id: NavId) => id === ALL_ID;

const kindOptions = computed(() => {
    const set = new Set<string>();
    visibleGroups.value.forEach((g) =>
        g.subGroups.forEach((sub) => set.add(sub.kind)),
    );
    return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
});

/* 切换一级分类 / 筛选条件变化时，立即校正二级选中项 */
watch(
    kindOptions,
    (opts) => {
        if (activeKind.value !== ALL_ID && !opts.includes(activeKind.value)) {
            activeKind.value = ALL_ID;
        }
    },
    { flush: 'sync' },
);

/* 切换一级分类时强制归位二级选中（双保险） */
watch(activeId, () => {
    activeKind.value = ALL_ID;
});

const renderedGroups = computed<NavGroup[]>(() =>
    visibleGroups.value
        .map((g) => ({
            ...g,
            // 只有真正命中当前 kind 的小节才保留，避免“分组标题在、内容空”的残留
            subGroups:
                activeKind.value === ALL_ID
                    ? g.subGroups
                    : g.subGroups.filter((sub) => sub.kind === activeKind.value),
        }))
        .filter((g) => {
            // 星标分组没有 subGroups，按 items 判断
            if (g.id === PIN_ID) return g.items.length > 0;
            // 选了具体 kind：必须有对应小节才渲染该分组
            if (activeKind.value !== ALL_ID) return g.subGroups.length > 0;
            // 选了“全部类型”：有任意小节或任意 item 才渲染
            return g.subGroups.length > 0 || g.items.length > 0;
        }),
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

const categoryAnchor = (id: NavId) => {
    if (id === ALL_ID) return 'nav-top';
    if (id === PIN_ID) return 'cat-pin';
    return `cat-${id as string}`;
};

const pickCategory = (id: NavId) => {
    activeId.value = id;
    activeKind.value = ALL_ID;
    scrollTo(categoryAnchor(id));
};

const pickKind = (kind: string) => {
    activeKind.value = kind;
    if (kind === ALL_ID) {
        scrollTo(categoryAnchor(activeId.value));
    } else {
        scrollTo(`kind-${kind}`);
    }
};
</script>

<template>
    <div class="np">
        <header class="np-header">
            <div class="np-brand">
                <span class="np-brand__dot" aria-hidden="true" />
                <h1 class="np-title">网站导航</h1>
            </div>

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

        <div class="np-body">
            <aside class="np-side" aria-label="一级分类">
                <!-- ① 星标置顶：放在「全部」之上 -->
                <button v-if="pinCount" class="np-cat np-cat--pin" type="button" :aria-pressed="activeId === PIN_ID"
                    :class="{ 'is-on': activeId === PIN_ID }" @click="pickCategory(PIN_ID)">
                    <span class="np-cat__name">
                        <span class="np-cat__star" aria-hidden="true">★</span>
                        星标
                    </span>
                    <span class="np-cat__count">{{ pinCount }}</span>
                </button>

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

                <section v-for="group in renderedGroups" :id="`cat-${group.id}`" :key="group.id" class="np-section"
                    :class="{ 'np-section--pin': group.id === PIN_ID }">
                    <h2 class="np-section__title">
                        <span class="np-section__bar" aria-hidden="true" />
                        <span v-if="group.id === PIN_ID" class="np-section__star" aria-hidden="true">★</span>
                        {{ group.name }}
                        <span class="np-section__count">{{ group.items.length }}</span>
                    </h2>

                    <div v-if="group.id === PIN_ID" class="np-grid">
                        <SiteCard v-for="site in group.items" :key="site.name" :site="site" />
                    </div>

                    <template v-else>
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
                    </template>
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

.np-searchbar {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    justify-content: flex-end;
}

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

.np-drop-enter-active,
.np-drop-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.np-drop-enter-from,
.np-drop-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

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

    box-shadow: 0 12px 40px -16px rgba(0, 0, 0, 0.75),
        inset 0 1px 0 rgba(255, 255, 255, 0.10);
}

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

.np-cat__name {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.np-cat--pin .np-cat__star {
    color: #ffd166;
    font-size: 13px;
    line-height: 1;
}

.np-cat--pin.is-on {
    background: rgba(255, 209, 102, 0.12);
}

.np-cat--pin.is-on::before {
    background: #ffd166;
}

.np-cat--pin.is-on .np-cat__count {
    color: #ffd166;
}

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

.np-anchor {
    display: block;
    height: 0;
    overflow: hidden;
}

.np-kinds {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 8px;
    margin-bottom: 28px;
    background: rgba(28, 28, 32, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.10);
    border-radius: 11px;

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

.np-section--pin .np-section__bar {
    background: #ffd166;
}

.np-section__star {
    color: #ffd166;
    font-size: 14px;
    line-height: 1;
}

.np-section__count {
    font-size: 12px;
    font-weight: 400;
    color: #6b6b74;
}

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

.np :focus-visible {
    outline: 2px solid #8b8bff;
    outline-offset: 2px;
}

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

    .np-cat--pin.is-on {
        border-color: rgba(255, 209, 102, 0.45);
    }

    .np-main {
        padding: 16px 0 40px;
    }
}

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