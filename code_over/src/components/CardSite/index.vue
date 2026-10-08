<template>
    <div class="card-site-all">
        <div class="main">
            <div class="icon"><img src="../../assets/imgs/logo/favicon.ico" alt=""></div>
            <div class="info">
                <div class="name">github</div>
                <div class="intro">开源项目的中心</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.card-site-all {
    .main {
        background-color: var(--bg-color-2);
        display: flex;

        padding: 20px;
        width: 260px;
        border-radius: 10px;

        .icon {
            width: 60px;
            height: 60px;
            background-color: rgb(126, 118, 118);
            padding: 5px;
            border-radius: 50%;


            img {
                border-radius: 50%;
                width: 100%;
                height: 100%;
            }
        }

        .info {
            display: flex;
            flex-direction: column;
            padding: 5px;
            padding-left: 20px;

            .name {
                padding: 5px 10px;
                font-family: '优设标题黑';
            }

            .intro {
                padding: 5px 10px;
                font-size: 12px;

            }
        }
    }
}
</style>