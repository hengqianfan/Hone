<template>
    <div class="profile-card">
        <div class="profile-card__body">
            <div class="logo">
                <img :src="logoUrl" alt="站点 Logo" width="60" height="60" />
            </div>

            <h1 class="name">{{ siteConfig.author }}</h1>
            <p class="motto">{{ siteConfig.motto }}</p>

            <div class="personal-intro" v-typewriter>
                {{ siteConfig.personalIntro }}
            </div>

            <nav class="social-links" aria-label="社交链接">
                <a v-for="item in siteConfig.socialLinks" :key="item.icon" :href="item.url" target="_blank"
                    rel="noopener noreferrer" :aria-label="item.name">
                    <i :class="`iconfont icon-${item.icon}`"></i>
                </a>
            </nav>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { honeConfig } from '@/config/main'
import logoUrl from '@/assets/imgs/logo/favicon.ico'

const siteConfig = honeConfig
</script>

<style lang="scss" scoped>
.profile-card {
    box-sizing: border-box;


    height: 100%;
    padding: 15px;
    border-radius: 20px;
    background: rgba(20, 20, 25, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:hover {
        border-color: rgba(255, 255, 255, 0.14);
        box-shadow: 0 14px 48px rgba(0, 0, 0, 0.45);
    }

    &__body {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px;
        border-radius: 14px;
        background: rgba(0, 0, 0, 0.5);
        text-align: center;
        min-width: 0;
    }
}

.logo {
    flex: none;
    width: 60px;
    height: 60px;
    margin-top: 8px;
    padding: 3px;
    box-sizing: border-box;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    background-color: rgb(56, 62, 66);
    overflow: hidden;
    transition: transform 0.6s ease;

    img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
    }

    &:hover {
        transform: rotate(360deg) scale(1.1);
    }
}

.name {
    margin: 10px 0;
    padding: 4px 12px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 2px;
}

.motto {
    margin: 0 0 10px;
    padding: 3px 8px;
    font-size: 14px;
    color: #918989;
}

.personal-intro {
    width: 500px;
    width: 100%;
    min-height: 80px;
    margin: 10px 0;
    padding: 10px 15px;
    box-sizing: border-box;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    color: #bdb7b7;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 1px;
    text-align: left;
    overflow-wrap: anywhere;
    overflow-y: auto;
}

.social-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin: 20px 0 0;

    a {
        display: grid;
        place-items: center;
        padding: 3px;
        border-radius: 50%;
        background-color: aliceblue;
        color: #111;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        i {
            font-size: 22px;
            color: var(--icon-color, #111);
            transition: color 0.3s ease;
        }

        &:hover {
            transform: scale(1.2);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);

            i {
                color: #0056b3;
            }
        }

        &:focus-visible {
            outline: 2px solid #7c93ff;
            outline-offset: 3px;
        }
    }
}
</style>