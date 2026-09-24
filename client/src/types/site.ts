// 一级分类
export const CATEGORIES = [
    { id: '001', name: '编程世界' },
    { id: '002', name: '人工智能' },
    { id: '003', name: '视频音乐' },
    { id: '004', name: '游戏世界' },
    { id: '005', name: '博客网站' },
    { id: '006', name: '软件工具' },
    { id: '007', name: '编辑阅读' },
    { id: '008', name: '生活娱乐' },
    { id: '009', name: '论坛资讯' },
    { id: '010', name: '图片绘画' }



] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

/**
 * 二级分类（kind）字典
 * 注意：kind 全局唯一命名，若不同一级分类存在同名二级分类，请加前缀
 */
export const KINDS = {
    '001': ['社区论坛', '代码托管', '技术文档', '开源项目', '设计资源'],
    '002': ['对话模型', 'AI IDE'],
    '003': ['综合类', '短视频', '音乐', '直播平台', '视频剪辑', '影视资源', '动漫'],
    '004': ['游戏平台', '游戏官网', '游戏社区', '交易平台', '游戏资源'],
    '005': ['个人博客', '资源博客'],
    '006': ['网络工具', '设计工具', '办公工具', '开发工具', '效率工具', '安全工具'],
    '007': ['文档软件', '小说平台'],
    '008': ['购物网站', '旅游出行', '美食餐饮', '运动健身'],
    '009': ['知识社区', '新闻资讯'],
    '010': ['综合图片', '壁纸']
} as const satisfies Record<CategoryId, readonly string[]>;

export type KindId = (typeof KINDS)[CategoryId][number];

export interface Site {
    name: string;
    categoryId: CategoryId;
    /** 二级分类 */
    kind: KindId;
    /** 简短描述 */
    desc: string;
    tags: string[];
    link?: string;
    icon?: string;
}
