// 
type DateString = `${number}${number}${number}${number}${number}${number}${number}${number}`

export interface TocItem {
    level: number
    text: string
    id: string
}

export interface FrontMatterAttributes {
    title?: string
    intro?: string
    category?: string
    tags?: string[]
    icon?: string
    cover?: string

    publishedAt?: string
    updatedAt?: string
    summary?: string
    visibility?: boolean
    series?: string
    sync?: {
        bilibili?: string
        heihe?: string
        redbook?: string
        douyin?: string
    }
}


export interface Post {
    slug: string
    title: string
    intro: string
    category?: string
    tags: string[]
    icon: string
    cover?: string
    publishedAt: string
    updatedAt: string
    content: string
    summary?: string
    toc: TocItem[]
    series?: string
    sync?: {
        bilibili?: string
        heihe?: string
        redbook?: string
        douyin?: string
    }
}