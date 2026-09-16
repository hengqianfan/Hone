<template>
    <div class="life-all">
        <div class="moments">
            <div class="content">
                <div class="title"> Moments</div>
                <div class="records">
                    <div class="option">
                        <div class="icon"><i class="iconfont icon-calendar"></i></div>
                        <div class="info">
                            <div class="counts">{{ new Date().getFullYear() }}</div>
                            <div class="desc">Year</div>
                        </div>
                    </div>
                    <div class="option">
                        <div class="icon"><i class="iconfont icon-img2"></i></div>
                        <div class="info">
                            <div class="counts">{{ momentsStore.momentsList.length }}</div>
                            <div class="desc">Moments</div>
                        </div>
                    </div>
                    <div class="option">
                        <div class="icon"><i class="iconfont icon-location"></i></div>
                        <div class="info">
                            <div class="counts">{{ momentsStore.cityCount }}</div>
                            <div class="desc">Cities</div>
                        </div>
                    </div>
                </div>

                <div class="intro">
                    <p>人的记忆由不同的瞬间组成，常态是逐渐模糊，然后靠回忆维持，可是，清晰记录下来的喜与悲，未尝不算是一种更好的选择。</p>
                </div>
            </div>

            <!-- banner：三条数据 左一（大图）+ 右二（上下） -->
            <div class="banner">
                <!-- 左侧大图（第一条） -->
                <div v-if="momentsStore.threeMoments[0]" class="big-card">
                    <img :src="getImgURL_img(momentsStore.threeMoments[0].imgUrl)" alt="" />
                    <!-- 悬浮查看更多 -->
                    <div class="overlay" @click="openDetail(momentsStore.threeMoments[0])">
                        <span class="view-more">查看更多</span>
                    </div>
                    <div class="info">
                        <div class="time">
                            <i class="iconfont icon-clock"></i>
                            {{ formatDate2(momentsStore.threeMoments[0].date) }} {{ `|
                            ${momentsStore.threeMoments[0].location}` }}
                        </div>
                        <div class="desc">{{ momentsStore.threeMoments[0].desc }}</div>
                    </div>
                    <div class="tag">最新</div>
                </div>

                <!-- 右侧两张（上下排列） -->
                <div class="small-cards">
                    <div v-for="m in momentsStore.threeMoments.slice(1)" :key="m.date" class="small-card">
                        <img :src="getImgURL_img(m.imgUrl)" alt="" />
                        <!-- 悬浮查看更多 -->
                        <div class="overlay" @click="openDetail(m)">
                            <span class="view-more">查看更多</span>
                        </div>
                        <div class="info">
                            <div class="time">
                                <i class="iconfont icon-clock"></i>
                                {{ formatDate2(m.date) }} {{ `| ${m.location}` }}
                            </div>
                            <div class="desc">{{ m.desc }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { useMomentsStore } from '@/stores/moments'
import { formatDate2 } from '@/utils/textFormat'
import { getImgURL_img } from '@/utils/link'
import { useRouter } from 'vue-router'

const momentsStore = useMomentsStore()


const router = useRouter()
// 查看详情方法（可自行扩展，如跳转到详情页等）
function openDetail(m: any) {
    // TODO: 实现详情跳转逻辑
    router.push({
        name: 'Moments',
    })

}
</script>

<style lang="scss" scoped>
.life-all {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    .moments {
        display: flex;
        flex-direction: row;
        gap: 20px;
        background-color: var(--bg-color);
        padding: 20px;
        border-radius: 20px;

        .content {
            padding: 20px;
            background-color: var(--bg-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 20px;
            gap: 10px;
            position: relative;
            max-width: 520px;

            .title {
                font-size: 40px;
                font-weight: bold;
                padding-left: 5px;
                margin-bottom: 20px;
            }

            .records {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin: 10px 0;

                .option {
                    display: flex;
                    background-color: var(--bg-color);
                    align-items: center;
                    justify-content: center;
                    padding: 10px;
                    gap: 5px;
                    flex: 1;
                    border-radius: 10px;

                    .icon {
                        display: flex;
                        flex-direction: column;
                        align-items: center;

                        .iconfont {
                            font-size: 30px;
                            margin-bottom: 5px;
                        }
                    }

                    .info {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 5px;
                        padding: 5px 10px;

                        .counts {
                            font-size: 16px;
                            font-weight: bold;
                        }

                        .desc {
                            font-size: 12px;
                            color: #888;
                            flex-wrap: nowrap;
                        }
                    }
                }
            }

            .intro {
                padding: 20px;
                background-color: var(--bg-color);
                border-radius: 10px;
                margin: 0 auto;

                p {
                    font-size: 14px;
                    color: #888;
                    line-height: 20px;
                }
            }
        }

        // ========== 右侧 banner：三条数据 左一右二 ==========
        .banner {
            display: flex;
            flex-direction: row;
            gap: 5px;
            align-items: stretch;
            padding: 10px;
            background-color: var(--bg-color);
            border-radius: 20px;
            flex: 1;
            height: 400px;
            width: 600px;

            // 左侧大卡片
            .big-card {
                width: 260px;
                border-radius: 20px;
                position: relative;
                overflow: hidden;
                border: 10px solid rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.3s ease;
                    opacity: 0.8;

                    &:hover {
                        transform: scale(1.2);

                        opacity: 1;
                    }
                }

                // 悬浮遮罩层 + 查看更多
                .overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.45);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    cursor: pointer;
                    z-index: 2;

                    .view-more {
                        padding: 5px 10px;
                        border: 1px solid #fff;
                        border-radius: 20px;
                        color: #fff;
                        font-size: 12px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(2px);
                        transition: all 0.3s ease;

                        &:hover {
                            background: #fff;
                            color: #333;
                        }
                    }
                }

                &:hover .overlay {
                    opacity: 1;
                }

                .info {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 15px;
                    border-radius: 10px;
                    background-color: var(--bg-color);
                    z-index: 1;

                    .time {
                        font-size: 12px;
                        font-weight: bold;

                        i {
                            font-size: 12px;
                        }
                    }

                    .desc {
                        font-size: 12px;
                        opacity: 0.8;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 90%;
                    }
                }

                .tag {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: #ff6b6b;
                    color: #fff;
                    padding: 5px 10px;
                    border-radius: 10px;
                    font-size: 12px;
                    z-index: 1;
                }
            }

            // 右侧上下两张小卡片
            .small-cards {
                display: flex;
                flex-direction: column;
                gap: 5px;
                flex: 1;

                .small-card {
                    flex: 1;
                    border-radius: 20px;
                    position: relative;
                    overflow: hidden;
                    border: 10px solid rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: all 0.3s ease;
                        opacity: 0.8;

                        &:hover {
                            transform: scale(1.2);
                            opacity: 1;
                        }
                    }

                    // 悬浮遮罩层 + 查看更多
                    .overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.45);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        cursor: pointer;
                        z-index: 2;

                        .view-more {
                            padding: 5px 10px;
                            border: 1px solid #fff;
                            border-radius: 20px;
                            color: #fff;
                            font-size: 12px;
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(2px);
                            transition: all 0.3s ease;

                            &:hover {
                                background: #fff;
                                color: #333;
                            }
                        }
                    }

                    &:hover .overlay {
                        opacity: 1;
                    }

                    .info {
                        position: absolute;
                        bottom: 10px;
                        left: 10px;
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        padding: 12px;
                        border-radius: 10px;
                        max-width: 90%;
                        background-color: var(--bg-color);
                        z-index: 1;

                        .time {
                            font-size: 12px;
                            font-weight: bold;

                            i {
                                font-size: 12px;
                            }
                        }

                        .desc {
                            font-size: 12px;
                            opacity: 0.8;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                }
            }
        }
    }
}
</style>