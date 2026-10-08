import { computed, ref, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import { wallpapers } from '@/config/wallpaper'
import type { LocalWallpaperItem } from '@/utils/useLocalWallpaper'

export const useBackgroundStore = defineStore('background', () => {
    const backgroundList = shallowRef(wallpapers)
    const localWallpapers = shallowRef<LocalWallpaperItem[]>([])

    const currentIndex = ref(0)
    const playSpeed = ref(30)

    /** 是否固定当前壁纸（暂停自动轮换） */
    const pinned = ref(false)

    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`

    const resolveUrl = (url?: string) => {
        if (!url) return ''
        if (/^(https?:)?\/\/|^(data|blob):/i.test(url)) return url
        const cleanUrl = url.replace(/^(\.\/|\/)+/, '')
        return `${baseUrl}${cleanUrl}`
    }

    /* ---------------- 本地壁纸 ---------------- */

    const addLocalWallpapers = (items: LocalWallpaperItem[]) => {
        localWallpapers.value = [...localWallpapers.value, ...items]
    }

    const removeLocalWallpaper = (id: string) => {
        const target = localWallpapers.value.find(w => w.id === id)
        if (target) URL.revokeObjectURL(target.url)
        localWallpapers.value = localWallpapers.value.filter(w => w.id !== id)
    }

    const clearLocalWallpapers = () => {
        localWallpapers.value.forEach(w => URL.revokeObjectURL(w.url))
        localWallpapers.value = []
    }

    /* ---------------- 合并列表 ---------------- */

    const backgrounds = computed(() => {
        const builtin = backgroundList.value.map(item => ({
            ...item,
            isLocal: false,
            url: resolveUrl(item.url),
        }))
        const local = localWallpapers.value.map(item => ({
            ...item,
            url: resolveUrl(item.url),
        }))
        return [...builtin, ...local]
    })

    const currentBackground = computed(
        () => backgrounds.value[currentIndex.value] || null
    )

    /* ---------------- 切换 ---------------- */

    const setCurrentBackground = (index: number) => {
        if (index < 0 || index >= backgrounds.value.length) return
        currentIndex.value = index
    }

    /** 按对象设置（本地库缩略图点击用，避免 index 错位） */
    const setCurrentWallpaper = (item: { id?: string; name?: string }) => {
        const idx = backgrounds.value.findIndex(
            b => (item.id && (b as any).id === item.id) || b.name === item.name
        )
        if (idx >= 0) currentIndex.value = idx
    }

    /** 轮换时跳过固定 */
    const nextBackground = () => {
        if (pinned.value) return
        const length = backgrounds.value.length
        if (!length) return
        currentIndex.value = (currentIndex.value + 1) % length
    }

    const previousBackground = () => {
        const length = backgrounds.value.length
        if (!length) return
        currentIndex.value = (currentIndex.value - 1 + length) % length
    }

    /* ---------------- 固定壁纸 ---------------- */

    const pinCurrent = () => {
        pinned.value = true
    }

    const unpin = () => {
        pinned.value = false
    }

    const togglePin = () => {
        pinned.value = !pinned.value
    }

    /** 固定状态持久化 */
    watch(pinned, v => localStorage.setItem('wallpaper-pinned', String(v)), {
        immediate: false,
    })

    // 初始化读取
    if (localStorage.getItem('wallpaper-pinned') === 'true') {
        pinned.value = true
    }

    return {
        // 列表
        backgroundList,
        localWallpapers,
        backgrounds,
        // 状态
        currentIndex,
        currentBackground,
        playSpeed,
        pinned,
        // 操作
        setCurrentBackground,
        setCurrentWallpaper,
        nextBackground,
        previousBackground,
        pinCurrent,
        unpin,
        togglePin,
        // 本地库
        addLocalWallpapers,
        removeLocalWallpaper,
        clearLocalWallpapers,
    }
})