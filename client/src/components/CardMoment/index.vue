<template>
    <div class="moment">

        <img class="moment-image" :src="imageSrc" :alt="moment.title || 'Moment'" @error="onImageError">

        <div class="mask">

            <div class="info">

                <div class="title">
                    {{ moment.title || '某个瞬间' }}
                </div>

                <div v-if="moment.description" class="description">
                    {{ moment.description }}
                </div>

                <div v-if="moment.date" class="date">
                    {{ moment.date }}
                </div>

            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Moment } from '@/types/moment'
import defaultMomentImage from '@/assets/imgs/banners/banner01.png'


const props = defineProps<{
    moment: Moment
}>()

const failed = ref(false)

const imageSrc = computed(() => {

    if (failed.value) {
        return defaultMomentImage
    }

    if (!props.moment.src) {
        return defaultMomentImage
    }

    return props.moment.src
})

function onImageError() {
    failed.value = true
}
</script>

<style lang="scss" scoped>
.moment {


    display: inline-block;

    width: 100%;

    margin-bottom: 10px;

    break-inside: avoid;

    position: relative;

    overflow: hidden;

    border-radius: 10px;

    background: var(--card-bg);

    border: 1px solid var(--border-color);

    cursor: pointer;
    transition: all 0.6s ease;

    &:hover {

        // transform: translateY(-4px);

        box-shadow:
            0 12px 32px rgb(0 0 0 / 12%);

        transition: all 0.6s ease;

        .mask {
            opacity: 1;
            transition: all 0.6s ease;

        }

        .moment-image {
            transform: scale(1.05);
            transition: all 0.6s ease;

        }
    }
}

.moment-image {

    width: 100%;

    height: auto;

    display: block;
    transition: all 0.6s ease;

}

.mask {

    position: absolute;

    inset: 0;

    display: flex;

    align-items: flex-end;

    opacity: 0;

    transition: opacity .3s;

    background:
        linear-gradient(to top,
            rgb(0 0 0 / 80%),
            rgb(0 0 0 / 20%),
            transparent);

    transition: all 0.6s ease;

}

.info {

    width: 100%;

    padding: 18px;
    transition: all 0.6s ease;

}

.title {

    color: white;

    font-size: 16px;

    font-weight: 700;

    line-height: 1.4;
    transition: all 0.6s ease;

}

.description {

    margin-top: 8px;

    color: rgb(255 255 255 / 85%);

    font-size: 13px;

    line-height: 1.6;

    display: -webkit-box;

    -webkit-line-clamp: 3;

    -webkit-box-orient: vertical;

    overflow: hidden;
    transition: all 0.6s ease;

}

.date {

    margin-top: 10px;

    color: rgb(255 255 255 / 70%);

    font-size: 12px;
    transition: all 0.6s ease;

}
</style>