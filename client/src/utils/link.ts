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

export const getImgURL_img = (mo: string, fallback = '/assets/icons/project.png'): string => {
    if (mo) {
        return `${honeConfig.base}${mo}`
    }
    return fallback
}



/** 判断是否为完整的网络地址（含协议或协议相对地址） */
const isAbsoluteURL = (s: string) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(s)

/** 判断是否为本地路径（绝对路径、相对路径，或带文件后缀的路径） */
const isLocalPath = (s: string) =>
    s.startsWith('/') ||
    s.startsWith('./') ||
    s.startsWith('../') ||
    /\.[a-z0-9]+$/i.test(s)   // 形如 index.png / a/b.js

/**
 * 获取图片 URL
 * @param mo        路径或词汇字符串；不传则返回本地默认图
 * @param fallback  默认占位图（本地）
 */
export const getImgURL = (mo?: string | null, fallback = '/banners/banner01.png',): string => {
    // 无参数 / 空字符串 → 本地默认图
    if (!mo) {
        return fallback
    }

    const value = mo.trim()

    // 已经是完整网络地址 → 原样返回
    if (isAbsoluteURL(value)) {
        return value
    }

    // 本地路径 → 拼接 base
    if (isLocalPath(value)) {
        return `${honeConfig.base}${value}`
    }

    // 纯词汇字符串 → 视为网络资源，拼到 CDN 基础地址上
    return `${honeConfig.imgServerIP}${value}.png`
}


export const getIconURL = (mo?: string | null, fallback = './favicon.ico',): string => {
    // 无参数 / 空字符串 → 本地默认图
    if (!mo) {
        return fallback
    }

    const value = mo.trim()

    // 已经是完整网络地址 → 原样返回
    if (isAbsoluteURL(value)) {
        return value
    }

    // 本地路径 → 拼接 base
    if (isLocalPath(value)) {
        return `${honeConfig.base}${value}`
    }

    // 纯词汇字符串 → 视为网络资源，拼到 CDN 基础地址上
    return `${honeConfig.iconServerIP}${value}.png`
}
