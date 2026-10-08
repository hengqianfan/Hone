<template>
    <div class="home-all">
        <!-- <div class="banner">
            <img src="../assets/imgs/banners/banner01.png" alt="Banner">
        </div> -->
        <div class="line-one">


            <div class="personal-info">
                <div class="title">
                    <i class="iconfont icon-book"></i>站长信息
                </div>
                <div class="profile-picture">
                    <img src="../assets/imgs/logo/favicon.ico" alt="">
                </div>
                <!-- <div class="author">{{ honeConfig.author }}</div> -->
                <div class="motto">{{ honeConfig.motto }}</div>
                <div class="social-links">
                    <div class="link" v-for="m in honeConfig.socialLinks" @click="openLink(m.url)">
                        <i :class="`iconfont icon-${m.icon}`"></i>
                    </div>
                </div>
                <div class="tip">
                    时间有限，时间迫切，所以，勇敢做自己，勇敢去做任何事，不留遗憾，少留遗憾！
                </div>
            </div>

            <div class="site-info">
                <div class="site-info-title">
                    <i class="iconfont icon-cloud"></i> 站点信息
                </div>
                <div class="content">
                    <div class="info-one">
                        <div class="item">
                            <div class="item-info">1112 </div>
                            <div class="item-name">总文章数</div>
                        </div>
                        <div class="item">
                            <div class="item-info">54 </div>
                            <div class="item-name">月度更新</div>
                        </div>
                        <div class="item">
                            <div class="item-info">88 </div>
                            <div class="item-name">年度更新</div>
                        </div>


                    </div>
                </div>
            </div>

            <div class="latest-updates">
                <div class="title"><i class="iconfont icon-fire"></i> 最新动态</div>
                <div class="content">
                    <div class="item">
                        <div class="item-name">学习</div>
                        <div class="item-info">最近在......</div>
                    </div>
                    <div class="item">
                        <div class="item-name">分享</div>
                        <div class="item-info">发表了文章：《..........》</div>
                    </div>
                    <div class="item">
                        <div class="item-name">出行</div>
                        <div class="item-info">去............</div>
                    </div>
                    <div class="item">
                        <div class="item-name">鉴赏</div>
                        <div class="item-info">看了、听了：《..........》</div>
                    </div>
                </div>

            </div>






        </div>

        <div class="line-two">

            <div class="my-projects">
                <div class="title"><i class="iconfont icon-home"></i>我的项目</div>
                <div class="content">
                    <div class="cover">
                        <img src="../assets/imgs/banners/banner02.png" alt="">
                    </div>
                    <div class="info">
                        <div class="name">{{ nowShowProject?.name }}</div>
                        <div class="intro">{{ nowShowProject?.description }} </div>
                        <div class="tags">
                            <span v-for="tag in nowShowProject?.tags" :key="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <div class="btns">
                        <div class="btn" v-for="(p, index) in projects" @click="changeProject(index)"></div>
                    </div>
                </div>

            </div>

            <div class="enter">
                KKK
            </div>
        </div>

        <!-- <div class="line-two">
            <div class="line-two-title">
                <i class="iconfont icon-home"></i> 我的项目
            </div>
            <div class="content">
                <div class="item">
                    <div class="cover">
                        <img src="../assets/imgs/banners/banner01.png" alt="">
                    </div>
                    <div class="info">
                        <div class="name">{{ nowShowProject?.name }}</div>
                        <div class="intro">{{ nowShowProject?.description }} </div>
                        <div class="tags">
                            <span v-for="tag in nowShowProject?.tags" :key="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <div class="btns">
                        <div class="btn" v-for="(p, index) in projects" @click="changeProject(index)"></div>
                    </div>
                </div>


            </div>
        </div> -->
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { honeConfig } from '@/config/main';
import { openLink } from '@/utils/link';
const projects = [
    {
        name: 'HONE',
        description: '个人博客与人生管理系统',
        tags: ['开发中', '博客系统'],
    },
    {
        name: '登托邦',
        description: '本地社区Web应用',
        tags: ['Vue3', 'Vite', '博客系统'],

    }

]
const nowShowProject = ref(projects[0]);

const changeProject = (index: number) => {
    nowShowProject.value = projects[index];
};

</script>

<style lang="scss" scoped>
.home-all {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 0;
    // 给导航栏预留空间

    // overflow-y: scroll;


    .line-one {
        display: flex;
        gap: 20px;
        padding: 10px;


        .personal-info {

            background-color: rgba(245, 245, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.5);

            width: 260px;
            height: 260px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-radius: 20px;
            position: relative;
            transition: all 0.5s ease;


            .title {
                position: absolute;
                left: 10px;
                background-color: rgba(255, 255, 255, 0.5);
                border: 1.5px solid white;

                padding: 6px 10px;
                border-radius: 18px;
                font-size: 12px;

                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 10px;
                transition: all 0.5s ease;

                i {
                    font-size: 13px;
                }



            }

            .profile-picture {

                width: 40px;
                height: 40px;
                background-color: aliceblue;
                border-radius: 30%;
                padding: 4px;
                margin: 5px;
                margin-top: 50px;
                transition: all 0.5s ease;
                overflow: hidden;

                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 30%;
                    transition: all 0.5s ease;

                    &:hover {
                        transform: scale(1.2);
                        transition: all 0.5s ease;

                    }
                }


            }

            .author {
                margin-top: 5px;
                padding: 5px;
                font-size: 12px;
                font-family: '优设标题黑';

                background-color: rebeccapurple;
            }

            .motto {
                padding: 5px;
                font-size: 12px;
                transition: all 0.5s ease;

            }

            .social-links {
                padding: 5px;
                display: flex;
                transition: all 0.5s ease;

                .link {
                    margin: 4px;
                    background-color: white;
                    color: #333;
                    padding: 1px;
                    border-radius: 50%;
                    transition: all 0.5s ease;
                    border: 2px solid transparent;

                    i {
                        transition: all 0.5s ease;

                    }

                }
            }

            .tip {
                color: #333;
                padding: 5px;
                margin-top: 10px;
                line-height: 20px;
                font-size: 14px;
                background-color: rgba(255, 255, 255, 0.5);
                border-radius: 10px;
                transition: all 0.5s ease;
                // 文本溢出处理
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                /* 显示3行 */
                -webkit-box-orient: vertical;

            }


        }

        .personal-info:hover {

            width: 600px;
            transition: all 0.5s ease;


            .title {
                position: absolute;

            }

            .profile-picture {

                width: 60px;
                height: 60px;
                transition: all 0.5s ease;
            }

            .author {
                margin-top: 5px;
            }

            .motto {
                padding: 5px;
                margin-top: 5px;
                font-size: 14px;
            }

            .social-links {


                .link {
                    transition: all 0.5s ease;

                    i {
                        font-size: 24px;
                        transition: all 0.5s ease;


                    }

                }

                .link:hover {
                    border: 2px solid #4960ad;

                    transition: all 0.5s ease;

                    i {

                        transition: all 0.5s ease;
                        color: #4960ad;


                    }



                }
            }



        }


        .latest-updates {
            width: 260px;
            height: 260px;
            flex: 1;
            background-color: rgba(245, 245, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.5);

            display: flex;
            flex-direction: column;

            padding: 10px;
            gap: 5px;
            border-radius: 20px;


            position: relative;

            transition: all 0.5s ease;


            .title {
                position: absolute;
                left: 10px;
                background-color: rgba(255, 255, 255, 0.5);
                padding: 6px 10px;
                border-radius: 18px;
                font-size: 12px;

                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 10px;
                border: 1.5px solid white;
            }

            .content {
                margin-top: 50px;
                display: flex;
                flex-direction: column;
                gap: 10px;

                .item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin: 0px 10px;

                    .item-name {
                        background-color: rgba(255, 255, 255, 0.6);
                        padding: 4px 8px;
                        font-family: '优设标题黑';
                        font-size: 12px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.5);

                    }

                    .item-info {
                        font-size: 12px;
                        padding: 4px 10px;
                        border-radius: 10px;
                        background-color: rgba(255, 255, 255, 0.514);

                    }
                }
            }


        }

        .latest-updates:hover {
            width: 600px;

            flex: 1;
            background-color: rgba(245, 245, 255, 0.5);
            display: flex;
            flex-direction: column;

            padding: 10px;
            gap: 10px;
            border-radius: 20px;

            position: relative;
            transition: all 0.5s ease;


            .title {
                position: absolute;
                left: 10px;
                background-color: rgba(255, 255, 255, 0.5);
                padding: 6px 10px;
                border-radius: 18px;
                font-size: 12px;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 10px;
                border: 1.5px solid white;
            }

            .content {
                margin-top: 50px;
                display: flex;
                flex-direction: column;
                gap: 10px;

                .item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 0px 10px;

                    .item-name {
                        background-color: rgba(255, 255, 255, 0.6);
                        padding: 4px 8px;
                        font-family: '优设标题黑';
                        font-size: 16px;
                        border-radius: 8px;
                        border: 1px solid rgba(255, 255, 255, 0.5);
                        transition: all 0.5s ease;

                    }

                    .item-info {
                        font-size: 16px;
                        padding: 4px 10px;
                        border-radius: 10px;


                        transition: all 0.5s ease;

                        background-color: rgba(255, 255, 255, 0.514);

                    }
                }
            }


        }

        .site-info {
            position: relative;
            width: 260px;
            height: 260px;
            background-color: rgba(245, 245, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.5);


            border-radius: 20px;

            display: flex;
            flex-direction: column;
            transition: all 0.5s ease;



            .site-info-title {
                position: absolute;

                left: 10px;
                top: 10px;
                background-color: rgba(255, 255, 255, 0.5);
                padding: 6px 10px;
                border-radius: 18px;
                font-size: 12px;

                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 10px;
                border: 1.5px solid white;
                transition: all 0.5s ease;
            }

            .content {
                margin-top: 40px;
                padding: 10px;
                transition: all 0.5s ease;

                .info-one {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.5s ease;

                    .item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 5px;
                        background-color: rgba(255, 255, 255, 0.5);
                        padding: 10px;
                        transition: all 0.5s ease;
                        border-radius: 10px;



                        .item-info {
                            padding: 4px 8px;
                            background-color: white;
                            border-radius: 8px;
                            color: #333;
                            font-size: 14px;
                            font-family: '优设标题黑';
                            transition: all 0.5s ease;
                        }

                        .item-name {
                            font-size: 12px;
                            transition: all 0.5s ease;
                        }
                    }

                }


            }
        }

        .site-info:hover {
            width: 600px;
            transition: all 0.5s ease;

            .content {
                transition: all 0.5s ease;

                .info-one {
                    margin-top: 10px;
                    transition: all 0.5s ease;

                    .item {
                        .item-info {
                            font-size: 22px;
                            padding: 6px 12px;

                            transition: all 0.5s ease;

                        }

                        .item-name {
                            font-size: 14px;
                            margin-top: 5px;
                            transition: all 0.5s ease;
                        }
                    }

                }
            }
        }
    }

    .line-two {
        display: flex;
        gap: 20px;
        padding: 10px;
        // margin-top: 10px;
        transition: all 0.5s ease;

        .my-projects {
            width: 540px;
            padding: 0px;
            // background-color: rgba(245, 245, 255, 0.5);
            // border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 20px;
            transition: all 0.5s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            transition: all 0.5s ease;


            .title {
                position: absolute;
                left: 12px;
                top: 12px;
                border-radius: 18px;
                padding: 6px 10px;
                font-size: 12px;
                letter-spacing: 1px;
                display: flex;
                align-items: center;
                gap: 2px;
                line-height: 10px;
                border: 1px solid white;
                transition: all 0.5s ease;
                z-index: 5;

                i {
                    font-size: 13px;
                    transition: all 0.5s ease;

                }
            }

            .content {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: all 0.5s ease;


                .cover {
                    // margin-top: 30px;
                    width: 100%;

                    border-radius: 20px;
                    overflow: hidden;
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 6px;
                    transition: all 0.5s ease;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 18px;
                        transition: all 0.5s ease;

                        object-fit: cover;
                    }
                }

                .info {
                    background-color: rgba(255, 255, 255, 0.3);
                    position: absolute;
                    margin: 20px;
                    bottom: 0px;
                    left: 0px;
                    padding: 10px 15px;
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.5s ease;

                    .name {
                        font-size: 30px;
                        line-height: 30px;
                        font-family: '优设标题黑';
                        transition: all 0.5s ease;

                    }

                    .intro {
                        padding: 5px 0;
                        font-size: 16px;
                        color: #333;
                        letter-spacing: 0.5px;
                        transition: all 0.5s ease;

                    }

                    .tags {
                        margin-top: 5px;
                        display: flex;
                        gap: 10px;
                        transition: all 0.5s ease;

                        span {
                            background-color: rgba(255, 255, 255, 0.6);
                            padding: 4px 8px;
                            // font-family: '优设标题黑';
                            font-size: 12px;
                            border-radius: 8px;
                            color: #333;
                            transition: all 0.5s ease;

                            border: 1px solid rgba(255, 255, 255, 0.5);
                        }
                    }
                }


                .btns {
                    display: flex;
                    gap: 10px;
                    position: absolute;
                    right: 15px;
                    top: 10px;
                    margin: 5px;
                    transition: all 0.5s ease;

                    .btn {
                        width: 10px;
                        height: 10px;
                        background-color: rgba(255, 255, 255, 0.582);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: #333;
                        transition: all 0.5s ease;
                        transition: all 0.5s ease;

                        &:hover {
                            background-color: #808289;
                            color: white;
                            transition: all 0.5s ease;

                        }
                    }
                }
            }


        }

        .enter {
            width: 260px;
            padding: 10px;
            background-color: rgba(245, 245, 255, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 18px;
            transition: all 0.5s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
        }







    }



    // .line-two {
    //     width: 960px;
    //     margin-top: 20px;
    //     padding: 10px;

    //     background-color: rgba(245, 245, 255, 0.5);
    //     border: 1px solid rgba(255, 255, 255, 0.5);
    //     border-radius: 18px;
    //     position: relative;
    //     transition: all 0.5s ease;


    //     .line-two-title {
    //         position: absolute;
    //         border-radius: 18px;
    //         padding: 6px 10px;
    //         font-size: 12px;
    //         letter-spacing: 1px;
    //         display: flex;
    //         align-items: center;
    //         gap: 2px;
    //         line-height: 10px;
    //         border: 1px solid white;
    //         transition: all 0.5s ease;

    //         i {
    //             font-size: 13px;
    //             transition: all 0.5s ease;

    //         }



    //     }

    //     .content {
    //         margin-top: 40px;
    //         padding: 20px 10px;
    //         // background-color: rgba(255, 255, 255, 0.5);
    //         display: flex;
    //         flex-direction: column;

    //         align-items: center;
    //         transition: all 0.5s ease;




    //         .item {

    //             background-color: rgb(228, 225, 225);
    //             border-radius: 20px;
    //             padding: 3px;
    //             display: flex;
    //             flex-direction: row;
    //             position: relative;


    //             .cover {
    //                 width: 640px;
    //                 height: 360px;
    //                 border-radius: 20px;
    //                 overflow: hidden;

    //                 img {
    //                     width: 100%;
    //                     height: 100%;
    //                     object-fit: cover;
    //                 }
    //             }

    //             .info {
    //                 background-color: rgba(255, 255, 255, 0.3);
    //                 position: absolute;
    //                 margin: 20px;
    //                 bottom: 10px;
    //                 padding: 10px 15px;
    //                 border-radius: 10px;
    //                 display: flex;
    //                 flex-direction: column;

    //                 .name {
    //                     font-size: 30px;
    //                     line-height: 30px;
    //                     font-family: '优设标题黑';
    //                 }

    //                 .intro {
    //                     padding: 5px 0;
    //                     font-size: 16px;
    //                     color: #333;
    //                     letter-spacing: 0.5px;
    //                 }

    //                 .tags {
    //                     margin-top: 5px;
    //                     display: flex;
    //                     gap: 10px;

    //                     span {
    //                         background-color: rgba(255, 255, 255, 0.6);
    //                         padding: 4px 8px;
    //                         font-family: '优设标题黑';
    //                         font-size: 12px;
    //                         border-radius: 8px;
    //                         border: 1px solid rgba(255, 255, 255, 0.5);
    //                     }
    //                 }
    //             }


    //             .btns {

    //                 display: flex;
    //                 gap: 10px;
    //                 position: absolute;
    //                 right: 10px;
    //                 margin: 10px;

    //                 .btn {
    //                     width: 15px;
    //                     height: 15px;
    //                     background-color: rgba(255, 255, 255, 0.582);
    //                     border-radius: 50%;
    //                     display: flex;
    //                     align-items: center;
    //                     justify-content: center;
    //                     font-size: 18px;
    //                     color: #333;
    //                     transition: all 0.5s ease;

    //                     &:hover {
    //                         background-color: #4960ad;
    //                         color: white;
    //                         transition: all 0.5s ease;

    //                     }
    //                 }
    //             }


    //         }


    //     }




    // }


}





// .line-two:hover {
//     width: 1200px;
//     transition: all 0.5s ease;
// }


@media (max-width: 768px) {
    .home-all {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0;
        // 给导航栏预留空间
        padding-top: 60px;

        overflow-y: scroll;





        .line-one {
            display: flex;
            flex-direction: column;
            gap: 30px;


            .personal-info,
            .personal-info:hover {

                background-color: rgba(245, 245, 255, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.5);

                width: 320px;
                min-height: 320px;

                padding: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                border-radius: 20px;
                position: relative;
                transition: all 0.5s ease;


                .title {
                    position: absolute;
                    left: 10px;
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 6px 10px;
                    border-radius: 18px;
                    font-size: 12px;

                    letter-spacing: 1px;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    line-height: 10px;
                    border: 1.5px solid white;
                    transition: all 0.5s ease;

                    i {
                        font-size: 13px;
                    }



                }

                .profile-picture {

                    width: 40px;
                    height: 40px;
                    background-color: aliceblue;
                    border-radius: 30%;
                    padding: 4px;
                    margin: 5px;
                    margin-top: 50px;
                    transition: all 0.5s ease;

                    img {
                        width: 100%;
                        height: 100%;
                        border-radius: 30%;

                    }
                }

                .author {
                    margin-top: 5px;
                    padding: 5px;
                    font-size: 12px;
                    font-family: '优设标题黑';

                    background-color: rebeccapurple;
                }

                .motto {
                    padding: 5px;
                    font-size: 12px;
                    transition: all 0.5s ease;

                }

                .social-links {
                    padding: 5px;
                    display: flex;
                    transition: all 0.5s ease;

                    .link,
                    .link:hover {
                        margin: 5px;
                        background-color: white;
                        color: #333;
                        padding: 1px;
                        border-radius: 50%;
                        transition: all 0.5s ease;
                        border: 2px solid transparent;

                        i {
                            font-size: 16px;
                            transition: all 0.5s ease;

                        }
                    }

                }

                .tip {
                    color: #333;
                    padding: 10px;
                    margin-top: 10px;
                    line-height: 20px;
                    font-size: 14px;
                    background-color: rgba(255, 255, 255, 0.5);
                    border-radius: 10px;
                    transition: all 0.5s ease;

                }


            }




            .latest-updates,
            .latest-updates:hover {
                width: 320px;
                height: 320px;
                flex: 1;
                background-color: rgba(245, 245, 255, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.5);

                display: flex;
                flex-direction: column;

                padding: 10px;
                gap: 10px;
                border-radius: 20px;


                position: relative;

                transition: all 0.5s ease;


                .title {
                    position: absolute;
                    left: 10px;
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 6px 10px;
                    border-radius: 18px;
                    font-size: 12px;

                    letter-spacing: 1px;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    line-height: 10px;
                    border: 1.5px solid white;
                }

                .content {
                    margin-top: 50px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;

                    .item {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin: 0px 10px;

                        .item-name {
                            background-color: rgba(255, 255, 255, 0.6);
                            padding: 4px 8px;
                            font-family: '优设标题黑';
                            font-size: 12px;
                            border-radius: 8px;
                            border: 1px solid rgba(255, 255, 255, 0.5);

                        }

                        .item-info {
                            font-size: 12px;
                            padding: 4px 10px;
                            border-radius: 10px;
                            background-color: rgba(255, 255, 255, 0.514);

                        }
                    }
                }


            }



            .site-info,
            .site-info:hover {
                position: relative;
                width: 300px;
                height: 300px;
                background-color: rgba(245, 245, 255, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.5);


                border-radius: 20px;

                display: flex;
                flex-direction: column;
                transition: all 0.5s ease;



                .site-info-title {
                    position: absolute;

                    left: 10px;
                    top: 10px;
                    background-color: rgba(255, 255, 255, 0.5);
                    padding: 6px 10px;
                    border-radius: 18px;
                    font-size: 12px;

                    letter-spacing: 1px;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    line-height: 10px;
                    border: 1.5px solid white;
                    transition: all 0.5s ease;
                }

                .content {
                    margin-top: 40px;
                    padding: 10px;
                    transition: all 0.5s ease;

                    .info-one {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        transition: all 0.5s ease;

                        .item {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 5px;
                            background-color: rgba(255, 255, 255, 0.5);
                            padding: 10px;
                            transition: all 0.5s ease;
                            border-radius: 10px;



                            .item-info {
                                padding: 4px 8px;
                                background-color: white;
                                border-radius: 8px;
                                color: #333;
                                font-size: 14px;
                                font-family: '优设标题黑';
                                transition: all 0.5s ease;
                            }

                            .item-name {
                                font-size: 12px;
                                transition: all 0.5s ease;
                            }
                        }

                    }


                }
            }


        }
    }
}
</style>