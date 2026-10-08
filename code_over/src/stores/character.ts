import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('theme', () => {
    const webMode = ref<'boke' | 'workbench'>('boke')
    // 切换模式
    const setWebMode = (mode: 'boke' | 'workbench') => {
        webMode.value = mode
    }

    return { webMode, setWebMode }
})
