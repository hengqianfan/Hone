<!-- components/GithubContributions/index.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const props = withDefaults(
    defineProps<{
        user: string
        weeks?: number
        /** 标题文案，不传则由 user 自动生成 */
        title?: string
    }>(),
    { weeks: 20, title: '' }
)

interface Cell { level: number; date: string; count: number }

const weeks = ref<Cell[][]>([])
const loading = ref(true)
const error = ref(false)

/** 总提交数，标题右侧可顺带展示 */
const totalCount = computed(() =>
    weeks.value.reduce(
        (sum, week) => sum + week.reduce((s, d) => s + (d.count || 0), 0),
        0
    )
)

/** 标题：优先用传入的 title，否则用 “xxx 的更新动态” */
const heading = computed(
    () => props.title || (props.user ? `${props.user} 的更新动态` : '更新动态')
)

const LEVEL_CLASS = ['l0', 'l1', 'l2', 'l3', 'l4']

onMounted(async () => {
    try {
        // 公开接口，无需 token（有速率限制）
        const res = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${props.user}?y=last`
        )
        const json = await res.json()
        const days: { date: string; count: number; level: number }[] =
            json.contributions ?? []

        const sliced = days.slice(-props.weeks * 7)
        const grid: Cell[][] = []
        for (let i = 0; i < sliced.length; i += 7) {
            grid.push(
                sliced.slice(i, i + 7).map(d => ({
                    level: d.level ?? 0,
                    date: d.date,
                    count: d.count
                }))
            )
        }
        weeks.value = grid
    } catch {
        error.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="gh-contrib">
        <!-- ============ 标题 ============ -->
        <header class="gh-contrib__header">
            <span class="gh-contrib__dot" aria-hidden="true" />
            <h3 class="gh-contrib__title">{{ heading }}</h3>
            <span v-if="!loading && !error && totalCount" class="gh-contrib__total">
                共 {{ totalCount }} 次贡献
            </span>
        </header>

        <!-- ============ 内容 ============ -->
        <div v-if="loading" class="gh-contrib__tip">加载贡献数据…</div>
        <div v-else-if="error" class="gh-contrib__tip">贡献数据加载失败</div>

        <div v-else class="gh-contrib__grid">
            <div v-for="(week, wi) in weeks" :key="wi" class="gh-contrib__week">
                <span v-for="day in week" :key="day.date" class="gh-contrib__cell" :class="LEVEL_CLASS[day.level]"
                    :title="`${day.date} · ${day.count} 次提交`" />
            </div>
        </div>

        <div v-if="!loading && !error" class="gh-contrib__legend">
            <span>少</span>
            <span v-for="(_, i) in LEVEL_CLASS" :key="i" class="gh-contrib__cell" :class="LEVEL_CLASS[i]" />
            <span>多</span>
        </div>
    </div>
</template>

<style scoped>
.gh-contrib {
    --c0: rgba(255, 255, 255, 0.06);
    --c1: rgba(124, 147, 255, 0.22);
    --c2: rgba(124, 147, 255, 0.45);
    --c3: rgba(124, 147, 255, 0.72);
    --c4: #7c93ff;

    /* 与倒计时组件统一的内边距令牌 */
    --panel-pad-x: 18px;
    --panel-pad-y: 16px;

    width: 100%;
    max-width: 500px;
    height: 100%;
    /* 关键：撑满 .update__chart */
    box-sizing: border-box;
    padding: var(--panel-pad-y) var(--panel-pad-x);
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* 内容纵向居中，与倒计时一致 */
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

/* ---------- 标题 ---------- */
.gh-contrib__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    min-width: 0;
}

.gh-contrib__dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--c4);
    box-shadow: 0 0 8px rgba(124, 147, 255, 0.8);
}

.gh-contrib__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 1px;
    color: #e8eaf2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.gh-contrib__total {
    margin-left: auto;
    flex: none;
    font-size: 11px;
    color: #8b8f9c;
}

/* ---------- 网格 ---------- */
.gh-contrib__grid {
    display: flex;
    gap: 4px;
    justify-content: center;
    overflow-x: auto;
    padding-bottom: 4px;
}

.gh-contrib__week {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.gh-contrib__cell {
    width: 11px;
    height: 11px;
    border-radius: 3px;
    background: var(--c0);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.gh-contrib__cell:hover {
    transform: scale(1.25);
    box-shadow: 0 0 10px rgba(124, 147, 255, 0.6);
}

.l1 {
    background: var(--c1);
}

.l2 {
    background: var(--c2);
}

.l3 {
    background: var(--c3);
}

.l4 {
    background: var(--c4);
    box-shadow: 0 0 8px rgba(124, 147, 255, 0.45);
}

/* ---------- 图例 ---------- */
.gh-contrib__legend {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    margin-top: 12px;
    font-size: 11px;
    color: #8b8f9c;
}

.gh-contrib__tip {
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
    color: #8b8f9c;
}

/* 窄屏：标题与总数换行，避免挤压 */
@media (max-width: 480px) {
    .gh-contrib__header {
        flex-wrap: wrap;
    }

    .gh-contrib__total {
        margin-left: 0;
        flex-basis: 100%;
        padding-left: 16px;
    }
}
</style>