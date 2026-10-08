<template>
    <div class="boke-all">

        <XNav />
        <div class="boke-main">
            <router-view></router-view>

        </div>


    </div>
</template>

<script lang="ts" setup>

import XNav from '@/components/Xhone/nav/index.vue'



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
    padding-top: 70px;

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
        padding-top: 70px;

    }
}
</style>