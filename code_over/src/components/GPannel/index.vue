<template>
    <Teleport to="body">
        <div class="gp-all">
            <!-- 遮罩 -->
            <transition name="gp-fade">
                <div v-if="isOpenPannel" class="gp-mask" @click="close" />
            </transition>

            <!-- 面板 -->
            <transition name="gp-panel">
                <div v-if="isOpenPannel" class="gp-main" @click.stop>
                    <!-- 头部：头像 + 站点介绍 -->
                    <div class="gp-header">
                        <img class="gp-avatar" src="/favicon.ico" alt="logo" @click="Backhome()" />
                        <div class="gp-site">
                            <h3 class="gp-site-name">界·衡千帆</h3>
                            <p class="gp-site-desc">先完成，然后完美</p>
                        </div>
                    </div>

                    <!-- 个人介绍 -->
                    <div class="gp-profile">
                        <p class="gp-profile-text">
                            Hi ！欢迎访问「 界·衡千帆 」<br />
                            这里是 衡千帆 的独立博客网站，<br />
                        </p>
                    </div>

                    <Countdown :list="countdowns" :limit="10" :interval="4000" />

                    <!-- 社交链接 -->
                    <ul class="gp-socials">
                        <li v-for="(item, index) in socials" :key="item.name" class="gp-social-item"
                            :style="{ '--i': index }">
                            <a class="gp-social" :href="item.url" target="_blank" rel="noopener noreferrer"
                                :aria-label="item.name">
                                <i :class="item.icon" />
                                <span class="gp-social-tip">{{ item.name }}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </transition>

            <!-- 触发按钮 -->
            <button class="gp-logo" :class="{ 'is-open': isOpenPannel }" @click="togglePannel()">
                <img src="/favicon.ico" alt="logo" />
            </button>
        </div>
    </Teleport>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Countdown from '../countdown/index.vue'
import { countdowns } from '@/config/countdowns'

import { useRouter } from 'vue-router'

const router = useRouter()

const Backhome = () => {
    router.push({
        name: 'Home'
    })
}

const isOpenPannel = ref(true)

interface Social {
    name: string
    icon: string
    url: string
}

const socials: Social[] = [
    { name: 'GitHub', icon: 'iconfont icon-github', url: 'https://github.com' },
    { name: '小黑盒', icon: 'iconfont icon-heihe', url: 'https://juejin.cn' },
    { name: '哔哩哔哩', icon: 'iconfont icon-bilibili', url: 'mailto:you@example.com' },
]

const togglePannel = (state?: boolean) => {
    isOpenPannel.value = typeof state === 'boolean' ? state : !isOpenPannel.value
}

const close = () => togglePannel(false)

/**
 * 键盘快捷键：
 * - ESC：关闭面板
 * - P  ：切换面板（未打开则打开，已打开则关闭）
 *
 * 注意点：
 * 1) 输入框（input / textarea / select）或可编辑区域内按键时不触发，
 *    避免用户打字时误触。
 * 2) 组合键（Ctrl / Meta / Alt）或带 shift 的 P（如 Shift+P，
 *    常用于输入大写）不拦截，保持系统与其他快捷键的原有行为。
 * 3) ESC 只用 key === 'Escape' 判断，不受大小写影响。
 */
const onKeydown = (e: KeyboardEvent) => {
    // 目标元素处于可输入状态时，直接放行
    const target = e.target as HTMLElement | null
    if (target) {
        const tag = target.tagName
        const isEditable =
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            tag === 'SELECT' ||
            target.isContentEditable
        if (isEditable) return
    }

    // ESC：关闭面板（面板未打开时不做任何事）
    if (e.key === 'Escape') {
        if (isOpenPannel.value) close()
        return
    }

    // P：切换面板；排除组合键与大小写干扰
    if (e.key.toLowerCase() === 'p') {
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
        // 如果站点里已有其他 P 快捷键监听，可在此做冲突规避
        e.preventDefault()
        togglePannel()
    }
}

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
$panel-width: 320px;
$trigger-size: 40px;


$glass-border: rgba(255, 255, 255, 0.65);
// $glass-blur: blur(20px) saturate(180%);
$glass-blur: blur(10px);




/* 层级令牌：集中管理，避免各处硬编码 */
$z-mask: 2147483000;
$z-panel: 2147483001;
$z-trigger: 2147483002;

.gp-all {
    /*
     * 关键修复 1：顶层容器本身不占位，只做层叠上下文锚点。
     * isolation: isolate 显式建立层叠上下文，
     * 配合超高 z-index，保证整体压在站点绝大多数元素之上。
     */
    position: relative;
    z-index: $z-mask;
    isolation: isolate;

    /* 关键修复 2：避免站点全局样式干扰 */
    box-sizing: border-box;
    line-height: 1.5;
    text-align: left;

    /* ---------- 触发按钮 ---------- */
    .gp-logo {
        position: fixed;
        top: 15px;
        right: 15px;
        /* 关键修复 3：按钮层级高于面板，展开后仍可点击关闭 */
        z-index: $z-trigger;
        width: $trigger-size;
        height: $trigger-size;
        margin: 0;
        border: 1px solid $glass-border;
        padding: 0;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        backdrop-filter: $glass-blur;
        -webkit-backdrop-filter: $glass-blur;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            background-color 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 2px 12px rgba(31, 36, 48, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);

        img {
            border-radius: 50%;
            padding: 5px;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        &:hover {
            transform: scale(1.1);
            background-color: rgba(255, 255, 255, 0.85);
            box-shadow: 0 4px 16px rgba(31, 36, 48, 0.16),
                inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        /* 展开时轻微旋转，给出状态反馈 */
        &.is-open {
            transform: rotate(90deg) scale(1.05);
            opacity: 0.5;
        }
    }

    /* ---------- 遮罩 ---------- */
    .gp-mask {
        position: fixed;
        inset: 0;
        /* 关键修复 4：遮罩层级介于按钮与面板之间 */
        z-index: $z-mask;
        background: rgba(15, 20, 30, 0.18);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
    }

    .gp-fade-enter-active,
    .gp-fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .gp-fade-enter-from,
    .gp-fade-leave-to {
        opacity: 0;
    }

    /* ---------- 面板 ---------- */
    .gp-main {
        position: fixed;
        top: 50px;
        right: 70px;
        /* 关键修复 5：面板高于遮罩 */
        z-index: $z-panel;
        width: $panel-width;
        max-width: calc(100vw - 90px);
        max-height: calc(100vh - 30px);
        overflow-y: auto;
        overflow-x: hidden;
        padding: 20px;
        box-sizing: border-box;
        border-radius: 16px;

        /* 白色玻璃质感 */
        background-color: var(--gp-pannel-bg);
        border: 1px solid var(--gp-pannel-border);
        backdrop-filter: $glass-blur;
        -webkit-backdrop-filter: $glass-blur;
        color: #1f2430;

        /* 保证动画起点在右侧，形成“从按钮滑出”的感觉 */
        transform-origin: top right;
        /* 让面板内部元素自成一体，内部 hover/层叠不影响外部 */
        isolation: isolate;

        /* 滚动条美化（不影响功能） */
        scrollbar-width: thin;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(31, 36, 48, 0.18);
        }
    }

    .gp-panel-enter-active {
        transition: opacity 0.35s ease,
            transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .gp-panel-leave-active {
        transition: opacity 0.25s ease, transform 0.3s ease;
    }

    .gp-panel-enter-from,
    .gp-panel-leave-to {
        opacity: 0;
        transform: translateX(24px) scale(0.92);
    }

    /* 头部 */
    .gp-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .gp-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--gp-pannel-avatar-bg);
            border: 1px solid rgba(255, 255, 255, 0.9);
            padding: 3px;
            box-sizing: border-box;
            flex-shrink: 0;
            box-shadow: 0 2px 8px rgba(31, 36, 48, 0.1);
        }

        .gp-site-name {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 1px;
            color: var(--gp-pannel-sitename-fc);
        }

        .gp-site-desc {
            margin: 5px 0 0;
            font-size: 12px;
            line-height: 1.5;
            color: var(--gp-pannel-motto-fc);
        }
    }

    /* 个人介绍 */
    .gp-profile {
        margin: 20px auto;
        padding: 12px 14px;
        border-radius: 10px;
        background: var(--gp-pannel-intro-bg);
        border: 1px solid var(--gp-pannel-intro-border);

        .gp-profile-text {
            margin: 0;
            font-size: 13px;
            line-height: 1.7;
            color: var(--gp-pannel-intro-fc);
        }
    }

    /* ---------- 社交链接：图标组 ---------- */
    .gp-socials {
        list-style: none;
        margin: 20px 0 0;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
    }

    .gp-social-item {
        /* 逐个延迟浮现，--i 由模板注入 */
        animation: gp-social-in 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        animation-delay: calc(0.06s * var(--i) + 0.12s);
    }

    @keyframes gp-social-in {
        from {
            opacity: 0;
            transform: translateY(8px) scale(0.7);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .gp-social {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: #1f2430;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.75);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8),
            0 2px 8px rgba(31, 36, 48, 0.08);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.25s ease, box-shadow 0.25s ease;

        i {
            font-size: 24px;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateY(-4px) scale(1.12);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9),
                0 8px 18px rgba(31, 36, 48, 0.16);

            i {
                color: rebeccapurple;
            }
        }

        &:active {
            transform: translateY(-1px) scale(0.98);
            transition-duration: 0.1s;
        }
    }

    /* ---------- 社交链接：悬浮提示气泡 ---------- */
    .gp-social .gp-social-tip {
        position: absolute;
        bottom: calc(100% + 10px);
        left: 50%;
        /* 关键修复 6：气泡层级为面板内部最高 */
        z-index: 2;
        padding: 3px 6px;
        border-radius: 8px;
        font-size: 11px;
        line-height: 1.4;
        white-space: nowrap;
        color: #323a4b;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 6px 18px rgba(31, 36, 48, 0.16),
            0 1px 2px rgba(31, 36, 48, 0.08);
        backdrop-filter: blur(10px) saturate(180%);
        -webkit-backdrop-filter: blur(10px) saturate(180%);
        pointer-events: none;
        opacity: 0;

        /* 初始：略靠下 + 缩小 */
        transform: translate(-50%, 6px) scale(0.85);
        transform-origin: bottom center;

        transition:
            opacity 0.24s ease 0s,
            transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) 0s;

        /* 小尖角：独立绘制，不继承父级缩放 */
        &::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: -5px;
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.96);
            border-right: 1px solid rgba(255, 255, 255, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.9);
            border-radius: 0 0 2px 0;
            transform: translateX(-50%) rotate(45deg);
            transition: inherit;
        }
    }

    /* 悬停/聚焦：气泡弹到最终位置 */
    .gp-social:hover .gp-social-tip,
    .gp-social:focus-visible .gp-social-tip {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
    }

    /* 移出时仅对 opacity 做轻微延迟，transform 不延迟 */
    .gp-social:not(:hover) .gp-social-tip {
        transition-delay: 0.06s, 0s;
    }

    /* 键盘聚焦时也保留可访问性体验 */
    .gp-social:focus-visible {
        outline: 2px solid rgba(31, 36, 48, 0.35);
        outline-offset: 2px;
    }

    /* 尊重系统「减少动态效果」设置 */
    @media (prefers-reduced-motion: reduce) {
        .gp-social-item {
            animation: none;
        }

        .gp-social,
        .gp-social-tip,
        .gp-social-tip::after {
            transition: none;
        }

        .gp-social-tip {
            transform: translate(-50%, 0) scale(1);
        }
    }
}
</style>