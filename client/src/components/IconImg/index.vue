<template>
    <img :src="currentSrc" :alt="alt" :class="imgClass" @error="handleError">
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { honeConfig } from '../../config/main'

import defaultIcon from '@/assets/imgs/logo/favicon.ico'

interface Props {
    name?: string
    alt?: string
    imgClass?: string
}

const props = withDefaults(
    defineProps<Props>(),
    {
        name: '',
        alt: '',
        imgClass: ''
    }
)

const getRemoteUrl = (name?: string) => {
    if (!name) return defaultIcon

    return `${honeConfig.iconServerIP}${name}.png`
}

const currentSrc = ref(getRemoteUrl(props.name))

watch(
    () => props.name,
    (value) => {
        currentSrc.value = getRemoteUrl(value)
    },
    {
        immediate: true
    }
)

const handleError = () => {
    currentSrc.value = defaultIcon
}
</script>