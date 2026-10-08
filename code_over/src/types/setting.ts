// 各种值的类型
export type SettingPrimitive = string | number | boolean
export type SettingPayload = SettingPrimitive | SettingPrimitive[]


/** store 里的完整状态 */
export interface SettingState {
    blurBg: boolean
    backTop: boolean
    /** 主题模式：浅色 / 深色 */
    themeColor: 'light' | 'dark'
    /** 布局 / 背景模式 */
    background: 'summer' | 'city' | 'seaside' | 'forest' | 'rainy'
    /** 附加效果（多选） */
    extra: string[]
}

/** 单个设置项的描述 */
export interface SettingOption {
    label: string
    value: string | number
}

export interface SettingItem {
    key: keyof SettingState
    label: string
    type: 'switch' | 'radio' | 'checkbox'
    options?: SettingOption[]
}