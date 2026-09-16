import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useSettingStore = defineStore(
    'setting',
    () => {

        // 当前视频
        const videoName = ref('乡村夜景')


        // 修改视频
        const changeVideo = (name: string) => {
            videoName.value = name
        }


        return {
            videoName,
            changeVideo
        }

    },

)