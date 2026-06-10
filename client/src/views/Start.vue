<template>
    <div class="start-all">
        <div class="start-nav">
            <div class="site-logo">
                <img src="../assets/imgs/logo/favicon.ico" alt="logo">
            </div>
            <div class="menu">
                <div class="menu-item" v-for="m in menuList">
                    <a :href="`#${m.router}`" target="_self">{{ m.text }}</a>
                </div>

            </div>
        </div>
        <div class="banner">
            HENGQIANFAN
        </div>

        <div class="project" id="project">
            <div class="title">
                推荐项目 / Project
            </div>
            <div class="intro">
                不同领域下，我创作的一些项目。
            </div>
            <div class="content">
                <router-link :to="it.link" class="option" v-for="it in projects" target="_blank">
                    <div class="option-cover">
                        <img :src="it.cover" alt="cover">
                    </div>
                    <div class="option-name">{{ it.title }}</div>

                    <div class="option-intro">
                        {{ it.description }}
                    </div>
                </router-link>
                <!-- <div class="option" v-for="it in projects" :key="it.title" @click="openLinkByRouter(it.link)">

                    <div class="option-cover">
                        <img :src="it.cover" alt="cover">
                    </div>
                    <div class="option-name">{{ it.title }}</div>

                    <div class="option-intro">
                        {{ it.description }}
                    </div>
                </div> -->
            </div>
        </div>
        <div class="article" id="article">
            <div class="title" id="post">
                推荐文章 / Post
            </div>
            <div class="intro">
                个人觉得不错的文章，分享给大家。
            </div>
            <div class="content">
                <CardPost :post="post" v-for="post in postsStore.startRecommendedList" />
            </div>
        </div>

        <div class="life" id="life">
            <div class="title" id="post">
                日常 / life
            </div>
            <div class="intro">
                个人觉得不错的文章，分享给大家。
            </div>
            <div class="content">
                <CardPost :post="post" v-for="post in postsStore.lives" />

            </div>
        </div>

        <div class="personal-intro" id="me">
            <div class="title">
                关于我 / Me
            </div>
            <div class="intro">
                目前难以定义的非典型性人类
            </div>
            <div class="content">
                <div class="avatar">
                    <img src="../assets/imgs/logo/favicon.ico" alt="Avatar">
                </div>

                <div class="desc">
                    {{ honeConfig.personalIntro }}
                </div>

                <div class="social-links">
                    <div class="link" v-for="m in honeConfig.socialLinks" @click="openLink(m.url)">
                        <i :class="`iconfont icon-${m.icon}`"></i>
                    </div>
                </div>

            </div>



        </div>



        <Footer />

    </div>
</template>

<script lang="ts" setup>
import { usePostsStore } from '@/stores/posts';
import CardPost from '../components/CardPost/index.vue';
import Footer from '../components/Footer/index.vue';
import { honeConfig } from '@/config/main.ts';
import { projects } from '@/config/projects.ts';
import { openLink, openLinkByRouter } from '@/utils/link';
import { useRouter } from 'vue-router'
const router = useRouter()


const postsStore = usePostsStore()

const menuList = [
    { text: 'Project', router: 'project' },
    { text: 'Note', router: 'article' },
    { text: 'Life', router: 'life' },
    { text: 'Me', router: 'me' },
]
</script>

<style lang="scss" scoped>
.start-all {
    width: 100%;
    min-height: 100%;
    background-color: rgb(255, 255, 255);
    display: flex;
    flex-direction: column;
    align-items: center;
    --bg-one: rgb(240, 240, 240);
    --bg-two: rgb(230, 230, 230);
    --transition-default: all 0.6s ease;
    --transition-fast: all 0.3s ease;
    --transition-slow: all 0.8s ease;


    .start-nav {

        height: 60px;
        display: flex;
        align-items: center;
        padding: 0 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #eaeaea;
        position: fixed;
        margin: 10px auto;
        border-radius: 30px;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(5px);
        gap: .625rem;
        z-index: 999;

        .site-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }

        .menu {
            display: flex;

            gap: 20px;
            transition: all 0.3s ease;

            .menu-item {

                padding: 6px 10px;
                font-size: 16px;
                color: #222;
                cursor: pointer;
                font-weight: 600;
                // letter-spacing: 3px;
                transition: all 0.3s ease;

                a {}

                &:hover {
                    border-radius: 20px;
                    background-color: rgba(220, 220, 220, 0.3);
                    transition: all 0.3s ease;
                    color: #30508a;
                }
            }
        }
    }

    .banner {
        width: 100%;
        height: 70vh;
        background-color: var(--bg-one);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 60px;
        color: #333;
        letter-spacing: 8px;
        font-weight: 800;

    }

    .project {
        width: 100%;
        padding: 60px 20px;
        padding-bottom: 100px;
        min-height: 70vh;
        scroll-margin-top: 90px;
        background-color: var(--bg-two);

        .title {
            font-size: 30px;

            font-weight: 600;
            text-align: center;
            color: #333;
            margin-bottom: 15px;
        }

        .intro {
            font-size: 16px;
            color: #777;
            text-align: center;
            padding: 10px;
        }

        .content {
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: center;
            margin-top: 20px;

            .option {
                width: 400px;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 20px;
                padding: 15px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border: 1px solid #eaeaea;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;

                &:hover {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    transition: all 0.3s ease;
                }

                .option-intro {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 10px;

                }

                .option-name {
                    font-size: 18px;
                    color: #333;
                    font-weight: bold;
                    padding: 15px;
                }

                .option-cover {
                    width: 100%;
                    border: 4px solid #eaeaea;
                    border-radius: 15px;
                    overflow: hidden;
                    transition: var(--transition-slow);


                    img {

                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: 10px;
                        transition: var(--transition-slow);


                        &:hover {
                            transform: scale(1.5);
                            transition: var(--transition-slow);
                        }

                    }
                }
            }
        }
    }


    .article {
        padding: 60px 20px;
        background-color: var(--bg-one);
        min-height: 60vh;
        width: 100%;
        scroll-margin-top: 90px;

        .title {
            font-size: 30px;

            font-weight: 600;
            text-align: center;
            color: #333;
            margin-bottom: 15px;
        }

        .intro {
            font-size: 16px;
            color: #777;
            text-align: center;
            padding: 10px;
        }

        .content {
            display: flex;
            flex-direction: row;
            padding: 50px 0;
            gap: 1.25rem;
            justify-content: center;
        }
    }


    .life {
        padding: 60px 20px;
        background-color: white;
        background-color: var(--bg-two);
        min-height: 60vh;
        width: 100%;
        scroll-margin-top: 90px;

        .title {
            font-size: 30px;

            font-weight: 600;
            text-align: center;
            color: #333;
            margin-bottom: 15px;
        }

        .intro {
            font-size: 16px;
            color: #777;
            text-align: center;
            padding: 10px;
        }

        .content {

            display: flex;
            gap: 1.25rem;
            align-items: center;
            justify-content: center;

            display: flex;
            flex-direction: row;
            padding: 50px 0;

            justify-content: center;
        }
    }

    .personal-intro {
        padding: 60px 20px;
        background-color: white;
        min-height: 60vh;
        width: 100%;
        scroll-margin-top: 90px;
        background-color: var(--bg-one);

        .title {
            font-size: 30px;

            font-weight: 600;
            text-align: center;
            color: #333;
            margin-bottom: 15px;
        }

        .intro {
            font-size: 16px;
            color: #777;
            text-align: center;
            padding: 10px;
        }

        .content {

            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            align-items: center;
            justify-content: center;

            padding: 50px 0;

            .avatar {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                overflow: hidden;
                border: 4px solid #eaeaea;
                display: flex;
                justify-content: center;
                align-items: center;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }
            }

            .desc {
                margin: 20px 0;
                text-indent: 2em;
                font-size: 16px;
                color: #999;
                // text-align: center;
                max-width: 500px;
                line-height: 20px;
            }


            .social-links {
                // margin-top: 20px;
                padding: 5px;
                display: flex;
                transition: all 0.5s ease;

                .link {
                    margin: 10px;
                    background-color: white;
                    color: #333;
                    padding: 5px;
                    border-radius: 50%;
                    transition: all 0.5s ease;
                    border: 2px solid transparent;
                    box-shadow:
                        0 4px 12px rgba(0, 0, 0, 0.08),
                        0 2px 4px rgba(0, 0, 0, 0.04);

                    &:hover {
                        border: 2px dashed #30508a;
                        box-shadow:
                            0 6px 16px rgba(0, 0, 0, 0.12),
                            0 4px 8px rgba(0, 0, 0, 0.06);
                        transition: all 0.5s ease;
                    }

                    i {
                        transition: all 0.5s ease;
                        font-size: 30px;

                    }

                }
            }
        }


    }


}


@media (max-width: 767px) {
    .start-all {



        .start-nav {
            height: 50px;
            margin: 10px;

            .site-logo {
                width: 30px;
                height: 30px;
            }

            .menu {

                .menu-item {

                    font-size: 14px;

                    &:hover {}
                }
            }
        }

        .banner {
            height: 25vh;
            font-size: 18px;
        }

        .project {
            padding: 30px 10px;
            min-height: 50vh;


            .title {
                font-size: 20px;
            }

            .intro {}

            .content {

                .option {
                    width: 300px;

                    &:hover {}

                    .option-intro {}

                    .option-name {}

                    .option-cover {



                        img {



                            &:hover {}

                        }
                    }
                }
            }
        }


        .article {
            padding: 30px 10px;
            min-height: 50vh;


            .title {
                font-size: 20px;
            }


            .intro {}

            .content {
                flex-wrap: wrap;
                padding: 20px 0;
            }
        }


        .life {

            padding: 30px 10px;
            min-height: 50vh;


            .title {
                font-size: 20px;
            }

            .intro {}

            .content {



                .post {}
            }
        }

        .personal-intro {}


    }
}
</style>