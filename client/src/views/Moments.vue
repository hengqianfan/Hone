<template>
    <div class="moments-all">
        <div class="moments-title">
            Moments
        </div>

        <div class="moments-intro">
            <div>在这里，你可以看到我记录的每一个瞬间。</div>
        </div>

        <!-- 图片墙 -->
        <div class="moments-list">
            <div v-for="item in currentMoments" :key="item.imgUrl" class="moment">
                <div class="image" @click="openViewer(item)">

                    <img :src="getImgURL_img(item.imgUrl)" :alt="item.desc" loading="lazy">

                    <!-- 底部信息 -->
                    <div class="info">
                        <!-- 顶部：时间 + 地点 -->
                        <div class="top">
                            <span class="date">
                                {{ formatDate(item.date) }}
                            </span>

                            <span v-if="item.location" class="location">
                                <i class="iconfont icon-location"></i>
                                {{ item.location }}
                            </span>
                        </div>

                        <!-- 描述：悬浮时才显示 -->
                        <div class="desc">
                            {{ item.desc }}
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="momentsStore.momentsList.length === 0" class="empty">
            暂时还没有记录
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
            <button class="page" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                <i class="iconfont icon-left"></i>
            </button>

            <button v-for="page in totalPages" :key="page" class="page" :class="{ active: currentPage === page }"
                @click="changePage(page)">
                {{ page }}
            </button>

            <button class="page" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                <i class="iconfont icon-right"></i>
            </button>
        </div>

        <!-- 图片放大查看器 -->
        <transition name="viewer-fade">
            <div v-if="viewerVisible" class="viewer-mask" @click="closeViewer">
                <div class="viewer-container" :class="{ zoomed: viewerZoomed }" @click.stop>
                    <img :src="viewerImgUrl" alt="大图预览" class="viewer-img" @click="toggleZoom">

                    <div v-if="viewerCurrent" class="viewer-info">
                        <div class="viewer-top">
                            <span class="viewer-date">
                                {{ formatDate(viewerCurrent.date) }}
                            </span>
                            <span v-if="viewerCurrent.location" class="viewer-location">
                                <i class="iconfont icon-location"></i>
                                {{ viewerCurrent.location }}
                            </span>
                        </div>
                        <div class="viewer-desc">
                            {{ viewerCurrent.desc }}
                        </div>
                    </div>

                    <button class="viewer-close" @click="closeViewer">
                        <i class="iconfont icon-close"></i> ×
                    </button>

                    <div class="viewer-tip">
                        点击图片可放大 / 缩小
                    </div>
                </div>
            </div>
        </transition>

    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { useMomentsStore } from '@/stores/moments'
import { getImgURL_img } from '@/utils/link'

const momentsStore = useMomentsStore()

/*
|--------------------------------------------------------------------------
| 分页
|--------------------------------------------------------------------------
*/

const currentPage = ref(1)
const pageSize = 12

const total = computed(() => momentsStore.momentsList.length)

const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize)
})

const currentMoments = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return momentsStore.momentsList.slice(start, end)
})

/*
|--------------------------------------------------------------------------
| 日期格式化
|--------------------------------------------------------------------------
*/

function formatDate(date: number | string) {
    const value = String(date)
    if (value.length !== 8) {
        return value
    }
    return `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
}

/*
|--------------------------------------------------------------------------
| 切换页面
|--------------------------------------------------------------------------
*/

function changePage(page: number) {
    if (page < 1 || page > totalPages.value) {
        return
    }
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

/*
|--------------------------------------------------------------------------
| 数据变化时检查当前页
|--------------------------------------------------------------------------
*/

watch(
    () => momentsStore.momentsList.length,
    () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = Math.max(1, totalPages.value)
        }
    }
)

/*
|--------------------------------------------------------------------------
| 图片放大查看器
|--------------------------------------------------------------------------
*/

const viewerVisible = ref(false)
const viewerZoomed = ref(false)
const viewerImgUrl = ref('')
const viewerCurrent = ref<null | { date: number | string; location?: string; desc?: string }>(null)

function openViewer(item: any) {
    viewerImgUrl.value = getImgURL_img(item.imgUrl)
    viewerCurrent.value = {
        date: item.date,
        location: item.location,
        desc: item.desc
    }
    viewerZoomed.value = false
    viewerVisible.value = true
    document.body.style.overflow = 'hidden'
}

function closeViewer() {
    viewerVisible.value = false
    viewerZoomed.value = false
    document.body.style.overflow = ''
}

function toggleZoom() {
    viewerZoomed.value = !viewerZoomed.value
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        closeViewer()
    }
}

onBeforeUnmount(() => {
    document.body.style.overflow = ''
})

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
.moments-all {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .moments-title {
        font-size: 20px;
        font-weight: bold;
        // margin-bottom: 10px;
        padding: 10px 20px;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: var(--bg-color);
    }

    .moments-intro {
        font-size: 14px;
        line-height: 20px;
        margin: 10px;
        text-align: center;
        max-width: 600px;
        border-radius: 10px;
        // background-color: var(--bg-color);
        padding: 5px 10px;
    }
}

/* =========================
   图片墙：桌面端固定 4 列
========================= */

.moments-list {
    columns: 4;
    column-gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: var(--bg-color);
    padding: 20px;
    border-radius: 20px;
}

/* =========================
   Moment
========================= */

.moment {
    width: 100%;
    margin-bottom: 20px;
    break-inside: avoid;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    // padding: 5px;
    background-color: var(--bg-color);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* =========================
   图片
========================= */

.image {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 16px;
    cursor: zoom-in;
}

.image img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 0.4s ease, filter 0.4s ease;
}

/* 悬浮轻微放大 */
.moment:hover img {
    transform: scale(1.03);
}

/* =========================
   信息
========================= */

.info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 40px 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #fff;
    background: linear-gradient(to bottom,
            transparent,
            rgba(0, 0, 0, 0.55) 40%,
            rgba(0, 0, 0, 0.85));
    pointer-events: none;
}

/* =========================
   顶部信息（时间 + 地点）
========================= */

.top {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
}

.date {
    font-weight: bold;
    letter-spacing: 0.3px;
}

.location {
    opacity: 0.85;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60%;
}

.location .iconfont {
    font-size: 11px;
}

/* =========================
   描述（仅悬浮时显示）
========================= */

.desc {
    font-size: 13px;
    line-height: 1.5;

    max-height: 0;
    opacity: 0;
    transform: translateY(6px);
    overflow: hidden;
    transition: all 0.3s ease;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.moment:hover .desc {
    max-height: 3.2em;
    opacity: 1;
    transform: translateY(0);
}

/* =========================
   空状态
========================= */

.empty {
    padding: 80px 20px;
    text-align: center;
    color: #888;
    font-size: 14px;
}

/* =========================
   分页
========================= */

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 30px;
}

.page {
    width: 34px;
    height: 34px;
    padding: 0;
    border: none;
    border-radius: 10px;
    background-color: var(--bg-color);
    color: inherit;
    cursor: pointer;
    font-size: 13px;
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.page:hover:not(:disabled) {
    transform: translateY(-2px);
}

.page.active {
    background-color: var(--primary);
    color: #fff;
}

.page:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

/* =========================
   图片放大查看器
========================= */

.viewer-mask {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
}

.viewer-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.viewer-img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
    transition: transform 0.35s ease;
    user-select: none;
}

.viewer-container.zoomed .viewer-img {
    transform: scale(1.8);
    cursor: zoom-out;
}

.viewer-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 40px 20px 20px;
    color: #fff;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
    text-align: left;
    pointer-events: none;
    border-radius: 0 0 8px 8px;
}

.viewer-top {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    margin-bottom: 6px;
}

.viewer-date {
    font-weight: bold;
}

.viewer-location .iconfont {
    font-size: 14px;
}

.viewer-desc {
    font-size: 14px;
    line-height: 1.6;
}

.viewer-close {
    position: absolute;
    top: -18px;
    right: -18px;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    z-index: 10;
}

.viewer-close:hover {
    background: rgba(255, 255, 255, 0.4);
}

.viewer-tip {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    white-space: nowrap;
}

.viewer-fade-enter-active,
.viewer-fade-leave-active {
    transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
    opacity: 0;
}

/* =========================
   响应式
========================= */

@media (max-width: 768px) {
    .moments-list {
        columns: 2;
        column-gap: 10px;
        max-width: 100%;
    }

    .moment {
        margin-bottom: 10px;
        border-radius: 10px;
    }

    .image {
        border-radius: 10px;
    }

    /* ===== 移动端：缩小卡片信息文字 ===== */
    .info {
        padding: 30px 10px 8px;
        gap: 4px;
        /* 用更深的黑色，保证在小图上清晰 */
        background: linear-gradient(to bottom,
                transparent,
                rgba(0, 0, 0, 0.6) 40%,
                rgba(0, 0, 0, 0.9));
    }

    .top {
        gap: 6px;
        font-size: 10px;
        /* 桌面 12 → 移动 10 */
    }

    .date {
        font-weight: 600;
    }

    .location {
        font-size: 10px;
        /* 更小的地点字 */
        max-width: 50%;
        gap: 2px;
        display: inline-flex;
        align-items: center;
    }

    .location .iconfont {
        font-size: 10px;
    }

    .desc {
        font-size: 11px;
        /* 描述字也调小 */
        line-height: 1.4;
        -webkit-line-clamp: 1;
        /* 移动端只显示一行描述 */
    }

    .moment:hover .desc {
        max-height: 1.6em;
    }

    .viewer-img {
        max-width: 95vw;
        max-height: 95vh;
    }
}

/* 超小屏，单列场景 */
@media (max-width: 400px) {
    .top {
        font-size: 11px;
    }

    .location {
        font-size: 11px;
    }

    .desc {
        font-size: 12px;
    }
}
</style>