export function currentMonthValue() {
  const now = new Date()
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
}

export function toMonth(value) {
  if (!value) return ''
  const text = String(value)
  const match = text.match(/^(\d{4})-(\d{2})/)
  if (match) return match[1] + '-' + match[2]
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0')
}

export function formatPeriodLabel(startMonth, endMonth) {
  if (!startMonth && !endMonth) return ''
  const format = month => {
    const match = String(month || '').match(/^(\d{4})-(\d{2})$/)
    return match ? match[1] + '年第' + match[2] + '期' : String(month || '')
  }
  const startLabel = format(startMonth)
  const endLabel = format(endMonth)
  return startLabel === endLabel ? startLabel : startLabel + ' 至 ' + endLabel
}

export function buildPeriodFilename(title, startMonth, endMonth) {
  const period = startMonth === endMonth ? startMonth : startMonth + '至' + endMonth
  return title + '-' + period + '.xls'
}

export function flattenTree(items) {
  const result = []
  ;(items || []).forEach(item => {
    result.push(item)
    if (item.children && item.children.length) result.push.apply(result, flattenTree(item.children))
  })
  return result
}

export function buildTree(items, parentId) {
  const rows = (items || []).map(item => Object.assign({}, item))
  const byParent = {}
  rows.forEach(item => {
    const key = Number(item.parentId || 0)
    if (!byParent[key]) byParent[key] = []
    byParent[key].push(item)
  })
  const attach = item => {
    const children = (byParent[Number(item.id)] || []).map(attach)
    if (children.length) item.children = children
    return item
  }
  const rootId = parentId === undefined
    ? Math.min.apply(Math, rows.map(item => Number(item.parentId || 0)).concat([0]))
    : Number(parentId)
  return (byParent[rootId] || rows.filter(item => !rows.some(parent => Number(parent.id) === Number(item.parentId)))).map(attach)
}

export function filterQuantitySubjects(subjects) {
  return (subjects || []).reduce((result, subject) => {
    const children = filterQuantitySubjects(subject.children || [])
    if (subject.quantityAccounting) result.push(Object.assign({}, subject, { children }))
    else result.push.apply(result, children)
    return result
  }, [])
}

export function filterParentSubjects(subjects) {
  return (subjects || []).reduce((result, subject) => {
    if (subject.children && subject.children.length) {
      result.push(Object.assign({}, subject, { children: filterParentSubjects(subject.children) }))
    }
    return result
  }, [])
}
