<template>
    <div class="footer">
        <div class="site-name">界·衡千帆</div>
        <div class="site-intro">{{ honeConfig.siteIntro }}</div>
        <div class="badges">
            <!-- <img alt="Static Badge"src="https://img.shields.io/badge/vue-技术框架-red.svg?logo=vitepress&logoColor=white&labelColor=79bfc9" /> -->

            <img alt="Static Badge"
                src="https://img.shields.io/badge/%E9%BB%94ICP%E5%A4%87-2023015500%E5%8F%B7_3-black.svg?logo=codementor&logoColor=white&labelColor=black" />


        </div>
    </div>
</template>

<script lang="ts" setup>
import { honeConfig } from '@/config/main';
</script>

<style lang="scss" scoped>
.footer {

    min-height: 100px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin: 20px;
    padding: 20px 40px;
    font-size: 14px;
    background-color: var(--bg-color);
    border-radius: 20px;

    .site-name {
        padding: 4px 12px;
        background-color: #111;
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: .625rem;




    }

    .site-intro {
        color: #666;
    }

    .badges {
        display: flex;
        gap: 5px;
    }
}
</style>