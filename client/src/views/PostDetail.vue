<template>
    <div class="progress-bar" role="progressbar" aria-label="阅读进度" :aria-valuenow="Math.round(progress)"
        aria-valuemin="0" aria-valuemax="100">
        <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="post" class="post-detail">
        <!-- ===================== 封面头部 ===================== -->
        <header class="hero" :style="heroStyle">
            <!-- 封面遮罩，保证文字可读性 -->
            <div class="hero-mask"></div>

            <!-- 顶部悬浮信息卡 -->
            <div class="hero-inner">
                <div class="hero-meta-top">
                    <span v-if="post.series" class="hero-series-badge">
                        收录于《 {{ post.series }} 》
                    </span>
                </div>

                <h1 class="hero-title" :title="post.title">
                    {{ post.title }}
                </h1>

                <!-- 日期 + 标签 -->
                <div class="hero-bottom">
                    <div class="hero-left">
                        <div class="hero-date">
                            🕒 {{ formatDate2(post.publishedAt) }}
                        </div>

                        <div v-if="post.tags?.length" class="hero-tags">
                            <span v-for="tag in post.tags" :key="tag" class="hero-tag">
                                # {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 同步信息：单独一行，位于标签之下 -->
                <div v-if="post.sync" class="hero-sync">
                    <div class="sync-items">
                        <div v-for="(_, n) in post.sync" :key="n" class="sync-item">
                            <i :class="`iconfont icon-${n}`"></i>
                        </div>
                    </div>
                    <div class="sync-title">（ 已同步 ）</div>
                </div>
            </div>
        </header>

        <div class="content">
            <MarkdownRenderer :html="post.content" />

            <aside v-if="post.toc?.length" class="toc">
                <div class="toc-title">内容速览</div>

                <div class="toc-list">
                    <div v-for="item in post.toc" :key="item.id" :class="[
                        'toc-item',
                        'level-' + item.level,
                        { 'is-active': activeTocId === item.id },
                    ]">
                        <a :href="'#' + item.id" :title="item.text" @click.prevent="scrollToHeading(item.id)">{{
                            item.text }}</a>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

import { usePostsStore } from '@/stores/posts'
import { setDocumentTitle } from '@/utils/setDocumentTitle'
import { formatDate2 } from '@/utils/textFormat'
import { getImgURL } from '@/utils/link'

import MarkdownRenderer from '@/components/RenderMarkdown/index.vue'

interface TocItem {
    id: string
    text: string
    level: number
}

const postStore = usePostsStore()
const route = useRoute()

const post = computed(() => postStore.getPost(route.params.slug as string))
const tocList = computed<TocItem[]>(() => post.value?.toc ?? [])

/* =========================
   封面样式：优先使用文章封面，否则用暗色渐变兜底
========================= */
const heroStyle = computed(() => {
    const cover = (post.value as any)?.cover ?? (post.value as any)?.coverUrl
    if (cover) {
        const res = getImgURL(cover)
        return {
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.72)), url(${res})`,
        }
    }
    return {
        backgroundImage:
            'linear-gradient(135deg, rgba(38, 38, 38, 0.9) 0%, rgba(22, 22, 22, 0.95) 50%, rgba(10, 10, 10, 1) 100%)',
    }
})

/* =========================
   阅读进度（rAF + 节流）
========================= */
const progress = ref(0)
const activeTocId = ref('')
let ticking = false

const calcProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight

    if (docHeight <= 0) {
        progress.value = 0
        return
    }

    const raw = (scrollTop / docHeight) * 100
    progress.value = Math.round(Math.min(100, Math.max(0, raw)) * 10) / 10
}

/** 用 rAF 合并高频 scroll 事件，避免重复计算与重排 */
const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
        calcProgress()
        updateActiveToc()
        ticking = false
    })
}

/* =========================
   TOC 当前章节高亮
========================= */
const updateActiveToc = () => {
    if (!tocList.value.length) return
    // @ts-ignore
    let current = tocList.value[0].id
    for (const item of tocList.value) {
        const el = document.getElementById(item.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 100) {
            current = item.id
        } else {
            break
        }
    }
    activeTocId.value = current
}

/** 平滑滚动到标题，并同步更新 hash（不触发整页跳转） */
const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top, behavior: 'smooth' })

    history.replaceState(null, '', `#${id}`)
    activeTocId.value = id
}

/* =========================
   生命周期
========================= */
onMounted(async () => {
    await nextTick()
    calcProgress()
    updateActiveToc()
    window.addEventListener('scroll', onScroll, { passive: true })
    setDocumentTitle(post.value?.title ?? '')
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
})

onBeforeRouteUpdate(async (to) => {
    await nextTick()
    const nextPost = postStore.getPost(to.params.slug as string)
    setDocumentTitle(nextPost?.title ?? '')

    progress.value = 0
    activeTocId.value = ''
    calcProgress()
})
</script>

<style scoped lang="scss">
/* =========================
   黑色磨砂玻璃设计变量
========================= */
$glass-bg: rgba(22, 22, 22, 0.55); // 主玻璃底色（半透明黑）
$glass-bg-soft: rgba(32, 32, 32, 0.45); // 次级玻璃（卡片/标签）
$glass-bg-deep: rgba(10, 10, 10, 0.6); // 更深玻璃（徽章/凹槽）
$glass-border: rgba(255, 255, 255, 0.08); // 极细玻璃边界
$glass-border-strong: rgba(255, 255, 255, 0.16); // hover 时的边界高光
$glass-highlight: rgba(255, 255, 255, 0.12); // 顶部内高光
$glass-blur: 18px; // 模糊强度

$neo-light: #2b2b2b; // 保留少量外阴影用色
$neo-dark: #050505;
$neo-text: #d4d4d4;
$neo-text-dim: #8a8a8a;
$neo-accent: #e0e0e0;

/* =========================
   顶部沉浸式进度条（磨砂玻璃质感）
========================= */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur($glass-blur);
    -webkit-backdrop-filter: blur($glass-blur);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.7);

    .progress {
        height: 100%;
        width: 0%;
        border-radius: 0 999px 999px 0;
        background: linear-gradient(90deg,
                #6b7280,
                #9ca3af,
                #d1d5db,
                #f3f4f6,
                #d1d5db,
                #9ca3af);
        background-size: 220% 100%;
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 0 12px rgba(220, 220, 220, 0.3);
        animation: grayFlow 3s ease-in-out infinite;
        will-change: width;
    }
}

@keyframes grayFlow {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 60% 50%;
    }

    100% {
        background-position: 100% 50%;
    }
}

@media (prefers-reduced-motion: reduce) {
    .progress-bar .progress {
        animation: none;
    }
}

/* =========================
   页面布局（磨砂玻璃主面板）
========================= */
.post-detail {
    width: 900px;
    max-width: 100%;
    margin: 0 auto;
    padding-bottom: 200px;
    border-radius: 30px;
    overflow: hidden;
    background: $glass-bg;
    backdrop-filter: blur($glass-blur) saturate(140%);
    -webkit-backdrop-filter: blur($glass-blur) saturate(140%);
    border: 1px solid $glass-border;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.65),
        inset 0 1px 0 $glass-highlight;
}

/* =========================
   封面头部
========================= */
.hero {
    position: relative;
    min-height: 320px;
    display: flex;
    align-items: flex-end;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
    /* 封面与下方正文磨砂层的交界阴影，制造玻璃叠层关系 */
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.06),
        inset 0 0 70px rgba(0, 0, 0, 0.85);

    .hero-mask {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(120% 90% at 50% 0%,
                rgba(255, 255, 255, 0.07) 0%,
                rgba(0, 0, 0, 0) 60%),
            linear-gradient(180deg,
                rgba(0, 0, 0, 0.1) 20%,
                rgba(0, 0, 0, 0.65) 78%,
                rgba(0, 0, 0, 0.92) 100%);
        pointer-events: none;
    }

    .hero-inner {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 32px 40px 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .hero-meta-top {
        display: flex;
        justify-content: flex-start;
    }

    /* 系列标签：磨砂胶囊 */
    .hero-series-badge {
        font-size: 12px;
        letter-spacing: 1px;
        padding: 6px 16px;
        border-radius: 999px;
        color: $neo-text;
        background: $glass-bg-deep;
        backdrop-filter: blur(calc(#{$glass-blur} / 2));
        -webkit-backdrop-filter: blur(calc(#{$glass-blur} / 2));
        border: 1px solid $glass-border;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .hero-title {
        margin: 0;
        font-size: 38px;
        line-height: 1.25;
        font-weight: 700;
        letter-spacing: 2px;
        color: #f5f5f5;
        text-shadow: 0 4px 24px rgba(0, 0, 0, 0.9);
        position: relative;
        padding-bottom: 14px;
        word-break: break-word;

        &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 96px;
            height: 2px;
            border-radius: 999px;
            /* 玻璃高光条：上亮下暗 */
            background: linear-gradient(90deg,
                    rgba(255, 255, 255, 0.5),
                    rgba(255, 255, 255, 0.12),
                    transparent);
            box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
        }
    }

    /* 日期 + 标签区：只保留左侧内容，不再与同步同行 */
    .hero-bottom {
        display: flex;
        align-items: flex-end;
        justify-content: flex-start;
        gap: 16px;
        flex-wrap: wrap;
    }

    .hero-left {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .hero-date {
        font-size: 13px;
        margin: 10px 0;
        letter-spacing: 1px;
        color: $neo-text-dim;
    }

    .hero-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        /* 标签：磨砂小胶囊 */
        .hero-tag {
            font-size: 12px;
            padding: 6px 14px;
            border-radius: 999px;
            color: $neo-text;
            background: $glass-bg-soft;
            backdrop-filter: blur(calc(#{$glass-blur} / 2));
            -webkit-backdrop-filter: blur(calc(#{$glass-blur} / 2));
            border: 1px solid $glass-border;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
            transition: all 0.25s ease;

            &:hover {
                color: #ffffff;
                background: rgba(48, 48, 48, 0.6);
                border-color: $glass-border-strong;
                box-shadow:
                    inset 0 1px 0 rgba(255, 255, 255, 0.16),
                    0 0 16px rgba(255, 255, 255, 0.08);
            }
        }
    }

    /* 同步信息：独立成行，位于标签之下 */
    .hero-sync {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        gap: 10px;
        margin-top: 4px;

        .sync-title {
            font-size: 12px;
            color: $neo-text-dim;
            padding-top: 0;
            text-align: center;
            justify-content: flex-end;
        }

        .sync-items {
            display: flex;
            gap: 12px;
            padding-right: 10px;

            /* 同步图标：磨砂圆形按钮 */
            .sync-item i {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                padding: 8px;
                border-radius: 50%;
                color: $neo-text;
                background: $glass-bg-soft;
                backdrop-filter: blur(calc(#{$glass-blur} / 2));
                -webkit-backdrop-filter: blur(calc(#{$glass-blur} / 2));
                border: 1px solid $glass-border;
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
                transition: all 0.25s ease;

                &:hover {
                    color: #ffffff;
                    background: rgba(48, 48, 48, 0.62);
                    border-color: $glass-border-strong;
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.18),
                        0 0 18px rgba(255, 255, 255, 0.12);
                }
            }
        }
    }
}

/* =========================
   正文内容
========================= */
.content {
    position: relative;
    padding: 28px 30px 10px;

    /* TOC：右侧悬浮磨砂面板 */
    .toc {
        width: 220px;
        max-width: 220px;
        border-radius: 20px;
        position: fixed;
        top: 80px;
        padding: 20px;
        left: calc(50% + 450px + 20px);
        font-size: 12px;
        display: flex;
        flex-direction: column;
        background: $glass-bg;
        backdrop-filter: blur($glass-blur) saturate(140%);
        -webkit-backdrop-filter: blur($glass-blur) saturate(140%);
        border: 1px solid $glass-border;
        box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 $glass-highlight;
        max-height: calc(100vh - 100px);

        .toc-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 10px;
            color: $neo-text;
            flex-shrink: 0;
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .toc-list {
            overflow-y: auto;
            overflow-x: hidden;
            padding-bottom: 20px;
            scrollbar-width: none;

            &::-webkit-scrollbar {
                display: none;
            }
        }

        .toc-item {
            margin: 8px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 2px 0;

            a {
                color: $neo-text-dim;
                text-decoration: none;
                transition: color 0.2s ease;
                display: block;
            }

            a:hover {
                color: $neo-accent;
            }

            /* 激活态：提亮文字 + 柔光，保持黑白灰纯粹性 */
            &.is-active a {
                color: #ffffff;
                font-weight: 600;
                text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
            }
        }

        .level-2 {
            padding-left: 0;
            font-size: 13px;
            font-weight: 500;
        }

        .level-3 {
            padding-left: 12px;
        }

        .level-4 {
            padding-left: 24px;
        }

        .level-5 {
            padding-left: 36px;
        }
    }
}

/* 屏幕空间不足时隐藏 TOC */
@media (max-width: 1400px) {
    .post-detail .content .toc {
        display: none;
    }
}

/* =========================
   移动端适配
========================= */
@media (max-width: 768px) {
    .post-detail {
        width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
        box-shadow: none;
    }

    .hero {
        min-height: 220px;

        .hero-inner {
            padding: 20px 16px 18px;
        }

        .hero-title {
            font-size: 24px;
            letter-spacing: 1px;
        }

        .hero-bottom {
            flex-direction: column;
            align-items: flex-start;
        }

        .hero-sync {
            align-items: center;
            flex-wrap: wrap;
        }
    }

    .content {
        padding: 18px 16px 10px;
    }
}
</style>