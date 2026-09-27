import { parseTime } from '@/utils/ruoyi'

/**
 * 构建 FMS 表格打印文档
 *
 * @param {Object} options 打印参数
 * @return {string} 可供 iframe 预览的 HTML
 */
export function buildFmsTablePrintHtml(options) {
  const header = cloneTableSection(options.tableElement, '.el-table__header-wrapper thead')
  const body = cloneTableSection(options.tableElement, '.el-table__body-wrapper tbody')
  const footer = cloneTableSection(
    options.tableElement,
    '.el-table__footer-wrapper tfoot, .el-table__footer-wrapper tbody'
  )
  if (!header || !body) throw new Error('未找到可打印的表格内容')
  const printDate = parseTime(new Date(), '{y}-{m}-{d}')
  const footerLabels = (options.footerLabels || []).concat(['打印日期：' + printDate])
    .map(label => '<span>' + escapeHtml(label) + '</span>')
    .join('')
  return `<!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(options.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; background: #eef0f3; color: #303133; font-family: Arial, "Microsoft YaHei", sans-serif; font-size: 14px; }
          .print-page { width: calc(100% - 32px); min-height: 210mm; margin: 16px auto; padding: 12mm; background: #fff; box-shadow: 0 2px 12px rgba(0, 0, 0, .12); }
          h1 { margin: 0; text-align: center; font-size: 28px; font-weight: 600; }
          .print-meta, .print-footer { display: flex; justify-content: space-between; gap: 20px; padding: 12px 0; }
          .print-meta span { flex: 1; }
          .print-meta span:nth-child(2) { text-align: center; }
          .print-meta span:last-child { text-align: right; }
          table { width: 100%; border-collapse: collapse; table-layout: auto; }
          th, td { min-width: 54px; padding: 7px 6px; border: 1px solid #303133; line-height: 1.5; vertical-align: middle; word-break: break-word; }
          th { text-align: center; font-weight: 600; background: #f5f7fa; }
          td.is-right, th.is-right { text-align: right; }
          td.is-center, th.is-center { text-align: center; }
          tr { page-break-inside: avoid; }
          .print-footer { padding-bottom: 0; color: #606266; font-size: 12px; }
          @page { size: A3 landscape; margin: 8mm; }
          @media print {
            body { background: #fff; }
            .print-page { width: auto; min-height: auto; margin: 0; padding: 0; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <main class="print-page">
          <h1>${escapeHtml(options.title)}</h1>
          <div class="print-meta">
            <span>编制单位：${escapeHtml(options.companyName)}</span>
            <span>${escapeHtml(options.centerText)}</span>
            <span>${escapeHtml(options.periodLabel)}</span>
          </div>
          <table>${header.outerHTML}${body.outerHTML}${footer ? footer.outerHTML : ''}</table>
          <div class="print-footer">${footerLabels}</div>
        </main>
      </body>
    </html>`
}

function cloneTableSection(tableElement, selector) {
  const source = tableElement.querySelector(selector)
  if (!source) return undefined
  const clone = source.cloneNode(true)
  Array.from(clone.querySelectorAll('button')).forEach(button => {
    button.parentNode.replaceChild(document.createTextNode(button.textContent || ''), button)
  })
  Array.from(clone.querySelectorAll('svg, input, textarea, .el-icon, .caret-wrapper, .el-checkbox__input'))
    .forEach(element => element.parentNode.removeChild(element))
  Array.from(clone.querySelectorAll('[title]')).forEach(element => element.removeAttribute('title'))
  return clone
}

export function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]))
}
