<template>
    <Teleport to="body">
        <div class="global-background">

            <!--
                底层：
                当前已经显示的背景

                切换时旧背景不会立即消失，
                会一直留在这里直到新背景完成淡入。
            -->
            <div v-if="oldBackground" class="background-layer background-layer--old" :class="{
                'is-hidden': isChanging
            }">
                <img v-if="oldBackground.type === 'img'" :src="oldBackground.url" :alt="oldBackground.desc" />

                <video v-else-if="oldBackground.type === 'video'" :src="oldBackground.url" autoplay muted loop
                    playsinline />
            </div>

            <!--
                顶层：
                新背景

                新资源加载完成之前保持透明，
                因此不会出现黑屏。
            -->
            <div v-if="currentBackground" class="background-layer background-layer--new" :class="{
                'is-visible': currentVisible
            }">
                <img v-if="currentBackground.type === 'img'" :src="currentBackground.url" :alt="currentBackground.desc"
                    @load="onMediaReady" @error="onMediaError" />

                <video v-else-if="currentBackground.type === 'video'" :src="currentBackground.url" autoplay muted loop
                    playsinline preload="auto" @canplay="onMediaReady" @error="onMediaError" />
            </div>

            <!-- 遮罩 -->
            <div class="global-background__overlay"></div>

        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useBackgroundStore } from '@/stores/background'
import type { Wallpaper } from '@/config/wallpaper'

const store = useBackgroundStore()

/**
 * 当前真正显示在画面上的背景
 */
const currentBackground = ref<Wallpaper | null>(
    store.currentBackground ?? null
)

/**
 * 旧背景
 *
 * 切换过程中旧背景继续存在，
 * 等新背景淡入完成以后再删除。
 */
const oldBackground = ref<Wallpaper | null>(null)

/**
 * 新背景是否已经准备好
 */
const currentVisible = ref(true)

/**
 * 当前是否正在切换
 */
const isChanging = ref(false)

/**
 * 动画计时器
 */
const transitionTimer = ref<ReturnType<typeof setTimeout> | null>(null)

/**
 * 背景切换动画时间
 */
const TRANSITION_DURATION = 800

/**
 * 监听 Pinia 当前背景变化
 *
 * 背景可以由：
 * - 自动播放
 * - 其他组件调用 store
 *
 * 统一从这里执行双层切换。
 */
watch(
    () => store.currentIndex,
    newIndex => {
        const nextBackground = store.backgrounds[newIndex]

        if (!nextBackground) {
            return
        }

        // 第一次初始化
        if (!currentBackground.value) {
            currentBackground.value = nextBackground
            currentVisible.value = true
            return
        }

        // 相同资源不处理
        if (
            currentBackground.value.name === nextBackground.name &&
            currentBackground.value.url === nextBackground.url
        ) {
            return
        }

        // 正在切换时，不重复启动动画
        if (isChanging.value) {
            return
        }

        startTransition(nextBackground)
    }
)

/**
 * 开始双层切换
 */
const startTransition = (nextBackground: Wallpaper) => {
    if (transitionTimer.value) {
        clearTimeout(transitionTimer.value)
        transitionTimer.value = null
    }

    /**
     * 保存旧背景
     *
     * 旧背景继续显示在下面。
     */
    oldBackground.value = currentBackground.value

    /**
     * 设置新背景
     *
     * 新背景现在位于上层。
     */
    currentBackground.value = nextBackground

    /**
     * 新背景刚开始加载，所以透明。
     */
    currentVisible.value = false

    /**
     * 标记切换状态
     */
    isChanging.value = true
}

/**
 * 新媒体加载完成
 *
 * 图片：
 * load
 *
 * 视频：
 * canplay
 */
const onMediaReady = () => {
    if (!isChanging.value) {
        return
    }

    /**
     * 新背景淡入
     */
    requestAnimationFrame(() => {
        currentVisible.value = true
    })

    /**
     * 等淡入完成以后，
     * 删除旧背景。
     */
    transitionTimer.value = setTimeout(() => {
        oldBackground.value = null
        isChanging.value = false
        transitionTimer.value = null
    }, TRANSITION_DURATION)
}

/**
 * 媒体加载失败
 *
 * 如果新背景加载失败，
 * 保留旧背景，不让页面变黑。
 */
const onMediaError = () => {
    if (!isChanging.value) {
        return
    }

    console.warn(
        '[GlobalBackground] 背景资源加载失败:',
        currentBackground.value?.url
    )

    /**
     * 恢复旧背景
     */
    if (oldBackground.value) {
        currentBackground.value = oldBackground.value
    }

    currentVisible.value = true
    oldBackground.value = null
    isChanging.value = false

    if (transitionTimer.value) {
        clearTimeout(transitionTimer.value)
        transitionTimer.value = null
    }
}

/**
 * 自动切换
 */
let autoPlayTimer: ReturnType<typeof setInterval> | null = null

const startAutoPlay = () => {
    stopAutoPlay()

    if (store.backgrounds.length <= 1) {
        return
    }

    /**
     * playSpeed 直接表示秒数
     *
     * 例如：
     * 10 = 10 秒切换一次
     * 30 = 30 秒切换一次
     * 60 = 60 秒切换一次
     */
    const delay = Math.max(store.playSpeed, 1) * 1000

    autoPlayTimer = setInterval(() => {
        if (!isChanging.value) {
            store.nextBackground()
        }
    }, delay)
}

const stopAutoPlay = () => {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer)
        autoPlayTimer = null
    }
}

/**
 * 播放间隔改变时重新启动
 */
watch(
    () => store.playSpeed,
    () => {
        startAutoPlay()
    }
)

/**
 * 初始化自动播放
 */
startAutoPlay()

/**
 * 清理
 */
onBeforeUnmount(() => {
    stopAutoPlay()

    if (transitionTimer.value) {
        clearTimeout(transitionTimer.value)
        transitionTimer.value = null
    }
})
</script>

<style scoped lang="scss">
.global-background {
    position: fixed;
    inset: 0;
    z-index: -1;

    overflow: hidden;

    background: #000;

    /**
     * 双媒体层
     */
    .background-layer {
        position: absolute;
        inset: 0;

        width: 100%;
        height: 100%;

        overflow: hidden;

        img,
        video {
            display: block;

            width: 100%;
            height: 100%;

            object-fit: cover;
            object-position: center;

            user-select: none;
            pointer-events: none;
        }
    }

    /**
     * 旧背景
     */
    .background-layer--old {
        z-index: 1;

        opacity: 1;

        transition:
            opacity 800ms ease;
    }

    /**
     * 新背景
     */
    .background-layer--new {
        z-index: 2;

        opacity: 0;

        transition:
            opacity 800ms ease;
    }

    /**
     * 新背景加载完成以后淡入
     */
    .background-layer--new.is-visible {
        opacity: 1;
    }

    /**
     * 旧背景在新背景淡入以后淡出
     */
    .background-layer--old.is-hidden {
        opacity: 0;
    }

    /**
     * 全局遮罩
     */
    .global-background__overlay {
        position: absolute;
        inset: 0;

        z-index: 5;

        pointer-events: none;

        background: rgba(0, 0, 0, 0.15);
    }
}
</style>