<template>
    <div class="setting-all">


        <!-- 设置按钮 -->
        <div class="main" @click="toggle">
        </div>



        <!-- 设置菜单 -->
        <Transition name="menu">

            <div class="menu" v-if="isOpen" @click.stop>


                <!-- 背景切换 -->
                <div class="menu-item">


                    <div class="title">
                        背景切换
                    </div>



                    <div class="content">


                        <div v-for="item in videos" :key="item" class="bg-item" :class="{
                            active:
                                settingStore.videoName === item
                        }" @click="changeVideo(item)">

                            {{ item }}

                        </div>



                    </div>


                </div>


            </div>


        </Transition>


    </div>
</template>



<script setup lang="ts">

import { ref } from 'vue'
import { useSettingStore } from '@/stores/settings'



const settingStore = useSettingStore()



const isOpen = ref(false)



const toggle = () => {

    isOpen.value = !isOpen.value

}




// 视频列表

const videos = [

    '乡村夜景',

    '云雾城市夜晚',

    '千与千寻',

    '开阔旷野',

    '森林雪夜',

    '雨夜',

    '雨天圣诞树'

]




// 切换背景

const changeVideo = (name: string) => {

    settingStore.changeVideo(name)

}



</script>

<style lang="scss" scoped>
.setting-all {


    position: fixed;


    width: 30px;

    height: 30px;


    top: 20px;

    right: 20px;


    z-index: 9999;



    border-radius: 50%;


    background-color:

        rgba(255, 255, 255, .4);



    box-shadow:

        0 2px 10px rgba(0, 0, 0, .1);



    display: flex;

    justify-content: center;

    align-items: center;



    .main {


        width: 20px;

        height: 20px;



        background: white;


        border:

            5px solid rgb(36, 33, 33);



        border-radius: 50%;



        cursor: pointer;



        transition: .3s;



        &:hover {

            transform: rotate(90deg);

        }


    }





    .menu {


        position: absolute;



        top: 50px;


        right: 0;



        width: 230px;



        padding: 15px;



        border-radius: 18px;




        background:

            rgba(119, 113, 113, .45);



        backdrop-filter:

            blur(15px);




        box-shadow:

            0 10px 30px rgba(0, 0, 0, .15);




        .menu-item {



            display: flex;

            flex-direction: column;


            gap: 12px;



            .title {

                width: 100px;
                color: #eee;
                font-size: 16px;
                // font-family: '优设标题黑';
                padding: 5px;
                letter-spacing: 1px;

            }



            .content {
                // margin-top: 10px;


                display: flex;


                flex-wrap: wrap;


                gap: 8px;



                .bg-item {



                    padding:

                        5px 10px;



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


    }


}





// 菜单动画

.menu-enter-active,

.menu-leave-active {

    transition: .25s;

}



.menu-enter-from,

.menu-leave-to {


    opacity: 0;


    transform:

        translateY(-10px) scale(.95);


}
</style>