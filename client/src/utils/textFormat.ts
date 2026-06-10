// 标识化文本
export function slugify(str: string) {
    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
}

export const getPostTitle = (mo: string): string => {

    const index = mo.indexOf(" ")  // 找到空格的索引
    if (index === -1) return mo    // 没有空格时，直接返回
    return mo.slice(index + 1)     // 去掉第一个空格前的部分
}

export const getPostPublishAt = (mo: string): string => {
    const index = mo.indexOf(" ")  // 找到空格的索引
    if (index === -1) return ''   // 没有空格时，直接返回
    // 截取前八位，并转化为 0000-00-00 的格式
    let res = mo.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");

    return res
}

