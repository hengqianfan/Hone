<template>

    <div class="danmaku-wall" :class="{
        paused: hoverDanmaku
    }" @mouseenter="hoverDanmaku = true" @mouseleave="hoverDanmaku = false">


        <TransitionGroup name="danmaku-in">


            <component v-for="item in list" :key="item.id" :is="getComponent(item)"
                :to="isInternal(item.url) ? item.url : undefined" :href="isExternal(item.url) ? item.url : undefined"
                :target="isExternal(item.url) ? '_blank' : undefined" class="danmaku" :class="{ clickable: item.url }"
                :style="{
                    top: item.top + 'px',
                    left: item.start + 'px',
                    animationDuration: item.duration + 's',
                    animationDelay: item.delay + 's'
                }">


                <span class="icon">

                    {{ item?.icon || '💬' }}

                </span>


                <span class="text">

                    {{ item.text }}

                </span>


            </component>


        </TransitionGroup>


    </div>

</template>



<script setup lang="ts">


import {

    ref,

    onMounted,

    onUnmounted

} from "vue"



import {

    mottos,

    type Motto

} from "@/config/motto"





interface Danmaku extends Motto {


    id: number


    top: number


    start: number


    duration: number


    delay: number


}






const list =
    ref<Danmaku[]>([])



// 新增：全局悬停状态

const hoverDanmaku =
    ref(false)



const maxShow =
    ref(10)



let timer: number







function random(

    min: number,

    max: number

) {


    return Math.floor(

        Math.random()

        *

        (max - min)

        +

        min

    )

}







function calcShowCount() {
    const count = mottos.length
    if (count <= 20) return 8
    if (count <= 50) return 18
    if (count <= 100) return 30
    return 40
}







function isExternal(

    url?: string

) {


    if (!url)

        return false



    return /^https?:\/\//.test(url)


}



function isInternal(url?: string) {
    return Boolean(url && !isExternal(url))
}

function getComponent(
    item: Danmaku
) {
    if (!item.url)
        return "div"



    if (isExternal(item.url))

        return "a"



    return "router-link"


}


function createDanmaku(

    item: Motto,

    index: number,

    initial = false

): Danmaku {


    const rowCount = Math.min(

        maxShow.value,

        30

    )



    return {


        id:

            Date.now()

            +

            Math.random(),



        icon: item.icon,


        text: item.text,


        url: item.url,



        top:


            (

                index

                %

                rowCount

            )

            *

            (

                260

                /

                rowCount

            )

            +

            random(

                0,

                10

            ),



        start:

            initial

                ?

                random(

                    0,

                    window.innerWidth

                )

                :

                window.innerWidth + 100,



        duration:


            random(

                12,

                25

            ),




        delay:


            random(

                0,

                1

            )


    }


}







function init() {
    maxShow.value = calcShowCount()
    const data = [...mottos].sort(() => Math.random() - 0.5)



    list.value = data

        .slice(

            0,

            maxShow.value

        )

        .map(

            (item, index) =>

                createDanmaku(

                    item,

                    index,

                    true

                )

        )


}







function addDanmaku() {


    if (

        list.value.length

        >=

        maxShow.value

    )

        return



    const item =

        mottos[

        random(

            0,

            mottos.length

        )

        ]



    list.value.push(

        createDanmaku(

            item,

            list.value.length

        )

    )


}







onMounted(() => {


    init()



    timer =

        window.setInterval(() => {


            addDanmaku()



        }, 4000)


})







onUnmounted(() => {


    clearInterval(timer)


})



</script>





<style scoped lang="scss">
.danmaku-wall {
    position: relative;
    width: 100%;
    height: 320px;
    overflow: hidden;
    border-radius: 20px;
    background: rgba(0, 0, 0, .25);
    // backdrop-filter: blur(10px);

}





/*
 全局暂停
*/

.danmaku-wall.paused {

    .danmaku {
        animation-play-state: paused;
    }


}





.danmaku {


    position: absolute;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .15);
    border: 1px solid rgba(255, 255, 255, .15);
    backdrop-filter: blur(10px);
    color: white;
    white-space: nowrap;
    text-decoration: none;
    font-size: 14px;
    animation: move linear infinite;
    transition:
        background .3s ease,
        box-shadow .3s ease;


}



.danmaku:hover {
    color: var(--text-hover-color);
    background: rgba(255, 255, 255, .3);
    box-shadow: 0 0 25px rgba(255, 255, 255, .3);
}







.clickable {
    cursor: pointer;
}



.icon {
    font-size: 22px;
}

.text {
    font-weight: 600;

    &:hover {
        color: var(--text-hover-color);

    }
}





.clickable:hover .text {}



@keyframes move {
    from {
        transform: translateX(0);

    }



    to {


        transform:

            translateX(-120vw);


    }


}







/*
 弹幕进入动画
*/
.danmaku-in-enter-active {

    transition:
        opacity 1.2s ease;

}


.danmaku-in-enter-from {

    opacity: 0;

}


.danmaku-in-enter-to {

    opacity: 1;

}



.danmaku-in-leave-active {


    transition:

        opacity .5s ease;


}




.danmaku-in-leave-from {

    opacity: 1;

}




.danmaku-in-leave-to {


    opacity: 0;


}
</style>