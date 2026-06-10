<template>

    <div class="boke-nav" @mouseenter="openMenu()" @mouseleave="closeMenu()">

        <div class="boke-info">
            <div class="boke-logo">
                <img src="../../assets/imgs/logo/favicon.ico" alt="">
            </div>
            <div class="boke-name">{{ honeConfig.siteName }}</div>
            <!-- <div class="boke-name">HONE</div> -->

            <div class="boke-nav-menu" v-if="menuState">
                <div class="boke-nav-menu-item" v-for="(item, index) in navlist" :key="index"
                    @click="toPage(item.router)">
                    <i :class="`iconfont ${item.icon}`"></i>
                    <span>{{ item.text }}</span>
                </div>

            </div>

        </div>

        <div class="time">
            {{ timeString }}
        </div>

        <div class="social-links" v-show="honeConfig.socialLinks">
            <div class="link" v-for="m in honeConfig.socialLinks">
                <i :class="`iconfont icon-${m.icon}`"></i>
            </div>
        </div>





    </div>

</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { honeConfig } from '@/config/main'
import HomeBoke from '@/views/HomeBoke.vue'

const navlist = [
    { icon: 'icon-home', text: '博客首页', router: 'HomeBoke' },
    { icon: 'icon-book', text: '知识体系', router: 'Articles' },
    { icon: 'icon-img', text: '日常动态' },
    { icon: 'icon-cloud', text: '我的宇宙' },


]
const activeIndex = ref<number | null>(null)
const themeStore = useThemeStore()
const router = useRouter()
const toPage = (path?: string) => {
    if (path) {
        router.push({ name: path })
    }
}

const timeString = ref("")

let timer: any = null

function updateTime() {

    const now = new Date()

    const h = String(now.getHours()).padStart(2, "0")
    const m = String(now.getMinutes()).padStart(2, "0")
    const s = String(now.getSeconds()).padStart(2, "0")

    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    // timeString.value = `${h}:${m}:${s}    ${week[now.getDay()]}`
    timeString.value = `${h}:${m}:${s}`


}

onMounted(() => {

    updateTime()

    timer = setInterval(updateTime, 1000)

})

onUnmounted(() => {
    clearInterval(timer)
})

const menuState = ref(false)

let closeTimer: any = null

const openMenu = () => {
    if (closeTimer) clearTimeout(closeTimer)
    menuState.value = true
}

const closeMenu = () => {
    closeTimer = setTimeout(() => {
        menuState.value = false
    }, 150)
}
</script>

<style lang="scss" scoped>
.time {
    // 视觉上的微调
    transform: translateY(1px);
    margin-left: 10px;
    font-size: 12px;
    line-height: 12px;
    letter-spacing: 1px;
    color: #4e667e;
    background-color: rgba(245, 245, 255, 0.8);
    padding: 3px 6px;
    text-align: center;
    border-radius: 15px;
    font-family: '优设标题黑';
    min-width: 80px;
}

.boke-nav {

    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 10px;

    background-color: rgba(245, 245, 255, 0.5);

    display: flex;
    align-items: center;
    padding: 6px 12px;
    z-index: 1000;
    gap: 10px;
    border-radius: 20px;
    border: 0.3px solid rgba(255, 255, 255, 0.3);

    box-shadow:

        0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
        0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影

    .boke-info {
        display: flex;
        align-items: center;
        gap: 10px;



        .boke-logo {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            overflow: hidden;
            transform: translateX(-20%);
            box-shadow:
                0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
                0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .boke-name {
            font-size: 16px;
            color: #272c3f;
            font-family: '优设标题黑', sans-serif;
            letter-spacing: 1px;
            text-shadow:
                0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
                0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影

        }
    }

    .boke-nav-menu {
        position: absolute;
        top: 43px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.7);
        // border-radius: 25px;
        padding: 10px 20px;
        display: flex;
        gap: 10px;
        border-radius: 50px;



        .boke-nav-menu-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #333;
            cursor: pointer;
            transition: all 0.5s ease;
            padding: 5px 10px;
            border-radius: 20px;


            i {
                font-size: 18px;

            }

            span {
                white-space: nowrap;
                font-family: '优设标题黑';
            }

            &:hover {
                background-color: white;
                box-shadow:
                    0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
                    0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影


            }
        }
    }

    .social-links {
        display: flex;
        margin: 0 10px;
        gap: 10px;
        transition: all 0.5s ease;

        .link {
            background-color: rgba(255, 255, 255, 0.8);
            padding: 3px;
            border-radius: 50%;

            transition: all 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.5s ease;


            &:hover {

                box-shadow: none;
                transform: scale(1.15);
                transition: all 0.5s ease;


            }
        }


    }


}

@media (max-width: 600px) {
    .boke-nav {
        .boke-info {
            .boke-name {
                display: none;
            }
        }

        .boke-nav-menu {

            top: 43px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.7);
            // border-radius: 25px;
            padding: 4px;
            display: flex;
            gap: 5px;
            border-radius: 52px;



            .boke-nav-menu-item {
                gap: 2px;
                font-size: 12px;

                padding: 5px 10px;
                border-radius: 20px;

                i {
                    font-size: 12px;

                }


                &:hover {
                    background-color: white;
                    box-shadow:
                        0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
                        0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影


                }
            }
        }
    }
}
</style>