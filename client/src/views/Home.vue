<template>
    <div class="home-all">
        <!-- 第一部分 -->
        <div class="content">
            <div class="one">
                <div class="info">
                    <div class="container">
                        <div class="logo">
                            <img src="../assets/imgs/logo/favicon.ico" alt="">
                        </div>
                        <div class="name">衡千帆</div>
                        <div class="motto">{{ honeConfig.motto }}</div>



                        <div class="personal-intro" v-typewriter>
                            {{ honeConfig.personalIntro }}
                        </div>
                        <div class="social-links">
                            <a v-for="(item, index) in honeConfig.socialLinks" :key="index" :href="item.url"
                                target="_blank">
                                <i :class="`iconfont icon-${item.icon}`"></i>
                            </a>
                        </div>

                    </div>


                </div>
                <div class="update">
                    <img src="https://ghchart.rshah.org/hengqianfan" alt="GitHub 贡献图" />
                    <Countdown :list="countdowns" :limit="3" :interval="4000" />
                </div>
            </div>

            <div class="two">
                <div class="container">
                    <FloatWall />
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { honeConfig } from '@/config/main'
import { ref } from "vue"
import { countdowns } from '@/config/countdowns'
import Countdown from '@/components/countdown/index.vue'
import FloatWall from '@/components/FloatWall/index.vue'
import banner1 from '@/assets/imgs/banners/工藤新一.png'
import banner2 from '@/assets/imgs/banners/灰原哀.png'
import banner3 from '@/assets/imgs/banners/毛利兰.png'

const enwterLinks = ref([
    { name: '笔记', url: '/articles' },
    { name: '动态', url: '/articles' },
    { name: '相册', url: '/articles' }
])
const noticeItems = ref([
    { id: 1, text: '①本站为<b> 个人博客  </b>网站，所有内容仅代表作者个人观点。' },
    { id: 2, text: '②本站不提供任何<b> 违法、侵权、色情、暴力 </b>等内容。' },
    { id: 3, text: '③本站所有文章均为原创或转载，转载文章请注明出处。' },
    { id: 4, text: '④本站不对任何因使用本站内容而产生的直接或间接损失负责。' },
    { id: 5, text: '⑤本站欢迎各类友链申请，请联系站长。' }])

import { usePostsStore } from '@/stores/posts'


const postsStore =
    usePostsStore()


const activeIndex = ref<number | null>(null)

const flippedIndex = ref<number | null>(null)

const toggleFlip = (index: number) => {
    flippedIndex.value =
        flippedIndex.value === index ? null : index
}
const handleMouseLeave = (index: number) => {
    activeIndex.value = null

    // 如果当前卡片是翻转状态，移出后恢复正面
    if (flippedIndex.value === index) {
        flippedIndex.value = null
    }
}
const cards = [
    {
        title: "笔记",
        desc: "这是第一个卡片",
        bg: banner1,
        content: "这里放笔记相关的自定义内容。"
    },
    {
        title: "动态",
        desc: "这是第二个卡片",
        bg: banner2,
        content: "这里放动态相关的自定义内容。"
    },
    {
        title: "相册",
        desc: "这是第三个卡片",
        bg: banner3,
        content: "这里放相册相关的自定义内容。"
    }
]


</script>

<style lang="scss" scoped>
.home-all {
    width: 100%;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    content: center;
    align-items: center;
    gap: 20px;


    .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        height: auto;
        // 关键：由 .one 的内容决定整个容器宽度
        // max-width: 70vw;
        // background-color: rebeccapurple;


        .one {
            display: flex;
            flex-direction: row;
            height: auto;
            justify-content: center;
            gap: 20px;


            .info {

                padding: 15px;
                border-radius: 25px;
                background: rgba(20, 20, 25, .65);

                border:
                    1px solid rgba(255, 255, 255, .08);

                box-shadow:
                    0 10px 40px rgba(0, 0, 0, .35);

                // background: conic-gradient(from var(--angle),
                //         #42b883,
                //         #00d9ff,
                //         #835dff,
                //         #42b883);

                .container {
                    text-align: center;

                    background-color: rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-radius: 20px;
                    padding: 10px;

                    .logo {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        overflow: hidden;
                        margin-top: 20px;
                        transition: transform 0.6s ease;
                        background-color: rgb(56, 62, 66);
                        padding: 3px;
                        border: 2px solid rgba(0, 0, 0, 0.1);

                        &:hover {
                            transform: rotate(360deg) scale(1.1);
                        }
                    }

                    .logo img {
                        width: 100%;
                        height: auto;
                        border-radius: 50%;
                    }

                    .name {
                        letter-spacing: 1px;
                        margin: 10px 0;
                        color: white;
                        font-weight: 600;

                        border-radius: 6px;

                        padding: 4px 12px;
                        letter-spacing: 2px;

                        // font-family: '优设标题黑', sans-serif;
                    }

                    .motto {
                        font-size: 14px;
                        color: #918989;
                        margin-bottom: 10px;
                        padding: 3px 8px;



                    }

                    .personal-intro {
                        width: 320px;
                        height: 80px;
                        background: rgba(0, 0, 0, 0.3);
                        font-size: 14px;
                        color: #bdb7b7;
                        margin: 10px;
                        padding: 10px 15px;
                        border-radius: 10px;
                        text-align: left;

                        line-height: 20px;
                        // text-indent: 2em;
                        letter-spacing: 1px;


                    }

                    .social-links {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 15px;
                        margin: 20px;
                        transition: color 0.6s ease;

                        a {
                            transition: color 0.6s ease;
                            background-color: aliceblue;
                            border-radius: 50%;
                            padding: 3px;
                            color: #111;
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);


                            i {
                                font-size: 22px;
                                transition: color 0.6s ease;
                                color: var(--icon-color);
                            }

                            &:hover {
                                i {
                                    color: #0056b3;

                                }

                                scale: 1.2;
                                transition: color 0.6s ease;

                            }
                        }
                    }
                }

            }

            .update {

                background-color: rgba(255, 255, 255, 0.5);
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                border-radius: 20px;
                padding: 15px;
                gap: 1.25rem;

                background:
                    rgba(20, 20, 25, .65);

                // backdrop-filter:
                //     blur(20px);

                // -webkit-backdrop-filter:
                //     blur(20px);

                border:
                    1px solid rgba(255, 255, 255, .08);

                box-shadow:
                    0 10px 40px rgba(0, 0, 0, .35);

                .accordion {
                    width: 100%;
                    align-self: stretch;
                    display: flex;
                    gap: 15px;
                    // padding: 10px;
                    // overflow: hidden;





                    .card {
                        flex: 1;
                        width: 200px;
                        border-radius: 20px;

                        cursor: pointer;
                        perspective: 1000px;
                        transition:
                            flex .5s ease,
                            transform .5s ease;
                        position: relative;

                        // 当前展开
                        &.active {
                            flex: 3;
                        }

                        // 其他缩小
                        &.shrink {
                            flex: .5;
                        }

                        // =========================
                        // 翻转容器
                        // =========================

                        .card-inner {
                            width: 100%;
                            height: 100%;

                            position: relative;

                            transform-style: preserve-3d;

                            transition: transform .7s cubic-bezier(.4, .2, .2, 1);

                            border-radius: 20px;
                        }

                        // 点击之后
                        &.flipped {
                            .card-inner {
                                transform: rotateY(180deg);
                            }
                        }

                        // =========================
                        // 正面
                        // =========================

                        .card-front {
                            position: absolute;

                            inset: 0;

                            border-radius: 20px;

                            padding: 5px;

                            border: 5px solid rgba(80, 80, 80, 1);

                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center;

                            overflow: hidden;

                            backface-visibility: hidden;

                            display: flex;
                            align-items: center;
                            justify-content: center;

                            &::before {
                                content: '';

                                position: absolute;

                                inset: 0;

                                background: rgba(0, 0, 0, .15);

                                border-radius: inherit;

                                pointer-events: none;
                            }

                            .title {
                                color: rgba(255, 255, 255, 1);

                                font-size: 40px;

                                text-shadow:
                                    1px 1px 2px rgba(0, 0, 0, .5);

                                letter-spacing: 6px;

                                opacity: .5;

                                position: absolute;

                                bottom: 30px;

                                left: 0;
                                right: 0;

                                text-align: center;

                                font-family: '优设标题黑', sans-serif;
                            }

                            .desc {
                                color: rgba(255, 255, 255, 1);

                                font-size: 16px;

                                text-shadow:
                                    1px 1px 2px rgba(0, 0, 0, .5);

                                letter-spacing: 2px;

                                opacity: .5;

                                position: absolute;

                                bottom: 10px;

                                left: 0;
                                right: 0;

                                text-align: center;
                            }
                        }

                        // =========================
                        // 背面
                        // =========================

                        .card-back {
                            position: absolute;

                            inset: 0;

                            border-radius: 20px;

                            padding: 25px;

                            background:
                                rgba(25, 25, 30, .95);

                            border: 5px solid rgba(80, 80, 80, 1);

                            color: white;

                            backface-visibility: hidden;

                            transform: rotateY(180deg);

                            display: flex;
                            flex-direction: column;

                            align-items: center;
                            justify-content: center;

                            text-align: center;

                            overflow: hidden;

                            .back-title {
                                font-size: 26px;

                                font-weight: 600;

                                letter-spacing: 4px;

                                margin-bottom: 20px;
                            }

                            .back-content {
                                width: 90%;

                                font-size: 14px;

                                line-height: 1.8;

                                color: rgba(255, 255, 255, .7);
                            }

                            .back-action {
                                margin-top: 25px;

                                padding: 6px 16px;

                                border-radius: 999px;

                                background: rgba(255, 255, 255, .1);

                                border: 1px solid rgba(255, 255, 255, .15);

                                font-size: 13px;

                                transition: .3s ease;
                            }

                            &:hover {
                                .back-action {
                                    background: rgba(255, 255, 255, .2);

                                    transform: translateY(-2px);
                                }
                            }
                        }
                    }

                }



            }


        }

        .two {

            padding: 15px;
            flex: 1;
            background-color: rgba(0, 0, 0, 0.5);

            border-radius: 20px;


            .container {
                display: flex;

                .notice {
                    background-color: white;
                    width: 50%;

                    border-radius: 20px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;

                    .title {

                        font-weight: 600;
                        color: #333;
                        margin-bottom: 10px;
                    }

                    .notice-item {
                        font-size: 14px;
                        color: #777;
                        padding: 3px 0;

                        // margin-bottom: 5px;
                        :deep(b) {

                            display: inline-block;
                            font-weight: 600;
                            padding: 1px 2px;

                            border-radius: 999px;

                            font-size: 13px;







                        }
                    }


                }



            }
        }
    }



}

@media (max-width: 768px) {
    .home-all {
        .content {
            max-width: 100%;

            .one {
                display: flex;
                flex-direction: column;

                .info {
                    width: 100%;
                }
            }

        }
    }
}
</style>