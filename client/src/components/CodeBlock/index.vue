<template>
    <div ref="root" class="code-block">

        <!-- header -->
        <div class="header">
            <span>{{ lang }}</span>
            <button class="copy-btn">复制</button>
        </div>

        <!-- body -->
        <div class="body">

            <!-- 行号 -->
            <div class="gutter">
                <div v-for="n in lineCount" :key="n" class="line">
                    {{ n }}
                </div>
            </div>

            <!-- code -->
            <div class="code">
                <code class="hljs" v-html="highlighted"></code>
            </div>

        </div>

    </div>
</template>

<!-- <script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const props = defineProps<{
    lang: string
    code: string
}>()

/* =========================
   1. 清洗代码（关键修复）
========================= */

const cleanCode = computed(() => {

    return (props.code || '')
        .replace(/^\n+/, '')   // ❌ 去首空行
        .replace(/\n+$/, '')   // ❌ 去尾空行
})

/* =========================
   2. highlight
========================= */

const highlighted = computed(() => {

    const raw = cleanCode.value

    if (props.lang && hljs.getLanguage(props.lang)) {
        return hljs.highlight(raw, {
            language: props.lang
        }).value
    }

    return hljs.highlightAuto(raw).value
})

/* =========================
   3. 行号（修复尾空行）
========================= */

const lineCount = computed(() => {

    return cleanCode.value
        .split('\n')
        .length
})

/* =========================
   copy
========================= */

function copy() {
    navigator.clipboard.writeText(cleanCode.value)
}
</script> -->

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import hljs from 'highlight.js'

const props = defineProps<{
    lang: string
    code: string
}>()

const root = ref<HTMLElement | null>(null)

/* =========================
   清洗代码
========================= */

const cleanCode = computed(() => {
    return (props.code || '')
        .replace(/^\n+/, '')
        .replace(/\n+$/, '')
})

/* =========================
   highlight
========================= */

const highlighted = computed(() => {

    const raw = cleanCode.value

    if (props.lang && hljs.getLanguage(props.lang)) {
        return hljs.highlight(raw, {
            language: props.lang
        }).value
    }

    return hljs.highlightAuto(raw).value
})

/* =========================
   line count
========================= */

const lineCount = computed(() => {
    return cleanCode.value.split('\n').length
})

/* =========================
   copy（核心修复：事件代理）
========================= */

onMounted(async () => {

    await nextTick()

    if (!root.value) return

    root.value.addEventListener('click', (e) => {

        const target = e.target as HTMLElement

        if (!target.classList.contains('copy-btn')) return

        navigator.clipboard.writeText(cleanCode.value)

        target.textContent = '已复制'

        setTimeout(() => {
            target.textContent = '复制'
        }, 1000)
    })
})
</script>

<style scoped>
/* =========================
   外层
========================= */

.code-block {
    margin: 30px 0;
    border-radius: 10px;
    overflow: hidden;
    background: #0d1117;

    .header {
        display: flex;
        justify-content: space-between;
        padding: 8px 12px;
        background: #161b22;
        color: #fff;
        font-size: 12px;
    }
}






.body {

    display: grid;
    grid-template-columns: 48px 1fr;

    max-height: 500px;
    overflow: auto;

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: #8b949e #161b22;

    &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }

    &::-webkit-scrollbar-track {
        background: #161b22;
    }

    &::-webkit-scrollbar-thumb {
        background: #8b949e;
        border-radius: 999px;
        border: 2px solid #161b22;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #a1aab4;
    }

    &::-webkit-scrollbar-corner {
        background: #161b22;

    }

    /* 隐藏箭头 */
    &::-webkit-scrollbar-button {
        display: none;
        width: 0;
        height: 0;
    }
}


.gutter {
    padding: 12px 8px 12px 12px;
    text-align: right;
    user-select: none;
    color: #6b7280;
    border-right: 1px solid #222;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.line {
    font-size: 13px;
    line-height: 1.6;
    height: 1.6em;
}

/* =========================
   code 区（关键替换 pre）
========================= */

.code {
    padding: 12px;

    background: #0d1117;

    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
}

/* hljs 修复 */
.code code {
    display: block;
    white-space: pre;
}

.copy-btn {
    padding: 4px 10px;
    color: #c9d1d9;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all .2s;

}

.copy-btn:hover {
    background: #30363d;
}

.copy-btn:active {
    background: #3b434d;
}

/* 去 hljs 默认 padding */
:deep(.hljs) {
    padding: 0 !important;
    background: transparent !important;
}
</style>