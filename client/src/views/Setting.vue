<template>

    <div class="setting-page">


        <div class="header">

            <h1>
                设置
            </h1>


            <!-- <button @click="back">
                返回
            </button> -->


        </div>



        <section class="card">

            <h2>
                背景切换
            </h2>


            <div class="video-list">


                <div v-for="item in videos" :key="item" class="video-item" :class="{
                    active:
                        settingStore.videoName === item
                }" @click="changeVideo(item)">

                    {{ item }}

                </div>

            </div>

        </section>

        <!-- <section class="card">

            <h2>
                主题切换
            </h2>

            <div class="theme-list">

                <div v-for="item in themes" :key="item.key" class="theme-item" :class="{
                    active:
                        settingStore.theme === item.key
                }" @click="changeTheme(item.key)">

                    {{ item.name }}

                </div>

            </div>

        </section> -->

        <!-- <section class="card">

            <h2>
                站点管理
            </h2>

            <div class="theme-list">

                <div v-for="item in themes" :key="item.key" class="theme-item" :class="{
                    active:
                        settingStore.theme === item.key
                }" @click="changeTheme(item.key)">

                    {{ item.name }}

                </div>

            </div>

        </section> -->


    </div>


</template>



<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useSettingStore } from '@/stores/settings'



const router = useRouter()


const settingStore = useSettingStore()



const videos = [

    '夏夜郊野',

    '城市霓虹',

    '海边列车',

    '森林雪夜',

    '窗外雨夜',



]


const themes = [

    {
        name: '透黑',
        key: 'dark'
    },

    {
        name: '深蓝',
        key: 'blue'
    },

    {
        name: '粉红',
        key: 'pink'
    }

]


const changeTheme = (theme: string) => {

    // settingStore.changeTheme(theme)

}

const changeVideo = (name: string) => {

    settingStore.changeVideo(name)

}



const back = () => {

    router.back()

}


</script>

<style lang="scss" scoped>
.setting-page {


    min-height: 20vh;


    padding: 40px;
    padding-bottom: 80px;
    background: var(--bg-color);

    border-radius: 20px;



    .header {


        display: flex;

        justify-content: space-between;

        align-items: center;



        h1 {

            font-size: 30px;

        }


    }





    .card {


        margin-top: 40px;


        padding: 30px;



        border-radius: 20px;



        background:

            rgba(255, 255, 255, 0.2);



        backdrop-filter:

            blur(10px);



        box-shadow:

            0 20px 50px rgba(0, 0, 0, .1);



    }




    .video-list {


        display: flex;


        flex-wrap: wrap;


        gap: 15px;



        margin-top: 20px;



        .video-item {



            padding: 5px 12px;


            color: white;


            font-size: 13px;


            border-radius: 12px;



            cursor: pointer;



            background:

                rgba(255, 255, 255, .25);



            transition: .2s;



            &:hover {


                transform:

                    translateY(-3px);

            }




            &.active {


                background: #42b883;

                color: white;


            }


        }


    }

    .theme-list {

        display: flex;

        flex-wrap: wrap;

        gap: 8px;

        margin-top: 20px;

        .theme-item {


            padding: 5px 12px;


            color: white;


            font-size: 13px;


            border-radius: 12px;



            cursor: pointer;



            background:

                rgba(255, 255, 255, .25);



            transition: .2s;




            &:hover {

                background:

                    rgba(255, 255, 255, .5);

            }




            &.active {

                background: #42b883;

            }


        }

    }


}
</style>