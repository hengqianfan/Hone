<template>
    <Teleport to="body">
        <div class="ghub">

            <!-- ============ Logo 独立区块（与导航完全解耦） ============ -->
            <div class="ghub-logo-wrap">
                <button class="ghub-logo" :class="{ 'is-open': activePanel === 'logo' }" type="button"
                    aria-label="打开个人面板" :aria-expanded="activePanel === 'logo'" @click="togglePanel('logo')">
                    <img src="/favicon.ico" alt="logo" />
                </button>
            </div>

            <!-- ============ 主导航胶囊 ============ -->
            <nav class="ghub-nav">
                <div v-for="item in navItems" :key="item.name" class="ghub-item" :class="{
                    active: isActive(item),
                    'has-children': !!item.children?.length,
                    'is-expanded': openedMenu === item.name
                }">
                    <button class="ghub-button" type="button" :aria-label="item.label"
                        :aria-expanded="item.children?.length ? openedMenu === item.name : undefined"
                        @click="handleItemClick(item)">
                        <i :class="item.icon"></i>
                        <span class="ghub-tooltip">{{ item.label }}</span>
                    </button>

                    <Transition name="ghub-submenu">
                        <div v-if="item.children?.length && openedMenu === item.name" class="ghub-submenu" @click.stop>
                            <div class="ghub-submenu-title">{{ item.label }}</div>
                            <button v-for="child in item.children" :key="child.name" class="ghub-submenu-item"
                                :class="{ active: isChildActive(child) }" type="button"
                                @click="handleChildClick(child)">
                                <i :class="child.icon"></i>
                                <span>{{ child.label }}</span>
                                <i v-if="child.external" class="iconfont icon-link ghub-external"></i>
                            </button>
                        </div>
                    </Transition>
                </div>

                <!-- 设置按钮 -->
                <div class="ghub-item">
                    <button class="ghub-button ghub-setting" :class="{ 'is-open': activePanel === 'setting' }"
                        type="button" aria-label="打开设置" :aria-expanded="activePanel === 'setting'"
                        @click="togglePanel('setting')">
                        <i class="iconfont icon-settings"></i>
                        <span class="ghub-tooltip">设置</span>
                    </button>
                </div>
            </nav>

            <!-- ============ 回到顶部（带阅读进度环） ============ -->
            <div class="ghub-top-slot">
                <Transition name="ghub-top">
                    <button v-if="showBackTop" class="ghub-top-button" type="button"
                        :aria-label="`回到顶部，当前阅读进度 ${roundedProgress}%`" :title="`阅读进度 ${roundedProgress}%`"
                        @click="backToTop">
                        <!-- 进度环 -->
                        <svg class="ghub-top-ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                            <!-- 轨道 -->
                            <circle class="ghub-top-ring-track" cx="50" cy="50" :r="RING_RADIUS" />
                            <!-- 进度 -->
                            <circle class="ghub-top-ring-progress" :class="{ 'is-full': roundedProgress >= 100 }"
                                cx="50" cy="50" :r="RING_RADIUS" :style="ringStyle" />
                        </svg>

                        <i class="iconfont icon-top"></i>
                    </button>
                </Transition>
            </div>

        </div>
    </Teleport>

    <!-- ============ Logo 面板 ============ -->
    <Teleport to="body">
        <Transition name="ghub-panel">
            <div v-if="activePanel === 'logo'" class="ghub-panel-mask" @click="closePanel" @mouseleave="closePanel">
                <div class="ghub-panel" @click.stop>
                    <div class="ghub-panel-header">
                        <img src="/favicon.ico" alt="logo" class="ghub-panel-avatar" @click="goHome" />
                        <div class="ghub-panel-site">
                            <h3>界·衡千帆</h3>
                            <p>先完成，然后完美</p>
                        </div>
                    </div>

                    <div class="ghub-panel-profile">
                        <p>
                            Hi！欢迎访问「界·衡千帆」
                            <br />
                            这里是衡千帆的独立博客网站。
                        </p>
                    </div>

                    <div class="countdown-container">
                        <Countdown :list="countdowns" />
                    </div>

                    <div class="ghub-panel-socials">
                        <a v-for="item in socials" :key="item.name" :href="item.url" target="_blank"
                            rel="noopener noreferrer" :aria-label="item.name">
                            <i :class="item.icon"></i>
                            <span>{{ item.name }}</span>
                        </a>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>

    <!-- ============ 设置面板 ============ -->
    <Teleport to="body">
        <Transition name="ghub-panel">
            <div v-if="activePanel === 'setting'" class="ghub-panel-mask" @click="closePanel">
                <div class="ghub-panel ghub-setting-panel" @click.stop>

                    <div class="ghub-setting-header">
                        <i class="iconfont icon-setting"></i>
                        <h3>设置</h3>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">本地壁纸库</div>

                        <div class="ghub-setting-row">
                            <span>目录</span>
                            <span class="ghub-setting-ellipsis">{{ dirName || '未选择' }}</span>
                        </div>

                        <div class="ghub-setting-row ghub-setting-actions">
                            <button type="button" class="ghub-setting-btn" @click="pickAndScan">
                                {{ hasDir ? '重新选择目录' : '选择本地文件夹' }}
                            </button>

                            <button v-if="hasDir" type="button" class="ghub-setting-btn" @click="resumeLast">
                                继续使用上次目录
                            </button>

                            <button v-if="localList.length" type="button" class="ghub-setting-btn" @click="clearLocal">
                                清空
                            </button>
                        </div>

                        <div v-if="status" class="ghub-setting-tip">{{ status }}</div>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">壁纸</div>

                        <div class="ghub-setting-row">
                            <span>当前壁纸</span>
                            <span>{{ store.currentBackground?.desc ?? '未设置' }}</span>
                        </div>

                        <div class="ghub-setting-wallpapers">
                            <button v-for="(item, index) in store.backgrounds" :key="item.name"
                                class="ghub-setting-wallpaper" :class="{ active: index === store.currentIndex }"
                                type="button" :title="item.desc" @click="store.setCurrentBackground(index)">
                                <img v-if="item.type === 'img'" :src="item.url" :alt="item.desc" loading="lazy" />
                                <video v-else :src="item.url" muted loop playsinline />
                            </button>
                        </div>

                        <div class="ghub-setting-row">
                            <span>固定当前壁纸</span>
                            <input type="checkbox" :checked="store.pinned" @change="store.togglePin()" />
                            <span class="ghub-setting-tip">
                                {{ store.pinned ? '已固定，不再自动轮换' : '自动轮换中' }}
                            </span>
                        </div>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">自动播放</div>

                        <div class="ghub-setting-row ghub-setting-row--slider">
                            <span class="ghub-setting-row-label">切换间隔（秒）</span>
                            <input v-model.number="playSpeed" class="ghub-setting-range" type="range" min="1" max="120"
                                step="1" :disabled="store.pinned" />
                            <span class="ghub-setting-value">{{ playSpeed }}s</span>
                        </div>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">动画</div>
                        <label class="ghub-setting-row">
                            <span>减少动态效果</span>
                            <input v-model="reduceMotion" type="checkbox" />
                        </label>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">站点管理</div>

                        <div class="ghub-setting-row ghub-setting-actions">
                            <button type="button" class="ghub-setting-nav" @click="goSitesManage">
                                <i class="iconfont icon-nav"></i>
                                <span>前往站点管理</span>
                                <i class="iconfont icon-link ghub-external"></i>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocalWallpaper } from '@/utils/useLocalWallpaper'
import Countdown from '@/components/countdown/index.vue'
import { countdowns } from '@/config/countdowns'
import { useBackgroundStore } from '@/stores/background'

const {
    hasDir,
    dirName,
    localList,
    status,
    pickAndScan,
    tryRestore,
    resumeLast,
    clearLocal,
} = useLocalWallpaper()

const router = useRouter()
const route = useRoute()
const store = useBackgroundStore()

/* ---------------- 类型 ---------------- */

interface GhubChild {
    name: string
    label: string
    icon: string
    routeName?: string
    url?: string
    external?: boolean
}

interface GhubItem {
    name: string
    label: string
    icon: string
    routeName?: string
    children?: GhubChild[]
}

/* ---------------- 导航配置 ---------------- */

const navItems: GhubItem[] = [
    { name: 'home', label: '首页', icon: 'iconfont icon-home', routeName: 'Home' },
    { name: 'posts', label: '文章', icon: 'iconfont icon-book', routeName: 'Articles' },
    { name: 'sites', label: '网站导航', icon: 'iconfont icon-nav', routeName: 'Sites' },
    { name: 'life', label: '生活', icon: 'iconfont icon-life', routeName: 'Moments' },
]

/* ---------------- 社交链接 ---------------- */

interface Social {
    name: string
    icon: string
    url: string
}

const socials: Social[] = [
    { name: 'GitHub', icon: 'iconfont icon-github', url: 'https://github.com' },
    { name: 'Bilibili', icon: 'iconfont icon-bilibili', url: 'https://www.bilibili.com' },
    // { name: 'Email', icon: 'iconfont icon-email', url: 'mailto:you@example.com' },
]

/* =========================================================
 * 面板统一状态源：'logo' | 'setting' | null
 * ========================================================= */

type PanelName = 'logo' | 'setting' | null

const activePanel = ref<PanelName>(null)

const togglePanel = (name: Exclude<PanelName, null>) => {
    activePanel.value = activePanel.value === name ? null : name
    openedMenu.value = null
}

const closePanel = () => {
    activePanel.value = null
}

/* ---------------- 设置面板内的跳转 ---------------- */

const goSitesManage = () => {
    if (route.path !== '/sitesManage') {
        router.push({ path: '/sitesManage' })
    }
    closePanel()
}

/* ---------------- 设置项 ---------------- */

const playSpeed = ref(store.playSpeed)

watch(playSpeed, value => {
    store.playSpeed = value
})

const reduceMotion = ref(false)

watch(reduceMotion, value => {
    document.documentElement.classList.toggle('reduce-motion', value)
})

/* ---------------- 子菜单 ---------------- */

const openedMenu = ref<string | null>(null)

const toggleMenu = (item: GhubItem) => {
    if (!item.children?.length) return
    openedMenu.value = openedMenu.value === item.name ? null : item.name
}

/* ---------------- 导航点击 ---------------- */

const handleItemClick = (item: GhubItem) => {
    if (item.children?.length) {
        toggleMenu(item)
        return
    }
    if (item.routeName) {
        router.push({ name: item.routeName })
        openedMenu.value = null
    }
}

const handleChildClick = (child: GhubChild) => {
    if (child.external && child.url) {
        window.open(child.url, '_blank', 'noopener,noreferrer')
        return
    }
    if (child.routeName) {
        router.push({ name: child.routeName })
        openedMenu.value = null
    }
}

/* ---------------- 路由判断 ---------------- */

const isActive = (item: GhubItem) => {
    if (item.routeName) return route.name === item.routeName
    if (item.children?.length) {
        return item.children.some(child => child.routeName === route.name)
    }
    return false
}

const isChildActive = (child: GhubChild) =>
    !!child.routeName && route.name === child.routeName

/* ---------------- 首页 ---------------- */

const goHome = () => {
    router.push({ name: 'Home' })
    closePanel()
}

/* =========================================================
 * 回到顶部 + 阅读进度环
 * ========================================================= */

const showBackTop = ref(false)
/** 页面阅读进度 0 ~ 100 */
const progress = ref(0)

/* --- 环形几何常量 --- */
/** SVG 内部坐标系半径（viewBox 100x100） */
const RING_RADIUS = 46
/** 圆周长 */
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

/** 用于展示与 aria 的整数进度 */
const roundedProgress = computed(() => Math.round(progress.value))

/**
 * 进度环样式：
 * 用 stroke-dashoffset 把「已走完的弧长」露出来
 */
const ringStyle = computed(() => {
    const ratio = Math.min(1, Math.max(0, progress.value / 100))
    const offset = RING_CIRCUMFERENCE * (1 - ratio)
    return {
        strokeDasharray: `${RING_CIRCUMFERENCE}`,
        strokeDashoffset: `${offset}`,
    }
})

/** 计算滚动进度 */
const calcProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
    const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight

    if (docHeight <= 0) {
        progress.value = 100
        return
    }

    const raw = (scrollTop / docHeight) * 100
    progress.value = Math.min(100, Math.max(0, raw))
}

/**
 * 滚动处理：
 * - 阈值判断是否显示回到顶部
 * - 计算阅读进度
 * 用 rAF 节流，避免高频重排
 */
let ticking = false

const checkScroll = () => {
    if (ticking) return
    ticking = true

    requestAnimationFrame(() => {
        showBackTop.value = window.scrollY > 300
        calcProgress()
        ticking = false
    })
}

const backToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ---------------- 全局事件 ---------------- */

const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (!target) return
    if (!target.closest('.ghub') && !target.closest('.ghub-panel')) {
        openedMenu.value = null
    }
}

const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return
    openedMenu.value = null
    activePanel.value = null
}

/* ---------------- 生命周期 ---------------- */

onMounted(async () => {
    window.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll, { passive: true })
    document.addEventListener('click', onDocumentClick)
    window.addEventListener('keydown', onKeydown)

    checkScroll()

    await tryRestore()

    if (localList.value.length) {
        store.clearLocalWallpapers()
        store.addLocalWallpapers(localList.value)
    }
})

watch(
    () => localList.value,
    list => {
        const sameLength = store.localWallpapers.length === list.length
        const sameIds =
            sameLength &&
            list.every((item, i) => store.localWallpapers[i]?.id === item.id)

        if (sameIds) return

        store.clearLocalWallpapers()
        if (list.length) store.addLocalWallpapers(list)
    }
)

onBeforeUnmount(() => {
    window.removeEventListener('scroll', checkScroll)
    window.removeEventListener('resize', checkScroll)
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('keydown', onKeydown)
})

/* ---------------- 路由变化关闭菜单 & 刷新进度 ---------------- */

watch(
    () => route.fullPath,
    async () => {
        openedMenu.value = null
        activePanel.value = null

        // 路由切换后重新计算进度（新页面高度不同）
        await new Promise(resolve => setTimeout(resolve, 0))
        calcProgress()
    }
)
</script>

<style lang="scss" scoped>
/* =========================================================
 * 设计令牌（黑透玻璃风格）
 * ========================================================= */

$logo-size: 45px;
$nav-item-size: 30px;
$nav-size: 45px;
$top-size: 45px;

$ghub-logo-bg: rgba(18, 20, 26, 0.55);
$ghub-logo-bg-hover: rgba(28, 31, 40, 0.72);

$ghub-nav-bg: rgba(14, 16, 21, 0.5);

$ghub-panel-bg: rgba(16, 18, 24, 0.72);

$ghub-card-bg: rgba(255, 255, 255, 0.06);
$ghub-card-bg-strong: rgba(255, 255, 255, 0.1);

$ghub-border: rgba(255, 255, 255, 0.12);
$ghub-border-strong: rgba(255, 255, 255, 0.2);

$ghub-text: rgba(255, 255, 255, 0.88);
$ghub-text-strong: #ffffff;
$ghub-text-muted: rgba(255, 255, 255, 0.55);

$ghub-option-fc: rgba(255, 255, 255, 0.82);
$ghub-option-fc-hover: #ffffff;
$ghub-option-fc-active: #ffffff;

$ghub-option-bg: transparent;
$ghub-option-bg-hover: rgba(255, 255, 255, 0.12);
$ghub-option-bg-active: rgba(255, 255, 255, 0.18);

$ghub-active: #3d6394;
$ghub-active-bg: rgba(79, 156, 255, 0.22);
$ghub-active-border: rgba(79, 156, 255, 0.45);

$ghub-logo-opacity-active: 0.7;

$ghub-shadow-soft: 0 4px 14px rgba(0, 0, 0, 0.22);
$ghub-shadow-pop: 0 8px 24px rgba(0, 0, 0, 0.3);

$ghub-z: 1000;

/* =========================================================
 * 根节点：贴右侧垂直居中
 * ========================================================= */

.ghub {
    position: fixed;
    right: 15px;
    top: 50%;
    z-index: 1001;

    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 10px;

    transform: translateY(-50%);

    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

    box-sizing: border-box;

    * {
        box-sizing: border-box;
    }
}

/* =========================================================
 * Logo 独立区块
 * ========================================================= */

.ghub-logo-wrap {
    position: relative;
    width: $logo-size;
    height: $logo-size;
    flex-shrink: 0;
}

.ghub-logo {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 1px solid $ghub-border;
    border-radius: 50%;

    background: $ghub-logo-bg;

    box-shadow: $ghub-shadow-soft;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        background 0.25s ease,
        border-color 0.25s ease,
        opacity 0.25s ease;

    img {
        width: 100%;
        height: 100%;
        padding: 5px;
        border-radius: 50%;
        display: block;
    }

    &:hover {
        transform: scale(1.1);
        background: $ghub-logo-bg-hover;
        border-color: $ghub-border-strong;
    }

    &.is-open {
        opacity: $ghub-logo-opacity-active;
        transform: rotate(90deg) scale(1.06);
    }
}

/* =========================================================
 * 主导航胶囊
 * ========================================================= */

.ghub-nav {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 10px;

    padding: 9px 7px;

    border: 1px solid $ghub-border;
    border-radius: 999px;

    background: $ghub-nav-bg;
}

/* =========================================================
 * 单个导航
 * ========================================================= */

.ghub-item {
    position: relative;
    width: $nav-item-size;
    height: $nav-item-size;
    flex-shrink: 0;
}

/* =========================================================
 * 导航按钮
 * ========================================================= */

.ghub-button {
    position: relative;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 0;
    border-radius: 50%;

    color: $ghub-option-fc;
    background: $ghub-option-bg;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        color 0.25s ease,
        background 0.25s ease,
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    i {
        font-size: 16px;
        line-height: 1;
        transition:
            transform 0.25s ease,
            color 0.25s ease;
    }

    &:hover {
        color: $ghub-option-fc-hover;
        background: $ghub-option-bg-hover;
        transform: scale(1.08);

        >i {
            transform: scale(1.08);
        }
    }
}

/* =========================================================
 * 当前路由
 * ========================================================= */

.ghub-item.active {
    .ghub-button {
        color: $ghub-option-fc-active;
        background: $ghub-active;

        >i {
            color: $ghub-option-fc-active;
        }
    }
}

/* =========================================================
 * 有子菜单
 * ========================================================= */

.ghub-item.is-expanded {
    .ghub-button {
        background: $ghub-option-bg-active;

        i {
            color: $ghub-option-fc-active;
            display: none;
        }

        transform: scale(0.5);
    }

    .ghub-tooltip {
        display: none;
    }
}

/* =========================================================
 * Tooltip（向左弹出）
 * ========================================================= */

.ghub-tooltip {
    position: absolute;

    right: calc(100% + 12px);
    top: 50%;

    padding: 5px 9px;

    border-radius: 8px;

    white-space: nowrap;

    color: $ghub-text-strong;
    background: rgba(12, 14, 19, 0.92);
    border: 1px solid $ghub-border-strong;

    box-shadow: $ghub-shadow-pop;

    font-size: 11px;
    line-height: 1.4;

    pointer-events: none;

    opacity: 0;

    transform: translateY(-50%) translateX(5px) scale(0.92);

    transition:
        opacity 0.2s ease,
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    z-index: 9050;

    &::before {
        content: '';

        position: absolute;

        right: -4px;
        top: 50%;

        width: 7px;
        height: 7px;

        background: rgba(12, 14, 19, 0.92);
        border-right: 1px solid $ghub-border-strong;
        border-top: 1px solid $ghub-border-strong;

        transform: translateY(-50%) rotate(45deg);
    }
}

.ghub-button:hover .ghub-tooltip {
    opacity: 1;
    transform: translateY(-50%) translateX(0) scale(1);
}

/* =========================================================
 * 子菜单（向左弹出）
 * ========================================================= */

.ghub-submenu {
    position: absolute;

    right: calc(100% + 20px);
    top: 50%;

    min-width: 160px;

    padding: 9px;

    border-radius: 16px;

    border: 1px solid $ghub-border;
    background: rgba(16, 18, 24, 0.78);

    box-shadow: $ghub-shadow-pop;

    transform: translateY(-50%) translateX(0);

    z-index: 9010;
}

.ghub-submenu-title {
    padding: 5px 9px 8px;

    color: $ghub-text-muted;

    font-size: 11px;
    letter-spacing: 0.5px;
}

.ghub-submenu-item {
    width: 100%;

    min-height: 30px;

    padding: 0 10px;

    border: 0;
    border-radius: 10px;

    background: transparent;
    color: $ghub-text;

    cursor: pointer;

    display: flex;
    align-items: center;

    gap: 10px;

    font-size: 12px;
    text-align: left;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;

    i {
        width: 18px;
        flex-shrink: 0;
        font-size: 17px;
        text-align: center;
    }

    span {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    &:hover {
        color: $ghub-active;
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(-2px);
    }

    &.active {
        color: $ghub-active;
        background: $ghub-active-bg;
        font-weight: 500;
    }
}

.ghub-external {
    opacity: 0.45;
    font-size: 12px !important;
}

.ghub-submenu-enter-active,
.ghub-submenu-leave-active {
    transition:
        opacity 0.22s ease,
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ghub-submenu-enter-from,
.ghub-submenu-leave-to {
    opacity: 0;
    transform: translateY(-50%) translateX(10px) scale(0.94);
}

/* =========================================================
 * 设置按钮
 * ========================================================= */

.ghub-setting {
    i {
        font-size: 16px;
    }

    &.is-open,
    &.is-open:hover {
        transform: scale(0.5);
        background: $ghub-option-bg-active;

        >i {
            display: none;
        }

        .ghub-tooltip {
            display: none;
        }
    }
}

/* =========================================================
 * 回到顶部：占位槽 + 绝对定位按钮 + 进度环
 * ========================================================= */

.ghub-top-slot {
    position: relative;

    width: $top-size;
    height: $top-size;

    flex-shrink: 0;
}

.ghub-top-button {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 1px solid $ghub-border;
    border-radius: 50%;

    color: $ghub-text;
    background: $ghub-logo-bg;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    /* 进度环绝对定位铺满按钮 */
    overflow: visible;

    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        background 0.25s ease,
        color 0.25s ease,
        border-color 0.25s ease;

    >i {
        position: relative;
        z-index: 1;
        font-size: 16px;
        transition: transform 0.25s ease;
    }

    &:hover {
        color: $ghub-text-strong;
        background: $ghub-active;
        border-color: $ghub-active-border;
        transform: scale(1.08);

        >i {
            transform: translateY(-1px);
        }
    }

    &:active {
        transform: scale(0.96);
    }
}

/* ---------- 进度环本体 ---------- */

.ghub-top-ring {
    position: absolute;
    /* 让环略微超出一圈，视觉上包裹按钮 */
    inset: -3px;

    width: calc(100% + 6px);
    height: calc(100% + 6px);

    /* 环从 12 点钟方向开始 */
    transform: rotate(-90deg);

    pointer-events: none;
    overflow: visible;
}

/* 轨道：淡淡的底圈，保证 0% 时也能看出环形结构 */
.ghub-top-ring-track {
    fill: none;
    stroke: rgba(255, 255, 255, 0.14);
    stroke-width: 3;
}

/* 进度弧 */
.ghub-top-ring-progress {
    fill: none;

    stroke: $ghub-active-border;
    stroke-width: 3;
    stroke-linecap: round;

    /* 让进度变化平滑跟随滚动 */
    transition:
        stroke-dashoffset 0.15s linear,
        stroke 0.25s ease;

    /* 轻微发光，在深色背景上更清晰 */
    filter: drop-shadow(0 0 3px rgba(114, 151, 199, 0.55));
}

/* 读满时：换成更亮的强调色并加强发光，作为一个完成反馈 */
.ghub-top-ring-progress.is-full {
    stroke: #adbfdb;
    filter: drop-shadow(0 0 6px rgba(137, 168, 214, 0.85));
}

/* hover 时进度弧跟着变亮 */
.ghub-top-button:hover .ghub-top-ring-progress {
    stroke: #a8ccff;
    filter: drop-shadow(0 0 6px rgba(168, 204, 255, 0.8));
}

/* =========================================================
 * 回到顶部动画
 * ========================================================= */

.ghub-top-enter-active,
.ghub-top-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ghub-top-enter-from,
.ghub-top-leave-to {
    opacity: 0;
    transform: translateY(6px) scale(0.72);
}

/* =========================================================
 * 面板遮罩（Logo / 设置共用）
 * ========================================================= */

.ghub-panel-mask {
    position: fixed;

    inset: 0;

    z-index: $ghub-z;

    display: flex;
    align-items: center;
    justify-content: flex-end;

    padding-top: 65px;
    padding-right: 75px;

    background: rgba(0, 0, 0, 0.4);
}

/* =========================================================
 * 面板
 * ========================================================= */

.ghub-panel {
    width: 320px;

    max-width: calc(100vw - 100px);

    padding: 20px;

    border-radius: 18px;

    border: 1px solid $ghub-border;
    background: $ghub-panel-bg;

    color: $ghub-text;

    box-shadow: $ghub-shadow-pop;
}

.ghub-panel-header {
    display: flex;
    align-items: center;

    gap: 12px;

    margin-bottom: 16px;
}

.ghub-panel-avatar {
    width: 48px;
    height: 48px;

    padding: 3px;

    border-radius: 50%;

    background: $ghub-card-bg-strong;
    border: 1px solid $ghub-border-strong;

    cursor: pointer;

    transition: transform 0.25s ease;

    &:hover {
        transform: scale(1.08);
    }
}

.ghub-panel-site {
    h3 {
        margin: 0;

        color: $ghub-text-strong;

        font-size: 16px;
        font-weight: 600;

        letter-spacing: 1px;
    }

    p {
        margin: 5px 0 0;

        color: $ghub-text-muted;

        font-size: 12px;
    }
}

.ghub-panel-profile {
    padding: 12px 14px;

    border-radius: 11px;

    background: $ghub-card-bg;
    border: 1px solid $ghub-border;

    p {
        margin: 0;

        color: $ghub-text;

        font-size: 13px;
        line-height: 1.7;
    }
}

.countdown-container {
    background: $ghub-card-bg;

    border: 1px solid $ghub-border;
    margin-top: 16px;
    border-radius: 11px;
}

.ghub-panel-socials {
    display: flex;
    justify-content: center;
    align-items: center;

    gap: 12px;

    margin-top: 18px;

    a {
        position: relative;

        width: 40px;
        height: 40px;

        border-radius: 50%;

        color: $ghub-text;
        background: $ghub-card-bg;
        border: 1px solid $ghub-border;

        text-decoration: none;

        display: flex;
        align-items: center;
        justify-content: center;

        transition:
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;

        i {
            font-size: 21px;
        }

        span {
            position: absolute;

            bottom: calc(100% + 8px);
            left: 50%;

            padding: 3px 7px;

            border-radius: 6px;

            white-space: nowrap;

            color: $ghub-text-strong;
            background: rgba(12, 14, 19, 0.92);
            border: 1px solid $ghub-border-strong;

            font-size: 10px;

            opacity: 0;
            pointer-events: none;

            transform: translateX(-50%) translateY(4px);

            transition:
                opacity 0.2s ease,
                transform 0.2s ease;
        }

        &:hover {
            color: $ghub-active;
            background: $ghub-card-bg-strong;
            border-color: $ghub-active-border;

            transform: translateY(-3px) scale(1.08);

            span {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    }
}

/* =========================================================
 * 设置面板专用样式
 * ========================================================= */

.ghub-setting-panel {
    width: 340px;

    max-height: calc(100vh - 140px);

    overflow-y: auto;
}

.ghub-setting-header {
    display: flex;
    align-items: center;

    gap: 10px;

    margin-bottom: 16px;

    i {
        font-size: 20px;
        color: $ghub-active;
    }

    h3 {
        margin: 0;

        color: $ghub-text-strong;

        font-size: 16px;
        font-weight: 600;

        letter-spacing: 1px;
    }
}

.ghub-setting-group {
    padding: 12px 14px;

    border-radius: 11px;

    background: $ghub-card-bg;
    border: 1px solid $ghub-border;

    &+& {
        margin-top: 16px;
    }
}

.ghub-setting-label {
    margin-bottom: 10px;

    color: $ghub-text-muted;

    font-size: 11px;
    letter-spacing: 0.5px;
}

.ghub-setting-row {
    display: flex;
    align-items: center;

    gap: 10px;

    color: $ghub-text;

    font-size: 13px;

    min-width: 0;

    &+& {
        margin-top: 10px;
    }

    >span:first-child {
        flex-shrink: 0;
    }

    .ghub-setting-ellipsis {
        min-width: 0;
    }
}

.ghub-setting-row--slider {
    flex-wrap: wrap;
    row-gap: 6px;

    .ghub-setting-row-label {
        flex: 0 0 auto;
        white-space: nowrap;
    }

    .ghub-setting-value {
        flex: 0 0 auto;
        min-width: 34px;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }
}

.ghub-setting-range {
    flex: 1 1 100%;

    min-width: 0;

    width: 100%;
    max-width: 100%;

    height: 18px;
    margin: 0;

    accent-color: $ghub-active;

    padding: 0;

    &::-moz-range-track {
        width: 100%;
    }

    &::-webkit-slider-thumb {
        cursor: pointer;
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
}

.ghub-setting-wallpapers {
    padding: 10px 0;
    display: grid;

    grid-template-columns: repeat(4, 1fr);

    gap: 8px;
}

.ghub-setting-wallpaper {
    position: relative;

    aspect-ratio: 1;

    padding: 0;

    border: 2px solid transparent;
    border-radius: 8px;

    overflow: hidden;

    cursor: pointer;

    background: rgba(255, 255, 255, 0.06);

    transition:
        transform 0.2s ease,
        border-color 0.2s ease;

    img,
    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
    }

    &:hover {
        transform: scale(1.05);
    }

    &.active {
        border-color: $ghub-active;
        box-shadow: 0 0 0 3px rgba(79, 156, 255, 0.28);
    }
}

.ghub-setting-ellipsis {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: right;
}

.ghub-setting-actions {
    flex-wrap: wrap;
}

.ghub-setting-btn {
    padding: 5px 10px;
    border: 1px solid $ghub-active-border;
    border-radius: 7px;
    background: $ghub-active-bg;
    color: $ghub-active;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: rgba(79, 156, 255, 0.3);
    }
}

.ghub-setting-nav {
    display: flex;
    align-items: center;
    gap: 8px;

    width: 100%;

    padding: 9px 12px;

    border: 1px solid $ghub-active-border;
    border-radius: 8px;

    background: $ghub-active-bg;
    color: $ghub-active;

    font-size: 13px;
    text-align: left;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;

    >i:first-child {
        font-size: 16px;
        flex-shrink: 0;
    }

    >span {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .ghub-external {
        opacity: 0.55;
        font-size: 12px !important;
        flex-shrink: 0;
    }

    &:hover {
        background: rgba(79, 156, 255, 0.3);
        color: $ghub-text-strong;
        transform: translateX(-2px);
    }

    &:active {
        transform: scale(0.98);
    }
}

.ghub-setting-tip {
    margin-top: 8px;
    color: $ghub-text-muted;
    font-size: 11px;
}

/* =========================================================
 * 面板动画
 * ========================================================= */

.ghub-panel-enter-active,
.ghub-panel-leave-active {
    transition: opacity 0.25s ease;
}

.ghub-panel-enter-active .ghub-panel,
.ghub-panel-leave-active .ghub-panel {
    transition:
        opacity 0.3s ease,
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ghub-panel-enter-from,
.ghub-panel-leave-to {
    opacity: 0;
}

.ghub-panel-enter-from .ghub-panel,
.ghub-panel-leave-to .ghub-panel {
    opacity: 0;
    transform: translateX(20px) scale(0.92);
}

/* =========================================================
 * 小屏幕
 * ========================================================= */

@media (max-width: 768px) {
    .ghub {
        right: 10px;
    }

    .ghub-nav {
        gap: 8px;
        padding: 7px 5px;
    }

    .ghub-button,
    .ghub-item,
    .ghub-top-slot,
    .ghub-top-button {
        width: 24px;
        height: 24px;
    }

    .ghub-logo-wrap {
        width: 40px;
        height: 40px;
    }

    .ghub-button i {
        font-size: 13px;
    }

    .ghub-tooltip {
        display: none;
    }

    .ghub-submenu {
        right: calc(100% + 9px);
        min-width: 145px;
    }

    .ghub-panel-mask {
        padding-right: 58px;
        padding-top: 60px;
    }

    .ghub-panel {
        width: 280px;
    }

    .ghub-setting-panel {
        width: 280px;
        padding: 16px;
    }

    .ghub-setting-group {
        padding: 10px 12px;
    }

    .ghub-setting-row--slider {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;

        .ghub-setting-row-label,
        .ghub-setting-value {
            width: 100%;
            text-align: left;
        }

        .ghub-setting-range {
            flex: 1 1 auto;
            width: 100%;
        }
    }
}

/* =========================================================
 * 减少动态效果
 * ========================================================= */

@media (prefers-reduced-motion: reduce) {
    .ghub * {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }

    /* 进度环也别做过渡动画，直接跟随 */
    .ghub-top-ring-progress {
        transition: none !important;
    }
}
</style>