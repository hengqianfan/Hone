<script setup lang="ts">
import { computed } from 'vue';

/* ============ 类型 ============ */
interface SocialLink {
    label: string;
    href: string;
    icon: string;
}

interface Project {
    name: string;
    desc: string;
    stars: number;
    lang: string;
    href: string;
}

/* ============ 个人信息 ============ */
const profile = {
    name: '衡千帆',
    role: '前端工程师 / 全栈开发',
    location: '中国 · 杭州',
    bio: '把复杂的东西做简单，喜欢折腾构建工具与动效。',
    avatar: '', // 留空显示首字母
};

const socials: SocialLink[] = [
    {
        label: 'GitHub',
        href: 'https://github.com/your-handle',
        icon: 'M12 2C6.475 2 2 6.475 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.56 9.56 0 0 1 12 6.8c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.525-4.475-10-10-10Z',
    },
    {
        label: '邮箱',
        href: 'mailto:you@example.com',
        icon: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 2v.4l8 5 8-5V6H4Zm16 2.75-7.45 4.66a1 1 0 0 1-1.1 0L4 8.75V18h16V8.75Z',
    },
    {
        label: '掘金',
        href: 'https://juejin.cn/user/your-id',
        icon: 'M12 2 2 9l10 7 10-7-10-7Zm0 2.32L18.53 9 12 13.68 5.47 9 12 4.32ZM2 15l10 7 10-7-1.7-1.19L12 19.32l-8.3-5.51L2 15Z',
    },
    {
        label: '博客',
        href: 'https://your-blog.com',
        icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-2.6a15.6 15.6 0 0 0-1.4-3.5A8.05 8.05 0 0 1 18.9 8ZM12 4c.8 1.1 1.5 2.4 1.9 4h-3.8c.4-1.6 1.1-2.9 1.9-4ZM4.3 14a8.1 8.1 0 0 1 0-4h2.9a17 17 0 0 0 0 4H4.3ZM5.1 16h2.6c.35 1.28.83 2.44 1.4 3.5A8.05 8.05 0 0 1 5.1 16Zm2.6-8H5.1a8.05 8.05 0 0 1 4-3.5A15.6 15.6 0 0 0 7.7 8ZM12 20c-.8-1.1-1.5-2.4-1.9-4h3.8c-.4 1.6-1.1 2.9-1.9 4Zm2.34-6H9.66a15 15 0 0 1 0-4h4.68a15 15 0 0 1 0 4Zm.56 5.5c.57-1.06 1.05-2.22 1.4-3.5h2.6a8.05 8.05 0 0 1-4 3.5Zm1.8-5.5a17 17 0 0 0 0-4h2.9a8.1 8.1 0 0 1 0 4h-2.9Z',
    },
];

/* ============ 推荐项目 ============ */
const projects: Project[] = [
    {
        name: 'website-nav',
        desc: '黑色玻璃风格的网站导航页，分类、标签、防抖搜索，纯前端零依赖。',
        stars: 128,
        lang: 'Vue',
        href: 'https://github.com/your-handle/website-nav',
    },
    {
        name: 'awesome-cli',
        desc: '按需生成脚手架的 CLI 工具，支持插件化模板与多包管理。',
        stars: 76,
        lang: 'TypeScript',
        href: 'https://github.com/your-handle/awesome-cli',
    },
];

/* ============ 计算属性 ============ */
const avatarText = computed(() => profile.name.trim().charAt(0) || '?');
</script>

<template>
    <div class="card-page">
        <!-- ============ 个人介绍卡片（头像在左，信息在右） ============ -->
        <article class="pcard">
            <div class="pcard__glow" aria-hidden="true" />

            <div class="pcard__main">
                <!-- 左侧：头像 -->
                <div class="pcard__avatar">
                    <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
                    <span v-else class="pcard__avatar-text">{{ avatarText }}</span>
                </div>

                <!-- 右侧：信息 -->
                <div class="pcard__info">
                    <header class="pcard__head">
                        <h1 class="pcard__name">{{ profile.name }}</h1>
                        <p class="pcard__role">{{ profile.role }}</p>
                    </header>

                    <p class="pcard__bio">{{ profile.bio }}</p>

                    <p class="pcard__location">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
                            <path
                                d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                        </svg>
                        {{ profile.location }}
                    </p>

                    <div class="pcard__socials">
                        <a v-for="s in socials" :key="s.label" class="psocial" :href="s.href" target="_blank"
                            rel="noopener noreferrer" :aria-label="s.label" :title="s.label">
                            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
                                <path :d="s.icon" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <!-- ============ 卡内推荐项目（左右并排） ============ -->
            <section class="pcard__projects" aria-label="推荐项目">
                <header class="dock__head">
                    <span class="dock__dot" aria-hidden="true" />
                    <span class="dock__title">推荐项目</span>
                </header>

                <ul class="dock__list">
                    <li v-for="p in projects" :key="p.name" class="dock__item">
                        <a class="dock__link" :href="p.href" target="_blank" rel="noopener noreferrer">
                            <span class="dock__top">
                                <span class="dock__icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                                        <path
                                            d="M4 4h6l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                                    </svg>
                                </span>
                                <span class="dock__arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M7 17 17 7M9 7h8v8" />
                                    </svg>
                                </span>
                            </span>

                            <span class="dock__name">{{ p.name }}</span>
                            <span class="dock__desc">{{ p.desc }}</span>

                            <span class="dock__meta">
                                <span class="dock__lang">
                                    <i class="dock__lang-dot" aria-hidden="true" />
                                    {{ p.lang }}
                                </span>
                                <span class="dock__star">
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"
                                        aria-hidden="true">
                                        <path
                                            d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21l6.18-3.73Z" />
                                    </svg>
                                    {{ p.stars }}
                                </span>
                            </span>
                        </a>
                    </li>
                </ul>
            </section>
        </article>
    </div>
</template>

<style lang="scss" scoped>
/* ==================== 页面容器：整体居中 ==================== */
.card-page {
    color-scheme: dark;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 56px 24px;
    color: #e8e8ea;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
}

/* ==================== 个人卡片：横向长方形 ==================== */
.pcard {
    position: relative;
    width: 100%;
    max-width: 780px;
    /* 横向长方形 */
    padding: 44px 48px 40px;
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(18, 18, 20, 0.58);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.9),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    transition: border-color 0.3s ease;
}

.pcard:hover {
    border-color: rgba(139, 139, 255, 0.32);
}

/* 卡片顶部柔光 */
.pcard__glow {
    position: absolute;
    top: -140px;
    left: 50%;
    width: 460px;
    height: 280px;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(139, 139, 255, 0.2), transparent 70%);
    pointer-events: none;
}

/* ==================== 顶部主体：头像在左 + 信息在右 ==================== */
.pcard__main {
    position: relative;
    display: flex;
    align-items: center;
    gap: 30px;
}

/* 头像：左侧，尺寸与左侧栏对齐 */
.pcard__avatar {
    flex: none;
    width: 108px;
    height: 108px;
    border-radius: 50%;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(139, 139, 255, 0.28), rgba(139, 139, 255, 0.08));
    border: 1px solid rgba(139, 139, 255, 0.45);
    box-shadow: 0 0 0 7px rgba(139, 139, 255, 0.08);
}

.pcard__avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.pcard__avatar-text {
    font-size: 40px;
    font-weight: 700;
    color: #8b8bff;
}

/* 右侧信息区：左对齐，纵向分布 */
.pcard__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    text-align: left;
}

.pcard__head {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 10px;
}

.pcard__name {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: #e8e8ea;
}

.pcard__role {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: #8b8bff;
    background: rgba(139, 139, 255, 0.12);
    border: 1px solid rgba(139, 139, 255, 0.3);
    border-radius: 999px;
}

.pcard__bio {
    margin: 0 0 10px;
    font-size: 14px;
    line-height: 1.75;
    color: #9a9aa2;
}

.pcard__location {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 16px;
    font-size: 13px;
    color: #6b6b74;
}

.pcard__socials {
    display: flex;
    gap: 10px;
}

.psocial {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    color: #9a9aa2;
    background: rgba(28, 28, 32, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: color 0.18s ease, background 0.18s ease,
        border-color 0.18s ease, transform 0.18s ease;
}

.psocial:hover {
    color: #8b8bff;
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(139, 139, 255, 0.14);
    transform: translateY(-3px);
}

/* ==================== 卡内推荐项目（左右并排） ==================== */
.pcard__projects {
    margin-top: 30px;
    padding-top: 26px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dock__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.dock__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8b8bff;
    box-shadow: 0 0 9px 1px rgba(139, 139, 255, 0.75);
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.4;
    }
}

.dock__title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1.2px;
    color: #9a9aa2;
}

.dock__list {
    display: grid;
    /* 关键：左右并排两列，不再一行一个 */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;
    text-align: left;
}

.dock__link {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
    padding: 14px 15px 15px;
    text-decoration: none;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(28, 28, 32, 0.6);
    transition: border-color 0.2s ease, background 0.2s ease,
        transform 0.2s ease, box-shadow 0.2s ease;
}

.dock__link:hover {
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(139, 139, 255, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 14px 28px -18px rgba(0, 0, 0, 0.9);
}

/* 卡片顶行：图标 + 角标箭头 */
.dock__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dock__icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    color: #8b8bff;
    background: rgba(139, 139, 255, 0.14);
    border: 1px solid rgba(139, 139, 255, 0.22);
    transition: background 0.2s ease, transform 0.2s ease;
}

.dock__link:hover .dock__icon {
    background: rgba(139, 139, 255, 0.22);
    transform: scale(1.06);
}

.dock__name {
    font-size: 14.5px;
    font-weight: 650;
    color: #e8e8ea;
}

.dock__desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: #8b8b93;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.dock__meta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    padding-top: 4px;
    font-size: 12px;
    color: #6b6b74;
}

.dock__lang {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.dock__lang-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #8b8bff;
}

.dock__star {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #9a9aa2;
}

.dock__arrow {
    flex: none;
    display: grid;
    place-items: center;
    color: #6b6b74;
    opacity: 0;
    transform: translate(-4px, 4px);
    transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.dock__link:hover .dock__arrow {
    opacity: 1;
    transform: translate(0, 0);
    color: #8b8bff;
}

/* ==================== 无障碍 & 动效 ==================== */
.card-page :focus-visible {
    outline: 2px solid #8b8bff;
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {

    .card-page *,
    .dock__dot {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
    .card-page {
        padding: 40px 16px;
    }

    .pcard {
        max-width: 100%;
        padding: 30px 22px 26px;
        border-radius: 24px;
    }

    /* 窄屏：头像与信息改为上下排列 */
    .pcard__main {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 18px;
    }

    .pcard__avatar {
        width: 92px;
        height: 92px;
    }

    .pcard__avatar-text {
        font-size: 34px;
    }

    .pcard__info {
        text-align: center;
        align-items: center;
    }

    .pcard__head {
        justify-content: center;
    }

    .pcard__socials {
        justify-content: center;
    }

    .dock__head {
        justify-content: center;
    }

    .pcard__projects {
        margin-top: 24px;
        padding-top: 20px;
    }

    /* 窄屏改为单列 */
    .dock__list {
        grid-template-columns: 1fr;
    }

    .dock__link:hover {
        transform: none;
    }

    .dock__arrow {
        display: none;
    }
}
</style>