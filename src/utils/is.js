/**
 * 类型判断工具（与 vue3 的 utils/is 对齐的精简版）
 */

export function is(val, type) {
  return Object.prototype.toString.call(val) === `[object ${type}]`
}

export function isString(val) {
  return is(val, 'String')
}

export function isNumber(val) {
  return is(val, 'Number')
}

export function isArray(val) {
  return val && Array.isArray(val)
}

export function isFunction(val) {
  return typeof val === 'function'
}

export function isObject(val) {
  return val !== null && is(val, 'Object')
}

export function isEmpty(val) {
  if (val === null || val === undefined) {
    return true
  }
  if (isArray(val) || isString(val)) {
    return val.length === 0
  }
  if (val instanceof Map || val instanceof Set) {
    return val.size === 0
  }
  if (isObject(val)) {
    return Object.keys(val).length === 0
  }
  return false
}

export function isUrl(path) {
  const reg =
    /(((^https?:(?:\/\/)?)(?:[-:&=+$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www\.|[-:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%#\/.\w-]*)?\??(?:[-+=&%@.\w]*)#?(?:[\w]*))?)$/
  return reg.test(path)
}
