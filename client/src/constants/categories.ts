export const CATEGORY_MAP = {
    tech: '技术文章',
    post: '知识碎片',
    comment: '评论赏析',
    other: '其它'
} as const

export type CategoryKey =
    keyof typeof CATEGORY_MAP