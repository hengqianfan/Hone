// src/utils/useLocalWallpaper.ts
import { ref } from 'vue'

export interface LocalWallpaperItem {
    id: string
    /** 真实文件路径（用于去重 / key） */
    path: string
    /** 展示用名称 */
    name: string
    /** 生成后的 blob 地址 */
    url: string
    /** 展示描述 */
    desc: string
    /** 媒体类型：img | video */
    type: 'img' | 'video'
    isLocal: true
}

const STORAGE_KEY = 'local-wallpaper-dir'

export function useLocalWallpaper() {
    const hasDir = ref(false)
    const dirName = ref('')
    const localList = ref<LocalWallpaperItem[]>([])
    const status = ref('')

    /** 目录句柄持久化用 */
    let dirHandle: FileSystemDirectoryHandle | null = null

    /* ---------------- 类型判断 ---------------- */

    const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i
    const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i

    const detectType = (file: File): 'img' | 'video' | null => {
        // 优先用 MIME，部分浏览器对 mp4 的 type 为空
        if (file.type.startsWith('image/')) return 'img'
        if (file.type.startsWith('video/')) return 'video'
        // MIME 缺失时用后缀兜底
        if (IMAGE_EXT.test(file.name)) return 'img'
        if (VIDEO_EXT.test(file.name)) return 'video'
        return null
    }

    /* ---------------- 扫描目录 ---------------- */

    const scanDir = async (handle: FileSystemDirectoryHandle) => {
        const items: LocalWallpaperItem[] = []

        for await (const entry of (handle as any).values()) {
            if (entry.kind !== 'file') continue

            const file: File = await entry.getFile()
            const type = detectType(file)
            if (!type) continue // 非图片、非视频直接忽略

            items.push({
                id: `${entry.name}-${file.lastModified}-${file.size}`,
                path: entry.name,
                name: entry.name,
                url: URL.createObjectURL(file),
                desc: entry.name,
                type,
                isLocal: true,
            })
        }

        // 排序，保证结果稳定
        items.sort((a, b) =>
            a.name.localeCompare(b.name, 'zh-Hans-CN', { numeric: true })
        )

        localList.value = items
        status.value = items.length
            ? `已加载 ${items.length} 个壁纸`
            : '该目录下没有找到图片或视频'
        return items
    }

    /* ---------------- 选择目录 ---------------- */

    const pickAndScan = async () => {
        try {
            const handle = await (window as any).showDirectoryPicker()
            dirHandle = handle
            hasDir.value = true
            dirName.value = handle.name

            // 记住目录名（句柄本身无法序列化）
            localStorage.setItem(STORAGE_KEY, handle.name)

            releaseAll()
            await scanDir(handle)
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                status.value = '选择目录失败：' + (err?.message ?? err)
            }
        }
    }

    /* ---------------- 静默恢复 ---------------- */

    const tryRestore = async () => {
        try {
            const handle = await (window as any).showDirectoryPicker({
                mode: 'read',
                // 不需要用户交互时的静默尝试由浏览器决定是否支持
            })
            dirHandle = handle
            hasDir.value = true
            dirName.value = handle.name
            await scanDir(handle)
        } catch {
            // 静默失败，等待用户手动选择
            const remembered = localStorage.getItem(STORAGE_KEY)
            if (remembered) dirName.value = remembered
        }
    }

    /* ---------------- 继续使用上次目录 ---------------- */

    const resumeLast = async () => {
        if (!dirHandle) {
            await pickAndScan()
            return
        }
        await scanDir(dirHandle)
    }

    /* ---------------- 清空 & 回收 ---------------- */

    const releaseAll = () => {
        localList.value.forEach(item => URL.revokeObjectURL(item.url))
        localList.value = []
    }

    const clearLocal = () => {
        releaseAll()
        status.value = '已清空本地壁纸库'
    }

    return {
        hasDir,
        dirName,
        localList,
        status,
        pickAndScan,
        tryRestore,
        resumeLast,
        clearLocal,
        releaseAll,
    }
}