<template>
    <Teleport to="body">
        <div class="ghub">

            <!-- =========================
                 Logo
            ========================== -->
            <button class="ghub-logo" :class="{ 'is-open': isLogoPanelOpen }" type="button" aria-label="打开个人面板"
                @click="toggleLogoPanel">
                <img src="/favicon.ico" alt="logo" />
            </button>


            <!-- =========================
                 主导航按钮组
            ========================== -->
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

                        <!-- Tooltip：仅普通导航项 -->
                        <span class="ghub-tooltip">
                            {{ item.label }}
                        </span>
                    </button>


                    <!-- =========================
                         子菜单（向左展开）
                    ========================== -->
                    <Transition name="ghub-submenu">
                        <div v-if="item.children?.length && openedMenu === item.name" class="ghub-submenu" @click.stop>
                            <div class="ghub-submenu-title">
                                {{ item.label }}
                            </div>

                            <button v-for="child in item.children" :key="child.name" class="ghub-submenu-item"
                                :class="{ active: isChildActive(child) }" type="button"
                                @click="handleChildClick(child)">
                                <i :class="child.icon"></i>

                                <span>
                                    {{ child.label }}
                                </span>

                                <i v-if="child.external" class="iconfont icon-link ghub-external"></i>
                            </button>
                        </div>
                    </Transition>

                </div>


                <!-- =========================
                     设置按钮（按钮组内的最后一个 item）
                ========================== -->
                <div class="ghub-item">
                    <button class="ghub-button ghub-setting" :class="{ 'is-open': isSettingPanelOpen }" type="button"
                        aria-label="打开设置" @click="toggleSettingPanel">
                        <i class="iconfont icon-settings"></i>

                        <span class="ghub-tooltip">
                            设置
                        </span>
                    </button>
                </div>

            </nav>


            <!-- =========================
                 回到顶部
            ========================== -->
            <div class="ghub-top-slot">
                <Transition name="ghub-top">
                    <button v-if="showBackTop" class="ghub-top-button" type="button" aria-label="回到顶部"
                        @click="backToTop">
                        <i class="iconfont icon-top"></i>
                    </button>
                </Transition>
            </div>

        </div>
    </Teleport>


    <!-- =========================
         Logo 面板
    ========================== -->
    <Teleport to="body">
        <Transition name="ghub-panel">
            <div v-if="isLogoPanelOpen" class="ghub-panel-mask" @click="closeLogoPanel" @mouseleave="closeLogoPanel">
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

                            <span>
                                {{ item.name }}
                            </span>
                        </a>
                    </div>

                </div>
            </div>
        </Transition>
    </Teleport>


    <!-- =========================
         设置面板
    ========================== -->
    <Teleport to="body">
        <Transition name="ghub-panel">
            <div v-if="isSettingPanelOpen" class="ghub-panel-mask" @click="closeSettingPanel">
                <div class="ghub-panel ghub-setting-panel" @click.stop>

                    <div class="ghub-setting-header">
                        <i class="iconfont icon-setting"></i>
                        <h3>设置</h3>
                    </div>


                    <!-- =========================
                         主题
                    ========================== -->
                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">
                            主题设置
                        </div>

                        <div class="ghub-setting-row">
                            <button v-for="mode in themes" :key="mode.value" class="ghub-setting-theme"
                                :class="{ active: themeMode === mode.value }" type="button"
                                @click="themeMode = mode.value">

                                <span>{{ mode.label }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">本地壁纸库</div>

                        <div class="ghub-setting-row">
                            <span>目录</span>
                            <span class="ghub-setting-ellipsis">
                                {{ dirName || '未选择' }}
                            </span>
                        </div>

                        <div class="ghub-setting-row ghub-setting-actions">
                            <button type="button" class="ghub-setting-btn" @click="pickAndScan">
                                {{ hasDir ? '重新选择目录' : '选择本地文件夹' }}
                            </button>

                            <button v-if="hasDir && !localList.length" type="button" class="ghub-setting-btn"
                                @click="resumeLast">
                                继续使用上次目录
                            </button>

                            <button v-if="localList.length" type="button" class="ghub-setting-btn" @click="clearLocal">
                                清空
                            </button>
                        </div>

                        <div v-if="status" class="ghub-setting-tip">{{ status }}</div>

                    </div>


                    <!-- =========================
                         壁纸设置
                    ========================== -->
                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">
                            壁纸
                        </div>

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


                    <!-- =========================
                         自动播放
                    ========================== -->
                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">
                            自动播放
                        </div>



                        <div class="ghub-setting-row">
                            <span>切换间隔（秒）</span>
                            <input v-model.number="playSpeed" class="ghub-setting-range" type="range" min="1" max="120"
                                step="1" :disabled="store.pinned" />
                            <span>{{ playSpeed }}s</span>
                        </div>
                    </div>


                    <!-- =========================
                         动画
                    ========================== -->
                    <div class="ghub-setting-group">
                        <div class="ghub-setting-label">
                            动画
                        </div>

                        <label class="ghub-setting-row">
                            <span>减少动态效果</span>
                            <input v-model="reduceMotion" type="checkbox" />
                        </label>
                    </div>




                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import {
    onBeforeUnmount,
    onMounted,
    ref,
    watch
} from 'vue'

import {
    useRoute,
    useRouter
} from 'vue-router'

import { useLocalWallpaper } from '@/utils/useLocalWallpaper'

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

import Countdown from '@/components/countdown/index.vue'
import { countdowns } from '@/config/countdowns'

import { useBackgroundStore } from '@/stores/background'

/* =========================================================
 * Router / Store
 * ========================================================= */

const router = useRouter()
const route = useRoute()

const store = useBackgroundStore()

/* =========================================================
 * 类型
 * ========================================================= */

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

/* =========================================================
 * 导航配置
 * ========================================================= */

const navItems: GhubItem[] = [
    {
        name: 'home',
        label: '首页',
        icon: 'iconfont icon-home',
        routeName: 'Home'
    },
    {
        name: 'posts',
        label: '文章',
        icon: 'iconfont icon-book',
        children: [
            {
                name: 'categories',
                label: '分类模式',
                icon: 'iconfont icon-category',
                routeName: 'Articles'
            },
            {
                name: 'tags',
                label: '标签模式',
                icon: 'iconfont icon-tag',
                routeName: 'Tags'
            }
        ]
    },
    {
        name: 'sites',
        label: '网站导航',
        icon: 'iconfont icon-nav',
        routeName: 'Sites'
    },
    {
        name: 'life',
        label: '生活',
        icon: 'iconfont icon-life',
        routeName: 'Moments'
    },
]

/* =========================================================
 * 社交链接
 * ========================================================= */

interface Social {
    name: string
    icon: string
    url: string
}

const socials: Social[] = [
    {
        name: 'GitHub',
        icon: 'iconfont icon-github',
        url: 'https://github.com'
    },
    {
        name: 'Bilibili',
        icon: 'iconfont icon-bilibili',
        url: 'https://www.bilibili.com'
    },
    {
        name: 'Email',
        icon: 'iconfont icon-email',
        url: 'mailto:you@example.com'
    }
]

/* =========================================================
 * Logo 面板
 * ========================================================= */

const isLogoPanelOpen = ref(false)

const openLogoPanel = () => {
    isLogoPanelOpen.value = true
    isSettingPanelOpen.value = false
    openedMenu.value = null
}

const toggleLogoPanel = () => {
    if (isLogoPanelOpen.value) {
        isLogoPanelOpen.value = false
    } else {
        openLogoPanel()
    }
}

const closeLogoPanel = () => {
    isLogoPanelOpen.value = false
}

/* =========================================================
 * 设置面板
 * ========================================================= */

const isSettingPanelOpen = ref(false)

const openSettingPanel = () => {
    isSettingPanelOpen.value = true
    isLogoPanelOpen.value = false
    openedMenu.value = null
}

const toggleSettingPanel = () => {
    if (isSettingPanelOpen.value) {
        isSettingPanelOpen.value = false
    } else {
        openSettingPanel()
    }
}

const closeSettingPanel = () => {
    isSettingPanelOpen.value = false
}

/* =========================================================
 * 设置项
 * ========================================================= */

/** 壁纸自动播放间隔（秒） */
const playSpeed = ref(store.playSpeed)

watch(playSpeed, value => {
    store.playSpeed = value
})

/** 减少动态效果 */
const reduceMotion = ref(false)

watch(reduceMotion, value => {
    document.documentElement.classList.toggle('reduce-motion', value)
})

/** 主题 */
const themes = [
    { label: '浅色', value: 'light' },
    { label: '深色', value: 'dark' },
    { label: '跟随系统', value: 'auto' }
] as const

const themeMode = ref<'light' | 'dark' | 'auto'>('auto')

watch(themeMode, value => {
    document.documentElement.dataset.theme = value
})

/* =========================================================
 * 子菜单
 * ========================================================= */

const openedMenu = ref<string | null>(null)

const toggleMenu = (item: GhubItem) => {
    if (!item.children?.length) {
        return
    }

    openedMenu.value =
        openedMenu.value === item.name
            ? null
            : item.name
}

/* =========================================================
 * 导航点击
 * ========================================================= */

const handleItemClick = (item: GhubItem) => {
    if (item.children?.length) {
        toggleMenu(item)
        return
    }

    if (item.routeName) {
        router.push({
            name: item.routeName
        })

        openedMenu.value = null
    }
}

/* =========================================================
 * 子菜单点击
 * ========================================================= */

const handleChildClick = (child: GhubChild) => {
    if (child.external && child.url) {
        window.open(
            child.url,
            '_blank',
            'noopener,noreferrer'
        )

        return
    }

    if (child.routeName) {
        router.push({
            name: child.routeName
        })

        openedMenu.value = null
    }
}

/* =========================================================
 * 判断当前路由
 * ========================================================= */

const isActive = (item: GhubItem) => {
    if (item.routeName) {
        return route.name === item.routeName
    }

    if (item.children?.length) {
        return item.children.some(
            child => child.routeName === route.name
        )
    }

    return false
}

const isChildActive = (child: GhubChild) => {
    return !!child.routeName &&
        route.name === child.routeName
}

/* =========================================================
 * 首页
 * ========================================================= */

const goHome = () => {
    router.push({
        name: 'Home'
    })

    closeLogoPanel()
}

/* =========================================================
 * 回到顶部
 * ========================================================= */

const showBackTop = ref(false)

const checkScroll = () => {
    showBackTop.value = window.scrollY > 300
}

const backToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

/* =========================================================
 * 点击页面其他位置
 * ========================================================= */

const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null

    if (!target) {
        return
    }

    if (!target.closest('.ghub')) {
        openedMenu.value = null
    }
}

/* =========================================================
 * ESC
 * ========================================================= */

const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
        return
    }

    openedMenu.value = null
    isLogoPanelOpen.value = false
    isSettingPanelOpen.value = false
}

/* =========================================================
 * 生命周期
 * ========================================================= */

onMounted(() => {
    window.addEventListener(
        'scroll',
        checkScroll,
        {
            passive: true
        }
    )

    document.addEventListener(
        'click',
        onDocumentClick
    )

    window.addEventListener(
        'keydown',
        onKeydown
    )

    checkScroll()

    // 静默尝试恢复上次目录（不弹授权框）
    tryRestore()
})

watch(
    () => localList.value,
    list => {
        store.clearLocalWallpapers()
        if (list.length) store.addLocalWallpapers(list)
    },
    { deep: false }
)
onBeforeUnmount(() => {
    window.removeEventListener(
        'scroll',
        checkScroll
    )

    document.removeEventListener(
        'click',
        onDocumentClick
    )

    window.removeEventListener(
        'keydown',
        onKeydown
    )

    // 注意：这里不要 releaseAll()，否则离开组件会回收 blob，
    // 而壁纸是全站共享的，会导致壁纸失效。
})

/* =========================================================
 * 路由变化后关闭菜单
 * ========================================================= */

watch(
    () => route.fullPath,
    () => {
        openedMenu.value = null
    }
)
</script>


<style lang="scss" scoped>
/* =========================================================
 * 设计令牌
 * ========================================================= */

$ghub-size: 40px;
$ghub-gap: 8px;

$ghub-bg: rgba(255, 255, 255, 0.58);
$ghub-bg-hover: rgba(255, 255, 255, 0.88);

$ghub-border: rgba(255, 255, 255, 0.75);

$ghub-text: #343a46;
$ghub-active: #4285f4;

$ghub-shadow: 0 8px 28px rgba(31, 36, 48, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

$ghub-blur: blur(14px) saturate(160%);

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

    gap: 20px;

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
 * Logo
 * ========================================================= */

.ghub-logo {

    position: relative;

    width: $ghub-size;
    height: $ghub-size;

    flex-shrink: 0;

    padding: 0;

    border: 1px solid var(--gh-logo-border);

    border-radius: 50%;

    background: var(--gh-logo-bg);

    backdrop-filter: $ghub-blur;
    -webkit-backdrop-filter: $ghub-blur;



    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        background 0.25s ease,
        box-shadow 0.25s ease;

    img {

        width: 100%;
        height: 100%;

        padding: 5px;

        border-radius: 50%;

        display: block;
    }

    &:hover {

        transform: scale(1.1);

    }

    &.is-open {
        opacity: var(--gh-logo-opacity-active);
        transform:
            rotate(90deg) scale(1.06);


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

    background: rgba(255, 255, 255, 0.42);

    backdrop-filter: $ghub-blur;
    -webkit-backdrop-filter: $ghub-blur;

    box-shadow:
        0 10px 32px rgba(31, 36, 48, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
}


/* =========================================================
 * 单个导航
 * ========================================================= */

.ghub-item {

    position: relative;

    width: 30px;
    height: 30px;

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

    background: transparent;

    color: var(--gc-option-fc);
    background: var(--gc-option-bg);
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        color 0.25s ease,
        background 0.25s ease,
        transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.25s ease;

    i {

        font-size: 16px;

        line-height: 1;

        transition:
            transform 0.25s ease,
            color 0.25s ease;
    }


    &:hover {

        color: var(--gc-option-fc-hover);

        background: var(--gc-option-bg-hover);

        transform: scale(1.08);

        box-shadow:
            0 5px 14px rgba(31, 36, 48, 0.1);

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

        color: white;

        background-color: #357052;

        box-shadow:
            0 5px 16px rgba(66, 133, 244, 0.32);

        >i {
            color: white;
        }
    }
}


/* =========================================================
 * 有子菜单
 * ========================================================= */

.ghub-item.is-expanded {

    .ghub-button {

        background: var(--gc-option-bg-active);

        i {
            color: var(--gc-option-fc-active);
            display: none;
        }

        transform: scale(0.5);

        box-shadow: none;
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

    color: #303746;

    background: rgba(255, 255, 255, 0.94);

    border: 1px solid rgba(255, 255, 255, 0.85);

    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    box-shadow:
        0 6px 18px rgba(31, 36, 48, 0.14);

    font-size: 11px;
    line-height: 1.4;

    pointer-events: none;

    opacity: 0;

    transform:
        translateY(-50%) translateX(5px) scale(0.92);

    transform-origin: right center;

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

        background: rgba(255, 255, 255, 0.94);

        border-right: 1px solid rgba(255, 255, 255, 0.85);
        border-top: 1px solid rgba(255, 255, 255, 0.85);

        transform:
            translateY(-50%) rotate(45deg);
    }
}


.ghub-button:hover .ghub-tooltip {

    opacity: 1;

    transform:
        translateY(-50%) translateX(0) scale(1);
}


/* =========================================================
 * 子菜单（向左弹出）
 * ========================================================= */

.ghub-submenu {

    position: absolute;

    right: calc(100% + 20px);
    top: 50%;
    min-width: 165px;

    padding: 9px;

    border-radius: 16px;

    border: 1px solid rgba(255, 255, 255, 0.75);

    background: rgba(255, 255, 255, 0.72);

    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);

    box-shadow:
        0 12px 35px rgba(31, 36, 48, 0.16),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);

    transform-origin: right center;
    transform:
        translateY(-50%) translateX(0);

    z-index: 9010;
}


/* =========================================================
 * 子菜单标题
 * ========================================================= */

.ghub-submenu-title {

    padding: 5px 9px 8px;

    color: #7a8190;

    font-size: 11px;

    letter-spacing: 0.5px;
}


/* =========================================================
 * 子菜单按钮
 * ========================================================= */

.ghub-submenu-item {

    width: 100%;

    min-height: 38px;

    padding: 0 10px;

    border: 0;

    border-radius: 10px;

    background: transparent;

    color: #343a46;
    cursor: pointer;

    display: flex;
    align-items: center;

    gap: 10px;

    font-size: 13px;

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

        background: rgba(255, 255, 255, 0.78);

        transform: translateX(-2px);
    }


    &.active {

        color: $ghub-active;

        background: rgba(66, 133, 244, 0.1);

        font-weight: 500;
    }
}




.ghub-external {

    opacity: 0.45;

    font-size: 12px !important;
}


/* =========================================================
 * 子菜单动画（从右向左滑出）
 * ========================================================= */

.ghub-submenu-enter-active,
.ghub-submenu-leave-active {

    transition:
        opacity 0.22s ease,
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}


.ghub-submenu-enter-from,
.ghub-submenu-leave-to {

    opacity: 0;

    transform:
        translateY(-50%) translateX(10px) scale(0.94);
}


/* =========================================================
 * 设置按钮
 *
 * 已移入 .ghub-nav，作为普通 .ghub-item 内的按钮，
 * 尺寸 / 布局完全复用 .ghub-button，仅补充设置图标字号的
 * 细节（与导航图标保持一致，不产生额外视觉差异）。
 * ========================================================= */

.ghub-setting {

    /* 基础态：复用 .ghub-button 的所有视觉与交互 */
    i {
        font-size: 16px;
    }

    /* 面板打开态：缩小一半 + 隐藏图标 + 激活色背景 */
    &.is-open,
    &.is-open:hover {

        transform: scale(0.5);

        background: var(--gc-option-bg-active);

        box-shadow: none;

        /* 隐藏图标（含 hover 时的放大） */
        >i {
            display: none;
        }

        /* 打开时不再显示 tooltip */
        .ghub-tooltip {
            display: none;
        }
    }
}


/* =========================================================
 * 回到顶部：占位槽 + 绝对定位按钮
 * ========================================================= */

.ghub-top-slot {

    position: relative;

    width: $ghub-size;
    height: $ghub-size;

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

    background: $ghub-bg;

    backdrop-filter: $ghub-blur;
    -webkit-backdrop-filter: $ghub-blur;

    box-shadow: $ghub-shadow;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
        background 0.25s ease,
        color 0.25s ease;

    i {
        font-size: 20px;
    }


    &:hover {

        color: white;

        background: $ghub-active;

        transform: scale(1.08);

        box-shadow:
            0 8px 22px rgba(66, 133, 244, 0.28);
    }
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

    transform:
        translateY(6px) scale(0.72);
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

    background: rgba(15, 20, 30, 0.18);

    backdrop-filter: blur(8px) saturate(120%);
    -webkit-backdrop-filter: blur(8px) saturate(120%);
}


/* =========================================================
 * 面板
 * ========================================================= */

.ghub-panel {

    width: 320px;

    max-width: calc(100vw - 100px);

    padding: 20px;

    border-radius: 18px;

    border: 1px solid rgba(255, 255, 255, 0.7);

    background: var(--gh-logo-panel-bg);

    backdrop-filter: blur(18px) saturate(160%);
    -webkit-backdrop-filter: blur(18px) saturate(160%);

    color: #252b36;

    box-shadow:
        0 18px 50px rgba(31, 36, 48, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.countdown-container {

    margin-top: 16px;
}


/* =========================================================
 * 面板头部
 * ========================================================= */

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

    background: rgba(255, 255, 255, 0.7);

    border: 1px solid rgba(255, 255, 255, 0.9);

    cursor: pointer;

    transition:
        transform 0.25s ease;

    &:hover {
        transform: scale(1.08);
    }
}


.ghub-panel-site {

    h3 {

        margin: 0;

        color: #252b36;

        font-size: 16px;
        font-weight: 600;

        letter-spacing: 1px;
    }


    p {

        margin: 5px 0 0;

        color: #7a8190;

        font-size: 12px;
    }
}


/* =========================================================
 * 个人介绍
 * ========================================================= */

.ghub-panel-profile {

    padding: 12px 14px;

    border-radius: 11px;

    background: rgba(255, 255, 255, 0.45);

    border: 1px solid rgba(255, 255, 255, 0.65);

    p {

        margin: 0;

        color: #4a5260;

        font-size: 13px;

        line-height: 1.7;
    }
}


/* =========================================================
 * 社交
 * ========================================================= */

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

        color: #343a46;

        background: rgba(255, 255, 255, 0.55);

        border: 1px solid rgba(255, 255, 255, 0.75);

        text-decoration: none;

        display: flex;
        align-items: center;
        justify-content: center;

        transition:
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
            background 0.2s ease,
            color 0.2s ease;

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

            color: #343a46;

            background: white;

            font-size: 10px;

            opacity: 0;

            pointer-events: none;

            transform:
                translateX(-50%) translateY(4px);

            transition:
                opacity 0.2s ease,
                transform 0.2s ease;
        }


        &:hover {

            color: $ghub-active;

            background: white;

            transform:
                translateY(-3px) scale(1.08);

            span {

                opacity: 1;

                transform:
                    translateX(-50%) translateY(0);
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

        color: #252b36;

        font-size: 16px;
        font-weight: 600;

        letter-spacing: 1px;
    }
}


.ghub-setting-group {

    &+& {
        margin-top: 16px;
    }

    padding: 12px 14px;

    border-radius: 11px;

    background: rgba(255, 255, 255, 0.45);

    border: 1px solid rgba(255, 255, 255, 0.65);
}


.ghub-setting-label {

    margin-bottom: 10px;

    color: #7a8190;

    font-size: 11px;

    letter-spacing: 0.5px;
}


.ghub-setting-row {

    display: flex;
    align-items: center;

    gap: 10px;

    color: #4a5260;

    font-size: 13px;

    &+& {
        margin-top: 10px;
    }

    >span:first-child {
        flex-shrink: 0;
    }
}


.ghub-setting-range {

    flex: 1;

    accent-color: $ghub-active;
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

    background: rgba(0, 0, 0, 0.05);

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

        box-shadow:
            0 0 0 3px rgba(66, 133, 244, 0.18);
    }
}


.ghub-setting-theme {

    flex: 1;

    padding: 2px 6px;

    border: 1px solid rgba(255, 255, 255, 0.75);

    border-radius: 8px;

    background: rgba(255, 255, 255, 0.55);

    color: #4a5260;

    cursor: pointer;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;

    font-size: 11px;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.85);
    }

    &.active {

        color: $ghub-active;

        background: rgba(66, 133, 244, 0.1);

        border-color: rgba(66, 133, 244, 0.35);
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
    border: 1px solid rgba(66, 133, 244, 0.35);
    border-radius: 7px;
    background: rgba(66, 133, 244, 0.1);
    color: #4285f4;
    font-size: 11px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: rgba(66, 133, 244, 0.18);
    }
}

.ghub-setting-tip {
    margin-top: 8px;
    color: #7a8190;
    font-size: 11px;
}


/* =========================================================
 * 面板动画（自右向左展开）
 * ========================================================= */

.ghub-panel-enter-active,
.ghub-panel-leave-active {

    transition:
        opacity 0.25s ease;
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

    transform:
        translateX(20px) scale(0.92);
}


/* =========================================================
 * 小屏幕
 * ========================================================= */

@media (max-width: 768px) {

    .ghub {

        right: 10px;
    }


    .ghub-nav {

        gap: 5px;

        padding: 7px 5px;
    }


    .ghub-logo,
    .ghub-button,
    .ghub-top-slot,
    .ghub-top-button {

        width: 25px;
        height: 25px;
    }

    .ghub-item {
        width: 25px;
        height: 25px;
    }


    .ghub-button i {

        font-size: 19px;
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
}
</style>