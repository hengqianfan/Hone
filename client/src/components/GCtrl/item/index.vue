<template>
    <div class="ctrl-item" :title="title" @click="$emit('click')">
        <i :class="`iconfont ${icon}`"></i>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    icon: string
    title?: string
}>()

defineEmits<{
    (e: 'click'): void
}>()
</script>

<style lang="scss" scoped>
.ctrl-item {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    border: 0.3px solid var(--nav-border-color);
    border-radius: 50%;

    background-color: var(--nav-option-bg);

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    cursor: pointer;

    transition:
        transform 0.25s ease,
        border-color 0.25s ease;

    i {
        font-size: 20px;
        color: var(--sub-font-color);
        transition: color 0.3s ease-in-out;
    }

    &:hover {
        transform: translateY(-3px);

        i {
            color: var(--main-font-color);
        }
    }

    &:active {
        transform: translateY(-1px) scale(0.95);
    }
}
</style>