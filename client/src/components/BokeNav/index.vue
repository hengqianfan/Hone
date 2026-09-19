<template>
    <div class="controller-all">

        <div class="menu">

            <div class="menu-item" v-for="(item, index) in navlist" :key="index" @mouseenter="activeIndex = index"
                @mouseleave="activeIndex = null">

                <!-- 一级菜单 -->
                <div class="option" @click="item.children?.length ? null : toPage(item.router)">
                    <i :class="`iconfont ${item.icon}`"></i>
                </div>

                <!-- 二级菜单 -->
                <Transition name="submenu">
                    <div v-if="activeIndex === index && item.children?.length" class="submenu">
                        <div class="submenu-item" v-for="(child, childIndex) in item.children" :key="childIndex"
                            @click.stop="toPage(child.router)">
                            <i v-if="child.icon" :class="`iconfont ${child.icon}`"></i>

                            <span>{{ child.text }}</span>
                        </div>
                    </div>
                </Transition>

            </div>

        </div>

    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeIndex = ref<number | null>(null)

interface NavItem {
    icon: string
    text: string
    router?: string
    children?: {
        icon?: string
        text: string
        router: string
    }[]
}

const navlist: NavItem[] = [
    {
        icon: 'icon-home',
        text: '首页',
        router: 'Home'
    },

    {
        icon: 'icon-book',
        text: '书籍',
        children: [

            {
                icon: 'icon-category',
                text: '分类模式',
                router: 'Articles'
            },
            {
                icon: 'icon-tag',
                text: '标签模式',
                router: 'Tags'
            },
            {
                icon: 'icon-collection',
                text: '合集模式',
                router: 'Articles'
            }
        ]
    },

    {
        text: '心情瞬间',
        router: 'Moments',
        icon: 'icon-life'
    },

    {
        icon: 'icon-nav',
        text: '网站',
        router: 'Sites'
    },
    // {
    //     icon: 'icon-nav',
    //     text: '网站',
    //     router: 'SitesManage'
    // },


    {
        icon: 'icon-settings',
        text: '设置',
        router: 'Settings'
    }
]

const toPage = (path?: string) => {
    if (path) {
        router.push({
            name: path
        })
    }
}
</script>

<style lang="scss" scoped>
.controller-all {

    position: fixed;

    top: 12px;
    left: 50%;
    transform: translateX(-50%);

    z-index: 9999;

    display: flex;
    align-items: center;

    padding: 10px 20px;

    border: 0.3px solid rgba(255, 255, 255, 0.3);
    border-radius: 30px;

    background-color: rgba(0, 0, 0, 0.5);

    .menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 15px;
    }

    /*
     * 一级菜单容器
     *
     * 这里非常重要：
     * submenu 是 absolute，
     * 所以需要让 menu-item 成为定位参考。
     */
    .menu-item {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    /*
     * 一级按钮
     */
    .option {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;

        border: 0.3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;

        background-color: rgba(255, 255, 255, 0.4);

        cursor: pointer;

        i {
            font-size: 20px;
            color: var(--icon-color);

            transition: color 0.3s ease-in-out;
        }

        &:hover {

            i {
                color: var(--primary-color);
            }
        }
    }


    /*
     * =========================
     * 二级菜单
     * =========================
     */

    .submenu {

        position: absolute;

        /*
         * 一级按钮下面
         */
        top: calc(100% + 20px);
        left: 50%;

        transform: translateX(-50%);

        display: flex;
        flex-direction: column;
        align-items: center;

        min-width: 110px;
        gap: 10px;

        padding: 15px;

        border: 0.3px solid rgba(255, 255, 255, 0.3);
        border-radius: 14px;

        background-color: rgba(0, 0, 0, 0.65);

        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);

        box-shadow:
            0 8px 25px rgba(0, 0, 0, 0.15);

        /*
         * 防止鼠标从一级菜单移动到二级菜单时
         * 因为间隔导致菜单消失
         */
        &::before {
            content: '';

            position: absolute;

            top: -10px;
            left: 0;

            width: 100%;
            height: 10px;
        }
    }

    .submenu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 5px;
        white-space: nowrap;
        color: var(--text-color);

        font-size: 12px;

        cursor: pointer;

        transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;


        i {

            font-size: 14px;
        }

        &:hover {

            color: var(--primary-color);

            background-color: rgba(255, 255, 255, 0.12);

            // transform: translateX(2px);
            transform: scale(1.1);
        }
    }


    /*
     * =========================
     * 二级菜单动画
     * =========================
     */

    .submenu-enter-active,
    .submenu-leave-active {
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
    }

    .submenu-enter-from,
    .submenu-leave-to {

        opacity: 0;

        transform:
            translateX(-50%) translateY(-6px);
    }


    /*
     * =========================
     * 其他原来的样式
     * =========================
     */

    .site-logo {
        width: 50px;
        height: 50px;

        padding: 5px;

        border-radius: 50%;

        overflow: hidden;

        img {
            width: 100%;
            height: 100%;

            object-fit: cover;

            border-radius: 50%;
        }
    }

    .site-info {

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .site-name {

            font-size: 14px;

            color: var(--text-color);

            font-family: '优设标题黑', sans-serif;

            letter-spacing: 1px;

            text-shadow:
                0 1px 0 rgba(255, 255, 255, 0.6),
                0 2px 4px rgba(0, 0, 0, 0.15);
        }
    }
}
</style>