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
    publishedAt?: string
    updatedAt?: string
    summary?: string
    visibility?: boolean
}


export interface Post {
    slug: string
    title: string
    intro: string
    category?: string
    tags: string[]
    icon: string
    publishedAt: string
    updatedAt: string
    content: string
    summary?: string
    toc: TocItem[]
}