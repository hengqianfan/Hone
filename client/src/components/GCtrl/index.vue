<template>
    <div class="ctrl-all" ref="rootRef">
        <Transition name="ctrl-slide">
            <div v-if="showSetting" class="ctrl-panel" @click.stop>
                <header class="ctrl-panel-head">
                    <span class="title">
                        <i class="iconfont icon-settings"></i>
                        设置
                    </span>
                </header>

                <div class="ctrl-panel-body">
                    <slot name="setting">
                        <template v-for="item in settingItems" :key="item.key">
                            <!-- 二选一：开关 -->
                            <div v-if="item.type === 'switch'" class="setting-row">
                                <span class="label">{{ item.label }}</span>
                                <label class="switch">
                                    <input type="checkbox" :checked="!!store.state[item.key]"
                                        @change="(e) => onChange(item.key, (e.target as HTMLInputElement).checked)" />
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <!-- 多选一：单选组 -->
                            <RadioGroup v-else-if="item.type === 'radio'" :label="item.label" :name="item.key"
                                :model="store.state[item.key] as string | number" :options="item.options || []"
                                @update:model="(v) => onChange(item.key, v)" />

                            <!-- 多选：勾选组 -->
                            <div v-else-if="item.type === 'checkbox'" class="setting-row-column">
                                <span class="label">{{ item.label }}</span>
                                <div class="checkbox-group">
                                    <label v-for="opt in item.options" :key="opt.value" class="checkbox-item">
                                        <input type="checkbox" :value="opt.value"
                                            :checked="(store.state[item.key] as (string | number)[]).includes(opt.value)"
                                            @change="onCheckboxChange(item.key, opt.value, $event)" />
                                        <span class="box"></span>
                                        <span class="text">{{ opt.label }}</span>
                                    </label>
                                </div>
                            </div>
                        </template>
                    </slot>
                </div>
            </div>
        </Transition>

        <div class="ctrl-btns">
            <Transition name="ctrl-fade">
                <ControlItem v-show="showTop" icon="icon-top" title="回到顶部" @click="scrollToTop" />
            </Transition>

            <!-- 新增：黑白主题快捷切换 -->
            <!-- <ControlItem :icon="isDark ? 'icon-sun' : 'icon-moon'" :title="isDark ? '切换到浅色' : '切换到深色'"
                @click="toggleTheme" /> -->

            <ControlItem :icon="showSetting ? 'icon-close' : 'icon-settings'" :title="showSetting ? '收起设置' : '设置'"
                @click="toggleSetting" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ControlItem from './item/index.vue'
import RadioGroup from './RadioGroup/index.vue'
import { useSettingStore } from '@/stores/settings.ts'
import type { SettingItem, SettingPayload, SettingState } from '@/types/setting'

const store = useSettingStore()

const emit = defineEmits<{
    (e: 'setting-change', payload: { key: string; value: SettingPayload }): void
}>()

/* ---------------- 回到顶部 ---------------- */
const showTop = ref(false)
const THRESHOLD = 300
const onScroll = () => (showTop.value = window.scrollY > THRESHOLD)
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

/* ---------------- 设置面板 ---------------- */
const showSetting = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const closeSetting = () => (showSetting.value = false)
const toggleSetting = () => (showSetting.value = !showSetting.value)

const onDocClick = (e: MouseEvent) => {
    if (!showSetting.value) return
    if (rootRef.value && !rootRef.value.contains(e.target as Node)) closeSetting()
}
const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showSetting.value) closeSetting()
}

/* ---------------- 主题 ---------------- */
const isDark = computed(() => store.state.themeColor === 'dark')

/** 应用主题到 <html data-theme="..."> */
const applyTheme = (mode: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.style.colorScheme = mode
}

/** 一键在黑 / 白之间切换 */
const toggleTheme = () => onChange('themeColor', isDark.value ? 'light' : 'dark')

/* ---------------- 设置项：只描述 UI，值在 store ---------------- */
const settingItems: SettingItem[] = [
    { key: 'blurBg', label: '毛玻璃背景', type: 'switch' },
    { key: 'backTop', label: '显示回到顶部', type: 'switch' },
    {
        key: 'themeColor',
        label: '主题模式',
        type: 'radio',
        options: [
            { label: '浅色', value: 'light' },
            { label: '深色', value: 'dark' }
        ]
    },
    {
        key: 'background',
        label: '布局模式',
        type: 'radio',
        options: [
            { label: '夏夜郊野', value: 'summer' },
            { label: '城市霓虹', value: 'city' },
            { label: '海边列车', value: 'seaside' },
            { label: '森林雪夜', value: 'forest' },
            { label: '窗外雨夜', value: 'rainy' }
        ]
    },
    // 多选示例
    {
        key: 'extra',
        label: '附加效果',
        type: 'checkbox',
        options: [
            { label: '粒子', value: 'particle' },
            { label: '波纹', value: 'ripple' }
        ]
    }
]

/** 统一写入口 */
const onChange = (key: keyof SettingState, value: SettingPayload) => {
    store.set(key, value)
    // 主题类变更立即作用到 DOM（store 的 watch 也会做，这里保证同步生效）
    if (key === 'themeColor') applyTheme(value as 'light' | 'dark')
    emit('setting-change', { key, value })
}

/** checkbox 组：手动算数组 */
const onCheckboxChange = (key: keyof SettingState, value: string | number, e: Event) => {
    const checked = (e.target as HTMLInputElement).checked
    const list = [...((store.state[key] as (string | number)[]) || [])]
    const i = list.indexOf(value)
    if (checked && i === -1) list.push(value)
    if (!checked && i > -1) list.splice(i, 1)
    onChange(key, list)
}

/* ---------------- 生命周期 ---------------- */
onMounted(() => {
    // 首次进入时把已持久化的主题应用到 DOM
    applyTheme(isDark.value ? 'dark' : 'light')

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKeydown)
    onScroll()
})
onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKeydown)
})
</script>

<style lang="scss" scoped>
.ctrl-all {
    position: fixed;

    /* 右下角悬浮 */
    right: 20px;
    bottom: 24px;

    z-index: 9999;

    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 12px;

    /* 主题切换时颜色过渡更柔和 */
    transition: color 0.25s ease;
}

/* ============ 按钮组 ============ */
.ctrl-btns {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

/* ============ 设置面板 ============ */
.ctrl-panel {
    width: 300px;
    max-height: 70vh;
    overflow-y: auto;

    padding: 16px;

    border: 0.3px solid var(--nav-border-color);
    border-radius: 14px;

    background-color: var(--nav-bg);

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    /* 面板与按钮组的对齐 */
    margin-bottom: 2px;

    transition: background-color 0.25s ease, border-color 0.25s ease;
}

.ctrl-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding-bottom: 10px;
    margin-bottom: 10px;

    border-bottom: 0.3px solid var(--nav-border-color);

    .title {
        display: flex;
        align-items: center;
        gap: 8px;

        font-size: 14px;
        color: var(--main-font-color);
        letter-spacing: 1px;

        i {
            font-size: 16px;
        }
    }

    .close {
        font-size: 16px;
        color: var(--main-font-color);

        cursor: pointer;

        transition: color 0.25s ease, transform 0.25s ease;

        &:hover {
            color: var(--sub-font-color);

            transform: rotate(90deg);
        }
    }
}

.ctrl-panel-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* ============ 默认设置项样式（插槽复用） ============ */
.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 13px;
    color: var(--main-font-color);

    .label {
        user-select: none;
    }
}

.switch {
    position: relative;
    display: inline-block;
    width: 38px;
    height: 20px;

    input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked+.slider {
            background-color: var(--main-font-color);
        }

        &:checked+.slider::before {
            transform: translateX(18px);
        }
    }

    .slider {
        position: absolute;
        inset: 0;

        border-radius: 20px;
        /* 用主题变量替代写死的白色，浅色主题下也看得见 */
        background-color: var(--nav-border-color);
        opacity: 0.6;

        cursor: pointer;
        transition: background-color 0.25s ease, opacity 0.25s ease;

        &::before {
            content: '';
            position: absolute;

            left: 2px;
            top: 2px;

            width: 16px;
            height: 16px;

            border-radius: 50%;
            background-color: #fff;

            transition: transform 0.25s ease;
        }
    }
}

/* ============ 面板横向展开动画 ============ */
.ctrl-slide-enter-active,
.ctrl-slide-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
    transform-origin: right bottom;
}

.ctrl-slide-enter-from,
.ctrl-slide-leave-to {
    opacity: 0;
    transform: translateX(16px) scale(0.96);
}

/* ============ 回到顶部显现动画 ============ */
.ctrl-fade-enter-active,
.ctrl-fade-leave-active {
    transition:
        opacity 0.25s ease,
        transform 0.25s ease;
}

.ctrl-fade-enter-from,
.ctrl-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

/* 竖排设置行（radio / checkbox 组用） */
.setting-row-column {
    display: flex;
    flex-direction: column;
    gap: 8px;

    font-size: 13px;
    color: var(--main-font-color);

    .label {
        user-select: none;
    }
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 0.3px solid var(--nav-border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    input {
        display: none;
    }

    .box {
        width: 12px;
        height: 12px;
        border: 1.5px solid var(--nav-border-color);
        border-radius: 3px;
        transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .text {
        font-size: 12px;
    }

    &:hover {
        /* 用主题变量替代写死的白色 */
        background-color: rgba(127, 127, 127, 0.12);
    }

    input:checked~.box {
        border-color: var(--main-font-color);
        background-color: var(--main-font-color);
    }
}
</style>