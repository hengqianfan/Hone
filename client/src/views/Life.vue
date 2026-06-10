<template>
    <div class="life">
        <div class="life-momnents">
            <div class="title-btn">
                瞬间
            </div>
            <div class="moments-list">

                <Moment v-for="item in moments" :key="item.src" :moment="item" />

            </div>
        </div>
        <div class="life-updates">
            <div class="title-btn">
                动态
            </div>
            <div v-for="group in groups" :key="group.month" class="month-group">
                <!-- 时间轴 -->
                <div class="timeline">

                    <div class="dot"></div>

                    <div v-if="group !== groups[groups.length - 1]" class="line"></div>

                </div>

                <!-- 内容 -->
                <div class="content">

                    <div class="month">
                        {{ group.month }}
                    </div>

                    <div class="cards">

                        <CardPost v-for="item in group.items" :key="item.slug" :post="item"></CardPost>



                    </div>

                </div>
            </div>
        </div>



    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePostsStore } from '@/stores/posts'
import CardPost from '@/components/CardPost/index.vue'
import Moment from '@/components/CardMoment/index.vue'
import { moments } from '@/config/moments'




const postsStore = usePostsStore()

const groups = computed(() => {

    const map = new Map()

    postsStore.posts
        .filter(item => item.category === 'life')
        .forEach(item => {

            const month = item.publishedAt.slice(0, 7)

            if (!map.has(month)) {
                map.set(month, [])
            }

            map.get(month).push(item)
        })

    return Array
        .from(map.entries())
        .map(([month, items]) => ({
            month,
            items
        }))
})
</script>

<style lang="scss" scoped>
.life {
    display: flex;
    width: 100%;
    min-height: 100vh;
    background-color: rgb(230, 230, 230);


    .title-btn {
        margin: 12px;

        padding: 12px 18px;

        font-size: 18px;
        font-weight: 700;

        color: var(--text-color);

        border: 1px solid var(--border-color);

        border-radius: 14px;

        background: rgb(255 255 255 / 6%);
        backdrop-filter: blur(12px);

        transition: .25s;

        &:hover {
            border-color: var(--theme-color);

            color: var(--theme-color);

            transform: translateY(-2px);

            box-shadow:
                0 8px 24px rgb(0 0 0 / 8%);
        }
    }

    .life-momnents {
        background-color: rgb(240, 240, 240);
        flex: 0 0 100px;
        overflow: hidden;
        transition: all 0.8s ease;
        display: flex;
        flex-direction: column;

        .moments-list {
            display: none;
            transition: all 0.8s ease;

        }
    }

    .life-updates {
        background-color: rgb(230, 230, 230);
        flex: 1;
        transition: all 0.8s ease;
    }

    &:has(.life-momnents:hover) {
        transition: all 0.8s ease;

        .life-momnents {
            flex-basis: calc(100% - 100px);
            transition: all 0.8s ease;

            .moments-list {
                flex: 1;
                display: block;
                padding: 20px;

                overflow-y: auto;

                column-count: 4;

                column-gap: 10px;

                column-fill: balance;
                transition: all 0.8s ease;
            }

        }

        .life-updates {
            flex: 0 0 100px;
            transition: all 0.8s ease;

            .month-group {
                display: none;
                transition: all 0.8s ease;

            }
        }
    }
}



.month-group {
    display: flex;
    gap: 24px;
}

.timeline {
    width: 24px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

.dot {
    width: 16px;
    height: 16px;

    border-radius: 50%;

    background: var(--theme-color);

    box-shadow:
        0 0 10px rgb(59 130 246 / 40%);
}

.line {
    flex: 1;

    width: 2px;

    margin-top: 8px;

    background: var(--border-color);
}

.content {
    flex: 1;

    padding-bottom: 50px;
}

.month {
    margin-bottom: 20px;

    font-size: 24px;
    font-weight: 700;
}

.cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card {
    padding: 18px 20px;

    border-radius: 14px;

    border: 1px solid var(--border-color);

    background: var(--card-bg);

    transition: .25s;

    &:hover {
        transform: translateY(-2px);
    }
}

.title {
    font-size: 18px;
    font-weight: 600;

    margin-bottom: 10px;
}

.summary {
    line-height: 1.8;
    color: var(--text-2);

    margin-bottom: 12px;
}

.date {
    font-size: 13px;
    color: var(--text-3);
}

@media (max-width: 768px) {

    .life {
        padding: 20px 16px;
    }

    .month-group {
        gap: 16px;
    }

    .month {
        font-size: 20px;
    }

    .card {
        padding: 16px;
    }

    .title {
        font-size: 16px;
    }
}
</style>