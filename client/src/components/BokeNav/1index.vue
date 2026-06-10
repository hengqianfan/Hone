<template>
    <div class="boke-nav-all">
        <div class="boke-logo">
            <img src="../../assets/imgs/logo/favicon.ico" alt="">
        </div>


        <div class="boke-name">{{ honeConfig.siteName }}</div>


        <div class="time">
            {{ timeString }}
        </div>

    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { honeConfig } from '../../config/main'
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
</script>

<style lang="scss" scoped>
.boke-nav-all {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 5px;
    padding-right: 20px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.5);

    .boke-logo {

        display: flex;
        align-items: center;
        padding: 1px;

        background-color: white;


        border-radius: 20px;

        img {
            width: 24px;
            height: 24px;

            border-radius: 50%;
        }
    }

    .boke-name {
        padding: 4px 8px;
        font-size: 14px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.5);
        font-family: '优设标题黑';
        letter-spacing: 1px;

    }

    .time {
        // background-color: white;
        // background: rgba(255, 255, 255, 0.5);
        padding: 4px 6px;
        // 将元素视觉上对齐
        transform: translateY(-1.2px);
        color: #333;
        font-size: 12px;
        line-height: 12px;
        letter-spacing: 1px;
        border-radius: 0px;
        font-family: '';
    }


}
</style>