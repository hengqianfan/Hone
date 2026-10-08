<template>
    <div class="sm">
        <header class="sm-head">
            <h1>站点管理</h1>
            <div class="sm-actions">
                <button class="btn" @click="openCreate">＋ 新增站点</button>
                <button class="btn ghost" @click="exportTs">导出 sites</button>
                <button class="btn ghost" @click="copyOutput">复制结果</button>
                <button class="btn danger" @click="restoreInitial">恢复初始数据</button>
                <button class="btn danger" @click="clearAll">清空全部</button>
            </div>
        </header>

        <!-- 筛选区 -->
        <section class="sm-filter">
            <input v-model.trim="keyword" placeholder="搜索名称 / 描述 / 标签" />
            <select v-model="filterCat">
                <option value="">全部一级分类</option>
                <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filterKind">
                <option value="">全部二级分类</option>
                <option v-for="k in kindOptions" :key="k" :value="k">{{ k }}</option>
            </select>
            <span class="count">共 {{ filteredSites.length }} 条</span>
        </section>

        <!-- 列表 -->
        <table class="sm-table">
            <thead>
                <tr>
                    <th>名称</th>
                    <th>一级分类</th>
                    <th>二级分类</th>
                    <th>描述</th>
                    <th>标签</th>
                    <th>链接</th>
                    <th>图标</th>
                    <th style="width:120px">操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(s, i) in filteredSites" :key="s.__key" :class="{ editing: s.__key === editingKey }">
                    <td>{{ s.name }}</td>
                    <td>{{ catName(s.categoryId) }}</td>
                    <td>{{ s.kind }}</td>
                    <td class="ellipsis" :title="s.desc">{{ s.desc }}</td>
                    <td>{{ s.tags.join('、') }}</td>
                    <td class="ellipsis" :title="s.link">
                        <a v-if="s.link" :href="s.link" target="_blank" rel="noreferrer">{{ s.link }}</a>
                    </td>
                    <td>{{ s.icon || '-' }}</td>
                    <td>
                        <button class="btn mini" @click="openEdit(s)">编辑</button>
                        <button class="btn mini danger" @click="remove(i)">删除</button>
                    </td>
                </tr>
                <tr v-if="!filteredSites.length">
                    <td colspan="8" class="empty">暂无数据</td>
                </tr>
            </tbody>
        </table>

        <!-- 新增 / 编辑弹窗 -->
        <div v-if="dialog.open" class="sm-mask" @click.self="dialog.open = false">
            <div class="sm-dialog">
                <h2>{{ dialog.isEdit ? '编辑站点' : '新增站点' }}</h2>

                <label>名称 *</label>
                <input v-model.trim="dialog.form.name" placeholder="如 Github" />

                <label>一级分类 *</label>
                <select v-model="dialog.form.categoryId" @change="onCatChange">
                    <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.name }}（{{ c.id }}）</option>
                </select>

                <label>二级分类（kind）*</label>
                <select v-model="dialog.form.kind">
                    <option v-for="k in dialog.kinds" :key="k" :value="k">{{ k }}</option>
                </select>

                <label>简短描述 *</label>
                <input v-model.trim="dialog.form.desc" placeholder="一句话说明" />

                <label>标签（用逗号分隔）</label>
                <input v-model="dialog.tagsText" placeholder="github, git, 开源" />

                <label>链接（可选）</label>
                <input v-model.trim="dialog.form.link" placeholder="https://..." />

                <label>图标（可选）</label>
                <input v-model.trim="dialog.form.icon" placeholder="github" />

                <p v-if="dialog.error" class="err">{{ dialog.error }}</p>

                <div class="sm-dialog-foot">
                    <button class="btn ghost" @click="dialog.open = false">取消</button>
                    <button class="btn" @click="submitDialog">保存</button>
                </div>
            </div>
        </div>

        <!-- 导出预览 -->
        <div v-if="output" class="sm-mask" @click.self="output = ''">
            <div class="sm-dialog wide">
                <h2>导出结果（sites）</h2>
                <textarea class="code" readonly :value="output"></textarea>
                <div class="sm-dialog-foot">
                    <button class="btn ghost" @click="output = ''">关闭</button>
                    <button class="btn" @click="copyOutput">复制</button>
                </div>
            </div>
        </div>

        <p v-if="toast" class="toast">{{ toast }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

/* ------------------------------------------------------------------
 * 1. 从数据文件导入字典与初始数据
 * ------------------------------------------------------------------ */
import { CATEGORIES, KINDS } from '@/types/site';
import { sites as INITIAL_SITES } from '@/config/sites';
import type { CategoryId, KindId, Site } from '@/types/site';

/* ------------------------------------------------------------------
 * 2. 类型定义
 * ------------------------------------------------------------------ */
/** 表格内部使用，附加唯一 key */
interface SiteRow extends Site {
    __key: number;
}

interface DialogForm {
    name: string;
    categoryId: CategoryId;
    kind: string;
    desc: string;
    link: string;
    icon: string;
}

interface DialogState {
    open: boolean;
    isEdit: boolean;
    kinds: readonly string[];
    tagsText: string;
    error: string;
    form: DialogForm;
}

/* ------------------------------------------------------------------
 * 3. 状态（内存态，无持久化）
 * ------------------------------------------------------------------ */
let seq = 0;

/** 深拷贝一份附加唯一 key，避免污染源数据 */
const withKey = (list: readonly Site[]): SiteRow[] =>
    list.map((s) => ({ ...s, tags: [...(s.tags || [])], __key: ++seq }));

/** 初始数据源（外部文件） */
const sites = ref<SiteRow[]>(withKey(INITIAL_SITES));

const keyword = ref('');
const filterCat = ref<CategoryId | ''>('');
const filterKind = ref('');
const output = ref('');
const toast = ref('');
const editingKey = ref<number | null>(null);

const dialog = reactive<DialogState>({
    open: false,
    isEdit: false,
    kinds: [],
    tagsText: '',
    error: '',
    form: { name: '', categoryId: '001', kind: '', desc: '', link: '', icon: '' },
});

/* ------------------------------------------------------------------
 * 4. 计算属性
 * ------------------------------------------------------------------ */
const kindOptions = computed<string[]>(() =>
    filterCat.value ? [...(KINDS[filterCat.value] || [])] : Object.values(KINDS).flat()
);

const filteredSites = computed(() => {
    const kw = keyword.value.toLowerCase();
    return sites.value.filter((s) => {
        if (filterCat.value && s.categoryId !== filterCat.value) return false;
        if (filterKind.value && s.kind !== filterKind.value) return false;
        if (!kw) return true;
        return (
            s.name.toLowerCase().includes(kw) ||
            s.desc.toLowerCase().includes(kw) ||
            (s.tags || []).some((t) => t.toLowerCase().includes(kw))
        );
    });
});

const catName = (id: string): string =>
    CATEGORIES.find((c) => c.id === id)?.name || id;

/* 一级分类切换时，重置二级分类与可选列表 */
watch(filterCat, () => {
    if (filterKind.value && !kindOptions.value.includes(filterKind.value)) filterKind.value = '';
});

/* ------------------------------------------------------------------
 * 5. 增删改
 * ------------------------------------------------------------------ */
function openCreate(): void {
    dialog.isEdit = false;
    dialog.error = '';
    dialog.tagsText = '';
    dialog.form = { name: '', categoryId: '001', kind: KINDS['001'][0], desc: '', link: '', icon: '' };
    dialog.kinds = KINDS['001'];
    dialog.open = true;
}

function openEdit(s: SiteRow): void {
    dialog.isEdit = true;
    dialog.error = '';
    editingKey.value = s.__key;
    dialog.form = {
        name: s.name,
        categoryId: s.categoryId,
        kind: s.kind,
        desc: s.desc,
        link: s.link || '',
        icon: s.icon || '',
    };
    dialog.tagsText = (s.tags || []).join(', ');
    dialog.kinds = KINDS[s.categoryId] || [];
    dialog.open = true;
}

function onCatChange(): void {
    dialog.kinds = KINDS[dialog.form.categoryId] || [];
    dialog.form.kind = dialog.kinds[0] || '';
}

function submitDialog(): void {
    const f = dialog.form;
    if (!f.name) {
        dialog.error = '请填写名称';
        return;
    }
    if (!f.desc) {
        dialog.error = '请填写描述';
        return;
    }
    if (!f.kind) {
        dialog.error = '请选择二级分类';
        return;
    }

    const record: Site = {
        name: f.name,
        categoryId: f.categoryId,
        kind: f.kind as KindId,
        desc: f.desc,
        tags: dialog.tagsText
            .split(/[,，]/)
            .map((t) => t.trim())
            .filter(Boolean),
    };
    if (f.link) record.link = f.link;
    if (f.icon) record.icon = f.icon;

    if (dialog.isEdit) {
        const idx = sites.value.findIndex((s) => s.__key === editingKey.value);
        if (idx > -1) sites.value[idx] = { ...record, __key: editingKey.value! };
        showToast('已保存修改');
    } else {
        sites.value.push({ ...record, __key: ++seq });
        showToast('已新增站点');
    }
    dialog.open = false;
    editingKey.value = null;
}

function remove(index: number): void {
    const target = filteredSites.value[index];
    if (!target) return;
    if (!confirm(`确认删除「${target.name}」？`)) return;
    const i = sites.value.findIndex((s) => s.__key === target.__key);
    if (i > -1) sites.value.splice(i, 1);
    showToast('已删除');
}

/** 清空全部数据 */
function clearAll(): void {
    if (!sites.value.length) {
        showToast('当前没有数据');
        return;
    }
    if (!confirm('将清空全部站点数据，确认？')) return;
    sites.value = [];
    showToast('已清空');
}

/** 恢复到外部文件中的初始数据 */
function restoreInitial(): void {
    if (!confirm('将丢弃当前修改，恢复为外部文件的初始数据，确认？')) return;
    sites.value = withKey(INITIAL_SITES);
    showToast('已恢复初始数据');
}

/* ------------------------------------------------------------------
 * 6. 只导出 sites（generateSites 保留在组件内）
 * ------------------------------------------------------------------ */
const q = (str: string): string =>
    `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

function generateSites(): string {
    const lines: string[] = [];

    lines.push("import type { Site } from '@/types/site';");

    lines.push('export const sites: Site[] = [');
    const order = CATEGORIES.map((c) => c.id);
    const grouped = new Map<string, SiteRow[]>(order.map((id) => [id, []]));
    const others: SiteRow[] = [];
    sites.value.forEach((s) => {
        if (grouped.has(s.categoryId)) grouped.get(s.categoryId)!.push(s);
        else others.push(s);
    });

    const renderSite = (s: SiteRow): void => {
        lines.push('    {');
        lines.push(`        name: ${q(s.name)},`);
        lines.push(`        categoryId: ${q(s.categoryId)},`);
        lines.push(`        kind: ${q(s.kind)},`);
        if (s.icon) lines.push(`        icon: ${q(s.icon)},`);
        lines.push(`        desc: ${q(s.desc)},`);
        lines.push(`        tags: [${(s.tags || []).map(q).join(', ')}],`);
        if (s.link) lines.push(`        link: ${q(s.link)},`);
        lines.push('    },');
    };

    order.forEach((id) => {
        const list = grouped.get(id);
        if (!list || !list.length) return;
        const cat = CATEGORIES.find((c) => c.id === id);
        lines.push(`    // ---------- ${id} ${cat?.name} ----------`);
        list.forEach((s) => {
            renderSite(s);
            lines.push('');
        });
        if (lines[lines.length - 1] === '') lines.pop();
    });

    if (others.length) {
        lines.push('    // ---------- 未分组 ----------');
        others.forEach((s) => {
            renderSite(s);
            lines.push('');
        });
        if (lines[lines.length - 1] === '') lines.pop();
    }

    lines.push('];');
    return lines.join('\n');
}

function exportTs(): void {
    output.value = generateSites();
}

async function copyOutput(): Promise<void> {
    const text = output.value || generateSites();
    output.value = text;
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    } catch {
        showToast('复制失败，请手动选择文本');
    }
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(msg: string): void {
    toast.value = msg;
    clearTimeout(toastTimer!);
    toastTimer = setTimeout(() => (toast.value = ''), 1800);
}
</script>

<style scoped>
/* ============ 深色主题 ============ */
.sm {
    font-family: system-ui, -apple-system, 'PingFang SC', sans-serif;
    padding: 20px;
    color: #e5e7eb;
    background: #0f1115;
    min-height: 100vh;
}

.sm-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.sm-head h1 {
    font-size: 20px;
    margin: 0;
    color: #f9fafb;
}

.sm-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn {
    border: 1px solid #3b82f6;
    background: #2563eb;
    color: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
}

.btn.ghost {
    background: transparent;
    color: #93c5fd;
    border-color: #374151;
}

.btn.danger {
    background: #dc2626;
    border-color: #dc2626;
}

.btn.mini {
    padding: 3px 8px;
    font-size: 12px;
    margin-right: 4px;
}

.btn:hover {
    opacity: .88;
}

.sm-filter {
    display: flex;
    gap: 8px;
    align-items: center;
    margin: 16px 0;
    flex-wrap: wrap;
}

.sm-filter input,
.sm-filter select {
    padding: 6px 8px;
    border: 1px solid #374151;
    border-radius: 6px;
    font-size: 13px;
    background: #161a20;
    color: #e5e7eb;
}

.sm-filter input::placeholder {
    color: #6b7280;
}

.sm-filter input {
    min-width: 220px;
}

.sm-filter select option {
    background: #161a20;
    color: #e5e7eb;
}

.count {
    color: #9ca3af;
    font-size: 13px;
}

.sm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.sm-table th,
.sm-table td {
    border-bottom: 1px solid #262b33;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
}

.sm-table th {
    background: #161a20;
    font-weight: 600;
    color: #d1d5db;
}

.sm-table tbody tr:hover {
    background: #161a20;
}

.sm-table tr.editing {
    background: #2a2410;
}

.sm-table a {
    color: #60a5fa;
    text-decoration: none;
}

.sm-table a:hover {
    text-decoration: underline;
}

.ellipsis {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty {
    text-align: center;
    color: #6b7280;
    padding: 30px 0;
}

.sm-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
}

.sm-dialog {
    background: #161a20;
    border: 1px solid #262b33;
    border-radius: 10px;
    padding: 20px;
    width: 420px;
    max-height: 90vh;
    overflow: auto;
    color: #e5e7eb;
}

.sm-dialog.wide {
    width: min(860px, 92vw);
}

.sm-dialog h2 {
    margin: 0 0 12px;
    font-size: 16px;
    color: #f9fafb;
}

.sm-dialog label {
    display: block;
    margin: 10px 0 4px;
    font-size: 13px;
    color: #9ca3af;
}

.sm-dialog input,
.sm-dialog select,
.code {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 9px;
    border: 1px solid #374151;
    border-radius: 6px;
    font-size: 13px;
    background: #0f1115;
    color: #e5e7eb;
}

.sm-dialog input::placeholder {
    color: #6b7280;
}

.sm-dialog select option {
    background: #161a20;
    color: #e5e7eb;
}

.code {
    height: 52vh;
    font-family: ui-monospace, Consolas, monospace;
    color: #a5f3fc;
    resize: vertical;
}

.sm-dialog-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

.err {
    color: #f87171;
    font-size: 13px;
    margin: 10px 0 0;
}

.toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #e5e7eb;
    color: #111827;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
}
</style>