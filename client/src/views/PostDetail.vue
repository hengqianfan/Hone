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
                    <div class="sync-title">（ 已同步平台 ）</div>
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
            <div class="toc-title">
                <span class="toc-title-bar"></span>
                <span>内容速览</span>
            </div>

            <div class="toc-list">
                <template v-for="item in tocList" :key="item.id">
                    <div v-show="!isHidden(item)" :class="[
                        'toc-item',
                        'level-' + item.level,
                        {
                            'is-active': activeTocId === item.id,
                            'has-children': hasChildren(item),
                            'is-collapsed': collapsed.has(item.id),
                        },
                    ]" :style="{ '--depth': Math.max(0, item.level - 2) }">

                        <!-- 圆点即折叠开关：有子级时点击可折叠，无子级时纯装饰 -->
                        <component :is="hasChildren(item) ? 'button' : 'span'" class="toc-dot"
                            :type="hasChildren(item) ? 'button' : undefined"
                            :aria-label="hasChildren(item) ? (collapsed.has(item.id) ? '展开' : '收起') : undefined"
                            :aria-expanded="hasChildren(item) ? !collapsed.has(item.id) : undefined"
                            :aria-hidden="hasChildren(item) ? undefined : 'true'"
                            @click="hasChildren(item) && toggleCollapse(item.id)" />

                        <a :href="'#' + item.id" :title="item.text" @click.prevent="scrollToHeading(item.id)">
                            <span class="toc-text">{{ item.text }}</span>
                        </a>
                    </div>
                </template>
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
            backgroundImage: `url(${res})`,
            opacity: 1
        }
    }
    return {
        backgroundImage: 'transparent',
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
   TOC 折叠 / 展开
========================= */
// 被折叠的项 id 集合，默认全部展开（空集合）
const collapsed = ref<Set<string>>(new Set())

/** 判断 item 是否有子级（仅看紧随其后、level 更深的连续项） */
const hasChildren = (item: TocItem) => {
    const list = tocList.value
    const index = list.indexOf(item)
    const next = list[index + 1]
    return !!next && next.level > item.level
}

/** 该项是否因某个祖先被折叠而隐藏 */
const isHidden = (item: TocItem) => {
    const list = tocList.value
    const index = list.indexOf(item)
    let minLevel = Infinity

    // 从当前项往前回溯，维护「已遇到的最浅层级」
    for (let i = index - 1; i >= 0; i--) {
        const prev = list[i]
        if (!prev) continue
        if (prev.level < item.level && prev.level < minLevel) {
            // prev 是 item 的祖先之一
            if (collapsed.value.has(prev.id)) return true
            minLevel = prev.level
        }
    }
    return false
}

/** 切换折叠 */
const toggleCollapse = (id: string) => {
    const next = new Set(collapsed.value)
    if (next.has(id)) {
        next.delete(id)
    } else {
        next.add(id)
    }
    collapsed.value = next
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
    collapsed.value = new Set()

    progress.value = 0
    activeTocId.value = ''
    calcProgress()
    updateActiveToc()
})
</script>

<style scoped lang="scss">
/* =========================
   设计变量（局部 SCSS 常量，不依赖外部主题变量）
========================= */
$glass-bg: rgba(22, 22, 22, 0.55);
$glass-bg-soft: rgba(32, 32, 32, 0.45);
$glass-bg-deep: rgba(10, 10, 10, 0.6);
$glass-border: rgba(255, 255, 255, 0.08);
$glass-border-strong: rgba(255, 255, 255, 0.16);
$glass-highlight: rgba(255, 255, 255, 0.12);
$glass-blur: 18px;

/* 黑色玻璃主题写死色值 */
$panel-bg: rgba(0, 0, 0, 0.75);
$hero-bg: #0d0d0d;
$toc-bg: rgba(22, 22, 22, 0.55);
$toc-fc: #d4d4d4;
$toc-fc-active: #ffffff;

$neo-text: #d4d4d4;
$neo-text-dim: #8a8a8a;
$neo-accent: #e0e0e0;

/* 行内元素的垂直对齐基准：与 .toc-text 的行高/字号保持一致 */
$toc-line-height: 1.45;
$toc-font-l2: 13.5px;
$toc-font-l3: 12.5px;
$toc-font-l4: 11.5px;
$toc-font-l5: 11px;

/* =========================
   顶部进度条（蓝紫 · 呼吸）
========================= */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    z-index: 9999;
    /* 轨道：留一点微亮的底，让进度条边界清晰可辨 */

    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur($glass-blur);
    -webkit-backdrop-filter: blur($glass-blur);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.6);

    .progress {
        height: 100%;
        width: 0%;
        border-radius: 0 999px 999px 0;

        /* 蓝紫渐变：靛蓝 → 紫罗兰 → 亮蓝，明度抬高，避免发暗 */
        background: linear-gradient(90deg,
                #7083df,
                #907de6,
                #7c83c2,
                #756f94,
                #49527e);
        background-size: 220% 100%;

        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.35),
            0 0 10px rgba(122, 92, 255, 0.55),
            0 0 18px rgba(79, 107, 255, 0.35);

        /* 呼吸 + 渐变流动：两条动画同时跑 */
        animation:
            purpleFlow 4s ease-in-out infinite,
            purpleBreath 2.4s ease-in-out infinite;
        will-change: width, box-shadow, opacity, filter;
    }
}

/* 渐变横向流动 */
@keyframes purpleFlow {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

/* 呼吸：光晕强弱 + 轻微明度起伏 */
@keyframes purpleBreath {

    0%,
    100% {
        filter: brightness(1) saturate(1);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.32),
            0 0 8px rgba(122, 92, 255, 0.45),
            0 0 18px rgba(79, 107, 255, 0.25);
    }

    50% {
        filter: brightness(1.12) saturate(1.08);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.45),
            0 0 14px rgba(140, 110, 255, 0.75),
            0 0 30px rgba(100, 130, 255, 0.5);
    }
}

/* 顶部加一条更亮的蓝紫高光，强化"灵动"感 */
.progress-bar .progress::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.45),
            transparent);
    background-size: 40% 100%;
    background-repeat: no-repeat;
    animation: purpleShine 2.8s linear infinite;
    mix-blend-mode: screen;
    pointer-events: none;
}

/* 流光：一道高光反复扫过 */
@keyframes purpleShine {
    0% {
        background-position: -120% 0;
    }

    100% {
        background-position: 220% 0;
    }
}

/* 无障碍：用户偏好减弱动效时全部停掉 */
@media (prefers-reduced-motion: reduce) {

    .progress-bar .progress,
    .progress-bar .progress::after {
        animation: none;
    }
}

/* =========================
   主面板
========================= */
.post-detail {
    z-index: 0;
    width: 900px;
    max-width: 100%;
    margin: 60px auto;

    border-radius: 30px;
    overflow: hidden;
    border: 1px solid $glass-border;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.65),
        inset 0 1px 0 $glass-highlight;
    transform: translateX(-50px);
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
    z-index: 0;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg,
                rgba(0, 0, 0, 0.1) 0%,
                rgba(0, 0, 0, 0.2) 30%,
                rgba(0, 0, 0, 0.3) 65%,
                rgba(0, 0, 0, 0.4) 85%,
                rgba(0, 0, 0, 0.5) 100%);
    }

    .hero-inner {
        position: relative;
        width: 100%;
        padding: 32px 40px 28px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        z-index: 1;
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
        z-index: 1;

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
            margin-top: 10px;
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
    background: $panel-bg;
    // background: rgba(26, 26, 30, 0.6);
    z-index: 100;
}

/* =========================
   TOC 页面大纲
========================= */
.toc {
    position: fixed;
    top: 60px;
    left: calc(50% + 450px - 30px);
    width: 240px;
    max-width: 240px;
    max-height: calc(100vh - 100px);
    padding: 18px 16px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    background: $toc-bg;
    backdrop-filter: blur($glass-blur);
    -webkit-backdrop-filter: blur($glass-blur);
    border: 1px solid $glass-border;
    box-shadow:
        0 16px 40px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 $glass-highlight;
    z-index: 100;

    /* ---------- 标题 ---------- */
    .toc-title {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-bottom: 14px;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 1px;
        color: $neo-text;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.06);

        .toc-title-bar {
            width: 3px;
            height: 14px;
            border-radius: 999px;
            background: linear-gradient(180deg,
                    rgba(255, 255, 255, 0.7),
                    rgba(255, 255, 255, 0.15));
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.25);
        }
    }

    /* ---------- 列表容器 ---------- */
    .toc-list {
        position: relative;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 2px 0 8px;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;

        &::-webkit-scrollbar {
            display: none;
        }

        /* 左侧层级引导线 */
        &::before {
            content: '';
            position: absolute;
            left: 4px;
            top: 6px;
            bottom: 6px;
            width: 1px;
            background: linear-gradient(180deg,
                    transparent,
                    rgba(255, 255, 255, 0.12) 12%,
                    rgba(255, 255, 255, 0.12) 88%,
                    transparent);
            pointer-events: none;
        }
    }

    /* ---------- 单项 ---------- */
    .toc-item {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 9px;
        margin: 8px 0;
        padding-left: calc(var(--depth, 0) * 12px);

        a {
            position: relative;
            flex: 1;
            min-width: 0;
            display: block;
            padding: 0;
            border-radius: 8px;
            color: $toc-fc;
            text-decoration: none;
            line-height: $toc-line-height;
            transition:
                color 0.2s ease,
                background 0.2s ease,
                transform 0.2s ease;
        }

        /* 文字块：与圆点共享同一行高，保证首行对齐 */
        .toc-text {
            display: block;
            line-height: $toc-line-height;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        a:hover {
            color: $toc-fc-active;
            transform: translateX(2px);
        }

        /* =========================================================
           圆点：既是层级节点，也是折叠开关
           ========================================================= */
        .toc-dot {
            flex-shrink: 0;
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            min-width: 16px;
            height: 1em;
            padding: 0;
            border: 0;
            outline: none;
            border-radius: 50%;
            background: transparent;
            color: inherit;
            font-size: inherit;
            line-height: inherit;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            align-self: center;

            &::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.28);
                transform: translate(-50%, -50%);
                transition:
                    width 0.2s ease,
                    height 0.2s ease,
                    background 0.2s ease,
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
            }

            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0);
                transform: translate(-50%, -50%);
                transition: background 0.2s ease, box-shadow 0.2s ease;
                pointer-events: none;
            }
        }

        /* 有子级的圆点：可点击 */
        &.has-children>.toc-dot {
            cursor: pointer;

            &:hover::after {
                background: rgba(255, 255, 255, 0.08);
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
            }

            &:hover::before {
                background: rgba(255, 255, 255, 0.6);
                transform: translate(-50%, -50%) scale(1.1);
            }

            &:focus-visible::after {
                box-shadow:
                    inset 0 0 0 2px rgba(255, 255, 255, 0.35),
                    0 0 10px rgba(255, 255, 255, 0.25);
            }
        }

        /* 收起态：圆点变空心圈，暗示「可展开」 */
        &.has-children.is-collapsed>.toc-dot::before {
            width: 7px;
            height: 7px;
            background: transparent;
            box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.55);
        }

        /* ---------- 各层级差异化 ---------- */

        &.level-2 {
            a {
                font-size: $toc-font-l2;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.92);
            }

            .toc-dot::before {
                width: 7px;
                height: 7px;
                background: rgba(255, 255, 255, 0.5);
            }

            &.has-children.is-collapsed>.toc-dot::before {
                background: transparent;
                box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.75);
            }
        }

        &.level-3 {
            a {
                font-size: $toc-font-l3;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.72);
            }

            .toc-dot::before {
                width: 5px;
                height: 5px;
                background: rgba(255, 255, 255, 0.32);
            }

            &.has-children.is-collapsed>.toc-dot::before {
                background: transparent;
                box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.4);
            }
        }

        &.level-4 {
            a {
                font-size: $toc-font-l4;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.55);
                letter-spacing: 0.2px;
            }

            .toc-dot::before {
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.24);
            }

            &.has-children.is-collapsed>.toc-dot::before {
                width: 6px;
                height: 6px;
                background: transparent;
                box-shadow: inset 0 0 0 1.2px rgba(255, 255, 255, 0.3);
            }
        }

        &.level-5,
        &.level-6 {
            a {
                font-size: $toc-font-l5;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.42);
            }

            .toc-dot::before {
                width: 6px;
                height: 1px;
                border-radius: 1px;
                background: rgba(255, 255, 255, 0.22);
            }

            &.has-children.is-collapsed>.toc-dot::before {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: transparent;
                box-shadow: inset 0 0 0 1.2px rgba(255, 255, 255, 0.28);
            }
        }

        /* ---------- 激活态 ---------- */
        &.is-active {
            a {
                color: #ffffff;
                font-weight: 600;
                background: linear-gradient(90deg,
                        rgba(255, 255, 255, 0.1),
                        rgba(255, 255, 255, 0.02));
                transform: translateX(2px);
            }

            >.toc-dot::before {
                background: #ffffff;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.45);
                transform: translate(-50%, -50%) scale(1.15);
            }

            &.has-children.is-collapsed>.toc-dot::before {
                background: transparent;
                box-shadow:
                    inset 0 0 0 1.6px #ffffff,
                    0 0 10px rgba(255, 255, 255, 0.4);
                transform: translate(-50%, -50%) scale(1);
            }

            a::before {
                content: '';
                position: absolute;
                left: -8px;
                top: 50%;
                width: 2px;
                height: 60%;
                border-radius: 999px;
                background: linear-gradient(180deg,
                        rgba(255, 255, 255, 0.9),
                        rgba(255, 255, 255, 0.25));
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.35);
                transform: translateY(-50%);
            }
        }
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

/* 屏幕空间不足时隐藏 TOC */
@media (max-width: 1400px) {
    .toc {
        display: none;
    }
}

/* =========================
   平板适配（769px - 1024px）
========================= */
@media (max-width: 1024px) {
    .post-detail {
        width: 100%;
    }
}

/* =========================
   移动端适配（<= 768px）
========================= */
@media (max-width: 768px) {

    /* 进度条：略降高度，减少遮挡感 */
    .progress-bar {
        height: 4px;
    }

    /* 主面板：全宽、去圆角与阴影、去掉横向位移避免溢出 */
    .post-detail {
        width: 100%;
        max-width: 100%;
        margin: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top: none;
        box-shadow: none;
        transform: none;
    }

    /* 封面：高度自适应，内边距与字号随视口收缩 */
    .hero {
        min-height: clamp(180px, 42vw, 260px);
        align-items: flex-end;

        .hero-inner {
            padding: 20px 16px 18px;
            gap: 10px;
        }

        .hero-series-badge {
            font-size: 11px;
            padding: 4px 12px;
            letter-spacing: 0.5px;
        }

        .hero-title {
            font-size: clamp(20px, 5.5vw, 26px);
            line-height: 1.3;
            letter-spacing: 0.5px;
            padding-bottom: 10px;
            word-break: break-word;
            overflow-wrap: anywhere;

            &::after {
                width: 64px;
                height: 2px;
            }
        }

        .hero-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .hero-left {
            gap: 8px;
            width: 100%;
        }

        .hero-date {
            font-size: 12px;
            margin: 6px 0;
            letter-spacing: 0.5px;
        }

        .hero-tags {
            gap: 8px;

            .hero-tag {
                font-size: 11px;
                padding: 4px 11px;
                transition: none;
                touch-action: manipulation;

                &:hover {
                    background: $glass-bg-soft;
                    border-color: $glass-border;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
                }

                &:active {
                    background: rgba(48, 48, 48, 0.6);
                    border-color: $glass-border-strong;
                }
            }
        }

        /* 同步区：移动端左对齐，避免右侧留白错位 */
        .hero-sync {
            align-items: flex-start;
            margin-top: 2px;
            width: 100%;

            .sync-title {
                text-align: left;
                margin-top: 6px;
                font-size: 11px;
            }

            .sync-items {
                padding-right: 0;
                gap: 8px;
                flex-wrap: wrap;

                .sync-item i {
                    font-size: 16px;
                    padding: 7px;
                }
            }
        }
    }

    /* 正文：收紧内边距，底部预留安全区 */
    .content {
        padding: 18px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    }

    /* TOC 已隐藏，这里仅兜底避免 fixed 定位残留 */
    .toc {
        display: none;
    }
}

/* =========================
   超小屏适配（<= 480px）
========================= */
@media (max-width: 480px) {
    .hero {
        min-height: 170px;

        .hero-inner {
            padding: 16px 14px 14px;
            gap: 8px;
        }

        .hero-title {
            font-size: clamp(18px, 5.6vw, 22px);
            letter-spacing: 0;
            padding-bottom: 8px;
        }

        .hero-tags {
            gap: 6px;

            .hero-tag {
                font-size: 10.5px;
                padding: 3px 9px;
            }
        }

        .hero-sync .sync-item i {
            font-size: 15px;
            padding: 6px;
        }
    }

    .content {
        padding: 14px 12px calc(18px + env(safe-area-inset-bottom, 0px));
    }
}

/* =========================
   触摸设备：去掉 hover 依赖的动效
========================= */
@media (hover: none) and (pointer: coarse) {
    .hero-tag:active {
        transform: scale(0.97);
    }

    .toc-dot.has-children:active::before {
        background: rgba(255, 255, 255, 0.7);
        transform: translate(-50%, -50%) scale(1.2);
    }

    /* 触摸端不触发位移动画，避免抖动 */
    .toc-item a:hover {
        transform: none;
    }
}

/* =========================
   横屏矮屏（如手机横屏 / 小笔记本）
========================= */
@media (max-height: 500px) and (orientation: landscape) {
    .hero {
        min-height: 160px;
    }

    .toc {
        max-height: calc(100vh - 24px);
        top: 12px;
        padding: 12px 14px;
    }
}

/* =========================
   减少动态效果
========================= */
@media (prefers-reduced-motion: reduce) {

    .toc-fade-enter-active,
    .toc-fade-leave-active,
    .toc-item a,
    .hero-tag,
    .toc-dot::before,
    .toc-dot::after {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}
</style>