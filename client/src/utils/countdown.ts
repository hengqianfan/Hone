// utils/countdown.ts
import type { Countdown } from '../types/countdown'

/** 把 YYYYMMDD 数字解析成当天 00:00 的 Date */
export function parseDate(value: number): Date {
    const s = String(value)
    if (s.length !== 8) {
        throw new Error(`date 必须是 YYYYMMDD 格式，收到: ${value}`)
    }
    const y = Number(s.slice(0, 4))
    const m = Number(s.slice(4, 6))
    const d = Number(s.slice(6, 8))
    return new Date(y, m - 1, d, 0, 0, 0, 0)
}

/** 过滤掉已过期项，按时间升序排序，取最近 n 个 */
export function pickUpcoming(list: Countdown[], n = 3, now = new Date()): Countdown[] {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return list
        .filter(item => parseDate(item.date).getTime() >= today)
        .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime())
        .slice(0, n)
}

/** 计算剩余时间（天/时/分/秒） */
export interface Remain {
    total: number
    days: number
    hours: number
    minutes: number
    seconds: number
    reached: boolean
}

export function getRemain(target: number, now = Date.now()): Remain {
    const dist = parseDate(target).getTime() - now
    const total = Math.max(dist, 0)
    return {
        total,
        days: Math.floor(total / 864e5),
        hours: Math.floor((total % 864e5) / 36e5),
        minutes: Math.floor((total % 36e5) / 6e4),
        seconds: Math.floor((total % 6e4) / 1000),
        reached: dist <= 0,
    }
}