// src/stores/setting.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { SettingState, SettingPayload, } from '@/types/setting'

const STORAGE_KEY = 'setting'

/** 把主题写到 <html data-theme> 上 */
function applyTheme(theme: any) {
    document.documentElement.dataset.theme = theme
    // 让原生控件（滚动条、表单）也跟随
    document.documentElement.style.colorScheme = theme
}

export const useSettingStore = defineStore('setting', () => {
    const defaultState: SettingState = {
        blurBg: true,
        backTop: true,
        themeColor: 'dark', // ✅ 与 _themes.scss 的 key 对齐
        background: 'summer',
        extra: [],
    }

    const cache = (() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        } catch {
            return {}
        }
    })()

    const state = ref<SettingState>({ ...defaultState, ...cache })

    /** 统一入口 */
    const set = (key: keyof SettingState, value: SettingPayload) => {
        ; (state.value as Record<string, unknown>)[key] = value
    }

    const reset = () => {
        state.value = { ...defaultState }
    }

    // 初始化：把缓存里的主题立刻应用到 DOM
    applyTheme(state.value.themeColor)

    // 监听主题变化 → 同步 DOM
    watch(
        () => state.value.themeColor,
        (t) => applyTheme(t),
    )

    // 持久化
    watch(
        state,
        (v) => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)),
        { deep: true },
    )

    return { state, set, reset }
})