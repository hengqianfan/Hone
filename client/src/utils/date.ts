/**
 * 从 id（20260917 / 2026091701）解析出年月日
 * 前 8 位固定为 YYYYMMDD，其余为当天序号，忽略
 */
export function parseId(id: string) {
    const raw = String(id ?? '')
    const digits = raw.replace(/\D/g, '')
    if (digits.length < 8) return { year: '', month: '', day: '', key: '', ts: 0, seq: '' }

    const y = digits.slice(0, 4)
    const m = digits.slice(4, 6)
    const d = digits.slice(6, 8)
    const seq = digits.slice(8) || ''

    const ts = Date.UTC(Number(y), Number(m) - 1, Number(d))
    return { year: y, month: m, day: d, key: `${y}-${m}`, ts, seq }
}

/** 显示用：2026.09.17 */
export function formatId(id: string) {
    const { year, month, day } = parseId(id)
    if (!year) return String(id)
    return day ? `${year}.${month}.${day}` : `${year}.${month}`
}