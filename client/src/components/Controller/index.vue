<template>
    <div class="controller-all">
        <div class="pages" v-for="(item, index) in navlist" :key="index" :class="{
            'is-active': activeIndex === index,
            'is-idle': activeIndex !== index && activeIndex !== null
        }" @mouseenter="openMenu(index)" @mouseleave="closeMenu">
            <!-- 主按钮 -->
            <div class="switch" @click="toPage(item?.router || '')">
                <i :class="`iconfont ${item.icon}`"></i>
            </div>

            <!-- 菜单 -->
            <transition name="fade">
                <div class="menu" v-if="activeIndex === index && item.children">
                    <div class="menu-item" v-for="(child, i) in item.children" :key="i" @click="toPage(child.router)">
                        <i :class="`iconfont ${child.icon}`"></i>
                        <div class="menu-item-text">{{ child.text }}</div>
                    </div>
                </div>
            </transition>
        </div>


    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()


const router = useRouter()

const activeIndex = ref<number | null>(null)


const bokeNavlist = [
    { icon: 'icon-home', text: '首页', router: 'Start' },
    { icon: 'icon-book', text: '书籍', router: 'Articles' },
    { icon: 'icon-life', text: '生活', router: 'Life' },
    // { icon: 'icon-music', text: '音乐', router: 'HomeMusic' },
    {
        icon: 'icon-settings', text: '设置',
        children: [
            { icon: 'icon-settings', text: '工作台', router: 'HomeWorkbench' },
        ]
    }
]


const workbenchNavlist = [
    { icon: 'icon-home', text: '博客', router: 'HomeBoke' },

]


const navlist = ref(bokeNavlist)






const openMenu = (index: number) => {
    activeIndex.value = index
}

const closeMenu = () => {
    activeIndex.value = null
}




const toPage = (routerName: string) => {
    if (routerName === 'HomeWorkbench') {
        themeStore.setWebMode('workbench')
    } else if (routerName === 'HomeBoke') {
        themeStore.setWebMode('boke')
    }
    router.push({ name: routerName })
}


// 监听 webMode 变化来更新 navlist
watch(
    () => themeStore.webMode,
    (newWebMode) => {
        if (newWebMode === 'workbench') {
            navlist.value = workbenchNavlist
        } else {
            navlist.value = bokeNavlist
        }
    },
    { immediate: true }  // 初始化时也触发一次
)
</script>

<style lang="scss" scoped>
.controller-all {
    position: fixed;
    bottom: 20px;
    right: 20px;

    width: 46px;
    padding: 14px 0;
    gap: 12px;

    border-radius: 30px;
    z-index: 999;
    background: var(--glass-bg);
    backdrop-filter: blur(12px);

    display: flex;
    flex-direction: column;
    align-items: center;

    box-shadow: var(--shadow-soft);

    .pages {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        transition: all 0.25s ease;

        &.is-idle {
            opacity: 0.4;
            transform: scale(0.92);
            filter: blur(0.3px);
        }

        &:hover {
            opacity: 1;
            transform: scale(1.08);
            z-index: 10;
        }

        &.is-active {
            opacity: 1;
            transform: scale(1.08);
            z-index: 20;
        }

        /* 🔘 按钮 */
        .switch {
            width: 25px;
            height: 25px;

            border-radius: 50%;
            background: var(--glass-strong);
            backdrop-filter: blur(8px);

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;
            transition: all 0.2s ease;

            border: 1px solid var(--gray-3);

            i {
                font-size: 15px;
                color: var(--gray-6);
                transition: all 0.2s ease;
            }

            &:hover {
                transform: scale(1.1);
                border-color: var(--theme-color);

                i {
                    color: var(--theme-color);
                }
            }
        }

        /* 📦 菜单 */
        .menu {
            position: absolute;
            right: 80px;
            top: 30%;
            transform: translateY(-50%);

            display: flex;
            gap: 20px;
            padding: 15px 30px;
            background-color: var(--glass-bg);

            backdrop-filter: blur(12px);

            border-radius: 18px;
            box-shadow: var(--shadow-soft);

            .menu-item {
                display: flex;

                flex-direction: column;
                align-items: center;

                cursor: pointer;
                transition: all 0.2s ease;



                i {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(205, 200, 209, 0.541);

                    transition: all 0.2s ease;
                }

                .menu-item-text {
                    margin-top: 3px;
                    font-size: 10px;
                    color: var(--gray-5);
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                &:hover {



                    i {


                        background: var(--glass-bg);
                        backdrop-filter: blur(8px);
                    }

                    .menu-item-text {
                        color: var(--theme-color);
                    }
                }
            }
        }
    }
}

/* 🎬 动画 */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateX(10px);
}
</style>