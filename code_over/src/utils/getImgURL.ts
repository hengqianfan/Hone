import { honeConfig } from '../config/main'

/** 判断是否为完整的网络地址（含协议或协议相对地址） */
const isAbsoluteURL = (s: string) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(s)

/** 判断是否为本地路径（绝对路径、相对路径，或带文件后缀的路径） */
const isLocalPath = (s: string) =>
    s.startsWith('/') ||
    s.startsWith('./') ||
    s.startsWith('../') ||
    /\.[a-z0-9]+$/i.test(s)   // 形如 index.png / a/b.js

/** 图片类型 */
export type ImgType = 'img' | 'icon' | 'cover'

/** 各类型对应的本地默认占位图 */
const DEFAULT_FALLBACK: Record<ImgType, string> = {
    img: '/banners/banner01.png',
    icon: '/icons/default.png',
    cover: '/covers/default.png',
}

/** 需要拼接文件夹名的类型（img 不拼） */
const TYPE_DIR: Record<Exclude<ImgType, 'img'>, string> = {
    icon: 'icons',
    cover: 'covers',
}

/**
 * 获取图片 URL
 * @param mo        路径或词汇字符串；不传则返回该类型对应的本地默认图
 * @param type      图片类型：img 原样 / icon 拼 icons / cover 拼 covers
 * @param fallback  默认占位图（本地）；不传则按 type 自动选择
 */
export const getImgURL = (
    mo?: string | null,
    type: ImgType = 'img',
    fallback?: string,
): string => {
    // 按类型取默认占位图
    const defaultFallback = fallback ?? DEFAULT_FALLBACK[type]

    // 无参数 / 空字符串 → 本地默认图
    if (!mo) {
        return defaultFallback
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

    // icon / cover 需要补上文件夹名
    const dir = type === 'img' ? '' : `${TYPE_DIR[type]}/`

    // 纯词汇字符串 → 视为网络资源，拼到 CDN 基础地址上
    return `${honeConfig.imgServerBase}${dir}${value}.png`
}