<template>
    <RouterLink class="post" :class="{ 'is-hover': hovered }" :to="`/post/${post.slug}`" @mouseenter="hovered = true"
        @mouseleave="hovered = false" @focus="hovered = true" @blur="hovered = false">
        <!-- 封面区：纯图片 + 深色遮罩，点击进入文章 -->
        <div class="post-cover">
            <img class="cover-img" :src="coverSrc" :alt="post.title" loading="lazy" decoding="async"
                @error="onCoverError" />
            <!-- 深色模式遮罩层：铺满封面，hover 时变淡 -->
            <span class="cover-mask" aria-hidden="true"></span>
        </div>

        <!-- 标题区：图标 + 标题 -->
        <div class="base-info">
            <div class="post-icon">
                <img :src="iconSrc" :alt="post.title" loading="lazy" decoding="async" @error="onIconError" />
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
        </div>

        <!-- 信息区 -->
        <div class="other-info">
            <time class="post-updateTime" :datetime="String(post.publishedAt)">
                {{ formatDate(post.publishedAt) }}
            </time>

            <div class="post-tags">
                <!--
                  标签为独立链接：点击进入标签页并带上筛选条件
                  关键：@click.stop 阻止冒泡，避免触发外层 RouterLink 跳转文章
                -->
                <RouterLink v-for="tag in visibleTags" :key="tag" class="tag" :to="{ path: '/tags', query: { tag } }"
                    :title="`查看标签：${tag}`" @click.stop>
                    {{ tag }}
                </RouterLink>

                <!-- 超出 3 个的标签，折叠提示（点击走卡片进入文章） -->
                <span v-if="restTagCount > 0" class="tag-more">+{{ restTagCount }}</span>
            </div>
        </div>
    </RouterLink>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { formatDate } from '@/utils/textFormat'
import { getIconURL, getImgURL } from '@/utils/link'

interface Post {
    slug: string
    title: string
    icon?: string
    cover?: string
    publishedAt: string | number
    tags?: string[]
}

const props = defineProps<{ post: Post }>()

/** 悬浮状态：由 JS 显式维护，规避 scoped 下父级 hover 选择器失效 */
const hovered = ref(false)

/** 默认兜底资源 */
const DEFAULT_COVER = './banners/banner01.png'
const DEFAULT_ICON = './favicon.ico'

/** 当前实际渲染的图片地址 */
const coverSrc = ref(props.post.cover ? getImgURL(props.post.cover) : DEFAULT_COVER)
const iconSrc = ref(props.post.icon ? getIconURL(props.post.icon) : DEFAULT_ICON)

/** 是否已落到默认图，避免默认图再失败时无限循环 */
const coverFallbackUsed = ref(false)
const iconFallbackUsed = ref(false)

/** 只展示前 3 个标签 */
const visibleTags = computed(() => props.post.tags?.slice(0, 3) ?? [])
/** 剩余标签数量 */
const restTagCount = computed(() =>
    Math.max(0, (props.post.tags?.length ?? 0) - 3)
)

/** post 变化时重置图片状态（列表复用同组件） */
watch(
    () => props.post.cover,
    (val) => {
        coverFallbackUsed.value = false
        coverSrc.value = val ? getImgURL(val) : DEFAULT_COVER
    }
)
watch(
    () => props.post.icon,
    (val) => {
        iconFallbackUsed.value = false
        iconSrc.value = val ? getIconURL(val) : DEFAULT_ICON
    }
)

/** 封面加载失败：切换默认图；默认图也失败则隐藏，避免破图 */
const onCoverError = (e: Event) => {
    const el = e.target as HTMLImageElement
    if (!coverFallbackUsed.value) {
        coverFallbackUsed.value = true
        coverSrc.value = DEFAULT_COVER
        return
    }
    el.style.display = 'none'
}

/** 图标加载失败：切换默认图；默认图也失败则隐藏 */
const onIconError = (e: Event) => {
    const el = e.target as HTMLImageElement
    if (!iconFallbackUsed.value) {
        iconFallbackUsed.value = true
        iconSrc.value = DEFAULT_ICON
        return
    }
    el.style.display = 'none'
}
</script>

<style lang="scss" scoped>
.post {
    --post-radius: 16px;
    --post-line-height: 24px;
    --post-icon-size: 28px;
    --post-card-width: 300px;

    /* 封面缩放倍率：静止 1，悬浮 1.3 */
    --cover-scale: 1;

    /* 封面黑色遮罩浓度：静止较深，悬浮变淡 */
    --cover-mask-alpha: 0.35;

    box-sizing: border-box;

    display: flex;
    flex-direction: column;

    /* 宽度写死，杜绝随内容伸缩 */
    width: var(--post-card-width);
    min-width: var(--post-card-width);
    max-width: var(--post-card-width);
    height: 100%;

    padding: 10px;
    border-radius: var(--post-radius);
    background-color: var(--card-post-bg-color);
    backdrop-filter: blur(10px);
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.06),
        0 8px 24px -12px rgba(0, 0, 0, 0.35);
    text-decoration: none;
    overflow: hidden;

    /* 用 JS 维护的 is-hover 类驱动子元素变化 */
    &.is-hover {
        --cover-scale: 1.3;
        /* 悬浮时遮罩变淡，封面“亮”起来 */
        --cover-mask-alpha: 0.12;

        .post-title {
            color: #7cc7ea;
        }

        /* 悬浮时标签更醒目，暗示可点 */
        .post-tags .tag {
            border-color: rgba(124, 199, 234, 0.55);
        }
    }

    &:focus-visible {
        outline: 2px solid #5dacd1;
        outline-offset: 2px;
    }

    /* ===== 封面区 ===== */
    .post-cover {
        position: relative;
        flex-shrink: 0;
        width: 100%;
        aspect-ratio: 2 / 1;
        overflow: hidden;
        border-radius: calc(var(--post-radius) - 6px);
        background-color: rgba(0, 0, 0, 0.15);

        .cover-img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: scale(var(--cover-scale));
            transform-origin: center center;
            transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
            will-change: transform;
        }

        /* 深色模式遮罩：铺满封面，位于图片之上 */
        .cover-mask {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: block;
            pointer-events: none;
            /* 不拦截点击，保证整卡跳转 */
            background-color: rgba(0, 0, 0, var(--cover-mask-alpha));
            /* 与图片缩放同节奏过渡 */
            transition: background-color 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
    }

    /* ===== 标题区 ===== */
    .base-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 12px 6px 4px;
        min-height: calc(2 * var(--post-line-height));
    }

    .post-icon {
        flex-shrink: 0;

        img {
            display: block;
            width: var(--post-icon-size);
            height: var(--post-icon-size);
            object-fit: cover;
            padding: 1px;
            border: 1.5px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.35);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
    }

    .post-title {
        flex: 1 1 auto;
        min-width: 0;
        margin: 0 0 0 5px;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.01em;
        line-height: var(--post-line-height);
        color: #fff;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        word-break: break-word;
        transition: color 0.3s ease;
    }

    /* ===== 信息区 ===== */
    .other-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-top: auto;
        padding: 8px 4px 2px;
        min-width: 0;

        .post-updateTime {
            flex-shrink: 0;
            font-size: 12.5px;
            font-weight: 500;
            color: var(--post-meta-color, #9aa0a6);
            white-space: nowrap;
        }

        .post-tags {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            min-width: 0;
            flex: 0 1 auto;
            overflow: hidden;

            .tag {
                flex-shrink: 0;
                max-width: 84px;
                padding: 3px 8px;
                font-size: 11.5px;
                line-height: 1.2;
                color: rgba(255, 255, 255, 0.9);
                background-color: rgba(113, 118, 126, 0.85);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 999px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-decoration: none;
                cursor: pointer;
                transition:
                    background-color 0.25s ease,
                    border-color 0.25s ease,
                    transform 0.2s ease;

                &:hover {
                    background-color: rgba(93, 172, 209, 0.95);
                    border-color: rgba(255, 255, 255, 0.45);
                    transform: translateY(-1px);
                }

                &:focus-visible {
                    outline: 2px solid #7cc7ea;
                    outline-offset: 1px;
                }
            }

            .tag-more {
                flex-shrink: 0;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.55);
                white-space: nowrap;
            }
        }
    }
}
</style>