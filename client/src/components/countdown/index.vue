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

watch(items, val => {
    if (index.value >= val.length) index.value = 0
    start()
})
watch(() => [props.autoplay, props.interval], start)
</script>

<template>
    <div class="cd-carousel" @mouseenter="stop" @mouseleave="start">
        <template v-if="current">
            <Transition name="cd-fade" mode="out-in">
                <div :key="current.date + current.name" class="cd-slide">
                    <!-- 标题区：名称与日期上下两行，整体居中 -->
                    <div class="cd-head">
                        <h3 class="cd-name" :title="current.name">{{ current.name }}</h3>
                        <span class="cd-date">{{ parseDate(current.date).toLocaleDateString() }}</span>
                    </div>

                    <p v-if="current.desc" class="cd-desc">{{ current.desc }}</p>

                    <!-- 时间：单行紧凑排布 -->
                    <div v-if="!remain.reached" class="cd-timer">
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
                    <div v-else class="cd-reached">今天就是这一天 🎉</div>

                    <!-- 指示器：有多个才显示 -->
                    <div v-if="items.length > 1" class="cd-dots">
                        <button v-for="(item, i) in items" :key="item.name + item.date" class="cd-dot"
                            :class="{ active: i === index }" :aria-label="`切换到 ${item.name}`" @click="go(i)" />
                    </div>
                </div>
            </Transition>

            <!-- 左右箭头：缩小尺寸，常显低透明度 -->
            <template v-if="items.length > 1">
                <button class="cd-arrow cd-arrow--prev" aria-label="上一个" @click="(prev(), start())">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>
                <button class="cd-arrow cd-arrow--next" aria-label="下一个" @click="(next(), start())">
                    <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
            </template>
        </template>

        <div v-else class="cd-empty">暂无即将到来的倒计时</div>
    </div>
</template>

<style scoped>
/* =========================================================
   紧凑版：整体高度与字号收敛，适配更小的面板
   ========================================================= */
.cd-carousel {
    --cd-fg: #5b73d1;
    --cd-sub: #8b8f9c;
    --cd-accent: #7c93ff;
    --cd-accent-soft: rgba(124, 147, 255, 0.16);
    --cd-border: rgba(255, 255, 255, 0.08);
    --cd-border-strong: rgba(255, 255, 255, 0.14);
    --cd-surface: rgba(255, 255, 255, 0.05);
    --cd-surface-hover: rgba(255, 255, 255, 0.1);

    /* 内边距令牌：由 18/16 收紧到 12/10 */
    --panel-pad-x: 12px;
    --panel-pad-y: 16px;

    position: relative;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: var(--panel-pad-y) var(--panel-pad-x);
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: var(--cd-fg);
    font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    user-select: none;
    border-radius: 14px;
    background-color: var(--cd-bg-in);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.cd-slide {
    position: relative;
    text-align: center;
    animation: cd-in 0.35s ease;
}

/* 标题区：名称在上、日期在下，二者水平居中 */
.cd-head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    margin-bottom: 6px;
}

.cd-name {
    max-width: 100%;
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.2px;
    line-height: 1.3;
    text-align: center;
    color: var(--cd-fg);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cd-date {
    font-size: 10px;
    line-height: 1.2;
    letter-spacing: 0.5px;
    margin: 5px auto;
    text-align: center;
    color: var(--cd-sub);
    font-variant-numeric: tabular-nums;
}

/* 描述徽章：缩小并只在有内容时占位 */
.cd-desc {
    display: inline-block;
    margin: 0 0 8px;
    padding: 2px 8px;
    font-size: 11px;
    line-height: 1.5;
    letter-spacing: 0.2px;
    color: var(--cd-accent);
    background: var(--cd-accent-soft);
    border: 1px solid rgba(124, 147, 255, 0.28);
    border-radius: 999px;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

.cd-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
}

.cd-unit {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 2px;
    min-width: 46px;
    padding: 4px 6px;
    border: 1px solid var(--cd-border);
    border-radius: 8px;
    background: var(--cd-surface);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transition: border-color 0.3s ease, background 0.3s ease;
}

.cd-unit:hover {
    border-color: var(--cd-border-strong);
    background: var(--cd-surface-hover);
}

.cd-num {
    font-size: 18px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--cd-accent);
    text-shadow: 0 0 12px rgba(124, 147, 255, 0.35);
}

.cd-label {
    font-size: 10px;
    line-height: 1;
    color: var(--cd-sub);
}

.cd-colon {
    font-size: 14px;
    line-height: 1;
    color: var(--cd-sub);
    transform: translateY(-1px);
}

.cd-reached {
    font-size: 14px;
    font-weight: 500;
    color: var(--cd-accent);
    text-shadow: 0 0 12px rgba(124, 147, 255, 0.35);
}

/* ---------- 指示器：更小更贴底 ---------- */
.cd-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
}

.cd-dot {
    width: 5px;
    height: 5px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.22);
    cursor: pointer;
    transition: width 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.cd-dot:hover {
    background: rgba(255, 255, 255, 0.38);
}

.cd-dot.active {
    width: 14px;
    border-radius: 999px;
    background: var(--cd-accent);
    box-shadow: 0 0 10px rgba(124, 147, 255, 0.6);
}

/* ---------- 箭头：缩小 + 常显低透明 ---------- */
.cd-arrow {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    transform: translateY(-50%);
    border: 1px solid var(--cd-border-strong);
    border-radius: 50%;
    background: var(--cd-surface);
    color: var(--cd-fg);
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.3s ease, background 0.3s ease, border-color 0.3s ease;
}

.cd-carousel:hover .cd-arrow,
.cd-arrow:focus-visible {
    opacity: 1;
}

.cd-arrow:hover {
    background: var(--cd-surface-hover);
    border-color: rgba(124, 147, 255, 0.5);
}

.cd-arrow--prev {
    left: 2px;
}

.cd-arrow--next {
    right: 2px;
}

.cd-empty {
    padding: 8px 0;
    text-align: center;
    font-size: 12px;
    color: var(--cd-sub);
}

/* ---------- 过渡 ---------- */
.cd-fade-enter-active,
.cd-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.cd-fade-enter-from {
    opacity: 0;
    transform: translateY(6px);
}

.cd-fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}

@keyframes cd-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.cd-dot:focus-visible,
.cd-arrow:focus-visible {
    outline: 2px solid var(--cd-accent);
    outline-offset: 2px;
}

/* ---------- 响应式：窄屏可进一步压扁 ---------- */
@media (max-width: 992px) {
    .cd-carousel {
        --panel-pad-x: 10px;
        --panel-pad-y: 8px;
    }
}

@media (max-width: 768px) {

    /* 小屏时主动隐藏左右箭头，避免挤压时间单元 */
    .cd-arrow {
        display: none;
    }

    .cd-unit {
        min-width: 40px;
        padding: 3px 4px;
    }

    .cd-num {
        font-size: 16px;
    }

    .cd-label {
        font-size: 9px;
    }
}

/* ---------- 尊重「减少动态效果」 ---------- */
@media (prefers-reduced-motion: reduce) {

    .cd-slide,
    .cd-fade-enter-active,
    .cd-fade-leave-active {
        animation: none;
        transition: none;
    }
}
</style>