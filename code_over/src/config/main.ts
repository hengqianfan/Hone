interface HoneConfig {
    siteTitle: string,
    siteIntro?: string,
    siteDescription?: string,
    author: string;
    motto: string
    socialLinks?: { name: string, icon: string, url: string }[]
    personalIntro: string
    imgServerBase?: string


    base?: string
}


export const honeConfig: HoneConfig = {
    base: '/Hone/',
    siteTitle: '界·衡千帆',
    siteIntro: '一个不能但想要永远更新的独立博客',
    siteDescription: '本站是 衡千帆 的个人博客，是基于自己开发的 Hone 项目构建的，我的博客经过几次更迭，我最终采用现今这样的极简又具有功能性的设计，记录和分享一些技术文章、生活碎片以及个人项目。',
    author: '衡千帆',
    motto: '万事开头难，先完成，再完美',
    personalIntro: '我？非先天性的中度社恐人士，无害型快乐宅男，技术发烧佬，乐于在不同的领域内贡献一些并没有什么毛用的东西。',
    // iconServerIP: 'https://raw.githubusercontent.com/hengqianfan/nIcon/refs/heads/main/repo/',
    // iconServerIP: 'https://hengqianfan.github.io/NVP-ImageHost/images/icons/',
    imgServerBase: 'https://hengqianfan.github.io/NVP-ImageHost/images/',
    // coverServerIP: 'https://hengqianfan.github.io/NVP-ImageHost/images/covers/',


    socialLinks: [
        { name: '', icon: 'github', url: 'https://github.com/hengqianfan' },
        { name: '', icon: 'bilibili3', url: '' },
        { name: '', icon: 'heihe', url: '' },
        { name: '', icon: 'xhs', url: '' },
        { name: '', icon: 'douyin', url: '' },



    ]
}