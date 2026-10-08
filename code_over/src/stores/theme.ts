// stores/theme.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeName = 'light' | 'dark'

const STORAGE_KEY = 'app-theme'

function readInitialTheme(): ThemeName {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    // 跟随系统
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
    const theme = ref<ThemeName>(readInitialTheme())

    // 同步到 <html data-theme>
    const applyTheme = (val: ThemeName) => {
        document.documentElement.setAttribute('data-theme', val)
        localStorage.setItem(STORAGE_KEY, val)
    }

    // 立即应用一次
    applyTheme(theme.value)

    // 之后每次变化自动应用
    watch(theme, applyTheme)

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    const setTheme = (val: ThemeName) => {
        theme.value = val
    }

    return { theme, toggleTheme, setTheme }
})