<template>
    <div class="moments-all">
        <!-- ============ 头部：标题 + 统计 + 简介 ============ -->
        <header class="moments-header">
            <div class="header-title">Moments</div>

            <div class="header-stats">
                <div class="stat-item">
                    <div class="stat-icon"><i class="iconfont icon-calendar"></i></div>
                    <div class="stat-info">
                        <div class="stat-count">{{ yearCount }}</div>
                        <div class="stat-desc">Years</div>
                    </div>
                </div>

                <div class="stat-item">
                    <div class="stat-icon"><i class="iconfont icon-img2"></i></div>
                    <div class="stat-info">
                        <div class="stat-count">{{ momentsList.length }}</div>
                        <div class="stat-desc">Moments</div>
                    </div>
                </div>

                <div class="stat-item">
                    <div class="stat-icon"><i class="iconfont icon-location"></i></div>
                    <div class="stat-info">
                        <div class="stat-count">{{ momentsStore.cityCount }}</div>
                        <div class="stat-desc">Cities</div>
                    </div>
                </div>
            </div>

            <p class="header-intro">
                人的记忆由不同的瞬间组成，常态是逐渐模糊，然后靠回忆维持。

                <br>

                但把喜与悲清晰记录下来，这或许是一种更好的选择。
            </p>

            <!-- ============ 筛选器 ============ -->
            <div class="filters">
                <div class="filter-group">
                    <span class="filter-label">年份</span>
                    <button class="chip" :class="{ active: activeYear === 'all' }" @click="selectYear('all')">
                        全部
                    </button>
                    <button v-for="y in yearOptions" :key="y" class="chip" :class="{ active: activeYear === y }"
                        @click="selectYear(y)">
                        {{ y }}
                    </button>
                </div>

                <div class="filter-group">
                    <span class="filter-label">月份</span>
                    <button class="chip" :class="{ active: activeMonth === 'all' }" @click="selectMonth('all')">
                        全部
                    </button>
                    <button v-for="m in monthOptions" :key="m" class="chip" :class="{ active: activeMonth === m }"
                        :disabled="!monthHasData(m)" :title="monthHasData(m) ? '' : '该月暂无记录'" @click="selectMonth(m)">
                        {{ Number(m) }} 月
                    </button>
                </div>
            </div>

        </header>


        <!-- ============ 垂直时间轴 ============ -->
        <div class="timeline">
            <div v-for="group in groupedMoments" :key="group.key" class="timeline-group">
                <div class="group-head">
                    <span class="group-title">{{ group.label }}</span>
                    <span class="group-count">{{ group.items.length }} 条</span>
                </div>

                <div class="timeline-items">
                    <div v-for="(item, idx) in group.items" :key="item.id" class="timeline-item"
                        :class="idx % 2 === 0 ? 'is-left' : 'is-right'">
                        <span class="dot"></span>

                        <div class="moment" role="button" tabindex="0" @click="openViewer(item)"
                            @keydown.enter="openViewer(item)" @keydown.space.prevent="openViewer(item)">
                            <template v-if="hasImages(item)">
                                <div class="cover">
                                    <img :src="getImgURL(item.images![0])" :alt="item.text" loading="lazy">
                                    <div v-if="item.images!.length > 1" class="badge badge-tag">多图</div>
                                    <div v-if="item.images!.length > 1" class="badge badge-count">
                                        {{ item.images!.length }}
                                    </div>
                                </div>

                                <div class="info over-cover">
                                    <div class="top">
                                        <span class="date">{{ formatDate(item.id) }}</span>
                                        <span v-if="item.location" class="location">
                                            <i class="iconfont icon-location"></i>
                                            {{ item.location }}
                                        </span>
                                    </div>
                                    <div class="desc">{{ item.text }}</div>
                                </div>
                            </template>

                            <template v-else>
                                <div class="text-only">
                                    <div class="text-meta">
                                        <span class="date">{{ formatDate(item.id) }}</span>
                                        <span v-if="item.location" class="location">
                                            <i class="iconfont icon-location"></i>
                                            {{ item.location }}
                                        </span>
                                    </div>
                                    <p class="text-body">{{ item.text }}</p>
                                    <span class="read-more">💬 阅读全文</span>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredMoments.length === 0" class="empty">暂时还没有记录</div>

        <!-- ============ 放大查看器 ============ -->
        <transition name="viewer-fade">
            <div v-if="viewerVisible" class="viewer-mask" @click="closeViewer">
                <div class="viewer-card" @click.stop>
                    <div class="viewer-head">
                        <div class="viewer-meta">
                            <span class="viewer-date">
                                {{ viewerCurrent ? formatDate(viewerCurrent.id) : '' }}
                            </span>
                            <span v-if="viewerCurrent && viewerCurrent.location" class="viewer-location">
                                <i class="iconfont icon-location"></i>
                                {{ viewerCurrent.location }}
                            </span>
                        </div>
                        <button class="viewer-close" @click="closeViewer">
                            <i class="iconfont icon-close"></i>
                        </button>
                    </div>

                    <div class="viewer-body">
                        <div v-if="viewerImages.length" class="viewer-stage"
                            :class="[`is-${viewerOrientation}`, { dragging: isDragging }]" @mousedown="onDragStart"
                            @wheel.prevent="onWheel">
                            <img :src="viewerImgUrl" alt="大图预览" class="viewer-img" :style="zoomStyle"
                                @click.stop="toggleZoom" @load="onImgLoad">

                            <template v-if="viewerImages.length > 1">
                                <button class="viewer-nav prev" :disabled="viewerIndex === 0" @click.stop="prevImage">
                                    <i class="iconfont icon-left"></i>
                                </button>
                                <button class="viewer-nav next" :disabled="viewerIndex === viewerImages.length - 1"
                                    @click.stop="nextImage">
                                    <i class="iconfont icon-right"></i>
                                </button>
                                <div class="viewer-count">
                                    {{ viewerIndex + 1 }} / {{ viewerImages.length }}
                                </div>
                            </template>
                        </div>

                        <div v-else class="viewer-text-wrap">
                            <div class="viewer-text">{{ viewerCurrent?.text }}</div>
                        </div>
                    </div>

                    <div class="viewer-foot">
                        <div v-if="viewerImages.length" class="viewer-desc">{{ viewerCurrent?.text }}</div>
                        <div class="viewer-tip">
                            {{ viewerImages.length ? 'Esc 关闭 · 滚轮放大缩小 · 放大可拖拽' : '按 Esc 关闭' }}
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMomentsStore } from '@/stores/moments'
import { getImgURL } from '@/utils/link'
import type { Moment } from '@/types/moment'

const momentsStore = useMomentsStore()
const { momentsList } = storeToRefs(momentsStore)

/*
|--------------------------------------------------------------------------
| 时间解析 & 格式化（时间来源为 id：20260917 / 2026091701）
|--------------------------------------------------------------------------
*/

function parseDate(id: string) {
    const digits = String(id ?? '').replace(/\D/g, '')

    if (digits.length < 8) return { year: '', month: '', day: '', key: '', ts: 0, seq: '' }

    const year = digits.slice(0, 4)
    const month = digits.slice(4, 6)
    const day = digits.slice(6, 8)
    const seq = digits.slice(8) || ''

    const ts = Date.UTC(Number(year), Number(month) - 1, Number(day))
    return { year, month, day, key: `${year}-${month}`, ts, seq }
}

function formatDate(id: string) {
    const { year, month, day } = parseDate(id)
    if (!year) return String(id)
    return day ? `${year}.${month}.${day}` : `${year}.${month}`
}

function hasImages(item: Moment): item is Moment & { images: string[] } {
    return Array.isArray(item.images) && item.images.length > 0
}

/*
|--------------------------------------------------------------------------
| 筛选：年份 / 月份
|--------------------------------------------------------------------------
*/

const activeYear = ref<string>('all')
const activeMonth = ref<string>('all')

const normalized = computed(() => {
    return momentsList.value
        .map((item) => {
            const info = parseDate(item.id)
            return { item, ...info }
        })
        .sort((a, b) => b.ts - a.ts || b.seq.localeCompare(a.seq))
})

const yearOptions = computed(() => {
    const set = new Set<string>()
    normalized.value.forEach((n) => n.year && set.add(n.year))
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
})

/** 头部统计：有多少个不同年份 */
const yearCount = computed(() => yearOptions.value.length)

const monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
)

function monthHasData(m: string) {
    return normalized.value.some((n) => {
        const yearOk = activeYear.value === 'all' || n.year === activeYear.value
        return yearOk && n.month === m
    })
}

const filteredMoments = computed(() => {
    return normalized.value.filter((n) => {
        const yearOk = activeYear.value === 'all' || n.year === activeYear.value
        const monthOk = activeMonth.value === 'all' || n.month === activeMonth.value
        return yearOk && monthOk
    })
})

const groupedMoments = computed(() => {
    const map = new Map<string, { key: string; label: string; ts: number; items: Moment[] }>()

    filteredMoments.value.forEach((n) => {
        const key = n.key || 'unknown'
        if (!map.has(key)) {
            map.set(key, {
                key,
                label: n.year && n.month ? `${n.year} 年 ${n.month} 月` : '未知时间',
                ts: n.ts,
                items: []
            })
        }
        map.get(key)!.items.push(n.item)
    })

    return Array.from(map.values()).sort((a, b) => b.ts - a.ts)
})

function selectYear(y: string) {
    activeYear.value = y
    if (activeMonth.value !== 'all' && !monthHasData(activeMonth.value)) {
        activeMonth.value = 'all'
    }
}

function selectMonth(m: string) {
    if (!monthHasData(m)) return
    activeMonth.value = m
}

/*
|--------------------------------------------------------------------------
| 放大查看器
|--------------------------------------------------------------------------
*/

const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const viewerCurrent = ref<Moment | null>(null)

const viewerImgUrl = computed(() => {
    const url = viewerImages.value[viewerIndex.value]
    return url ? getImgURL(url) : ''
})

const viewerOrientation = ref<'landscape' | 'portrait' | 'square'>('landscape')

const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
let dragging = false
let startX = 0
let startY = 0
const isDragging = ref(false)

const zoomStyle = computed(() => ({
    transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
    transition: isDragging.value ? 'none' : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
}))

function onImgLoad(e: Event) {
    const img = e.target as HTMLImageElement
    if (!img) return
    const ratio = img.naturalWidth / img.naturalHeight
    if (ratio > 1.15) viewerOrientation.value = 'landscape'
    else if (ratio < 0.87) viewerOrientation.value = 'portrait'
    else viewerOrientation.value = 'square'
    resetTransform()
}

function resetTransform() {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    isDragging.value = false
}

function openViewer(item: Moment) {
    viewerCurrent.value = item
    if (hasImages(item)) {
        viewerImages.value = item.images
        viewerIndex.value = 0
        viewerOrientation.value = 'landscape'
    } else {
        viewerImages.value = []
        viewerIndex.value = 0
    }
    resetTransform()
    viewerVisible.value = true
    document.body.style.overflow = 'hidden'
}

function closeViewer() {
    viewerVisible.value = false
    viewerImages.value = []
    viewerIndex.value = 0
    resetTransform()
    document.body.style.overflow = ''
}

function toggleZoom() {
    if (!viewerImages.value.length) return
    if (scale.value > 1.001) {
        resetTransform()
    } else {
        scale.value = 2
        offsetX.value = 0
        offsetY.value = 0
    }
}

function onWheel(e: WheelEvent) {
    if (!viewerImages.value.length) return
    const delta = e.deltaY < 0 ? 0.2 : -0.2
    const next = Math.min(Math.max(1, scale.value + delta), 4)
    scale.value = next
    if (next === 1) {
        offsetX.value = 0
        offsetY.value = 0
    }
}

function onDragStart(e: MouseEvent) {
    if (scale.value <= 1.001) return
    dragging = true
    isDragging.value = true
    startX = e.clientX - offsetX.value
    startY = e.clientY - offsetY.value
    window.addEventListener('mousemove', onDragMove)
    window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
    if (!dragging) return
    offsetX.value = e.clientX - startX
    offsetY.value = e.clientY - startY
}

function onDragEnd() {
    dragging = false
    isDragging.value = false
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
}

function prevImage() {
    if (viewerIndex.value > 0) {
        viewerIndex.value--
        resetTransform()
    }
}

function nextImage() {
    if (viewerIndex.value < viewerImages.value.length - 1) {
        viewerIndex.value++
        resetTransform()
    }
}

function onKeydown(e: KeyboardEvent) {
    if (!viewerVisible.value) return
    if (e.key === 'Escape') closeViewer()
    else if (e.key === 'ArrowLeft') prevImage()
    else if (e.key === 'ArrowRight') nextImage()
}

watch(
    () => momentsList.value.length,
    () => {
        if (activeYear.value !== 'all' && !yearOptions.value.includes(activeYear.value)) {
            activeYear.value = 'all'
        }
        if (activeMonth.value !== 'all' && !monthHasData(activeMonth.value)) {
            activeMonth.value = 'all'
        }
    }
)

onBeforeUnmount(() => {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('mousemove', onDragMove)
    window.removeEventListener('mouseup', onDragEnd)
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
    margin-top: 5px;

}

/* =========================
   头部：标题 + 统计 + 简介
========================= */

.moments-header {
    width: 100%;
    max-width: 1000px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 28px 24px;
    border-radius: 20px;
    background-color: var(--main-bg);
    border: 0.3px solid var(--page-moments-border);
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.06);
}

.header-title {
    font-size: 30px;
    font-weight: bold;
    line-height: 1.1;
    letter-spacing: 0.5px;
    color: var(--main-font-color);

}

.header-stats {
    display: flex;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
}

.stat-item {
    flex: 1 1 160px;
    max-width: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 14px;
    background: var(--main-bg);
    color: var(--main-font-color);
    transition: background 0.25s ease, transform 0.25s ease;
}



.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-icon .iconfont {
    font-size: 30px;
}

.stat-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
}

.stat-count {
    font-size: 16px;
    font-weight: bold;
    line-height: 1.2;
}

.stat-desc {
    font-size: 12px;
    color: #888;
    white-space: nowrap;
}

.header-intro {
    margin: 0;
    max-width: 500px;
    text-align: center;
    font-size: 14px;
    line-height: 22px;
    // color: #888;
    padding: 10px;
    border-radius: 10px;
    color: var(--main-font-color);

}

/* =========================
   筛选器
========================= */

.filters {
    width: 100%;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 15px;
    // background-color: var(--main-bg);
    box-sizing: border-box;
}

.filter-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-label {
    font-size: 13px;
    opacity: 0.7;
    margin-right: 4px;
    color: var(--main-font-color)
}

.chip {
    padding: 5px 12px;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    color: inherit;
    cursor: pointer;
    background-color: var(--page-moments-chip-bg);
    color: var(--page-moments-chip-font-color);
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;

}

.chip:hover:not(:disabled) {
    transform: translateY(-1px);
}

.chip.active {

    font-weight: 600;
    background-color: var(--page-moments-chip-bg-active);
    border: 0.3px solid var(--page-moments-chip-border);
}

.chip:disabled {
    opacity: 0.2;
    cursor: not-allowed;
    transform: none;

}

/* =========================
   垂直时间轴：居中对称，左右交替
========================= */

.timeline {
    position: relative;
    width: 100%;
    max-width: 1000px;
    box-sizing: border-box;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 20px;
    bottom: 8px;
    width: 2px;
    transform: translateX(-50%);
    background: linear-gradient(to bottom, rgba(128, 128, 128, 0.45), rgba(128, 128, 128, 0.08));
    border-radius: 2px;
}

.timeline-group {
    position: relative;
    margin: 0 auto 30px;
}

.group-head {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 20px auto;
    padding: 10px 16px;
    width: fit-content;
    border-radius: 20px;
    background-color: var(--main-bg);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

}


.group-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.4px;

    color: var(--main-font-color);
}

.group-count {
    font-size: 12px;
    opacity: 0.5;
    color: var(--main-font-color);
}

.timeline-items {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.timeline-item {
    position: relative;
    display: flex;
    width: 100%;
    box-sizing: border-box;
}

.dot {
    position: absolute;
    left: 50%;
    top: 20px;
    width: 10px;
    height: 10px;
    transform: translateX(-50%);
    border-radius: 50%;
    background-color: var(--page-moments-chip-bg-active);
    border: 0.3px solid var(--page-moments-border);
    z-index: 3;
}

.timeline-item.is-left {
    justify-content: flex-start;
    padding-right: calc(50% + 28px);
}

.timeline-item.is-right {
    justify-content: flex-end;
    padding-left: calc(50% + 28px);
}

/* =========================
   卡片
========================= */

.moment {
    position: relative;
    width: 100%;
    max-width: 460px;
    overflow: hidden;
    border-radius: 16px;
    background-color: var(--page-moments-card-text-only-bg);
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    outline: none;
    padding: 10px;
    transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease;
}

.moment:hover,
.moment:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
    z-index: 2;
}

.cover {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: 10px;
}

.cover img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease;
}

.moment:hover .cover img {
    transform: scale(1.04);
}

.badge {
    position: absolute;
    top: 10px;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 12px;
    line-height: 1;
    color: #fff;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    pointer-events: none;
}

.badge-tag {
    left: 10px;
    letter-spacing: 1px;
}

.badge-count {
    right: 10px;
    min-width: 22px;
    font-weight: bold;
}

.info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
}

.info.over-cover {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    padding: 40px 20px 20px;
    color: #fff;
    background: linear-gradient(to bottom,
            transparent,
            rgba(0, 0, 0, 0.55) 40%,
            rgba(0, 0, 0, 0.85));
    pointer-events: none;
    // background-color: rebeccapurple;
}

.top,
.text-meta {
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

.desc {
    font-size: 13px;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* =========================
   纯文字卡片
========================= */

.text-only {
    position: relative;
    padding: 18px 20px 20px;
    overflow: hidden;
    background-color: var(--page-moments-card-text-only-bg);
    border-radius: 10px;

}

.text-meta {
    margin-bottom: 10px;
    opacity: 0.65;
    color: var(--main-font-color);
}

.text-body {
    margin: 0;
    font-size: 14px;
    line-height: 1.85;
    white-space: pre-wrap;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-height: calc(1.85em * 6);
    color: var(--page-moments-card-text-only-font-color);

}

.text-only::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 46px;
    background: linear-gradient(to bottom, transparent, var(--bg-color));
    pointer-events: none;
}

.read-more {
    position: relative;
    z-index: 1;
    display: inline-block;
    margin-top: 12px;
    font-size: 12px;
    color: var(--page-moments-card-text-only-more-color);
    font-weight: 600;

    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.moment:hover .read-more,
.moment:focus-visible .read-more {
    opacity: 0.9;
    transform: translateY(0);
}

/* =========================
   空状态
========================= */

.empty {
    padding: 60px 20px;
    text-align: center;
    color: #888;
    font-size: 14px;
}

/* =========================
   放大查看器
========================= */

.viewer-mask {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    cursor: zoom-out;
}

.viewer-card {
    position: relative;
    width: 70vw;
    height: 80vh;
    max-width: 1400px;
    max-height: 900px;
    display: flex;
    flex-direction: column;
    border-radius: 18px;
    overflow: hidden;
    background: rgba(28, 28, 30, 0.98);
    color: #f2f2f2;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
    cursor: default;
    animation: viewer-pop 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes viewer-pop {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.viewer-head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.viewer-meta {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 13px;
    min-width: 0;
}

.viewer-date {
    font-weight: 600;
    letter-spacing: 0.3px;
}

.viewer-location {
    opacity: 0.75;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.viewer-close {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    color: #f2f2f2;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, transform 0.2s ease;
}

.viewer-close:hover {
    background: rgba(255, 255, 255, 0.28);
    transform: rotate(90deg);
}

.viewer-body {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background:
        radial-gradient(circle at center, rgba(255, 255, 255, 0.04), transparent 70%),
        rgba(0, 0, 0, 0.35);
}

.viewer-stage {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 16px;
    box-sizing: border-box;

    &.dragging {
        cursor: grabbing;
    }
}

.viewer-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 6px;
    user-select: none;
    -webkit-user-drag: none;
    cursor: zoom-in;
    will-change: transform;
}

.viewer-stage.is-landscape .viewer-img {
    width: 100%;
    height: auto;
    max-height: 100%;
}

.viewer-stage.is-portrait .viewer-img {
    height: 100%;
    width: auto;
    max-width: 100%;
}

.viewer-stage.is-square .viewer-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}

.viewer-text-wrap {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex;
    justify-content: center;
    padding: 36px 32px;
    box-sizing: border-box;
}

.viewer-text {
    width: 100%;
    max-width: 68ch;
    margin: 0 auto;
    font-size: 16px;
    line-height: 2;
    letter-spacing: 0.2px;
    color: #eee;
    white-space: pre-wrap;
    word-break: break-word;
    text-align: left;
}

.viewer-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
    backdrop-filter: blur(4px);
}

.viewer-nav:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.4);
}

.viewer-nav:disabled {
    opacity: 0.25;
    cursor: not-allowed;
}

.viewer-nav.prev {
    left: 16px;
}

.viewer-nav.next {
    right: 16px;
}

.viewer-count {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 3px 12px;
    border-radius: 20px;
    font-size: 12px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.viewer-foot {
    flex: 0 0 auto;
    padding: 14px 20px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.viewer-desc {
    font-size: 13px;
    line-height: 1.6;
    color: #dcdcdc;
    max-height: 3.2em;
    overflow-y: auto;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.viewer-tip {
    margin-top: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    text-align: center;
}

.viewer-fade-enter-active,
.viewer-fade-leave-active {
    transition: opacity 0.28s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
    opacity: 0;
}

/* =========================
   响应式
========================= */

@media (max-width: 1024px) {
    .viewer-card {
        width: 82vw;
        height: 82vh;
    }
}

@media (max-width: 768px) {
    .moments-header {
        padding: 20px 16px;
        gap: 14px;
        border-radius: 16px;
    }

    .header-title {
        font-size: 30px;
    }

    .header-stats {
        gap: 10px;
    }

    .stat-item {
        flex: 1 1 100px;
        padding: 10px;
        gap: 6px;
        border-radius: 12px;
    }

    .stat-icon .iconfont {
        font-size: 22px;
    }

    .stat-count {
        font-size: 14px;
    }

    .stat-desc {
        font-size: 11px;
    }

    .header-intro {
        font-size: 13px;
        line-height: 20px;
    }

    .timeline {
        padding-left: 26px;
    }

    .timeline::before {
        left: 12px;
        transform: none;
    }

    .group-head {
        justify-content: flex-start;
        margin-left: 0;
        margin-right: 0;
    }

    .timeline-item.is-left,
    .timeline-item.is-right {
        justify-content: flex-start;
        padding-left: 0;
        padding-right: 0;
    }

    .dot {
        left: 12px;
        transform: translateX(-50%);
        top: 16px;
    }

    .moment {
        max-width: 100%;
        border-radius: 12px;
    }

    .text-only {
        padding: 14px 16px 16px;
    }

    .text-body {
        font-size: 13px;
        -webkit-line-clamp: 5;
        max-height: calc(1.8em * 5);
    }

    .read-more {
        opacity: 0.9;
        transform: none;
    }

    .filters {
        padding: 12px;
        border-radius: 12px;
    }

    .chip {
        padding: 4px 10px;
        font-size: 12px;
    }

    .info.over-cover {
        padding: 30px 10px 8px;
        gap: 4px;
        background: linear-gradient(to bottom,
                transparent,
                rgba(0, 0, 0, 0.6) 40%,
                rgba(0, 0, 0, 0.9));
    }

    .top {
        gap: 6px;
        font-size: 10px;
    }

    .location {
        font-size: 10px;
        max-width: 50%;
        display: inline-flex;
        align-items: center;
    }

    .location .iconfont {
        font-size: 10px;
    }

    .desc {
        font-size: 11px;
        line-height: 1.4;
        -webkit-line-clamp: 1;
    }

    .badge {
        top: 6px;
        font-size: 10px;
        padding: 2px 6px;
    }

    .badge-tag {
        left: 6px;
    }

    .badge-count {
        right: 6px;
        min-width: 18px;
    }

    .viewer-mask {
        padding: 12px;
    }

    .viewer-card {
        width: 100%;
        height: 100%;
        max-width: none;
        max-height: none;
        border-radius: 14px;
    }

    .viewer-head,
    .viewer-foot {
        padding-left: 14px;
        padding-right: 14px;
    }

    .viewer-stage {
        padding: 10px;
    }

    .viewer-nav {
        width: 34px;
        height: 34px;
        font-size: 13px;
    }

    .viewer-nav.prev {
        left: 8px;
    }

    .viewer-nav.next {
        right: 8px;
    }

    .viewer-text-wrap {
        padding: 22px 18px;
    }

    .viewer-text {
        font-size: 15px;
        line-height: 1.9;
    }
}

@media (max-width: 400px) {

    .top,
    .text-meta {
        font-size: 11px;
    }

    .location {
        font-size: 11px;
    }

    .desc {
        font-size: 12px;
    }

    .stat-item {
        flex: 1 1 80px;
        padding: 8px;
    }

    .stat-desc {
        font-size: 10px;
    }
}
</style>