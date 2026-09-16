<template>
    <div class="video-background">
        <video ref="videoRef" autoplay muted loop playsinline>
            <source :src="currentVideoSrc" type="video/mp4" />
        </video>
        <div class="mask"></div>
    </div>
</template>

<script setup lang="ts">

import { ref, computed, watch, nextTick } from 'vue'
import { useSettingStore } from '@/stores/settings'


import video1 from '@/assets/videos/乡村夜景.mp4'
import video2 from '@/assets/videos/云雾城市夜晚.mp4'
import video3 from '@/assets/videos/千与千寻.mp4'
import video4 from '@/assets/videos/开阔旷野.mp4'
import video5 from '@/assets/videos/森林雪夜.mp4'
import video6 from '@/assets/videos/雨夜.mp4'
import video7 from '@/assets/videos/雨天圣诞树.mp4'


const settingStore = useSettingStore()



const videoMap: Record<string, string> = {

    '乡村夜景': video1,
    '云雾城市夜晚': video2,
    '千与千寻': video3,
    '开阔旷野': video4,
    '森林雪夜': video5,
    '雨夜': video6,
    '雨天圣诞树': video7

}



const videoRef = ref<HTMLVideoElement | null>(null)



const currentVideoSrc = computed(() => {

    return videoMap[settingStore.videoName]

})




watch(

    () => settingStore.videoName,

    async () => {

        await nextTick()

        const video = videoRef.value

        if (video) {

            video.load()

            try {

                await video.play()

            } catch { }

        }

    }

)


</script>

<style scoped lang="scss">
.video-background {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -10;

    video {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .mask {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.1);
    }
}
</style>