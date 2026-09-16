<template>
    <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>

    <div v-if="post" class="post-detail">

        <div class="header">
            <div class="title">
                {{ post.title }}
            </div>
            <div class="info">
                <div class="tags">
                    <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <div class="publishDate">🕒 {{ formatDate2(post.publishedAt) }}</div>

                <!-- <div class="updateDate">更新时间：{{ post.publishedAt }}</div> -->
            </div>
            <div class="series" v-if="post.series">
                <div class="series-title">文章已收录：</div>
                <div class="series-name">《 {{ post.series }}》</div>
            </div>
            <div class="sync" v-if="post.sync">

                <div class="sync-items">
                    <div class="sync-item" v-for="(m, n) in post.sync">
                        <i :class="`iconfont icon-${n}`"></i>
                    </div>
                </div>

                <div class="sync-title">（ 已同步 ）</div>
            </div>
        </div>

        <div class="content">
            <MarkdownRenderer :html="post.content" />

            <aside class="toc" v-if="post.toc.length">
                <div class="toc-title">内容速览</div>

                <div class="toc-list">
                    <div v-for="item in post.toc" :key="item.id" :class="['toc-item', 'level-' + item.level]">
                        <a :href="'#' + item.id" :title="item.text" target="_self">{{ item.text }}</a>
                    </div>
                </div>
            </aside>
        </div>



    </div>

    <!-- <Footer /> -->
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

import { usePostsStore } from '@/stores/posts'
import { setDocumentTitle } from '@/utils/setDocumentTitle'
import { formatDate2 } from '@/utils/textFormat'


import MarkdownRenderer from '@/components/RenderMarkdown/index.vue'
import Footer from '@/components/Footer/index.vue'


const postStore = usePostsStore()
const route = useRoute()
const post = computed(() => postStore.getPost(route.params.slug as string))

/**
 * 阅读进度
 */
const progress = ref(0)

const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (docHeight <= 0) {
        progress.value = 0
        return
    }

    progress.value = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100))
}

onMounted(async () => {
    await nextTick()
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    setDocumentTitle(post.value ? post.value.title : '')
})

onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress)
})

// 当路由参数 slug 改变时（例如从 /post/a 跳转到 /post/b）
onBeforeRouteUpdate(async (to) => {
    // 重新获取数据并更新标题
    // const res = await getPostDetailApi(to.params.slug);
    setDocumentTitle('');
});
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
        box-shadow: 0 0 6px rgba(59, 130, 246, 0.45), 0 0 14px rgba(96, 165, 250, 0.35), 0 0 22px rgba(56, 189, 248, 0.20);
        animation: blueGlowFlow 2.8s ease-in-out infinite;
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

/* =========================
   页面布局
========================= */
.post-detail {
    width: 900px;
    margin: 0 auto;

    padding-bottom: 200px;
    border-radius: 30px;
    background-color: rgba(0, 0, 0, 0.5);

    .content {
        position: relative;
        padding: 10px 30px;

        /* 🛠️ 优化后的 TOC 样式 */
        .toc {
            max-width: 220px;
            border-radius: 20px;
            position: fixed;
            top: 80px;
            padding: 20px;
            /* 留出顶部进度条与视窗边缘的呼吸感 */
            // right: 20px;
            left: calc(50% + 450px + 20px);
            /* 50% + 主内容宽度的一半 + 间距 */
            font-size: 12px;
            display: flex;
            flex-direction: column;
            background-color: var(--bg-color);

            // 💡 限制最大高度：视窗总高减去顶部和底部留白
            max-height: calc(100vh - 100px);

            .toc-title {
                font-weight: 600;
                font-size: 16px;
                margin-bottom: 10px;
                color: var(--bg-base-color-2, 1);
                flex-shrink: 0;
                /* 保证标题不被压缩 */
            }

            /* 💡 独立的滚动容器 */
            .toc-list {
                overflow-y: auto;
                overflow-x: hidden;
                padding-bottom: 20px;

                /* 兼容火狐浏览器：隐藏滚动条但保留滚动功能 */
                scrollbar-width: none;

                /* 兼容 Chrome, Safari, Edge 等 Webkit 内核浏览器 */
                &::-webkit-scrollbar {
                    display: none;
                    /* 🔥 核心：直接让滚动条隐形 */
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
                }

                a:hover {
                    color: #2f5491;
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

.header {
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 40px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    // background-color: rgba(255, 255, 255, 0.1);
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
        // border-bottom: white 2px dashed;
        // color: var(--font-color);
        position: relative;

        &::after {
            content: "";
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

            span {
                // padding: 4px 8px;
                padding: 6px 12px;
                font-size: 12px;
                background-color: var(--post-detail-head-tag);
                border-radius: 15px;
                color: var(--post-detail-head-tag-text);
            }
        }
    }

    .series {
        // background-color: #2f5491;
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
        // margin-top: 10px;


        .sync-title {
            font-size: 12px;
            padding: 5px 0;
        }

        .sync-items {
            padding: 15px 0;
            display: flex;
            gap: .625rem;
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
</style>