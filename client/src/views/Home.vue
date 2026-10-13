<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
// TODO: 引入你的倒计时组件
import Countdown from '@/components/countdown/index.vue';
import { countdowns } from '@/config/countdowns';

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

interface Article {
    title: string;
    desc: string;
    date: string;
    tag: string;
    href: string;
}

/** 搜索引擎 */
interface SearchEngine {
    key: string;
    label: string;
    /** 关键词占位符，替换为 encodeURIComponent 后的关键词 */
    url: string;
    color: string;
    icon: string;
}

/* ============ 个人信息 ============ */
const profile = {
    name: '衡千帆',
    role: '技术爱好者 / 流浪型宅男',
    location: '中国 · 云南',
    bio: '先完成，再完美，然后完美',
    avatar: './favicon.ico', // 留空显示首字母
};

const socials: SocialLink[] = [
    {
        label: 'GitHub',
        href: 'https://github.com/your-handle',
        icon: 'github',
    },


    {
        label: 'Heihe',
        href: 'https://github.com/your-handle',
        icon: 'heihe',
    },


    {
        label: 'Bilibili',
        href: 'https://github.com/your-handle',
        icon: 'bilibili',
    },


    {
        label: 'douyin',
        href: 'https://github.com/your-handle',
        icon: 'douyin',
    },



];

/* ============ 搜索引擎配置 ============ */
const engines: [SearchEngine, ...SearchEngine[]] = [
    {
        key: 'google',
        label: 'Google',
        url: 'https://www.google.com/search?q=',
        color: '#4285f4',
        icon: 'M12 11v2.4h5.7c-.23 1.47-1.75 4.32-5.7 4.32A6.6 6.6 0 0 1 5.4 12 6.6 6.6 0 0 1 12 5.28c1.88 0 3.14.8 3.86 1.48l2.62-2.52C16.86 2.72 14.66 2 12 2a10 10 0 1 0 0 20c5.77 0 9.6-4.06 9.6-9.77 0-.66-.07-1.16-.16-1.66L12 11Z',
    },
    {
        key: 'baidu',
        label: '百度',
        url: 'https://www.baidu.com/s?wd=',
        color: '#2932e1',
        icon: 'M12 2C7.58 2 4 4.13 4 8.5c0 3.05 2.02 5.5 5.06 5.5h.19c.6 1.13.36 2.32-.53 3.1-.86.75-1.9 1.36-1.9 2.36 0 1.35 1.6 2.04 3.32 2.04 1.6 0 3.06-.55 4.34-1.36l.68.85C16.4 22.3 18.8 22 20 20.8c-.85-.36-1.72-1-2.06-1.86.6-1.02.6-2.2-.14-3.06C20.1 14.6 20 11.47 20 8.5 20 4.13 16.42 2 12 2Zm-4 5.5c.83 0 1.5 1.12 1.5 2.5S8.83 12.5 8 12.5 6.5 11.38 6.5 10 7.17 7.5 8 7.5Zm7.3.4c1.02.1 1.7 1.32 1.53 2.72-.18 1.4-1.13 2.46-2.15 2.37-1.02-.1-1.7-1.32-1.52-2.72.17-1.4 1.12-2.46 2.14-2.37Z',
    },
    {
        key: 'bing',
        label: 'Bing',
        url: 'https://www.bing.com/search?q=',
        color: '#0c8484',
        icon: 'M5 3v15.3l3.6 2.2 5.1-2.9v-3.1L9.4 12V6.1L5 3Zm6.6 2.2v9.9l2.3 1.3 4.6-2.6c1.5-.85 1.5-2.9 0-3.75l-6.9-4.85Z',
    },
    {
        key: 'github',
        label: 'GitHub',
        url: 'https://github.com/search?q=',
        color: '#e8e8ea',
        icon: 'M12 2C6.475 2 2 6.475 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.56 9.56 0 0 1 12 6.8c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.525-4.475-10-10-10Z',
    },
    {
        key: 'juejin',
        label: '掘金',
        url: 'https://juejin.cn/search?query=',
        color: '#1e80ff',
        icon: 'M12 2 2 9l10 7 10-7-10-7Zm0 2.32L18.53 9 12 13.68 5.47 9 12 4.32ZM2 15l10 7 10-7-1.7-1.19L12 19.32l-8.3-5.51L2 15Z',
    },
];

const SEARCH_CACHE_KEY = 'hone:search-engine';
const KEYWORD_CACHE_KEY = 'hone:search-keyword';

const keyword = ref('');
const activeKey = ref<string>(engines[0].key || '');

/** 下拉面板开关 */
const engineMenuOpen = ref(false);
/** 整个切换器的根元素，用于点击外部关闭 */
const switcherRef = ref<HTMLElement | null>(null);

const activeEngine = computed<SearchEngine>(
    () => engines.find((e) => e.key === activeKey.value) ?? engines[0]
);

/** 执行搜索 */
function doSearch() {
    const kw = keyword.value.trim();
    if (!kw) return;
    const target = activeEngine.value;
    window.open(target.url + encodeURIComponent(kw), '_blank', 'noopener,noreferrer');
    try {
        localStorage.setItem(KEYWORD_CACHE_KEY, kw);
    } catch {
        /* 隐私模式等场景忽略 */
    }
}

/** 切换引擎 */
function selectEngine(key: string) {
    activeKey.value = key;
    engineMenuOpen.value = false;
    try {
        localStorage.setItem(SEARCH_CACHE_KEY, key);
    } catch {
        /* ignore */
    }
}

/** 点击外部 / Esc 关闭下拉 */
function onDocPointerDown(e: MouseEvent) {
    if (!engineMenuOpen.value) return;
    const root = switcherRef.value;
    if (root && !root.contains(e.target as Node)) {
        engineMenuOpen.value = false;
    }
}
function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') engineMenuOpen.value = false;
}

onMounted(() => {
    try {
        const cachedEngine = localStorage.getItem(SEARCH_CACHE_KEY);
        if (cachedEngine && engines.some((e) => e.key === cachedEngine)) {
            activeKey.value = cachedEngine;
        }
        const cachedKeyword = localStorage.getItem(KEYWORD_CACHE_KEY);
        if (cachedKeyword) keyword.value = cachedKeyword;
    } catch {
        /* ignore */
    }

    document.addEventListener('pointerdown', onDocPointerDown);
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocPointerDown);
    document.removeEventListener('keydown', onKeydown);
});

/* 输入内容变化时同步缓存，避免只在提交时记录 */
watch(keyword, (v) => {
    try {
        localStorage.setItem(KEYWORD_CACHE_KEY, v);
    } catch {
        /* ignore */
    }
});

/* ============ 推荐项目 ============ */
const projects: Project[] = [
    {
        name: 'HEngine',
        desc: '个人管理系统',
        stars: 128,
        lang: 'Vue',
        href: 'https://github.com/your-handle/website-nav',
    },
    {
        name: 'NiuZone',
        desc: '基于 NVP-Local 的个人网络社区',
        stars: 76,
        lang: 'TypeScript',
        href: 'https://github.com/your-handle/awesome-cli',
    },
];

/* ============ 推荐文章 ============ */
const articles: Article[] = [
    {
        title: '用 Vue 3 + Vite 搭建个人博客',
        desc: '从零搭建、路由、暗色主题与部署上线的完整流程。',
        date: '2025-03-18',
        tag: '前端',
        href: 'https://your-blog.com/vue-blog',
    },
    {
        title: 'CSS 玻璃拟态的 8 个细节',
        desc: 'backdrop-filter、边框高光与性能取舍的实战笔记。',
        date: '2025-02-06',
        tag: 'CSS',
        href: 'https://your-blog.com/glassmorphism',
    },
    {
        title: 'TypeScript 类型体操入门',
        desc: '条件类型、映射类型与 infer 的常见套路速查。',
        date: '2025-01-21',
        tag: 'TypeScript',
        href: 'https://your-blog.com/ts-types',
    },
];

/* ============ 计算属性 ============ */
const avatarText = computed(() => profile.name.trim().charAt(0) || '?');
</script>

<template>
    <div class="card-page">
        <div class="card-page__grid">
            <!-- ============ 左列：个人卡片 + 搜索卡片 + 倒计时卡片（竖向排布） ============ -->
            <div class="card-page__left">
                <!-- 个人介绍卡片 -->
                <article class="pcard">
                    <div class="pcard__glow" aria-hidden="true" />

                    <div class="pcard__main">
                        <!-- 头像 -->
                        <div class="pcard__avatar">
                            <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
                            <span v-else class="pcard__avatar-text">{{ avatarText }}</span>
                        </div>

                        <!-- 名字 + 角色 -->
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
                                <i :class="`iconfont icon-${s.icon}`"></i>
                            </a>
                        </div>
                    </div>
                </article>

                <!-- ============ 快速搜索卡片 ============ -->
                <section class="card scard" aria-label="快速搜索">


                    <form class="sform" @submit.prevent="doSearch">
                        <!-- 单个引擎图标：点击展开选择菜单 -->
                        <div ref="switcherRef" class="sengine-switch">
                            <button type="button" class="sengine-trigger" :class="{ 'is-open': engineMenuOpen }"
                                :aria-expanded="engineMenuOpen" aria-haspopup="listbox" :title="activeEngine.label"
                                @click="engineMenuOpen = !engineMenuOpen">
                                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="currentColor"
                                    :style="{ color: activeEngine.color }">
                                    <path :d="activeEngine.icon" />
                                </svg>
                            </button>

                            <!-- 下拉菜单 -->
                            <transition name="smenu">
                                <ul v-if="engineMenuOpen" class="sengine-menu" role="listbox"
                                    :aria-activedescendant="`engine-${activeKey}`">
                                    <li v-for="e in engines" :key="e.key" :id="`engine-${e.key}`" class="sengine-item"
                                        role="option" :aria-selected="e.key === activeKey"
                                        :class="{ 'is-active': e.key === activeKey }" @click="selectEngine(e.key)">
                                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"
                                            fill="currentColor" :style="{ color: e.color }">
                                            <path :d="e.icon" />
                                        </svg>
                                        <span>{{ e.label }}</span>
                                    </li>
                                </ul>
                            </transition>
                        </div>

                        <input v-model="keyword" class="sform__input" type="text"
                            :placeholder="`用 ${activeEngine.label} 搜索…`" autocomplete="off" spellcheck="false"
                            aria-label="搜索关键词" />

                        <button v-if="keyword" type="button" class="sform__clear" aria-label="清空" @click="keyword = ''">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round">
                                <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        </button>

                        <button type="submit" class="sform__submit" aria-label="搜索" :disabled="!keyword.trim()">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 12h13M13 6l6 6-6 6" />
                            </svg>
                        </button>
                    </form>
                </section>

                <!-- 倒计时卡片：外层玻璃壳 + 你的 Countdown 组件 -->
                <section class="card ccard" aria-label="倒计时">
                    <header class="card__head">
                        <span class="card__dot card__dot--warm" aria-hidden="true" />
                        <span class="card__title">倒计时</span>
                    </header>

                    <div class="ccard__body">
                        <Countdown :list="countdowns" />
                    </div>
                </section>
            </div>

            <!-- ============ 右列：推荐项目 + 推荐文章 ============ -->
            <div class="card-page__side">
                <!-- 推荐项目卡片 -->
                <section class="card card--projects" aria-label="推荐项目">
                    <header class="card__head">
                        <span class="card__dot" aria-hidden="true" />
                        <span class="card__title">推荐项目</span>
                    </header>

                    <ul class="proj-list">
                        <li v-for="p in projects" :key="p.name" class="proj-item">
                            <a class="proj-link" :href="p.href" target="_blank" rel="noopener noreferrer">
                                <span class="proj-top">
                                    <span class="proj-icon" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                                            <path
                                                d="M4 4h6l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                                        </svg>
                                    </span>
                                    <span class="proj-arrow" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round">
                                            <path d="M7 17 17 7M9 7h8v8" />
                                        </svg>
                                    </span>
                                </span>

                                <span class="proj-name">{{ p.name }}</span>
                                <span class="proj-desc">{{ p.desc }}</span>

                                <span class="proj-meta">
                                    <span class="proj-lang">
                                        <i class="proj-lang-dot" aria-hidden="true" />
                                        {{ p.lang }}
                                    </span>
                                    <span class="proj-star">
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

                <!-- 推荐文章卡片 -->
                <section class="card card--articles" aria-label="推荐文章">
                    <header class="card__head">
                        <span class="card__dot card__dot--alt" aria-hidden="true" />
                        <span class="card__title">推荐文章</span>
                    </header>

                    <ul class="art-list">
                        <li v-for="a in articles" :key="a.title" class="art-item">
                            <a class="art-link" :href="a.href" target="_blank" rel="noopener noreferrer">
                                <span class="art-main">
                                    <span class="art-title">{{ a.title }}</span>
                                    <span class="art-desc">{{ a.desc }}</span>
                                    <span class="art-meta">
                                        <span class="art-tag">{{ a.tag }}</span>
                                        <span class="art-date">{{ a.date }}</span>
                                    </span>
                                </span>
                                <span class="art-arrow" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M7 17 17 7M9 7h8v8" />
                                    </svg>
                                </span>
                            </a>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
/* ==================== 页面容器 ==================== */
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

/* 两列网格：左个人信息(+搜索+倒计时) / 右项目 + 文章
   align-items: stretch（默认）让两列格子等高，这是「左右等高」的关键 */
.card-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
    gap: 24px;
    width: 100%;
    max-width: 980px;
    align-items: stretch;
}

/* 左列：竖向 flex 容器，个人卡片 + 搜索卡片 + 倒计时卡片 */
.card-page__left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    height: 100%;
    /* 撑满 grid 单元高度 */
}

.card-page__side {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 0;
    height: 100%;
}

/* 关键：每列「最后一张卡片」吸收剩余高度，两列自然齐平 */
.card-page__left> :last-child,
.card-page__side> :last-child {
    flex: 1 1 auto;
}

/* ==================== 个人卡片 ==================== */
.pcard {
    position: relative;
    padding: 40px 34px 36px;
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(18, 18, 20, 0.58);

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
    height: 220px;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(139, 139, 255, 0.2), transparent 70%);
    pointer-events: none;
}

/* 主体：头像 + 信息竖向排列居中 */
.pcard__main {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
}

.pcard__avatar {
    flex: none;
    width: 60px;
    height: 60px;
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
    font-size: 44px;
    font-weight: 700;
    color: #8b8bff;
}

.pcard__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.pcard__name {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.4px;
    color: #e8e8ea;
}

.pcard__role {
    display: inline-block;
    margin: 0;
    padding: 4px 12px;
    font-size: 12px;
    letter-spacing: 0.3px;
    color: #8b8bff;
    background: rgba(139, 139, 255, 0.12);
    border: 1px solid rgba(139, 139, 255, 0.3);
    border-radius: 999px;
}

.pcard__bio {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #9a9aa2;
}

.pcard__location {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 12px;
    color: #6b6b74;
}

.pcard__socials {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 3px;
}

.psocial {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    color: #9a9aa2;

    background: rgba(28, 28, 32, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: color 0.18s ease, background 0.18s ease,
        border-color 0.18s ease, transform 0.18s ease;

    i {
        font-size: 20px;
    }
}

.psocial:hover {
    color: #8b8bff;
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(139, 139, 255, 0.14);
    transform: translateY(-3px);
}

/* ==================== 通用卡片 ==================== */
.card {
    padding: 22px 20px 20px;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(18, 18, 20, 0.58);

    box-shadow: 0 30px 70px -34px rgba(0, 0, 0, 0.9),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: border-color 0.3s ease;
}

.card:hover {
    border-color: rgba(139, 139, 255, 0.28);
}

.card__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;

}

.card__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8b8bff;
    box-shadow: 0 0 9px 1px rgba(139, 139, 255, 0.75);
    animation: pulse 2s ease-in-out infinite;
}

.card__dot--alt {
    background: #5ad1a5;
    box-shadow: 0 0 9px 1px rgba(90, 209, 165, 0.75);
}

.card__dot--warm {
    background: #ffb454;
    box-shadow: 0 0 9px 1px rgba(255, 180, 84, 0.75);
}

.card__dot--cool {
    background: #5cb8ff;
    box-shadow: 0 0 9px 1px rgba(92, 184, 255, 0.75);
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

.card__title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 1.2px;
    color: #9a9aa2;
}

/* ==================== 快速搜索卡片 ==================== */
.scard {
    position: relative;
    /* 让下拉菜单可以溢出卡片，且不裁切 */
    overflow: visible;
    padding: 10px;
    border-radius: 20px;
    // border-radius: 10px;
}



/* 输入表单 */
.sform {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(180deg, rgba(28, 28, 32, 0.78), rgba(22, 22, 26, 0.66));
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.sform:focus-within {
    border-color: rgba(92, 184, 255, 0.55);
    box-shadow: 0 0 0 3px rgba(92, 184, 255, 0.12);
}

/* 引擎切换器容器（相对定位，作为下拉菜单的锚点） */
.sengine-switch {
    position: relative;
    flex: none;
}

/* 单个引擎图标按钮 */
.sengine-trigger {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    cursor: pointer;
    background: rgba(28, 28, 32, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.sengine-trigger:hover {
    background: rgba(92, 184, 255, 0.12);
    border-color: rgba(92, 184, 255, 0.45);
}

.sengine-trigger.is-open {
    background: rgba(92, 184, 255, 0.16);
    border-color: rgba(92, 184, 255, 0.55);
    box-shadow: 0 0 0 3px rgba(92, 184, 255, 0.1);
}

/* 下拉菜单 */
.sengine-menu {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 20;
    min-width: 148px;
    margin: 0;
    padding: 6px;
    list-style: none;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(24, 24, 28, 0.96);
    backdrop-filter: blur(12px);
    box-shadow: 0 22px 46px -18px rgba(0, 0, 0, 0.95),
        inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.sengine-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px;
    color: #9a9aa2;
    cursor: pointer;
    transition: color 0.16s ease, background 0.16s ease;
}

.sengine-item:hover {
    color: #e8e8ea;
    background: rgba(255, 255, 255, 0.07);
}

.sengine-item.is-active {
    color: #e8e8ea;
    background: rgba(92, 184, 255, 0.14);
}

/* 下拉出现动画 */
.smenu-enter-active,
.smenu-leave-active {
    transition: opacity 0.16s ease, transform 0.16s ease;
}

.smenu-enter-from,
.smenu-leave-to {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
}

/* 输入框部分 */
.sform__input {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    padding: 7px 0;
    font-size: 13.5px;
    color: #e8e8ea;
    font-family: inherit;
}

.sform__input::placeholder {
    color: #5f5f68;
}

.sform__clear {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    cursor: pointer;
    color: #6b6b74;
    background: transparent;
    border: none;
    border-radius: 50%;
    transition: color 0.18s ease, background 0.18s ease;
}

.sform__clear:hover {
    color: #e8e8ea;
    background: rgba(255, 255, 255, 0.08);
}

.sform__submit {
    flex: none;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    cursor: pointer;
    color: #0f0f12;
    background: linear-gradient(135deg, #5cb8ff, #8b8bff);
    border: none;
    border-radius: 11px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.sform__submit:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 18px -8px rgba(92, 184, 255, 0.9);
}

.sform__submit:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

/* ==================== 倒计时卡片 ==================== */
.ccard {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.ccard::before {
    content: '';
    position: absolute;
    top: -120px;
    left: 50%;
    width: 380px;
    height: 220px;
    transform: translateX(-50%);
    background: radial-gradient(closest-side, rgba(255, 180, 84, 0.16), transparent 70%);
    pointer-events: none;
}

.ccard__body {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px 14px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(180deg, rgba(28, 28, 32, 0.72), rgba(22, 22, 26, 0.6));
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
}

/* 如果 Countdown 组件自身没有暗色适配，可按需放开下面两条 */
/* .ccard__body :deep(*) { color: #e8e8ea; } */
/* .ccard__body:empty::after { content: '暂无倒计时'; color: #6b6b74; font-size: 13px; } */

/* ==================== 推荐项目 ==================== */
.proj-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.proj-link {
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

.proj-link:hover {
    border-color: rgba(139, 139, 255, 0.45);
    background: rgba(139, 139, 255, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 14px 28px -18px rgba(0, 0, 0, 0.9);
}

.proj-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.proj-icon {
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

.proj-link:hover .proj-icon {
    background: rgba(139, 139, 255, 0.22);
    transform: scale(1.06);
}

.proj-name {
    font-size: 14.5px;
    font-weight: 650;
    color: #e8e8ea;
}

.proj-desc {
    font-size: 12.5px;
    line-height: 1.6;
    color: #8b8b93;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.proj-meta {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: auto;
    padding-top: 4px;
    font-size: 12px;
    color: #6b6b74;
}

.proj-lang {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.proj-lang-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #8b8bff;
}

.proj-star {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #9a9aa2;
}

.proj-arrow {
    flex: none;
    display: grid;
    place-items: center;
    color: #6b6b74;
    opacity: 0;
    transform: translate(-4px, 4px);
    transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.proj-link:hover .proj-arrow {
    opacity: 1;
    transform: translate(0, 0);
    color: #8b8bff;
}

/* ==================== 推荐文章 ==================== */
.art-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
}

.art-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    text-decoration: none;
    border-radius: 14px;
    border: 1px solid transparent;
    transition: border-color 0.2s ease, background 0.2s ease;
}

.art-link:hover {
    border-color: rgba(90, 209, 165, 0.35);
    background: rgba(90, 209, 165, 0.08);
}

.art-main {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
    flex: 1;
}

.art-title {
    font-size: 14px;
    font-weight: 600;
    color: #e8e8ea;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.art-desc {
    font-size: 12.5px;
    line-height: 1.55;
    color: #8b8b93;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.art-meta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 11.5px;
    color: #6b6b74;
}

.art-tag {
    padding: 2px 8px;
    border-radius: 999px;
    color: #5ad1a5;
    background: rgba(90, 209, 165, 0.12);
    border: 1px solid rgba(90, 209, 165, 0.28);
}

.art-arrow {
    flex: none;
    display: grid;
    place-items: center;
    color: #6b6b74;
    opacity: 0;
    transform: translate(-4px, 4px);
    transition: opacity 0.2s ease, transform 0.2s ease, color 0.2s ease;
}

.art-link:hover .art-arrow {
    opacity: 1;
    transform: translate(0, 0);
    color: #5ad1a5;
}

/* ==================== 无障碍 & 动效 ==================== */
.card-page :focus-visible {
    outline: 2px solid #8b8bff;
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {

    .card-page *,
    .card__dot {
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
    }
}

/* ==================== 响应式 ==================== */
@media (max-width: 900px) {
    .card-page {
        padding: 40px 16px;
        align-items: flex-start;
    }

    .card-page__grid {
        grid-template-columns: 1fr;
        gap: 20px;
        max-width: 560px;
    }

    .card-page__left,
    .card-page__side {
        height: auto;
    }

    .card-page__left> :last-child,
    .card-page__side> :last-child {
        flex: 0 0 auto;
    }

    .pcard {
        padding: 32px 24px 28px;
        border-radius: 24px;
    }

    .pcard__avatar {
        width: 96px;
        height: 96px;
    }

    .pcard__avatar-text {
        font-size: 38px;
    }

    .card {
        padding: 22px 18px 20px;
        border-radius: 22px;
    }
}

@media (max-width: 480px) {

    .proj-list {
        grid-template-columns: 1fr;
    }

    .ccard__body {
        padding: 14px 12px;
    }

    .sengine-menu {
        min-width: 132px;
    }

    .proj-link:hover,
    .psocial:hover {
        transform: none;
    }

    .proj-arrow,
    .art-arrow {
        display: none;
    }
}
</style>