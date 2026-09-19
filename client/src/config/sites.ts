import type { Site } from '@/types/site';
export const sites: Site[] = [
    // ---------- 001 编程世界 ----------
    {
        name: 'Github',
        categoryId: '001',
        kind: '代码托管',
        icon: 'github',
        desc: '全球最大的代码托管与开源协作平台',
        tags: ['github', 'git', '开源'],
        link: 'https://github.com',
    },

    {
        name: 'VitePress',
        categoryId: '001',
        kind: '技术文档',
        icon: 'vitepress',
        desc: '由 Vite 和 Vue 驱动的静态站点生成器，适合快速搭建文档站点',
        tags: ['静态站点', 'Vite', 'Vue'],
        link: 'https://vitepress.dev/',
    },

    {
        name: 'Iconify',
        categoryId: '001',
        kind: '设计资源',
        icon: 'iconify',
        desc: '统一访问 20 万+ 开源图标集的图标搜索与聚合平台',
        tags: ['图标', '设计资源', '开源'],
        link: 'https://iconify.design/',
    },

    {
        name: 'Simple Icons',
        categoryId: '001',
        kind: '设计资源',
        icon: 'simpleicons',
        desc: '开源的品牌与产品图标库，收录各大知名品牌的 SVG 图标',
        tags: ['图标', '设计资源', '品牌'],
        link: 'https://simpleicons.org/',
    },

    {
        name: 'Iconfont',
        categoryId: '001',
        kind: '设计资源',
        icon: 'iconfont',
        desc: '阿里巴巴矢量图标库，国内最大的图标与插画资源平台',
        tags: ['图标', '设计资源', '矢量'],
        link: 'https://www.iconfont.cn/',
    },

    {
        name: 'vcalendar',
        categoryId: '001',
        kind: '开源项目',
        desc: '开源的vue日历组件',
        tags: ['开源', '日历'],
        link: 'https://vcalendar.io/',
    },
    // ---------- 002 人工智能 ----------
    {
        name: 'CodeBuddy',
        categoryId: '002',
        kind: '对话模型',
        icon: 'codebuddy',
        desc: '基于 CNB 平台的 AI 员工，自主闭环研发任务。',
        tags: ['ai', '大模型'],
        link: 'https://cnb.cool/npc/CodeBuddy',
    },

    {
        name: 'Deepseek',
        categoryId: '002',
        kind: '对话模型',
        icon: 'deepseek',
        desc: '由深度求索公司打造的 AI 助手',
        tags: ['ai', '大模型', '深度求索'],
        link: 'https://www.deepseek.com/',
    },

    {
        name: 'GPT',
        categoryId: '002',
        kind: '对话模型',
        icon: 'openai',
        desc: '人工智能的里程碑',
        tags: ['ai', '大模型', 'openai'],
        link: 'https://chatgpt.com/',
    },

    {
        name: 'Gemini',
        categoryId: '002',
        kind: '对话模型',
        icon: 'googlegemini',
        desc: 'Google 推出的多模态 AI 助手，支持文本、图像、音视频理解与生成',
        tags: ['AI', '多模态', '对话助手'],
        link: 'https://gemini.google.com/',
    },

    {
        name: 'WorkBuddy',
        categoryId: '002',
        kind: '对话模型',
        icon: 'codebuddy',
        desc: '腾讯旗下的AI工作台',
        tags: ['大模型', 'ai'],
        link: 'https://www.workbuddy.ai/app',
    },
    // ---------- 003 视频音乐 ----------
    {
        name: 'Bilibili',
        categoryId: '003',
        kind: '综合类',
        icon: 'bilibili',
        desc: '长视频平台',
        tags: ['弹幕', '二次元', '教程'],
        link: 'https://www.bilibili.com/',
    },

    {
        name: 'YouTube',
        categoryId: '003',
        kind: '综合类',
        icon: 'youtube',
        desc: '全球最大的视频分享平台，提供海量视频观看与上传服务',
        tags: ['视频', '影音娱乐', '流媒体'],
        link: 'https://www.youtube.com/',
    },

    {
        name: '落雪音乐',
        categoryId: '003',
        kind: '音乐',
        icon: 'music',
        desc: '神级音乐播放软件',
        tags: ['开源', '音乐'],
        link: 'https://lxmusic.toside.cn/',
    },

    {
        name: '抖音',
        categoryId: '003',
        kind: '短视频',
        icon: 'tiktok',
        desc: '划时代的产物，潘多拉的魔盒',
        tags: ['字节', '短视频'],
        link: 'https://www.douyin.com/jingxuan',
    },
    // ---------- 004 游戏世界 ----------
    {
        name: 'Steam',
        categoryId: '004',
        kind: '游戏平台与官网',
        icon: 'steam',
        desc: '全球最大的数字游戏发行与社区平台',
        tags: ['游戏平台', '游戏', 'steam'],
        link: 'https://store.steampowered.com/',
    },

    {
        name: '逆水寒端游',
        categoryId: '004',
        kind: '游戏平台与官网',
        icon: 'game',
        desc: '经典的mmo游戏',
        tags: ['mmo', '游戏', '搬砖'],
        link: 'https://n.163.com/',
    },

    {
        name: '金铲铲之战',
        categoryId: '004',
        kind: '游戏平台与官网',
        desc: '腾讯旗下的热门自走棋游戏',
        tags: ['腾讯', '游戏'],
        link: 'https://jcc.qq.com/',
    },
    // ---------- 005 博客网站 ----------
    {
        name: '罗磊的独立博客',
        categoryId: '005',
        kind: '个人博客',
        desc: '比较现代化的程序员博客',
        tags: ['博客', '前端'],
        link: 'https://luolei.org/',
    },
    // ---------- 006 软件工具 ----------
    {
        name: '赔钱机场',
        categoryId: '006',
        kind: '网络工具',
        icon: 'vpn',
        desc: '便宜够用，网络还行',
        tags: ['vpn'],
        link: 'https://xn--cp3a08l.com/dashboard',
    },

    {
        name: '低价机场',
        categoryId: '006',
        kind: '网络工具',
        icon: 'vpn',
        desc: '备用，防止失联',
        tags: ['vpn'],
        link: 'https://xn--6nq0hk9tdjr.site/#/dashboard',
    },
    // ---------- 009 论坛资讯 ----------
    {
        name: '知乎',
        categoryId: '009',
        kind: '知识社区',
        icon: 'zhihu',
        desc: '老牌知识论坛',
        tags: ['社区', '知识'],
        link: 'https://www.zhihu.com/',
    },

    {
        name: '新浪微博',
        categoryId: '009',
        kind: '新闻资讯',
        icon: 'sinaweibo',
        desc: '即将成为时代的眼泪',
        tags: ['微博', '咨询'],
        link: 'https://weibo.com/',
    },
];