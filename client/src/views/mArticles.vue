<template>

    <div class="blog-list">

        <RouterLink v-for="post in posts" :key="post.slug" :to="`/post/${post.slug}`" class="blog-card">

            <img v-if="post.frontmatter.cover" :src="post.frontmatter.cover" class="cover">

            <div class="content">

                <div class="title">
                    {{ post.frontmatter.title }}
                </div>

                <div class="date">
                    {{ post.frontmatter.date }}
                </div>

                <div class="description">
                    {{ post.frontmatter.description }}
                </div>

                <div class="tags">

                    <span class="tag" v-for="tag in post.frontmatter.tags" :key="tag">
                        {{ tag }}
                    </span>

                </div>

            </div>

        </RouterLink>

    </div>

</template>

<script setup lang="ts">

import { getAllPosts } from '@/utils/posts'

const posts = getAllPosts()

</script>

<style scoped lang="scss">
.blog-list {

    width: 900px;

    margin: 40px auto;
}

.blog-card {

    display: flex;

    margin-bottom: 30px;

    overflow: hidden;

    border-radius: 24px;

    background: rgba(255, 255, 255, .7);

    backdrop-filter: blur(20px);

    transition: .3s;

    text-decoration: none;

    color: inherit;

    &:hover {

        transform: translateY(-6px);
    }
}

.cover {

    width: 260px;

    height: 180px;

    object-fit: cover;
}

.content {

    flex: 1;

    padding: 24px;
}

.title {

    font-size: 28px;

    font-weight: bold;

    margin-bottom: 10px;
}

.date {

    color: #999;

    margin-bottom: 12px;
}

.description {

    color: #666;

    line-height: 1.8;
}

.tags {

    display: flex;

    gap: 10px;

    margin-top: 18px;
}

.tag {

    padding: 4px 12px;

    border-radius: 999px;

    background: rgba(0, 0, 0, .06);

    font-size: 13px;
}
</style>