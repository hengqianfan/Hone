<template>
    <div ref="overlayRef" class="page-overlay">
        <!-- 砖纹层 -->
        <div class="brick-wall"></div>

        <!-- 砖纹渐隐层 -->
        <div class="brick-veil"></div>

        <!-- 锯齿层 -->
        <div class="zigzag-edge"></div>

        <div class="overlay-inner">
            <span class="loading-text">Loading…</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const overlayRef = ref<HTMLElement>()

/** 遮罩盖住全屏 */
const cover = () => {
    // @ts-ignore
    return gsap.to(overlayRef.value, {
        yPercent: 0,
        duration: 0.7,
        ease: 'power3.inOut'
    })
}

/** 遮罩移出屏幕 */
const reveal = () => {
    // @ts-ignore
    return gsap.to(overlayRef.value, {
        yPercent: 100,
        duration: 0.7,
        ease: 'power3.inOut'
    })
}

onMounted(() => {
    // @ts-ignore

    gsap.set(overlayRef.value, {
        yPercent: -100
    })
})

defineExpose({
    cover,
    reveal
})
</script>

<style scoped>
/* ==================================================
   样式变量（默认白色主题，数值写死）
   需要换主题时只改这里即可
================================================== */
:root,
.page-overlay {
    /* ---------- 基础 ---------- */
    --loading-bg: #ffffff;
    --loading-text-color: #111111;

    /* ---------- 锯齿尺寸 ---------- */
    --zig-h: 22px;
    --zig-w: 46px;

    /* ---------- 砖纹尺寸 ---------- */
    --brick-size-x: 150px;
    --brick-size-y: 58px;

    /* ---------- 砖缝线宽 ---------- */
    --brick-line-h: 2px;
    --brick-line-v: 2px;
    --brick-line-thin: 1px;

    /* ---------- 砖缝颜色 / 透明度 ---------- */
    --brick-line-h-color: rgba(0, 0, 0, 0.16);
    --brick-line-v-color: rgba(0, 0, 0, 0.13);
    --brick-line-thin-color: rgba(0, 0, 0, 0.08);
    --brick-stagger-color: rgba(0, 0, 0, 0.14);

    /* ---------- 砖面渐变 ---------- */
    --brick-face-a: rgba(0, 0, 0, 0.025);
    --brick-face-b: rgba(0, 0, 0, 0.012);

    /* ---------- 砖墙整体 ---------- */
    --brick-rotate: -0.8deg;
    --brick-scale: 1.08;
    --brick-inset: -5%;
    --brick-opacity: 0.95;
    --brick-contrast: 1.15;
    --brick-brightness: 1;
    --brick-stagger-opacity: 0.9;
    --brick-thin-opacity: 0.75;

    /* ---------- 遮罩（砖纹明暗） ---------- */
    --veil-radial-inner: transparent;
    --veil-radial-mid: rgba(0, 0, 0, 0.08);
    --veil-radial-outer: rgba(0, 0, 0, 0.35);
    --veil-linear-top: rgba(0, 0, 0, 0.3);
    --veil-linear-bottom: rgba(0, 0, 0, 0.32);

    /* ---------- 锯齿颜色 ---------- */
    --edge-1: #f2f2f2;
    --edge-2: #e6e6e6;
    --hairline: rgba(0, 0, 0, 0.25);
    --hairline-opacity: 0.45;
    --zig-shadow: 0 -6px 14px rgba(0, 0, 0, 0.12);

    /* ---------- Loading 文本 ---------- */
    --loading-letter-spacing: 0.32em;
    --loading-font-size: 1.5rem;
    --loading-font-weight: 300;
    --loading-shadow-1: 0 1px 0 rgba(0, 0, 0, 0.06);
    --loading-shadow-2: 0 2px 12px rgba(0, 0, 0, 0.18);
    --loading-animation-duration: 3s;
    --loading-opacity-min: 0.72;
    --loading-opacity-max: 1;
}

/* ==================================================
   容器
================================================== */

.page-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;

    background: var(--loading-bg);

    display: flex;
    align-items: center;
    justify-content: center;

    pointer-events: none;
    overflow: hidden;
}

/* ==================================================
   不规则砖墙
================================================== */

.brick-wall {
    position: absolute;
    inset: var(--brick-inset);

    pointer-events: none;

    background-color: var(--loading-bg);

    /*
     * 第一层：
     * 横向砖缝
     */
    background-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent calc(var(--brick-size-y) - var(--brick-line-h)),
            var(--brick-line-h-color) calc(var(--brick-size-y) - var(--brick-line-h)),
            var(--brick-line-h-color) var(--brick-size-y)),

        /*
         * 第二层：
         * 纵向砖缝
         */
        repeating-linear-gradient(90deg,
            transparent 0,
            transparent calc(var(--brick-size-x) - var(--brick-line-v)),
            var(--brick-line-v-color) calc(var(--brick-size-x) - var(--brick-line-v)),
            var(--brick-line-v-color) var(--brick-size-x)),

        /*
         * 第三层：
         * 砖面微弱渐变
         */
        linear-gradient(135deg,
            var(--brick-face-a),
            transparent 35%,
            var(--brick-face-b) 70%,
            transparent);

    /*
     * 砖墙整体稍微倾斜，
     * 避免太像 CSS 网格
     */
    transform: rotate(var(--brick-rotate)) scale(var(--brick-scale));

    /*
     * 砖纹稍微明显一点
     */
    opacity: var(--brick-opacity);

    /*
     * 让砖缝产生柔和阴影
     */
    filter:
        contrast(var(--brick-contrast)) brightness(var(--brick-brightness));
}

/* ==================================================
   不规则砖缝
================================================== */

/*
 * 使用伪元素制造第二套错缝。
 *
 * 奇数行向右移动半块砖，
 * 形成传统砖墙的交错结构。
 */
.brick-wall::before {
    content: '';

    position: absolute;
    inset: 0;

    background-image:
        repeating-linear-gradient(90deg,
            transparent 0,
            transparent 73px,
            var(--brick-stagger-color) 73px,
            var(--brick-stagger-color) 75px,
            transparent 75px,
            transparent var(--brick-size-x));

    background-size:
        var(--brick-size-x) var(--brick-size-y);

    background-position:
        0 0;

    /*
     * 只显示在部分砖层
     */
    -webkit-mask-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent var(--brick-size-y),
            #000 var(--brick-size-y),
            #000 calc(var(--brick-size-y) * 2));

    mask-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent var(--brick-size-y),
            #000 var(--brick-size-y),
            #000 calc(var(--brick-size-y) * 2));

    opacity: var(--brick-stagger-opacity);
}

/*
 * 再叠一层非常细的砖缝，
 * 让白底上的深色纹理更加明显。
 */
.brick-wall::after {
    content: '';

    position: absolute;
    inset: 0;

    background-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent calc(var(--brick-size-y) - var(--brick-line-thin)),
            var(--brick-line-thin-color) calc(var(--brick-size-y) - var(--brick-line-thin)),
            var(--brick-line-thin-color) var(--brick-size-y));

    opacity: var(--brick-thin-opacity);
}

/* ==================================================
   砖纹明暗
================================================== */

.brick-veil {
    position: absolute;
    inset: 0;

    pointer-events: none;

    /*
     * 中间亮一些，
     * 四周压暗
     */
    background:
        radial-gradient(90% 75% at 50% 50%,
            var(--veil-radial-inner) 25%,
            var(--veil-radial-mid) 60%,
            var(--veil-radial-outer) 100%),

        /*
         * 上下渐隐
         */
        linear-gradient(180deg,
            var(--veil-linear-top) 0%,
            transparent 30%,
            transparent 70%,
            var(--veil-linear-bottom) 100%);
}

/* ==================================================
   锯齿顶边
================================================== */

.zigzag-edge {
    position: absolute;

    left: 0;
    bottom: 100%;

    width: 100%;
    height: var(--zig-h);

    background:
        linear-gradient(90deg,
            var(--edge-1),
            var(--edge-2) 50%,
            var(--edge-1));

    /*
     * 三角锯齿
     */
    -webkit-mask:
        linear-gradient(-45deg,
            #000 50%,
            transparent 0) 0 0 / var(--zig-w) 100% repeat-x,

        linear-gradient(45deg,
            #000 50%,
            transparent 0) calc(var(--zig-w) / 2) 0 / var(--zig-w) 100% repeat-x;

    mask:
        linear-gradient(-45deg,
            #000 50%,
            transparent 0) 0 0 / var(--zig-w) 100% repeat-x,

        linear-gradient(45deg,
            #000 50%,
            transparent 0) calc(var(--zig-w) / 2) 0 / var(--zig-w) 100% repeat-x;

    filter:
        drop-shadow(var(--zig-shadow));
}

/* 锯齿边缘细线 */
.zigzag-edge::after {
    content: '';

    position: absolute;
    inset: 0;

    background: var(--hairline);

    -webkit-mask:
        linear-gradient(-45deg,
            #000 50%,
            transparent 0) 0 0 / var(--zig-w) 100% repeat-x,

        linear-gradient(45deg,
            #000 50%,
            transparent 0) calc(var(--zig-w) / 2) 0 / var(--zig-w) 100% repeat-x;

    mask:
        linear-gradient(-45deg,
            #000 50%,
            transparent 0) 0 0 / var(--zig-w) 100% repeat-x,

        linear-gradient(45deg,
            #000 50%,
            transparent 0) calc(var(--zig-w) / 2) 0 / var(--zig-w) 100% repeat-x;

    opacity: var(--hairline-opacity);
}

/* ==================================================
   Loading
================================================== */

.overlay-inner {
    position: relative;
    z-index: 1;
}

.loading-text {
    color: var(--loading-text-color);

    letter-spacing: var(--loading-letter-spacing);
    text-transform: uppercase;

    font-size: var(--loading-font-size);
    font-weight: var(--loading-font-weight);

    text-shadow:
        var(--loading-shadow-1),
        var(--loading-shadow-2);

    animation: subtle var(--loading-animation-duration) ease-in-out infinite;
}

@keyframes subtle {

    0%,
    100% {
        opacity: var(--loading-opacity-min);
    }

    50% {
        opacity: var(--loading-opacity-max);
    }
}

/* ==================================================
   减少动画
================================================== */

@media (prefers-reduced-motion: reduce) {
    .loading-text {
        animation: none;
    }
}
</style>