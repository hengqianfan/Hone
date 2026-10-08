import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import DOMPurify from 'dompurify'
import { slugify } from './textFormat'

export interface TocItem {
    level: number
    text: string
    id: string
}

/* =========================
   Markdown 实例
========================= */

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

/* =========================
   Code Block（占位）
========================= */

md.renderer.rules.fence = (tokens, idx) => {

    const t: any = tokens[idx]

    const lang =
        (t.info || '').trim().split(/\s+/)[0] || 'text'

    const code =
        encodeURIComponent(t.content)

    return `
<div class="md-code"
     data-lang="${lang}"
     data-code="${code}">
</div>
`
}

/* =========================
   TOC + heading id（核心）
========================= */

function buildToc(tokens: any[]): TocItem[] {

    const toc: TocItem[] = []

    // 记录已使用的 id
    const usedIds = new Map<string, number>()

    for (let i = 0; i < tokens.length; i++) {

        const token = tokens[i]

        if (token.type !== 'heading_open') continue

        const inline = tokens[i + 1]

        if (!inline || inline.type !== 'inline') continue

        const text = inline.content.trim()

        if (!text) continue

        // 基础 id
        const baseId = slugify(text)

        let id = baseId

        // 重复标题自动追加序号
        const count = usedIds.get(baseId)

        if (count !== undefined) {
            id = `${baseId}-${count + 1}`
            usedIds.set(baseId, count + 1)
        } else {
            usedIds.set(baseId, 0)
        }

        // 写回 HTML 标题
        token.attrSet('id', id)

        toc.push({
            level: Number(token.tag.slice(1)),
            text,
            id
        })
    }

    return toc
}

/* =========================
   container
========================= */
function registerContainer(name: string, className: string, defaultTitle: string) {

    md.use(container, name, {

        render(tokens: any[], idx: number) {

            const token = tokens[idx]

            const info =
                token.info.trim().slice(name.length).trim()

            const title =
                info || defaultTitle

            if (token.nesting === 1) {

                return `
<div class="md-container md-${name} ${className}">
  <div class="md-container__title">${title}</div>
  <div class="md-container__content">
`
            }

            return `
  </div>
</div>
`
        }
    })
}

/* 注册 */
registerContainer('tip', 'is-tip', 'TIP')
registerContainer('warning', 'is-warning', 'WARNING')
registerContainer('info', 'is-info', 'INFO')
registerContainer('danger', 'is-danger', 'DANGER')

md.use(container, 'details', {

    validate(params: string) {
        return params.trim().startsWith('details')
    },

    render(tokens: any[], idx: number) {

        const token = tokens[idx]

        const info =
            token.info.trim().replace(/^details\s*/, '')

        const title =
            info || 'Details'

        // open
        if (token.nesting === 1) {

            return `
<details class="md-details">
  <summary class="md-details__summary">
    ${title}
  </summary>

  <div class="md-details__content">
`
        }

        // close
        return `
  </div>
</details>
`
    }
})

/* =========================
   space block
========================= */

md.core.ruler.push('space', (state) => {

    const out: any[] = []

    for (const t of state.tokens) {

        if (
            t.type === 'inline' &&
            t.content.trim() === '-=-'
        ) {
            const token = new state.Token('html_block', '', 0)
            token.content = `<div class="md-space-3"></div>`
            out.push(token)
            continue
        }

        out.push(t)
    }

    state.tokens = out
})

const defaultLink = md.renderer.rules.link_open || ((tokens, idx, opt, env, self) => self.renderToken(tokens, idx, opt))
md.renderer.rules.link_open = function (tokens, idx, opt, env, self) {
    const token: any = tokens[idx]
    const href = token.attrGet('href')
    if (!href) return defaultLink(tokens, idx, opt, env, self)
    try {
        const url = new URL(href)
        const favicon = `https://favicon.im/${url.hostname}`
        return `<a href="${href}" target = "_blank" class="md-link" > <img class="md-link-icon" src = "${favicon}" />`
    }
    catch { return defaultLink(tokens, idx, opt, env, self) }
}
md.renderer.rules.link_close = () => '</a>'


/* =========================
   render（最终统一出口）
========================= */

export function renderMarkdown(content: string) {

    const tokens = md.parse(content, {})

    // ⭐ 1. 先生成 TOC + 写入 id
    const toc = buildToc(tokens)

    // ⭐ 2. render HTML（基于已修改 tokens）
    const html = md.renderer.render(tokens, md.options, {})

    // ⭐ 3. 安全化
    const safeHtml = DOMPurify.sanitize(html, {
        ADD_ATTR: ['data-lang', 'data-code', 'id']
    })

    return {
        html: safeHtml,
        toc,
        // tokens
    }
}