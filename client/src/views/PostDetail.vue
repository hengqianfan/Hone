<template>
    <div class="progress-bar" role="progressbar" aria-label="阅读进度" :aria-valuenow="Math.round(progress)"
        aria-valuemin="0" aria-valuemax="100">
        <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="post" class="post-detail">
        <div class="header">
            <div class="title" :title="post.title">
                {{ post.title }}
            </div>

            <div class="info">
                <!-- tags 可能为空 / undefined -->
                <div v-if="post.tags?.length" class="tags">
                    <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>

                <div class="publishDate">
                    🕒 {{ formatDate2(post.publishedAt) }}
                </div>
            </div>

            <div v-if="post.series" class="series">
                <div class="series-title">文章已收录：</div>
                <div class="series-name">《 {{ post.series }} 》</div>
            </div>

            <div v-if="post.sync" class="sync">
                <div class="sync-items">
                    <div v-for="(_, n) in post.sync" :key="n" class="sync-item">
                        <i :class="`iconfont icon-${n}`"></i>
                    </div>
                </div>
                <div class="sync-title">（ 已同步 ）</div>
            </div>
        </div>

        <div class="content">
            <MarkdownRenderer :html="post.content" />

            <!-- toc 可能为空 / undefined -->
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
   阅读进度（rAF + 节流）
========================= */
const progress = ref(0)
const activeTocId = ref('')
let ticking = false

const calcProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (docHeight <= 0) {
        progress.value = 0
        return
    }

    const raw = (scrollTop / docHeight) * 100
    // 保留一位小数，避免亚像素抖动
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
        // 距离顶部 100px 以内视为“当前”
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

    const top = el.getBoundingClientRect().top + window.scrollY - 80 // 预留顶部间距
    window.scrollTo({ top, behavior: 'smooth' })

    // 静默更新地址栏 hash，不污染历史栈
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

// 路由参数变化（/post/a → /post/b）
onBeforeRouteUpdate(async (to) => {
    await nextTick()
    // 直接使用新 slug 对应的 post 设置标题，避免出现空标题真空期
    const nextPost = postStore.getPost(to.params.slug as string)
    setDocumentTitle(nextPost?.title ?? '')

    // 重置滚动进度与高亮
    progress.value = 0
    activeTocId.value = ''
    calcProgress()
})
</script>

<style scoped lang="scss">
/* =========================
   顶部沉浸式进度条
========================= */
.progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    z-index: 9999;
    background: rgba(30, 64, 175, 0.08);
    backdrop-filter: blur(6px);

    .progress {
        height: 100%;
        width: 0%;
        border-radius: 999px;
        background: linear-gradient(90deg,
                #dbeafe,
                #bfdbfe,
                #93c5fd,
                #60a5fa,
                #38bdf8,
                #60a5fa,
                #93c5fd,
                #bfdbfe,
                #dbeafe);
        background-size: 220% 100%;
        box-shadow: 0 0 6px rgba(59, 130, 246, 0.45),
            0 0 14px rgba(96, 165, 250, 0.35),
            0 0 22px rgba(56, 189, 248, 0.2);
        animation: blueGlowFlow 2.8s ease-in-out infinite;
        will-change: width;
    }
}

@keyframes blueGlowFlow {
    0% {
        background-position: 0% 50%;
        filter: brightness(1);
    }

    50% {
        background-position: 60% 50%;
        filter: brightness(1.2);
    }

    100% {
        background-position: 100% 50%;
        filter: brightness(1);
    }
}

/* 尊重系统「减少动效」偏好 */
@media (prefers-reduced-motion: reduce) {
    .progress-bar .progress {
        animation: none;
    }
}

/* =========================
   页面布局
========================= */
.post-detail {
    width: 900px;
    max-width: 100%;
    margin: 0 auto;
    padding-bottom: 200px;
    border-radius: 30px;
    background-color: rgba(0, 0, 0, 0.5);

    .content {
        position: relative;
        padding: 10px 30px;

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
            background-color: var(--bg-color);
            max-height: calc(100vh - 100px);

            .toc-title {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 10px;
                color: var(--bg-base-color-2, 1);
                flex-shrink: 0;
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
                    color: var(--bg-base-color-2, 1);
                    text-decoration: none;
                    transition: color 0.2s ease;
                    display: block;
                }

                a:hover {
                    color: #2f5491;
                }

                &.is-active a {
                    color: #38bdf8;
                    font-weight: 600;
                }
            }

            .level-2 {
                padding-left: 0;
                font-size: 13px;
                font-weight: 500;

                a {
                    color: var(--bg-base-color-2, 1);
                }
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
}

/* 屏幕空间不足时隐藏 TOC，避免溢出到屏幕外 */
@media (max-width: 1400px) {
    .post-detail .content .toc {
        display: none;
    }
}

.header {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 40px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 30px 30px 0 0;

    .title {
        font-size: 40px;
        font-weight: bold;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 100%;
        padding: 10px 0;
        letter-spacing: 2px;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: repeating-linear-gradient(90deg,
                    #889690 0 8px,
                    transparent 8px 16px);
            background-size: 200% 100%;
            animation: dash-flow 1.2s linear infinite;
        }

        @keyframes dash-flow {
            from {
                background-position-x: 0;
            }

            to {
                background-position-x: 16px;
            }
        }
    }

    .info {
        padding: 5px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 14px;
        gap: 0.625rem;

        .publishDate {
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            padding-bottom: 5px;
            color: #ecebeb;
        }

        .tags {
            gap: 10px;
            display: flex;
            padding: 10px;
            flex-wrap: wrap;
            justify-content: center;

            span {
                padding: 6px 12px;
                font-size: 12px;
                background-color: var(--post-detail-head-tag);
                border-radius: 15px;
                color: var(--post-detail-head-tag-text);
            }
        }
    }

    .series {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .series-title {
            font-size: 14px;
            padding: 5px 0;
        }

        .series-name {
            font-size: 12px;
            padding: 5px 0;
            text-indent: 20px;
        }
    }

    .sync {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;

        .sync-title {
            font-size: 12px;
            padding: 5px 0;
        }

        .sync-items {
            padding: 15px 0;
            display: flex;
            gap: 0.625rem;
            padding-right: 20px;

            .sync-item {
                i {
                    background-color: rgb(90, 82, 99);
                    padding: 5px;
                    font-size: 20px;
                    border-radius: 50%;
                }
            }
        }
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .post-detail {
        width: 100%;
        border-radius: 0;

        .content {
            padding: 10px 16px;
        }
    }

    .header {
        padding: 20px 16px;

        .title {
            font-size: 24px;
            white-space: normal;
            text-align: center;
        }
    }
}
</style>