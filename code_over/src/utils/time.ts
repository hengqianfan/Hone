//  这是专门时间戳的工具函数集

export const getDay = (timestamp: number) => {
    return new Date(timestamp).getDate();
}