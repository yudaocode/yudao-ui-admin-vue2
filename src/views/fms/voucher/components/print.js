import { formatMoney } from '@/views/fms/utils/format'
import { escapeHtml } from '@/views/fms/utils/print'
import {
  formatDateOnly,
  formatSubjectDisplay,
  formatUppercaseMoney
} from '../helpers'

const STANDARD_PAPER_SIZE = {
  A4: { width: 210, height: 297 },
  B5: { width: 176, height: 250 }
}
const VOUCHER_PRINT_BASE_MARGIN = 8
const VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE = 4

export const DEFAULT_VOUCHER_PRINT_SETTING = {
  paperType: 'B5',
  orientation: 'landscape',
  width: 250,
  height: 176,
  marginLeft: 0,
  marginTop: 0,
  fontSize: 16
}

export function buildVoucherPrintHtml(companyName, vouchers, setting) {
  const size = getPaperSize(setting)
  const marginTop = VOUCHER_PRINT_BASE_MARGIN + Number(setting.marginTop || 0)
  const marginLeft = VOUCHER_PRINT_BASE_MARGIN + Number(setting.marginLeft || 0)
  const content = buildVoucherPrintPages(vouchers)
    .map(page => buildVoucherPageHtml(companyName, page))
    .join('')
  return buildPrintDocument(
    '凭证打印',
    content,
    '@page { size: ' + size.width + 'mm ' + size.height + 'mm; margin: ' + marginTop +
      'mm ' + VOUCHER_PRINT_BASE_MARGIN + 'mm ' + VOUCHER_PRINT_BASE_MARGIN + 'mm ' + marginLeft +
      'mm; } .voucher-page { width: ' + size.width + 'mm; min-height: ' + size.height + 'mm; padding: 8mm; }',
    setting.fontSize
  )
}

export function buildVoucherListPrintHtml(companyName, period, vouchers) {
  const rows = (vouchers || []).map(buildVoucherListRowHtml).join('')
  const content = '<section class="voucher-list-page">' +
    '<h1>凭证列表</h1>' +
    '<div class="list-meta"><span>编制单位：' + escapeHtml(companyName) + '</span><span>' + escapeHtml(period) + '</span></div>' +
    '<table class="voucher-list-table"><thead><tr><th>日期</th><th>凭证字号</th><th>摘要</th><th>科目</th>' +
    '<th>借方金额</th><th>贷方金额</th><th>制单人</th><th>审核人</th></tr></thead><tbody>' + rows + '</tbody></table>' +
    '</section>'
  return buildPrintDocument(
    '凭证列表',
    content,
    '@page { size: A3 landscape; margin: 8mm; } .voucher-list-page { width: 100%; padding: 4mm; }',
    14
  )
}

function buildVoucherPrintPages(vouchers) {
  const pages = []
  ;(vouchers || []).forEach(voucher => {
    const entries = Array.isArray(voucher.entries) ? voucher.entries : []
    const totalPages = Math.max(1, Math.ceil(entries.length / VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE))
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      const pageEntries = entries.slice(
        pageIndex * VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE,
        pageIndex * VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE + VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE
      )
      while (pageEntries.length < VOUCHER_PRINT_ENTRY_COUNT_PER_PAGE) pageEntries.push(undefined)
      pages.push({ voucher, entries: pageEntries, currentPage: pageIndex + 1, totalPages })
    }
  })
  return pages
}

function buildVoucherPageHtml(companyName, page) {
  const voucher = page.voucher
  const dateParts = formatDateOnly(voucher.voucherTime).split('-')
  const voucherDate = dateParts.length === 3
    ? dateParts[0] + '年' + dateParts[1] + '月' + dateParts[2] + '日'
    : ''
  const entryRows = page.entries.map(entry => '<tr>' +
    '<td>' + escapeHtml(entry && entry.digest) + '</td>' +
    '<td>' + escapeHtml(entry ? formatSubject(entry) : '') + '</td>' +
    '<td class="money">' + (entry && entry.debitAmount ? escapeHtml(formatMoney(entry.debitAmount)) : '') + '</td>' +
    '<td class="money">' + (entry && entry.creditAmount ? escapeHtml(formatMoney(entry.creditAmount)) : '') + '</td>' +
    '</tr>').join('')
  return '<section class="voucher-page">' +
    '<h1>记账凭证</h1><div class="title-double-line"></div>' +
    '<div class="attachment-count">附单据&nbsp;&nbsp;' + escapeHtml(voucher.attachmentCount || '') + '&nbsp;&nbsp;张</div>' +
    '<div class="voucher-meta"><span>单位：' + escapeHtml(companyName) + '</span>' +
    '<span>日期：' + escapeHtml(voucherDate) + '</span>' +
    '<span>凭证号：' + escapeHtml(voucher.voucherWordName) + '-' + escapeHtml(voucher.voucherNumber) +
    '（' + page.currentPage + '/' + page.totalPages + '）</span></div>' +
    '<table class="voucher-table"><thead><tr><th>摘要</th><th>会计科目</th><th>借方金额</th><th>贷方金额</th></tr></thead>' +
    '<tbody>' + entryRows + '</tbody><tfoot><tr><td colspan="2">合计：' + escapeHtml(formatUppercaseMoney(Number(voucher.debitAmount))) +
    '</td><td class="money">' + escapeHtml(formatMoney(voucher.debitAmount)) + '</td><td class="money">' +
    escapeHtml(formatMoney(voucher.creditAmount)) + '</td></tr></tfoot></table>' +
    '<div class="voucher-footer"><span>财务主管：</span><span>审核：' + escapeHtml(voucher.reviewerUserName) +
    '</span><span>出纳：</span><span>制单：' + escapeHtml(voucher.creatorUserName) + '</span></div></section>'
}

function buildVoucherListRowHtml(voucher) {
  const entries = Array.isArray(voucher.entries) ? voucher.entries : []
  return '<tr><td>' + escapeHtml(formatDateOnly(voucher.voucherTime)) + '</td>' +
    '<td>' + escapeHtml(voucher.voucherWordName) + '-' + escapeHtml(voucher.voucherNumber) + '</td>' +
    '<td>' + entries.map(entry => '<div>' + escapeHtml(entry.digest) + '</div>').join('') + '</td>' +
    '<td>' + entries.map(entry => '<div>' + escapeHtml(formatSubject(entry)) + '</div>').join('') + '</td>' +
    '<td class="money">' + entries.map(entry => '<div>' + (entry.debitAmount ? escapeHtml(formatMoney(entry.debitAmount)) : '') + '</div>').join('') + '</td>' +
    '<td class="money">' + entries.map(entry => '<div>' + (entry.creditAmount ? escapeHtml(formatMoney(entry.creditAmount)) : '') + '</div>').join('') + '</td>' +
    '<td>' + escapeHtml(voucher.creatorUserName) + '</td><td>' + escapeHtml(voucher.reviewerUserName) + '</td></tr>'
}

function buildPrintDocument(title, content, pageStyle, fontSize) {
  return '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>' + escapeHtml(title) + '</title><style>' +
    '*{box-sizing:border-box}body{margin:0;background:#eef0f3;color:#303133;font-family:Arial,"Microsoft YaHei",sans-serif;font-size:' + Number(fontSize || 14) + 'px}' +
    pageStyle +
    '.voucher-page,.voucher-list-page{box-sizing:border-box;margin:16px auto;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.12);page-break-after:always}' +
    'h1{margin:0;text-align:center;font-size:30px;font-weight:500}.title-double-line{width:200px;height:6px;margin:8px auto;border-top:1px solid;border-bottom:1px solid}' +
    '.attachment-count{margin-bottom:6px;text-align:right}.voucher-meta,.voucher-footer,.list-meta{display:flex;justify-content:space-between;gap:16px;padding:7px 0}' +
    'table{width:100%;border-collapse:collapse}th,td{border:1px solid #303133;padding:10px 8px;vertical-align:middle}' +
    '.voucher-table th:nth-child(1){width:28%}.voucher-table th:nth-child(2){width:38%}.voucher-table th:nth-child(3),.voucher-table th:nth-child(4){width:17%}' +
    '.voucher-table tbody tr{height:54px}.money{text-align:right}.voucher-footer span{width:25%}.voucher-footer span:nth-child(2),.voucher-footer span:nth-child(3){text-align:center}' +
    '.voucher-footer span:last-child{text-align:right}.voucher-list-page h1{margin-bottom:12px;font-weight:600}.voucher-list-table th,.voucher-list-table td{padding:8px 6px}' +
    '.voucher-list-table tr{page-break-inside:avoid}@media print{body{background:#fff}.voucher-page,.voucher-list-page{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none}}' +
    '</style></head><body><main>' + content + '</main></body></html>'
}

function getPaperSize(setting) {
  const rawSize = setting.paperType === 'CUSTOM'
    ? { width: Number(setting.width), height: Number(setting.height) }
    : STANDARD_PAPER_SIZE[setting.paperType]
  const shortSide = Math.min(rawSize.width, rawSize.height)
  const longSide = Math.max(rawSize.width, rawSize.height)
  return setting.orientation === 'landscape'
    ? { width: longSide, height: shortSide }
    : { width: shortSide, height: longSide }
}

function formatSubject(entry) {
  return formatSubjectDisplay(
    entry.subjectCode,
    entry.subjectName,
    (entry.auxiliaries || []).map(item => item.name)
  )
}
