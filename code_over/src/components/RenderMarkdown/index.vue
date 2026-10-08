<template>
    <article ref="root" class="markdown-body" v-html="html" />
</template>

<script setup lang="ts">
import { ref, watch, nextTick, createApp } from 'vue'
import CodeBlock from '../CodeBlock/index.vue'

const props = defineProps<{
    html: string
}>()

const root = ref<HTMLElement | null>(null)

const mountedMap = new WeakMap<HTMLElement, any>()

function hydrate() {

    if (!root.value) return

    const blocks =
        root.value.querySelectorAll<HTMLElement>('.md-code')

    blocks.forEach(el => {

        if (mountedMap.has(el)) return

        const app = createApp(CodeBlock, {
            lang: el.dataset.lang || 'text',
            code: decodeURIComponent(el.dataset.code || '')
        })

        app.mount(el)

        mountedMap.set(el, app)
    })
}

watch(
    () => props.html,
    async () => {
        await nextTick()
        hydrate()
    },
    { immediate: true }
)
</script>