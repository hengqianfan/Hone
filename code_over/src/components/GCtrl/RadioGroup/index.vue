<template>
    <div class="setting-row">
        <div class="label">{{ label }}</div>

        <div class="radio-group">
            <label v-for="opt in options" :key="opt.value" class="radio-item">
                <input type="radio" :name="name" :value="opt.value" :checked="model === opt.value"
                    @change="onChange(opt.value)" />
                <span class="dot"></span>
                <span class="text">{{ opt.label }}</span>
            </label>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { SettingOption } from '@/types/setting'

const props = defineProps<{
    label: string
    name: string
    model: string | number
    options: SettingOption[]
}>()

const emit = defineEmits<{
    (e: 'update:model', value: string | number): void
}>()

const onChange = (value: string | number) => {
    emit('update:model', value)
}
</script>

<style lang="scss" scoped>
.setting-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    gap: 10px;

    font-size: 13px;
    color: var(--main-font-color);

    .label {
        user-select: none;
        width: 100%;




    }
}

.radio-group {
    display: flex;

    /* 关键：从左侧开始排列，不居中 */
    justify-content: flex-start;
    align-items: center;

    /* 允许换行，但换行后依然左对齐 */
    flex-wrap: wrap;

    gap: 8px;

    width: 100%;
}

.radio-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;

    padding: 4px 10px;

    border: 0.3px solid var(--nav-border-color);
    border-radius: 6px;

    cursor: pointer;

    transition: background-color 0.2s ease, border-color 0.2s ease;

    input {
        display: none;
    }

    .dot {
        flex: 0 0 auto;

        width: 12px;
        height: 12px;

        border: 1.5px solid var(--nav-border-color);
        border-radius: 50%;

        position: relative;

        transition: border-color 0.2s ease;

        &::after {
            content: '';
            position: absolute;
            inset: 2px;

            border-radius: 50%;
            background: var(--main-font-color);

            transform: scale(0);
            transition: transform 0.2s ease;
        }
    }

    .text {
        font-size: 12px;
        white-space: nowrap;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.08);
    }

    /* 选中态 */
    input:checked~.dot {
        border-color: var(--main-font-color);

        &::after {
            transform: scale(1);
        }
    }

    input:checked~.text {
        color: var(--main-font-color);
    }
}
</style>