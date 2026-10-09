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

/** 记录上次目录名的 key（用于拿不到句柄时提示用户） */
const STORAGE_KEY = 'local-wallpaper-dir'

/* =========================================================
 * IndexedDB：持久化 FileSystemDirectoryHandle
 * FileSystemDirectoryHandle 支持结构化克隆，可直接写入 IDB
 * ========================================================= */

const IDB_NAME = 'wallpaper-db'
const IDB_STORE = 'handles'
const IDB_KEY = 'dir-handle'

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE)
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function idbSetHandle(handle: FileSystemDirectoryHandle) {
    try {
        const db = await openDB()
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite')
            tx.objectStore(IDB_STORE).put(handle, IDB_KEY)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
        db.close()
    } catch {
        /* 忽略持久化失败 */
    }
}

async function idbGetHandle(): Promise<FileSystemDirectoryHandle | null> {
    try {
        const db = await openDB()
        const handle = await new Promise<FileSystemDirectoryHandle | null>(
            (resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readonly')
                const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
                req.onsuccess = () =>
                    resolve((req.result as FileSystemDirectoryHandle) ?? null)
                req.onerror = () => reject(req.error)
            }
        )
        db.close()
        return handle
    } catch {
        return null
    }
}

async function idbClearHandle() {
    try {
        const db = await openDB()
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite')
            tx.objectStore(IDB_STORE).delete(IDB_KEY)
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
        })
        db.close()
    } catch {
        /* ignore */
    }
}

/* =========================================================
 * 主逻辑
 * ========================================================= */

export function useLocalWallpaper() {
    const hasDir = ref(false)
    const dirName = ref('')
    const localList = ref<LocalWallpaperItem[]>([])
    const status = ref('')

    /** 当前目录句柄（内存态） */
    let dirHandle: FileSystemDirectoryHandle | null = null

    /* ---------------- 类型判断 ---------------- */

    const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i
    const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)$/i

    const detectType = (file: File): 'img' | 'video' | null => {
        if (file.type.startsWith('image/')) return 'img'
        if (file.type.startsWith('video/')) return 'video'
        if (IMAGE_EXT.test(file.name)) return 'img'
        if (VIDEO_EXT.test(file.name)) return 'video'
        return null
    }

    const isSupported = () =>
        typeof (window as any).showDirectoryPicker === 'function'

    /* ---------------- 回收 blob ---------------- */

    const releaseAll = () => {
        localList.value.forEach(item => URL.revokeObjectURL(item.url))
        localList.value = []
    }

    /* ---------------- 扫描目录 ---------------- */

    const scanDir = async (handle: FileSystemDirectoryHandle) => {
        const entries: FileSystemFileHandle[] = []

        for await (const entry of (handle as any).values()) {
            if (entry.kind === 'file') entries.push(entry)
        }

        // 并发读取文件元信息，避免长目录串行卡顿
        const items = (
            await Promise.all(
                entries.map(async (entry): Promise<LocalWallpaperItem | null> => {
                    try {
                        const file: File = await entry.getFile()
                        const type = detectType(file)
                        if (!type) return null

                        return {
                            id: `${entry.name}-${file.lastModified}-${file.size}`,
                            path: entry.name,
                            name: entry.name,
                            url: URL.createObjectURL(file),
                            desc: entry.name,
                            type,
                            isLocal: true,
                        }
                    } catch {
                        return null
                    }
                })
            )
        ).filter((it): it is LocalWallpaperItem => it !== null)

        items.sort((a, b) =>
            a.name.localeCompare(b.name, 'zh-Hans-CN', { numeric: true })
        )

        localList.value = items
        status.value = items.length
            ? `已加载 ${items.length} 个壁纸`
            : '该目录下没有找到图片或视频'
        return items
    }

    /* ---------------- 授权 + 校验句柄 ---------------- */

    /**
     * 校验句柄权限；如果权限已失效，调用 requestPermission 会弹出授权框。
     * 注意：requestPermission 需要在「用户手势」上下文中调用才会弹框。
     */
    const ensurePermission = async (
        handle: FileSystemDirectoryHandle,
        request: boolean
    ): Promise<boolean> => {
        const anyHandle = handle as any
        if (!anyHandle.queryPermission) return true // 老实现直接放行

        const opts = { mode: 'read' as const }
        const state: PermissionState = await anyHandle.queryPermission(opts)
        if (state === 'granted') return true
        if (!request) return false

        const next: PermissionState = await anyHandle.requestPermission(opts)
        return next === 'granted'
    }

    /* ---------------- 选择目录 ---------------- */

    const pickAndScan = async () => {
        if (!isSupported()) {
            status.value = '当前浏览器不支持本地文件夹选择（请使用 Chrome / Edge）'
            return
        }
        try {
            const handle: FileSystemDirectoryHandle =
                await (window as any).showDirectoryPicker({ mode: 'read' })

            dirHandle = handle
            hasDir.value = true
            dirName.value = handle.name

            // 句柄持久化到 IndexedDB；目录名存一份到 localStorage 作兜底提示
            await idbSetHandle(handle)
            localStorage.setItem(STORAGE_KEY, handle.name)
            status.value = ''

            releaseAll()
            await scanDir(handle)
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                status.value = '选择目录失败：' + (err?.message ?? err)
            }
        }
    }

    /* ---------------- 刷新后恢复（核心修复） ---------------- */

    /**
     * 页面启动时静默调用：
     * 1. 从 IndexedDB 取回句柄
     * 2. queryPermission 检查权限
     * 3. 已授权 → 直接重建列表（无需用户操作，刷新不掉壁纸库）
     * 4. 未授权 → 只回填目录名，提供「继续使用上次目录」按钮手动手势授权
     */
    const tryRestore = async () => {
        const rememberedName = localStorage.getItem(STORAGE_KEY) || ''
        if (rememberedName) dirName.value = rememberedName

        if (!isSupported()) return

        const handle = await idbGetHandle()
        if (!handle) return

        dirHandle = handle
        hasDir.value = true
        dirName.value = handle.name

        const granted = await ensurePermission(handle, /* request */ false)
        if (!granted) {
            status.value = '已记住上次目录，点击「继续使用上次目录」重新授权'
            return
        }

        await scanDir(handle)
    }

    /* ---------------- 继续使用上次目录 ---------------- */

    const resumeLast = async () => {
        // 优先用内存里的句柄
        if (dirHandle) {
            const granted = await ensurePermission(dirHandle, /* request */ true)
            if (granted) {
                releaseAll()
                await scanDir(dirHandle)
                return
            }
        }

        // 内存没有则从 IndexedDB 再取
        const handle = await idbGetHandle()
        if (handle) {
            const granted = await ensurePermission(handle, true)
            if (granted) {
                dirHandle = handle
                hasDir.value = true
                dirName.value = handle.name
                releaseAll()
                await scanDir(handle)
                return
            }
        }

        // 都没有 → 退回让用户重新选择
        await pickAndScan()
    }

    /* ---------------- 清空 ---------------- */

    const clearLocal = async () => {
        releaseAll()
        dirHandle = null
        hasDir.value = false
        dirName.value = ''
        status.value = '已清空本地壁纸库'
        localStorage.removeItem(STORAGE_KEY)
        await idbClearHandle()
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