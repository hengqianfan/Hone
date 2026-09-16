<template>
    <div class="boke-all">
        <VideoBackground />
        <BokeNav />
        <div class="boke-main">
            <router-view></router-view>

        </div>
        <myFooter />
        <!-- <Setting /> -->
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import BokeNav from '@/components/BokeNav/index.vue'
import myFooter from '@/components/Footer/index.vue'
import VideoBackground from '@/components/Background/index.vue'
import Setting from '@/components/Setting/index.vue'

onMounted(() => {
    console.log('布局1加载完成')
})
</script>

<style lang="scss" scoped>
.boke-all {
    width: 100%;
    min-height: 20vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    --transition-default: all 0.6s ease;
    --transition-fast: all 0.3s ease;
    --transition-slow: all 0.8s ease;
    padding: 0px 50px;
    padding-top: 80px;

    .boke-main {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
}


@media (max-width: 768px) {
    .boke-all {
        padding: 20px;
        padding-top: 80px;

    }
}
</style>