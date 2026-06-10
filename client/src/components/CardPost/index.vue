<template>

    <RouterLink class="post" :key="post.slug" :to="`/post/${post.slug}`">

        <div class="base-info">
            <div class="post-icon">
                <IconImg :name="post.icon" />
            </div>
            <div class="post-updateTime">{{ post.publishedAt }}</div>
        </div>
        <div class="post-title">
            {{ post.title }}
        </div>
        <div class="post-intro">
            {{ post.summary || '' }}
        </div>

        <div class="post-tags">
            <div class="tag" v-for="tag in post.tags?.slice(0, 3)">{{ tag }}</div>
        </div>

    </RouterLink>

</template>

<script lang="ts" setup>
import IconImg from '../IconImg/index.vue'

const props = defineProps<{
    post: any
}>()

</script>

<style lang="scss" scoped>
.post {
    width: 320px;

    background-color: white;
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 10px;
    border: 2px dashed transparent;
    transition: all 0.8s ease;

    // border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 0 5px 1px rgba(100, 100, 100, 0.12);

    &:hover {
        border: 2px dashed rgb(138, 189, 217);
        transition: all 0.8s ease;

        .post-title {
            color: #3d6c92;
            transition: all 0.8s ease;

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
                width: 30px;
                height: 30px;
                /* border-radius: 50%; */
                padding: 1px;
                background-color: aliceblue;
            }
        }

        .post-updateTime {
            margin-left: 10px;
            font-size: 14px;
            font-weight: 600;
            color: #777;
        }

    }

    .post-title {
        padding: 5px 15px;
        font-size: 18px;
        color: #444;
        font-weight: 600;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        transition: all 0.8s ease;


    }

    .post-intro {
        color: #777;
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
            background-color: #8c97aa;
            color: white;
            border-radius: 5px;
            // transform: translateY(-10px);
        }
    }

}
</style>