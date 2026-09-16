<!-- components/VCountdownCarousel.vue -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Countdown } from '@/types/countdown'
import { getRemain, parseDate, pickUpcoming, type Remain } from '@/utils/countdown'

const props = withDefaults(
    defineProps<{
        /** 全部倒计时数据 */
        list: Countdown[]
        /** 最多展示几个 */
        limit?: number
        /** 轮播间隔（毫秒） */
        interval?: number
        /** 是否自动轮播 */
        autoplay?: boolean
    }>(),
    { limit: 3, interval: 4000, autoplay: true }
)

const items = computed(() => pickUpcoming(props.list, props.limit))
const index = ref(0)
const current = computed(() => items.value[index.value])

/* ---------- 倒计时计算 ---------- */
const now = ref(Date.now())
let tickTimer: ReturnType<typeof setInterval> | null = null

const remain = computed<Remain>(() =>
    current.value ? getRemain(current.value.date, now.value) : getRemain(0, 0)
)

/* ---------- 轮播控制 ---------- */
let carouselTimer: ReturnType<typeof setInterval> | null = null

function start() {
    stop()
    if (props.autoplay && items.value.length > 1) {
        carouselTimer = setInterval(next, props.interval)
    }
}
function stop() {
    if (carouselTimer) clearInterval(carouselTimer)
    carouselTimer = null
}
function next() {
    if (!items.value.length) return
    index.value = (index.value + 1) % items.value.length
}
function prev() {
    if (!items.value.length) return
    index.value = (index.value - 1 + items.value.length) % items.value.length
}
function go(i: number) {
    index.value = i
    start()
}

onMounted(() => {
    tickTimer = setInterval(() => (now.value = Date.now()), 1000)
    start()
})
onBeforeUnmount(() => {
    if (tickTimer) clearInterval(tickTimer)
    stop()
})

// 数据变化时重置索引，避免越界
watch(items, val => {
    if (index.value >= val.length) index.value = 0
    start()
})
watch(() => [props.autoplay, props.interval], start)
</script>

<template>
    <div class="cd-carousel" @mouseenter="stop" @mouseleave="start">
        <!-- 深色主题下的柔光背景 -->
        <div class="cd-glow" aria-hidden="true" />

        <template v-if="current">
            <!-- 轮播主体 -->
            <Transition name="cd-fade" mode="out-in">
                <div :key="current.date + current.name" class="cd-slide">
                    <h3 class="cd-name">{{ current.name }}</h3>
                    <p class="cd-desc" v-if="current.desc">{{ current.desc }}</p>

                    <div class="cd-timer" v-if="!remain.reached">
                        <div class="cd-unit">
                            <span class="cd-num">{{ String(remain.days).padStart(2, '0') }}</span>
                            <span class="cd-label">天</span>
                        </div>
                        <span class="cd-colon">:</span>
                        <div class="cd-unit">
                            <span class="cd-num">{{ String(remain.hours).padStart(2, '0') }}</span>
                            <span class="cd-label">时</span>
                        </div>
                        <span class="cd-colon">:</span>
                        <div class="cd-unit">
                            <span class="cd-num">{{ String(remain.minutes).padStart(2, '0') }}</span>
                            <span class="cd-label">分</span>
                        </div>
                        <span class="cd-colon">:</span>
                        <div class="cd-unit">
                            <span class="cd-num">{{ String(remain.seconds).padStart(2, '0') }}</span>
                            <span class="cd-label">秒</span>
                        </div>
                    </div>
                    <div class="cd-reached" v-else>今天就是这一天 🎉</div>

                    <div class="cd-date">{{ parseDate(current.date).toLocaleDateString() }}</div>
                </div>
            </Transition>

            <!-- 指示器 -->
            <div class="cd-dots" v-if="items.length > 1">
                <button v-for="(item, i) in items" :key="item.name + item.date" class="cd-dot"
                    :class="{ active: i === index }" :aria-label="`切换到 ${item.name}`" @click="go(i)" />
            </div>

            <!-- 左右箭头 -->
            <template v-if="items.length > 1">
                <button class="cd-arrow cd-arrow--prev" aria-label="上一个" @click="(prev(), start())">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <button class="cd-arrow cd-arrow--next" aria-label="下一个" @click="(next(), start())">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </template>
        </template>

        <div class="cd-empty" v-else>暂无即将到来的倒计时</div>
    </div>
</template>

<style scoped>
/* ---------- 主题变量（固定黑色主题） ---------- */
.cd-carousel {
    --cd-bg: #16171c;
    --cd-bg-2: #1f2027;
    --cd-border: rgba(255, 255, 255, 0.08);
    --cd-fg: #f2f3f7;
    --cd-sub: #8b8f9c;
    --cd-accent: #7c93ff;
    --cd-accent-soft: rgba(124, 147, 255, 0.14);
    --cd-surface: rgba(255, 255, 255, 0.06);
    --cd-surface-hover: rgba(255, 255, 255, 0.12);

    position: relative;
    overflow: hidden;
    padding: 32px 56px;
    border: 1px solid var(--cd-border);
    border-radius: 20px;
    background: radial-gradient(120% 140% at 50% 0%, var(--cd-bg-2) 0%, var(--cd-bg) 60%);
    color: var(--cd-fg);
    box-shadow:
        0 18px 40px -12px rgba(0, 0, 0, 0.7),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    user-select: none;
    isolation: isolate;
}

/* 顶部柔光，避免大面积纯黑显得死板 */
.cd-glow {
    position: absolute;
    top: -60%;
    left: 50%;
    width: 70%;
    aspect-ratio: 1;
    transform: translateX(-50%);
    background: radial-gradient(circle, var(--cd-accent-soft) 0%, transparent 65%);
    pointer-events: none;
    z-index: -1;
}

.cd-slide {
    position: relative;
    text-align: center;
    animation: cd-in 0.35s ease;
}

.cd-name {
    margin: 0 0 14px;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--cd-fg);
}

/* 原 remark 徽标样式，现由 desc 使用 */
.cd-desc {
    display: inline-block;
    margin: 0 0 20px;
    padding: 4px 14px;
    font-size: 13px;
    letter-spacing: 0.5px;
    color: var(--cd-accent);
    background: var(--cd-accent-soft);
    border: 1px solid rgba(124, 147, 255, 0.22);
    border-radius: 999px;
}

.cd-timer {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
}

.cd-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 56px;
    padding: 8px 4px;
    border: 1px solid var(--cd-border);
    border-radius: 12px;
    background: var(--cd-surface);
}

.cd-num {
    font-size: 28px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    color: var(--cd-accent);
    text-shadow: 0 0 18px rgba(124, 147, 255, 0.35);
}

.cd-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--cd-sub);
}

.cd-colon {
    padding-bottom: 26px;
    font-size: 22px;
    color: var(--cd-sub);
}

.cd-reached {
    font-size: 18px;
    font-weight: 500;
    color: var(--cd-accent);
    text-shadow: 0 0 18px rgba(124, 147, 255, 0.35);
}

.cd-date {
    margin-top: 18px;
    font-size: 12px;
    color: var(--cd-sub);
    letter-spacing: 1px;
}

/* 指示器 */
.cd-dots {
    position: relative;
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.cd-dot {
    width: 6px;
    height: 6px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
    cursor: pointer;
    transition: width 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.cd-dot:hover {
    background: rgba(255, 255, 255, 0.32);
}

.cd-dot.active {
    width: 20px;
    border-radius: 999px;
    background: var(--cd-accent);
    box-shadow: 0 0 12px rgba(124, 147, 255, 0.55);
}

/* 箭头 */
.cd-arrow {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    transform: translateY(-50%);
    border: 1px solid var(--cd-border);
    border-radius: 50%;
    background: var(--cd-surface);
    color: var(--cd-fg);
    cursor: pointer;
    opacity: 0;
    backdrop-filter: blur(6px);
    transition: opacity 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.cd-carousel:hover .cd-arrow,
.cd-arrow:focus-visible {
    opacity: 1;
}

.cd-arrow:hover {
    background: var(--cd-surface-hover);
    border-color: rgba(124, 147, 255, 0.4);
}

.cd-arrow--prev {
    left: 12px;
}

.cd-arrow--next {
    right: 12px;
}

.cd-empty {
    padding: 12px 0;
    text-align: center;
    font-size: 14px;
    color: var(--cd-sub);
}

/* 过渡 */
.cd-fade-enter-active,
.cd-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.cd-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}

.cd-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@keyframes cd-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 键盘可达性：聚焦时给出可见轮廓 */
.cd-dot:focus-visible,
.cd-arrow:focus-visible {
    outline: 2px solid var(--cd-accent);
    outline-offset: 2px;
}
</style>