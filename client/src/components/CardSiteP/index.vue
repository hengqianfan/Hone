<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Site } from '@/types/site';

const props = defineProps<{ site: Site }>();

/** 标签最多展示数量，超出以 +N 收纳 */
const MAX_TAGS = 3;

/** 图标是否加载失败 */
const iconFailed = ref(false);

/** 是否需要展示文字兜底图标 */
const showFallback = computed(() => !props.site.icon || iconFailed.value);

/** iconify 图标地址 */
const iconUrl = computed(() =>
    props.site.icon
        ? `https://api.iconify.design/simple-icons:${props.site.icon}.svg`
        : '',
);

/** 站点名称首字符（兼容中英文、数字） */
const initial = computed(() =>
    (props.site.name?.trim() ?? '').charAt(0).toUpperCase() || '?',
);

/**
 * 兜底图标配色：深色底 + 高饱和亮色字，保证在深色卡片上足够醒目
 */
const fallbackStyle = computed(() => {
    const name = props.site.name ?? '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
        '--fb-bg': `hsl(${hue} 45% 22%)`,
        '--fb-fg': `hsl(${hue} 85% 72%)`,
    } as Record<string, string>;
});

/** 展示的标签与剩余数量 */
const visibleTags = computed(() => props.site.tags?.slice(0, MAX_TAGS) ?? []);
const restCount = computed(() =>
    Math.max(0, (props.site.tags?.length ?? 0) - MAX_TAGS),
);

const onIconError = () => {
    iconFailed.value = true;
};

watch(
    () => props.site.icon,
    () => {
        iconFailed.value = false;
    },
);
</script>

<template>
    <a class="site-card" :href="site.link" target="_blank" rel="noopener noreferrer">
        <header class="site-card__head">
            <span class="site-card__icon-wrap">
                <img v-if="!showFallback" class="site-card__icon" :src="iconUrl" :alt="site.name" loading="lazy"
                    decoding="async" @error="onIconError" />
                <span v-else class="site-card__icon site-card__icon--fallback" :style="fallbackStyle"
                    aria-hidden="true">{{ initial }}</span>
            </span>

            <h3 class="site-card__name" :title="site.name">{{ site.name }}</h3>

            <svg class="site-card__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M7 17 17 7M17 7H9M17 7v8" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </header>

        <p class="site-card__desc" :title="site.desc">{{ site.desc || '—' }}</p>

        <footer v-if="site.tags?.length" class="site-card__tags">
            <span v-for="t in visibleTags" :key="t" class="site-card__tag">{{ t }}</span>
            <span v-if="restCount > 0" class="site-card__tag site-card__tag--more">+{{ restCount }}</span>
        </footer>
    </a>
</template>

<style scoped>
/* ========== 深色主题 ========== */
.site-card {
    --card-bg: #16181f;
    --card-bg-hover: #1b1e27;
    --card-border-hover: #3f4a6b;
    --card-title: #e6e8ee;
    --card-text: #8b93a7;
    --card-tag-bg: #232733;
    --card-tag-text: #9aa3b8;
    --card-accent: #8b9dff;
    --card-glow: rgba(139, 157, 255, .16);
    --icon-bg: #1f2330;
    --icon-bg-hover: #262b3a;
    --icon-radius: 11px;

    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    /* 渐变边框：border 必须透明才可见 */
    border: 1px solid transparent;
    border-radius: 14px;
    background:
        linear-gradient(var(--card-bg), var(--card-bg)) padding-box,
        linear-gradient(135deg, rgba(139, 157, 255, .18), rgba(139, 157, 255, .04)) border-box;
    text-decoration: none;
    color: inherit;
    overflow: hidden;
    isolation: isolate;
    transition: box-shadow .2s ease;
}

/* 悬停时右上角柔光 */
.site-card::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -60px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, var(--card-glow), transparent 70%);
    opacity: 0;
    transition: opacity .25s ease;
    pointer-events: none;
    z-index: -1;
}

.site-card:hover {
    background:
        linear-gradient(var(--card-bg-hover), var(--card-bg-hover)) padding-box,
        linear-gradient(135deg, rgba(139, 157, 255, .45), rgba(139, 157, 255, .08)) border-box;
    box-shadow: 0 10px 24px rgba(0, 0, 0, .45);
}

.site-card:hover::after {
    opacity: 1;
}

.site-card:focus-visible {
    outline: 2px solid var(--card-accent);
    outline-offset: 2px;
}

/* ---------- 头部 ---------- */
.site-card__head {
    display: flex;
    align-items: center;
    gap: 12px;
}

.site-card__icon-wrap {
    flex: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--icon-radius);
    background: var(--icon-bg);
    border: 1px solid rgba(255, 255, 255, .06);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
    transition: border-color .2s ease, background .2s ease;
}

.site-card__icon {
    width: 100%;
    height: 100%;
    padding: 7px;
    object-fit: contain;
    box-sizing: border-box;
}

.site-card:hover .site-card__icon-wrap {
    background: var(--icon-bg-hover);
    border-color: rgba(139, 157, 255, .22);
}

/* simple-icons 是黑色 SVG：深色下反色显示，并叠加投影做出立体感 */
.site-card__icon:not(.site-card__icon--fallback) {
    filter: invert(1) brightness(1.6) drop-shadow(0 3px 6px rgba(0, 0, 0, .55));
    transition: filter .2s ease;
}

.site-card:hover .site-card__icon:not(.site-card__icon--fallback) {
    filter: invert(1) brightness(1.7) drop-shadow(0 6px 14px rgba(0, 0, 0, .6));
}

/* 兜底图标 */
.site-card__icon--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--icon-radius);
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    user-select: none;
    background: var(--fb-bg, #232733);
    color: var(--fb-fg, #8b9dff);
    transition: filter .2s ease;
}

.site-card__name {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--card-title);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.site-card__arrow {
    flex: none;
    color: var(--card-accent);
    opacity: 0;
    transform: translate(-2px, 2px);
    transition: opacity .18s ease, transform .18s ease;
}

.site-card:hover .site-card__arrow,
.site-card:focus-visible .site-card__arrow {
    opacity: 1;
    transform: translate(0, 0);
}

/* ---------- 描述 ---------- */
.site-card__desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: var(--card-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: calc(13px * 1.55 * 2);
}

/* ---------- 标签 ---------- */
.site-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
}

.site-card__tag {
    font-size: 11px;
    line-height: 1;
    padding: 4px 8px;
    border-radius: 999px;
    background: var(--card-tag-bg);
    color: var(--card-tag-text);
    white-space: nowrap;
    border: 1px solid transparent;
    transition: border-color .15s ease;
}

.site-card:hover .site-card__tag {
    border-color: rgba(139, 157, 255, .18);
}

.site-card__tag--more {
    background: transparent;
    color: var(--card-accent);
    font-weight: 600;
}

/* ---------- 动效降级 ---------- */
@media (prefers-reduced-motion: reduce) {

    .site-card__icon-wrap,
    .site-card,
    .site-card__icon,
    .site-card__arrow {
        transition: none;
    }
}
</style>