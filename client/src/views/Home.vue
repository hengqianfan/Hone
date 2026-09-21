<template>
    <div class="home-all">
        <div class="content">
            <!-- ============ 第一行：个人信息 + 弹幕墙 ============ -->
            <section class="hero">
                <!-- 个人信息（独立组件） -->
                <ProfileCard class="info" />

                <!-- 弹幕墙 -->
                <div class="showcase ">
                    <FloatWall />
                </div>
            </section>

            <!-- ============ 第二行：倒计时（单列铺满整行） ============ -->
            <section class="update ">
                <div class="update__countdown">
                    <Countdown :list="countdowns" :limit="10" :interval="4000" />
                </div>
            </section>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { countdowns } from '@/config/countdowns'
import Countdown from '@/components/countdown/index.vue'
import FloatWall from '@/components/FloatWall/index.vue'
import ProfileCard from '@/components/ProfileCard/index.vue'
</script>

<style lang="scss" scoped>
/* =========================================================
   设计令牌
   ========================================================= */
$hero-ratio: 1.5; // 右列 : 左列 = 1.5 : 1
$info-max: 420px; // 左列上限
$info-max-md: 340px; // 中等屏左列上限
$gap: 16px;
$gap-sm: 12px;
$radius-lg: 20px;
$panel-pad: 15px;

/* 统一两行列宽模板（由变量派生，保证永远一致） */
$col-left: minmax(0, $info-max);
$col-right: minmax(0, $info-max * $hero-ratio);

/* .content 的最大宽度 = 两列 + gap，让两行都被同一宽度约束 */
$content-max: $info-max + $info-max * $hero-ratio + $gap; // 1066px


$bp-md: 1200px;
$bp-sm: 992px;
$bp-xs: 768px;

/* =========================================================
   页面容器
   ========================================================= */
.home-all {
    width: 100%;
    min-height: 50vh;
    box-sizing: border-box;
    padding: 10px;
    display: grid;
    place-content: safe center;
}

.content {
    width: 100%;
    /* 关键：和第一行的两列之和保持一致，两行宽度严格对齐 */
    max-width: $content-max;
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: $gap;
    min-width: 0;
}

/* =========================================================
   第一行：个人信息 + 弹幕墙（两列）
   ========================================================= */
.hero {
    display: grid;
    grid-template-columns: $col-left $col-right;
    gap: $gap;
    min-width: 0;
    align-items: stretch;
    /* 两列等高 */
}

/* 个人信息卡外列：高度由行高决定，组件内部 100% 填充 */
.info {
    min-width: 0;
    height: 100%;
}

/* ---------- 弹幕墙 ---------- */
.showcase {
    box-sizing: border-box;
    padding: $panel-pad;
    min-width: 0;
    height: 100%;
    /* 撑满 hero 行高 */
    background-color: var(--danmaku-wall-bg);
    border-radius: 20px;

    >* {
        width: 100%;
        height: 100%;
        /* 让 FloatWall 撑满内层 */
    }
}

/* =========================================================
   第二行：倒计时（单列铺满整行）
   ========================================================= */
.update {
    box-sizing: border-box;
    padding: $panel-pad;
    min-width: 0;

    background-color: var(--cd-bg);
    border-radius: 20px;

    &__countdown {
        min-width: 0;
        width: 100%;
        display: flex;
        justify-content: center;

        /* 让 Countdown 组件横向撑满 */
        >* {
            width: 100%;
        }
    }
}

/* =========================================================
   响应式
   ========================================================= */
/* 中等屏：整体按比例缩小（第一行两列同步收敛） */
@media (max-width: $bp-md) {
    .content {
        max-width: $info-max-md + $info-max-md * $hero-ratio + $gap;
    }

    .hero {
        grid-template-columns:
            minmax(0, $info-max-md) minmax(0, $info-max-md * $hero-ratio);
    }
}

/* 平板：第一行纵向堆叠，左右两列各自占满整行 */
@media (max-width: $bp-sm) {
    .hero {
        grid-template-columns: minmax(0, 1fr);
    }

    .info,
    .showcase {
        width: 100%;
        height: auto;
    }

    .showcase {
        min-height: 320px;
        /* 堆叠时给弹幕墙一个确定高度 */
    }
}

/* 手机 */
@media (max-width: $bp-xs) {
    .home-all {
        padding: $gap-sm;
    }

    .content,
    .hero {
        gap: $gap-sm;
    }

    .showcase {
        padding: 10px;
        min-height: 280px;
    }
}
</style>