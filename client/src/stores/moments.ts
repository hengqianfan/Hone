import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { moments } from '@/config/moments'


export const useMomentsStore = defineStore('moments', () => {
    const momentsList = ref(moments)
    // 按时间排序
    momentsList.value.sort((a: any, b: any) => {
        return b.date - a.date
    })

    const cityCount = new Set(
        moments
            .map(item => item.location?.split('·')[1])
            .filter(Boolean)
    ).size

    const latestMoment = computed(() => {
        return momentsList.value[0]
    })

    const threeMoments = computed(() => {
        return momentsList.value.slice(0, 3)
    })



    return { momentsList, latestMoment, cityCount, threeMoments }
})
