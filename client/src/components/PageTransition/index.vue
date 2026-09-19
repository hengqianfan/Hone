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
.page-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;

    background: #000;

    display: flex;
    align-items: center;
    justify-content: center;

    pointer-events: none;
    overflow: hidden;

    /* =========================
       锯齿
    ========================= */
    --zig-h: 22px;
    --zig-w: 46px;

    /* =========================
       砖纹
    ========================= */
    --brick-size-x: 150px;
    --brick-size-y: 58px;

    /* =========================
       锯齿颜色
    ========================= */
    --edge-1: #111;
    --edge-2: #050505;

    --hairline: rgba(255, 255, 255, 0.25);
}

/* ==================================================
   不规则砖墙
================================================== */

.brick-wall {
    position: absolute;
    inset: -5%;

    pointer-events: none;

    background-color: #000;

    /*
     * 第一层：
     * 横向砖缝
     */
    background-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent 56px,
            rgba(255, 255, 255, 0.16) 56px,
            rgba(255, 255, 255, 0.16) 58px),

        /*
         * 第二层：
         * 纵向砖缝
         */
        repeating-linear-gradient(90deg,
            transparent 0,
            transparent 148px,
            rgba(255, 255, 255, 0.13) 148px,
            rgba(255, 255, 255, 0.13) 150px),

        /*
         * 第三层：
         * 砖面微弱渐变
         */
        linear-gradient(135deg,
            rgba(255, 255, 255, 0.025),
            transparent 35%,
            rgba(255, 255, 255, 0.012) 70%,
            transparent);

    /*
     * 砖墙整体稍微倾斜，
     * 避免太像 CSS 网格
     */
    transform: rotate(-0.8deg) scale(1.08);

    /*
     * 砖纹稍微明显一点
     */
    opacity: 0.95;

    /*
     * 让砖缝产生柔和阴影
     */
    filter:
        contrast(1.15) brightness(0.9);
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
            rgba(255, 255, 255, 0.14) 73px,
            rgba(255, 255, 255, 0.14) 75px,
            transparent 75px,
            transparent 150px);

    background-size:
        150px 58px;

    background-position:
        0 0;

    /*
     * 只显示在部分砖层
     */
    -webkit-mask-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent 58px,
            #000 58px,
            #000 116px);

    mask-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent 58px,
            #000 58px,
            #000 116px);

    opacity: 0.9;
}

/*
 * 再叠一层非常细的白色砖缝，
 * 让黑底上的白色纹理更加明显。
 */
.brick-wall::after {
    content: '';

    position: absolute;
    inset: 0;

    background-image:
        repeating-linear-gradient(0deg,
            transparent 0,
            transparent 57px,
            rgba(255, 255, 255, 0.08) 57px,
            rgba(255, 255, 255, 0.08) 58px);

    opacity: 0.75;
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
            transparent 25%,
            rgba(0, 0, 0, 0.2) 60%,
            rgba(0, 0, 0, 0.78) 100%),

        /*
         * 上下渐隐
         */
        linear-gradient(180deg,
            rgba(0, 0, 0, 0.72) 0%,
            transparent 30%,
            transparent 70%,
            rgba(0, 0, 0, 0.75) 100%);
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
        drop-shadow(0 -6px 14px rgba(0, 0, 0, 0.8));
}

/* 锯齿边缘白色细线 */
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

    opacity: 0.45;
}

/* ==================================================
   Loading
================================================== */

.overlay-inner {
    position: relative;
    z-index: 1;
}

.loading-text {
    color: #fff;

    letter-spacing: 0.32em;
    text-transform: uppercase;

    font-size: 1.5rem;
    font-weight: 300;

    text-shadow:
        0 1px 0 rgba(255, 255, 255, 0.08),
        0 2px 12px rgba(0, 0, 0, 0.9);

    animation: subtle 3s ease-in-out infinite;
}

@keyframes subtle {

    0%,
    100% {
        opacity: 0.72;
    }

    50% {
        opacity: 1;
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