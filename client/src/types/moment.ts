export interface Moment {
    /**
     * 记录 ID，同时作为时间来源
     * 固定格式：
     *  - 20260917       => 2026-09-17
     *  - 2026091701     => 2026-09-17（同一天的第 01 条）
     */
    id: string
    text: string
    images?: string[]
    location?: string
    tags?: string[]
}