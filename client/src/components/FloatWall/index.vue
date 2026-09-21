<template>
    <div class="danmaku-wall" ref="wallRef" :class="{ paused: hoverDanmaku }" @mouseenter="hoverDanmaku = true"
        @mouseleave="hoverDanmaku = false">
        <TransitionGroup name="danmaku-in">
            <component v-for="item in list" :key="item.id" :is="getComponent(item)"
                :to="isInternal(item.url) ? item.url : undefined" :href="isExternal(item.url) ? item.url : undefined"
                :target="isExternal(item.url) ? '_blank' : undefined" class="danmaku" :class="{ clickable: item.url }"
                :style="{
                    top: item.top + 'px',
                    left: item.start + 'px',
                    animationDuration: item.duration + 's',
                    animationDelay: item.delay + 's'
                }">
                <span class="icon">{{ item?.icon || '💬' }}</span>
                <span class="text">{{ item.text }}</span>
            </component>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { mottos, type Motto } from '@/config/motto'

interface Danmaku extends Motto {
    id: number
    top: number
    start: number
    duration: number
    delay: number
}

const list = ref<Danmaku[]>([])
const hoverDanmaku = ref(false)

const wallRef = ref<HTMLElement | null>(null)
/** 容器实际高度，用于均匀分布弹幕轨道 */
const wallHeight = ref(320)
/** 容器实际宽度，用于计算横向边界 */
const wallWidth = ref(0)

const maxShow = ref(10)
let timer: number

/** 上下左右统一留出的安全内边距，避免弹幕贴边 */
const PAD_Y = 10
const PAD_X = 12

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function calcShowCount() {
    const count = mottos.length
    if (count <= 20) return 8
    if (count <= 50) return 18
    if (count <= 100) return 30
    return 40
}

function isExternal(url?: string) {
    if (!url) return false
    return /^https?:\/\//.test(url)
}

function isInternal(url?: string) {
    return Boolean(url && !isExternal(url))
}

function getComponent(item: Danmaku) {
    if (!item.url) return 'div'
    if (isExternal(item.url)) return 'a'
    return 'router-link'
}

/** 测量容器尺寸（弹幕需要按尺寸分配轨道与起点） */
function measure() {
    if (wallRef.value) {
        wallHeight.value = wallRef.value.clientHeight || 320
        wallWidth.value = wallRef.value.clientWidth || 0
    }
}

function createDanmaku(item: Motto, index: number, initial = false): Danmaku {
    const rowCount = Math.min(maxShow.value, 10)

    // 可用高度 = 容器高 - 上下内边距；轨道数按此均分
    const usableH = Math.max(28, wallHeight.value - PAD_Y * 2)
    const laneH = Math.max(28, usableH / rowCount)

    // 纵向：贴住安全边距后再在轨道内做小幅抖动，避免压边
    const jitter = Math.max(0, (laneH - 40) * 0.3)
    const top =
        PAD_Y +
        (index % rowCount) * laneH +
        (jitter > 0 ? random(0, jitter) : 0)

    // 横向：初始位置在容器内（留出安全边距），新增弹幕从右侧外更远处进入
    const start = initial
        ? PAD_X + random(0, Math.max(1, (wallWidth.value || window.innerWidth) - PAD_X * 2))
        : (wallWidth.value || window.innerWidth) + PAD_X

    return {
        id: Date.now() + Math.random(),
        icon: item.icon,
        text: item.text,
        url: item.url,
        top,
        start,
        duration: random(12, 25),
        delay: random(0, 1)
    }
}

function init() {
    maxShow.value = calcShowCount()
    const data = [...mottos].sort(() => Math.random() - 0.5)

    list.value = data
        .slice(0, maxShow.value)
        .map((item, index) => createDanmaku(item, index, true))
}

function addDanmaku() {
    if (list.value.length >= maxShow.value) return
    const item = mottos[random(0, mottos.length)]
    if (!item) return
    list.value.push(createDanmaku(item, list.value.length))
}

let ro: ResizeObserver | null = null

onMounted(async () => {
    await nextTick()
    measure()
    init()

    // 尺寸随窗口 / 布局变化时重新测量
    ro = new ResizeObserver(() => {
        if (!wallRef.value) return
        const nextH = wallRef.value.clientHeight || 0
        const nextW = wallRef.value.clientWidth || 0
        if (nextH && nextH !== wallHeight.value) wallHeight.value = nextH
        if (nextW && nextW !== wallWidth.value) wallWidth.value = nextW
    })
    if (wallRef.value) ro.observe(wallRef.value)

    timer = window.setInterval(() => {
        addDanmaku()
    }, 4000)
})

onUnmounted(() => {
    clearInterval(timer)
    ro?.disconnect()
})
</script>

<style scoped lang="scss">
.danmaku-wall {
    position: relative;
    width: 100%;
    /* 关键：撑满外层高度，与个人信息卡等高 */
    height: 100%;
    min-height: 280px;
    overflow: hidden;
    border-radius: 20px;
    background: var(--danmaku-wall-bg-in);
    /* 内边距交给轨道计算控制，这里不再用 padding，避免与外层重复留白 */
}

/* 全局暂停 */
.danmaku-wall.paused {
    .danmaku {
        animation-play-state: paused;
    }
}

.danmaku {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    color: white;
    white-space: nowrap;
    text-decoration: none;
    font-size: 14px;
    /* top/left 由内联样式给出，均已在安全边距之内 */
    animation: move linear infinite;
    will-change: transform;
    transition:
        background 0.3s ease,
        box-shadow 0.3s ease;

    &:hover {
        color: var(--text-hover-color);
        background: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 25px rgba(255, 255, 255, 0.3);
    }
}

.clickable {
    cursor: pointer;
}

.icon {
    font-size: 22px;
}

.text {
    font-weight: 600;
}

@keyframes move {
    from {
        transform: translateX(0);
    }

    to {
        /* 用自身百分比 + 容器宽度，保证从可视区完整滑出且距离可控 */
        transform: translateX(calc(-100% - 100vw));
    }
}

/* 弹幕进入动画 */
.danmaku-in-enter-active {
    transition: opacity 1.2s ease;
}

.danmaku-in-enter-from {
    opacity: 0;
}

.danmaku-in-enter-to {
    opacity: 1;
}

.danmaku-in-leave-active {
    transition: opacity 0.5s ease;
}

.danmaku-in-leave-from {
    opacity: 1;
}

.danmaku-in-leave-to {
    opacity: 0;
}
</style>