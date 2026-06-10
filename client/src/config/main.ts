interface HoneConfig {
    siteName: string,
    author: string;
    motto: string
    socialLinks?: { name: string, icon: string, url: string }[]
    personalIntro: string
    iconServerIP: string
}


export const honeConfig: HoneConfig = {
    siteName: '界·衡千帆',
    author: '衡千帆',
    motto: '万事开头难，先完成，再完美',
    personalIntro: '技术发烧佬，中度社恐，在不同的领域都贡献了一些没用的东西。',

    // iconServerIP: 'https://raw.githubusercontent.com/hengqianfan/nIcon/refs/heads/main/repo/',
    iconServerIP: 'https://hengqianfan.github.io/NVP-ImageHost/images/icons/',


    socialLinks: [
        { name: '', icon: 'github', url: 'https://github.com/hengqianfan' },
        { name: '', icon: 'bilibili3', url: '' },
        { name: '', icon: 'heihe', url: '' },
        { name: '', icon: 'xhs', url: '' },
        { name: '', icon: 'douyin', url: '' },



    ]
}