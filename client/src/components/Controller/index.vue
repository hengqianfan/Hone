<template>
    <div class="controller-all">

        <!-- <div class="site-info">
            <div class="site-logo">
                <img src="../../assets/imgs/logo/favicon.ico" alt="">
            </div>
            <div class="site-name">界·衡千帆</div>
        </div> -->


        <div class="menu">
            <div class="option" v-for="(item, index) in navlist" :key="index" @click="toPage(item.router)">
                <i :class="`iconfont ${item.icon}`"></i>
            </div>
        </div>



    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const navlist = [
    { icon: 'icon-home', text: '首页', router: 'Home' },
    { icon: 'icon-book', text: '书籍', router: 'Articles' },
    { icon: 'icon-life', text: '生活', router: 'Life' },

]

const toPage = (path?: string) => {
    if (path) {
        router.push({ name: path })
    }
}
</script>

<style lang="scss" scoped>
.controller-all {

    position: fixed;

    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    gap: 12px;
    z-index: 9999;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 0.3px solid rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.4);
    padding: 10px 20px;
    border-radius: 30px;


    .menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 15px;
    }

    .option {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        border: 0.3px solid rgba(255, 255, 255, 0.3);
        background-color: rgba(255, 255, 255, 0.4);

        i {
            font-size: 20px;
            color: var(--text-color);
            transition: color 0.3s ease-in-out;
        }

        &:hover {
            background-color: rgba(255, 255, 255, 0.5);

            i {
                color: var(--primary-color);
            }
        }
    }


    .site-logo {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        padding: 5px;
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
        // gap: 5px;

        .site-name {
            font-size: 14px;
            color: var(--text-color);
            font-family: '优设标题黑', sans-serif;
            letter-spacing: 1px;
            text-shadow:
                0 1px 0 rgba(255, 255, 255, 0.6), // 上高光
                0 2px 4px rgba(0, 0, 0, 0.15); // 下阴影
        }
    }


}
</style>