<template>

    <RouterLink class="post" :key="post.slug" :to="`/post/${post.slug}`">

        <div class="base-info">
            <div class="post-icon">
                <IconImg :name="post.icon" />
            </div>
            <div class="post-title">
                {{ post.title }}
            </div>
        </div>

        <div class="post-intro">
            {{ post.summary || '' }}
        </div>
        <div class="other-info">
            <div class="post-updateTime">{{ formatDate(post.publishedAt) }}</div>
            <div class="post-tags">
                <div class="tag" v-for="tag in post.tags?.slice(0, 3)">{{ tag }}</div>
            </div>
        </div>


    </RouterLink>

</template>

<script lang="ts" setup>
import IconImg from '../IconImg/index.vue'
import { formatDate } from '@/utils/textFormat.ts'

const props = defineProps<{
    post: any
}>()

</script>

<style lang="scss" scoped>
.post {
    width: 300px;

    background-color: var(--card-post-bg-color);
    backdrop-filter: blur(5px);
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 10px;
    border: 2px dashed transparent;
    transition: all 0.8s ease;

    box-shadow: 0 0 5px 1px rgba(100, 100, 100, 0.12);

    &:hover {
        border: 2px dashed white;
        transition: all 0.8s ease;

        .base-info {
            .post-title {
                color: #5dacd1;
                transition: all 0.8s ease;

            }
        }
    }

    .base-info {
        display: flex;
        align-items: center;
        padding: 10px;
        gap: .625rem;

        .post-icon {
            i {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5px;
                font-size: 20px;
                border-radius: 20%;
                color: white;
                background-color: #3d6c92;
            }

            img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                padding: 2px;
                background-color: #555;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                /* 投影，向下偏移 */
                border: 2px solid rgba(255, 255, 255, 0.25);
                /* 高光边框，增加边缘亮色 */
            }
        }

        .post-title {
            padding: 5px 15px;
            font-size: 18px;
            color: rgba(200, 200, 200, 1);
            // color: #1a1a1a;
            font-weight: 600;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            transition: all 0.8s ease;


        }



    }



    .post-intro {
        color: rgb(228, 220, 220);
        font-size: 14px;
        line-height: 18px;
        margin: 10px;
        min-height: calc(3 * 18px);
        line-clamp: 3;
        display: -webkit-box;
        -webkit-line-clamp: 3; // 限制 3 行
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .other-info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .post-updateTime {
            margin-left: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #999;
        }

        .post-tags {
            display: flex;
            padding: 10px;
            gap: .3125rem;
            align-items: center;


            .tag {
                font-size: 12px;
                line-height: 12px;
                text-align: center;
                padding: 3px 6px;
                // 文字要实际居中，需要微调
                padding-bottom: 4px;
                background-color: #71767e;
                color: white;
                border-radius: 5px;
                // transform: translateY(-10px);
            }
        }
    }



}
</style>