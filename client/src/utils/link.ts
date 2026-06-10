import { honeConfig } from '../config/main'
import { useRouter } from 'vue-router'
import { slugify } from '@/utils/textFormat'
const router = useRouter()




export const openLink = (url: string) => {
    // 存在链接时，才会跳转
    if (url) {
        window.open(url, '_blank')
    } return
}


export const openLinkByRouter = (url: string) => {
    if (url) {
        router.push({
            name: 'post',
            params: {
                slug: slugify(url)
            }
        })
    }
}

export const getIconURL_img = (mo: string, fallback = '/assets/icons/project.png'): string => {
    if (mo) {
        return `${honeConfig.iconServerIP}${mo}.png`
    }
    return fallback
}

export const getIconURL_icon = (mo: string): string => {
    return `iconfont icon-${mo}`
}
