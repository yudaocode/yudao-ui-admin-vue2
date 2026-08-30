import { parseFormFields } from '@/components/FormCreate/src/utils'
import { DEFAULT_CONDITION_GROUP_VALUE, TimeUnitType } from '../../consts'

/** Small Vue2-safe helpers shared by the advanced node drawers. */
export function clone(value) {
  if (Array.isArray(value)) return value.map((item) => clone(item))
  if (value && typeof value === 'object') {
    const result = {}
    Object.keys(value).forEach((key) => { result[key] = clone(value[key]) })
    return result
  }
  return value
}

export function parseFields(rawFields) {
  const result = []
  ;(rawFields || []).forEach((field) => {
    try {
      const rule = typeof field === 'string' ? JSON.parse(field) : field
      if (rule && typeof rule === 'object') parseFormFields(rule, result)
    } catch (e) {
      // Keep valid fields selectable when an imported legacy rule is malformed.
    }
  })
  return result
}

/**
 * Parse the comma-separated candidate IDs stored by the BPM backend without
 * corrupting Long values that are outside JavaScript's safe integer range.
 * Keep ordinary IDs as numbers so Element UI selectors retain their existing
 * value semantics, but keep unsafe integer text as-is for an exact round-trip.
 */
export function parseCandidateIdList(value) {
  const source = Array.isArray(value)
    ? value
    : String(value === undefined || value === null ? '' : value).split(',')
  return source.map((item) => {
    const text = String(item === undefined || item === null ? '' : item).trim()
    if (!text) return null
    const number = Number(text)
    if (!Number.isFinite(number)) return null
    return Number.isSafeInteger(number) ? number : text
  }).filter((item) => item !== null)
}

export function conditionGroupsDefault() {
  return clone(DEFAULT_CONDITION_GROUP_VALUE)
}

export function parseIsoDuration(value) {
  const text = String(value === undefined || value === null ? '' : value).trim()
  // The simple designer exposes minute/hour/day controls, but imported BPMN
  // may contain compound ISO-8601 values (for example PT1H30M or PT30S).
  // Collapse those values to the smallest representable unit instead of
  // interpreting only the first number/suffix (which used to turn PT1H30M
  // into one hour and PT30S into thirty hours).
  const match = text.match(/^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i)
  if (match && (match[1] || match[2] || match[3] || match[4])) {
    const days = Number(match[1] || 0)
    const hours = Number(match[2] || 0)
    const minutes = Number(match[3] || 0)
    const seconds = Number(match[4] || 0)
    if (days && !hours && !minutes && !seconds) return { duration: days, unit: TimeUnitType.DAY }
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes + seconds / 60
    return { duration: Math.max(1, Math.ceil(totalMinutes)), unit: TimeUnitType.MINUTE }
  }
  return { duration: 1, unit: TimeUnitType.HOUR }
}

export function durationToIso(duration, unit) {
  const number = Math.max(1, Number(duration) || 1)
  if (Number(unit) === TimeUnitType.MINUTE) return `PT${number}M`
  if (Number(unit) === TimeUnitType.DAY) return `P${number}D`
  return `PT${number}H`
}

export function normalizeDateTime(value) {
  if (!value) return ''
  if (value instanceof Date) {
    const pad = (item) => String(item).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }
  return String(value).trim().replace(/\s+/, 'T').replace(/\.\d+Z$/, '')
}

export function ensureConditionShape(condition) {
  const target = condition || {}
  if (!target.conditionType) target.conditionType = 2
  if (!target.conditionGroups || typeof target.conditionGroups !== 'object') {
    target.conditionGroups = conditionGroupsDefault()
  }
  const groups = target.conditionGroups
  if (groups.and === undefined || groups.and === null) groups.and = true
  if (!Array.isArray(groups.conditions) || !groups.conditions.length) {
    groups.conditions = conditionGroupsDefault().conditions
  }
  groups.conditions.forEach((group) => {
    if (!group || typeof group !== 'object') return
    if (group.and === undefined || group.and === null) group.and = true
    if (!Array.isArray(group.rules) || !group.rules.length) {
      group.rules = [{ opCode: '==', leftSide: '', rightSide: '' }]
    }
    group.rules.forEach((rule) => {
      if (!rule || typeof rule !== 'object') return
      if (!rule.opCode) rule.opCode = '=='
      if (rule.leftSide === undefined || rule.leftSide === null) rule.leftSide = ''
      if (rule.rightSide === undefined || rule.rightSide === null) rule.rightSide = ''
    })
  })
  return target
}

export function conditionIsValid(condition) {
  if (!condition || !condition.conditionType) return false
  if (Number(condition.conditionType) === 1) return !!String(condition.conditionExpression || '').trim()
  const groups = condition.conditionGroups
  return !!(groups && Array.isArray(groups.conditions) && groups.conditions.length &&
    groups.conditions.every((group) => group && Array.isArray(group.rules) && group.rules.length &&
      group.rules.every((rule) => rule && String(rule.leftSide || '').trim() && String(rule.rightSide || '').trim() && rule.opCode)))
}

export function conditionShowText(condition, fields) {
  if (!condition) return ''
  if (Number(condition.conditionType) === 1) {
    return condition.conditionExpression ? `表达式：${condition.conditionExpression}` : ''
  }
  const groups = condition.conditionGroups && condition.conditionGroups.conditions
  if (!Array.isArray(groups) || !groups.length || !conditionIsValid(condition)) return ''
  const title = (field) => {
    const item = (fields || []).find((entry) => String(entry.field) === String(field))
    return item ? item.title : field
  }
  const operator = (code) => {
    const labels = { '==': '等于', '!=': '不等于', '>': '大于', '>=': '大于等于', '<': '小于', '<=': '小于等于', contain: '包含', '!contain': '不包含' }
    return labels[code] || code
  }
  const rendered = groups.map((group) => `(${group.rules.map((rule) => `${title(rule.leftSide)} ${operator(rule.opCode)} ${rule.rightSide}`).join(group.and ? ' 且 ' : ' 或 ')})`)
  return rendered.join(condition.conditionGroups.and ? ' 且 ' : ' 或 ')
}
