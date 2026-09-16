<template>
    <div class="life-all">
        <div class="main">

            <div class="this-day" v-for="(it, index) in activities" :key="index">

                <div class="time">{{ formatDate(it.time) }}</div>
                <div class="actions">
                    <div class="action" v-for="p in it.actions">

                        <div :class="`kind-${p.kind}`">{{ getTag(p.kind) }}</div>

                        <router-link :to="`/post/${p.url}`" class="text">
                            {{ getText(p) }}
                        </router-link>
                        <!-- <div :class="`kind-${p.kind}`">{{ getTag(p.kind) }}</div> -->
                        <div class="moment">
                            <img :src="p.src" alt="">
                        </div>
                        <!-- <router-link v-if="p.kind == 'post'" :to="`/post/${p.url}`" class="text">
                            - 发布了《 {{ p.text }} 》
                        </router-link>
                        <router-link v-if="p.kind == 'life'" :to="`/post/${p.url}`" class="text">
                            - 「 {{ p.text }} 」
                        </router-link>
                        <router-link v-if="p.kind == 'life'" :to="`/post/${p.url}`" class="text">
                            - 「 {{ p.text }} 」
                        </router-link>
                        <div class="kind-life" v-if="p.kind == 'life'">动态</div>
                        <div class="kind-post" v-if="p.kind == 'post'">文章</div> -->

                    </div>
                </div>



            </div>



        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePostsStore } from '@/stores/posts'
import { formatDate } from '@/utils/textFormat'
import type { Post } from '@/types/post'
import type { Moment } from '@/types/moment'


const postsStore = usePostsStore()

interface theDay {
    time: number
    actions: action[]
}

interface action {
    kind: 'post' | 'life' | 'status' | 'moment' | string
    text: string
    url?: string
    src?: string
}



/**
 * 合并帖子与动态数据，生成统一的时间线数组
 * @param posts 帖子列表
 * @param moments 动态列表
 * @returns 合并后的 theDay[]，按日期降序（最新在前）
 */
const setActivities = (posts: Post[], moments?: Moment[]): theDay[] => {
    // 1. 获取今天的日期字符串（用于 moments 缺失日期时）
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    // 2. 按日期分组（将两种数据源统一处理）
    const grouped = {} as Record<string, action[]>;

    // 处理 posts
    posts.forEach(post => {
        const date = String(post.publishedAt).slice(0, 8); // 取 YYYYMMDD
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
            kind: post.category || 'post',
            text: post.title,
            url: post.slug,
            src: ''
        });
    });

    // 处理 moments
    // moments.forEach(m => {
    //     const dateKey = m.date || todayStr;
    //     if (!grouped[dateKey]) grouped[dateKey] = [];
    //     grouped[dateKey].push({
    //         kind: 'moment',
    //         text: m.title || '',
    //         url: '',
    //         src: m.src || ''
    //     });
    // });

    // 3. 转换为 theDay[] 并按日期降序排序
    return Object.entries(grouped)
        .map(([date, actions]) => ({
            time: Number(date),
            actions
        }))
        .sort((a, b) => b.time - a.time);
};


const activities = computed(() => {
    const recentPosts = postsStore.getPostsWithinDays(120)
    return setActivities(recentPosts)
})


const getTag = (kind: string) => {
    if (kind == 'post') {
        return '文章'
    } else if (kind == 'life') {
        return '动态'
    } else if (kind == 'moment') {
        return '瞬间'
    }
}


const getText = (p: action) => {
    if (p.kind == 'post') {
        return `  发布了《  ${p.text}  》`
    } else if (p.kind == 'life') {
        return `「 ${p.text} 」`
    } else if (p.kind == 'moment') {
        return `📷 拍下了：${p.text}`
    }
}
</script>

<style lang="scss" scoped>
.life-all {
    // width: 100%;
    background-color: var(--bg-color);
    padding: 15px;
    margin: 0px auto;
    max-width: 50%;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
    max-height: 72vh;

    &::-webkit-scrollbar {
        display: none;

    }

    scrollbar-width: none;

    .main {
        border-radius: 15px;
        // background-color: rebeccapurple;

        padding: 50px 0;

        display: flex;
        flex-direction: column;
        // align-items: center;

        .this-day {
            display: flex;
            flex-direction: column;
            padding: 20px 60px 40px 20px;
            border-radius: 10px;


            // background-color: var(--bg-color);
            margin: 10px;

            .time {
                background-color: rgba(255, 255, 255, 0.1);
                // background-color: rgba(100, 100, 100, 0.1);
                color: white;
                padding: 10px;
                width: 120px;
                text-align: center;
                letter-spacing: 1px;
                border-radius: 5px;

            }

            .actions {
                margin-top: 20px;
                background-color: var(--bg-color);
                padding: 20px;

                .action {
                    margin: 10px 0;
                    display: flex;
                    gap: .625rem;
                    align-items: center;
                    color: white;

                    .kind-life {
                        padding: 4px 8px;
                        background-color: rgba(68, 173, 159, 0.6);
                        border-radius: 10px;
                        color: white;
                        font-size: 12px;
                    }


                    .kind-post {
                        padding: 4px 8px;
                        background-color: rgba(73, 98, 145, 0.6);
                        border-radius: 10px;
                        color: white;
                        font-size: 12px;
                    }

                    .kind-moment {
                        padding: 4px 8px;
                        background-color: rgba(39, 92, 32, 0.6);
                        border-radius: 10px;
                        color: white;
                        font-size: 12px;
                    }

                    .moment {
                        display: none;

                    }



                }


                .action:hover {
                    .moment:hover {
                        display: flex;

                    }
                }
            }








        }




    }
}
</style>