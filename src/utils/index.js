import {parseTime} from './ruoyi'

/**
 * 表格时间格式化
 */
export function formatDate(cellValue) {
  if (cellValue == null || cellValue === "") return "";
  const date = new Date(cellValue)
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
}

/** el-table 的时间列格式化器 */
export function dateFormatter(row, column, cellValue) {
  if (!cellValue) {
    return ''
  }
  return parseTime(cellValue, '{y}-{m}-{d} {h}:{i}:{s}')
}

/** el-table 的日期列格式化器 */
export function dateFormatter2(row, column, cellValue) {
  if (!cellValue) {
    return ''
  }
  return parseTime(cellValue, '{y}-{m}-{d}')
}

export function generateRandomStr(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 将耗时（毫秒）格式化为人类可读的文本，如 "2 天3 小时 0 分钟"
 */
export function formatPast2(ms) {
  if (ms === undefined || ms === null || ms === '') {
    return ''
  }
  const day = Math.floor(ms / (24 * 60 * 60 * 1000))
  const hour = Math.floor(ms / (60 * 60 * 1000) - day * 24)
  const minute = Math.floor(ms / (60 * 1000) - day * 24 * 60 - hour * 60)
  const second = Math.floor(ms / 1000 - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60)
  if (day > 0) {
    return day + ' 天' + hour + ' 小时 ' + minute + ' 分钟'
  }
  if (hour > 0) {
    return hour + ' 小时 ' + minute + ' 分钟'
  }
  if (minute > 0) {
    return minute + ' 分钟'
  }
  if (second > 0) {
    return second + ' 秒'
  }
  return 0 + ' 秒'
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param str
 * @param str
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (let i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xDC00 && code <= 0xDFFF) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map(key => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      obj[name] = v.substring(index + 1, v.length)
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach(property => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString =
      classString.substr(0, nameIndex) +
      classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...innerArgs) {
    context = this
    // 把当前调用参数存到外层 args，later 触发时才能拿到正确入参；不能用 ...args 形参，会遮蔽外层闭包变量
    // 对应 https://gitee.com/yudaocode/yudao-ui-admin-vue2/issues/IDKUIB 反馈
    args = innerArgs
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}

// /**
//  * This is just a simple version of deep copy
//  * Has a lot of edge cases bug
//  * If you want to use a perfect deep copy, use lodash's _.cloneDeep
//  * @param {Object} source
//  * @returns {Object}
//  */
// export function deepClone(source) {
//   if (!source && typeof source !== 'object') {
//     throw new Error('error arguments', 'deepClone')
//   }
//   const targetObj = source.constructor === Array ? [] : {}
//   Object.keys(source).forEach(keys => {
//     if (source[keys] && typeof source[keys] === 'object') {
//       targetObj[keys] = deepClone(source[keys])
//     } else {
//       targetObj[keys] = source[keys]
//     }
//   })
//   return targetObj
// }

// 深拷贝对象
// add by 芋道源码 https://github.com/JakHuang/form-generator/blob/dev/src/utils/index.js#L107
export function deepClone(obj) {
  const _toString = Object.prototype.toString

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true)
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime())
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    const flags = []
    if (obj.global) {
      flags.push('g')
    }
    if (obj.multiline) {
      flags.push('m')
    }
    if (obj.ignoreCase) {
      flags.push('i')
    }

    return new RegExp(obj.source, flags.join(''))
  }

  const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {}

  for (const key in obj) {
    result[key] = deepClone(obj[key])
  }

  return result
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * 生成 UUID（与 vue3 的 utils generateUUID 对齐）
 * 用于 SimpleProcessDesigner 生成节点 ID
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto === 'object' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  let timestamp = new Date().getTime()
  let perforNow = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0
      timestamp = Math.floor(timestamp / 16)
    } else {
      random = (perforNow + random) % 16 | 0
      perforNow = Math.floor(perforNow / 16)
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}


/**
 * Check if an element has a class
 * @param ele
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param ele
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param ele
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? val => map[val.toLowerCase()]
    : val => map[val]
}

export const exportDefault = 'export default '

export const beautifierConf = {
  html: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'separate',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  },
  js: {
    indent_size: '2',
    indent_char: ' ',
    max_preserve_newlines: '-1',
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    indent_scripts: 'normal',
    brace_style: 'end-expand',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: true,
    end_with_newline: true,
    wrap_line_length: '110',
    indent_inner_html: true,
    comma_first: false,
    e4x: true,
    indent_empty_lines: true
  }
}

// 首字母大小
export function titleCase(str) {
  return str.replace(/( |^)[a-z]/g, L => L.toUpperCase())
}

// 下划转驼峰
export function camelCase(str) {
  return str.replace(/_[a-z]/g, str1 => str1.substr(-1).toUpperCase())
}

export function isNumberStr(str) {
  return /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(str)
}

// -转驼峰
export function toCamelCase(str, upperCaseFirst) {
  str = (str || '').toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });

  if (upperCaseFirst && str) {
    str = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return str;
}

export const is = (val, type) => {
  return toString.call(val) === `[object ${type}]`
}

export function isString(val) {
  return is(val, 'String')
}

export function isArray(val) {
  return val && Array.isArray(val)
}

export function isObject(val) {
  return val !== null && is(val, 'Object')
}

export function isEmpty(val) {
  if (val === null || val === undefined || typeof val === 'undefined') {
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

/** 解析 JSON 字符串。 */
export function jsonParse(str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    console.warn(`str[${str}] 不是一个 JSON 字符串`)
    return str
  }
}

// ========== ERP / CRM number helpers ==========

const ERP_COUNT_DIGIT = 3
const ERP_PRICE_DIGIT = 2

/** Sum numeric values while ignoring values that cannot be converted to a number. */
export function getSumValue(values) {
  return (values || []).reduce((previous, current) => {
    const value = Number(current)
    return Number.isNaN(value) ? previous : previous + value
  }, 0)
}

/** Format an ERP number with a fixed number of decimal places. */
export function erpNumberFormatter(num, digit) {
  if (num == null) {
    return ''
  }
  const value = typeof num === 'string' ? parseFloat(num) : num
  if (isNaN(value)) {
    return ''
  }
  return value.toFixed(digit)
}

export function erpCountInputFormatter(num) {
  return erpNumberFormatter(num, ERP_COUNT_DIGIT)
}

export function erpCountTableColumnFormatter(row, column, cellValue) {
  return erpNumberFormatter(cellValue, ERP_COUNT_DIGIT)
}

export function erpPriceInputFormatter(num) {
  return erpNumberFormatter(num, ERP_PRICE_DIGIT)
}

export function erpPriceTableColumnFormatter(row, column, cellValue) {
  return erpNumberFormatter(cellValue, ERP_PRICE_DIGIT)
}

export function erpPriceMultiply(price, count) {
  if (price == null || count == null) {
    return undefined
  }
  return parseFloat((price * count).toFixed(ERP_PRICE_DIGIT))
}

export function erpCalculatePercentage(value, total) {
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(2)
}

/**
 * 将值复制到目标对象，且以目标对象属性为准。
 */
export function copyValueToTarget(target, source) {
  const newObj = Object.assign({}, target, source)
  Object.keys(newObj).forEach((key) => {
    if (Object.keys(target).indexOf(key) === -1) {
      delete newObj[key]
    }
  })
  Object.assign(target, newObj)
}

/** 将一个整数转换为分数并保留两位小数。 */
export function formatToFraction(num) {
  if (typeof num === 'undefined') return '0.00'
  const parsedNumber = typeof num === 'string' ? parseFloat(num) : num
  return (parsedNumber / 100.0).toFixed(2)
}

/** 将分值格式化为固定两位小数。 */
export function floatToFixed2(num) {
  let value = '0.00'
  if (typeof num === 'undefined') return value
  const fraction = formatToFraction(num)
  const decimalPart = fraction.toString().split('.')[1]
  const length = decimalPart ? decimalPart.length : 0
  switch (length) {
    case 0:
      value = fraction.toString() + '.00'
      break
    case 1:
      value = fraction.toString() + '0'
      break
    case 2:
      value = fraction.toString()
      break
    default:
      break
  }
  return value
}

/** 将一个分数转换为整数。 */
export function convertToInteger(num) {
  if (typeof num === 'undefined') return 0
  const parsedNumber = typeof num === 'string' ? parseFloat(num) : num
  return Math.round(parsedNumber * 100)
}

/** 分转元。 */
export function fenToYuan(price) {
  return formatToFraction(price)
}
