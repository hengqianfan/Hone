<template>
    <div class="progress-bar" role="progressbar" aria-label="阅读进度" :aria-valuenow="Math.round(progress)"
        aria-valuemin="0" aria-valuemax="100">
        <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="post" class="post-detail">
        <!-- ===================== 封面头部 ===================== -->
        <header class="hero" :style="heroStyle">


            <div class="hero-inner">
                <div class="hero-meta-top">
                    <span v-if="post.series" class="hero-series-badge">
                        收录于《 {{ post.series }} 》
                    </span>
                </div>

                <h1 class="hero-title" :title="post.title">
                    {{ post.title }}
                </h1>

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
        </div>
    </div>

    <!-- ★ 关键：TOC 移出 .post-detail，摆脱 backdrop-filter 包含块 + overflow 裁剪 -->
    <transition name="toc-fade">
        <aside v-if="post && tocList.length" class="toc">
            <div class="toc-title">内容速览</div>

            <div class="toc-list">
                <div v-for="item in tocList" :key="item.id" :class="[
                    'toc-item',
                    'level-' + item.level,
                    { 'is-active': activeTocId === item.id },
                ]">
                    <a :href="'#' + item.id" :title="item.text" @click.prevent="scrollToHeading(item.id)">{{
                        item.text }}</a>
                </div>
            </div>
        </aside>
    </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

import { usePostsStore } from '@/stores/posts'
import { setDocumentTitle } from '@/utils/setDocumentTitle'
import { formatDate2 } from '@/utils/textFormat'
import { getImgURL } from '@/utils/getImgURL'

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
   封面样式
========================= */
const heroStyle = computed(() => {
    const cover = (post.value as any)?.cover ?? (post.value as any)?.coverUrl
    if (cover) {
        const res = getImgURL(cover, 'cover')
        return {
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.72)), url(${res})`,
        }
    }
    return {
        backgroundImage:
            'transparent',
    }
})

/* =========================
   阅读进度
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
    const firstItem = tocList.value[0]
    if (!firstItem) return
    let current = firstItem.id
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
    updateActiveToc()
})
</script>

<style scoped lang="scss">
/* =========================
   设计变量
========================= */
$glass-bg: rgba(22, 22, 22, 0.55);
$glass-bg-soft: rgba(32, 32, 32, 0.45);
$glass-bg-deep: rgba(10, 10, 10, 0.6);
$glass-border: rgba(255, 255, 255, 0.08);
$glass-border-strong: rgba(255, 255, 255, 0.16);
$glass-highlight: rgba(255, 255, 255, 0.12);
$glass-blur: 18px;

$neo-text: #d4d4d4;
$neo-text-dim: #8a8a8a;
$neo-accent: #e0e0e0;

/* =========================
   顶部进度条
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
   主面板
========================= */
.post-detail {
    width: 900px;
    max-width: 100%;
    margin: 0 auto;
    padding-bottom: 200px;
    border-radius: 30px;
    /* 保留圆角裁剪主面板自身的视觉效果 */
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
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.04),
        inset 0 0 36px rgba(0, 0, 0, 0.35);



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
        color: rgb(245, 245, 245);

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
            background: linear-gradient(90deg,
                    rgba(255, 255, 255, 0.5),
                    rgba(255, 255, 255, 0.12),
                    transparent);
            box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08);
        }
    }

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
}

/* =========================
   TOC（独立 fixed，脱离 backdrop-filter 祖先）
========================= */
.toc {
    position: fixed;
    top: 80px;
    /* 900 宽正文右边缘 + 20px 间距 */
    left: calc(50% + 450px + 20px);
    width: 220px;
    max-width: 220px;
    max-height: calc(100vh - 100px);
    padding: 20px;
    border-radius: 20px;
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
    z-index: 100;

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

/* TOC 淡入淡出 */
.toc-fade-enter-active,
.toc-fade-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.toc-fade-enter-from,
.toc-fade-leave-to {
    opacity: 0;
    transform: translateX(12px);
}

/* 屏幕空间不足时隐藏 TOC（作用于外层，不受 .post-detail 影响） */
@media (max-width: 1400px) {
    .toc {
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