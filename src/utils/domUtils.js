/**
 * DOM 工具函数
 * 说明：class 系列（hasClass/addClass/removeClass）已在 utils/index.js 中提供，这里不再重复
 */
const isServer = typeof window === 'undefined'
const ieVersion = isServer ? 0 : Number(document.documentMode)
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/

/* istanbul ignore next */
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

/* istanbul ignore next */
const camelCase = function (name) {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, __, letter, offset) {
      return offset ? letter.toUpperCase() : letter
    })
    .replace(MOZ_HACK_REGEXP, 'Moz$1')
}

export function getBoundingClientRect(element) {
  if (!element || !element.getBoundingClientRect) {
    return 0
  }
  return element.getBoundingClientRect()
}

/**
 * 获取当前元素的left、top偏移
 *   left：元素最左侧距离文档左侧的距离
 *   top:元素最顶端距离文档顶端的距离
 *   right:元素最右侧距离文档右侧的距离
 *   bottom：元素最底端距离文档底端的距离
 *   rightIncludeBody：元素最左侧距离文档右侧的距离
 *   bottomIncludeBody：元素最底端距离文档最底部的距离
 *
 * @description:
 */
export function getViewportOffset(element) {
  const doc = document.documentElement

  const docScrollLeft = doc.scrollLeft
  const docScrollTop = doc.scrollTop
  const docClientLeft = doc.clientLeft
  const docClientTop = doc.clientTop

  const pageXOffset = window.pageXOffset
  const pageYOffset = window.pageYOffset

  const box = getBoundingClientRect(element)

  const { left: retLeft, top: rectTop, width: rectWidth, height: rectHeight } = box

  const scrollLeft = (pageXOffset || docScrollLeft) - (docClientLeft || 0)
  const scrollTop = (pageYOffset || docScrollTop) - (docClientTop || 0)
  const offsetLeft = retLeft + pageXOffset
  const offsetTop = rectTop + pageYOffset

  const left = offsetLeft - scrollLeft
  const top = offsetTop - scrollTop

  const clientWidth = window.document.documentElement.clientWidth
  const clientHeight = window.document.documentElement.clientHeight
  return {
    left: left,
    top: top,
    right: clientWidth - rectWidth - left,
    bottom: clientHeight - rectHeight - top,
    rightIncludeBody: clientWidth - left,
    bottomIncludeBody: clientHeight - top
  }
}

/* istanbul ignore next */
export const on = function (element, event, handler) {
  if (element && event && handler) {
    element.addEventListener(event, handler, false)
  }
}

/* istanbul ignore next */
export const off = function (element, event, handler) {
  if (element && event && handler) {
    element.removeEventListener(event, handler, false)
  }
}

/* istanbul ignore next */
export const once = function (el, event, fn) {
  const listener = function (...args) {
    if (fn) {
      fn.apply(this, args)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/* istanbul ignore next */
export const getStyle =
  ieVersion < 9
    ? function (element, styleName) {
        if (isServer) return
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'styleFloat'
        }
        try {
          switch (styleName) {
            case 'opacity':
              try {
                return element.filters.item('alpha').opacity / 100
              } catch (e) {
                return 1.0
              }
            default:
              return element.style[styleName] || element.currentStyle
                ? element.currentStyle[styleName]
                : null
          }
        } catch (e) {
          return element.style[styleName]
        }
      }
    : function (element, styleName) {
        if (isServer) return
        if (!element || !styleName) return null
        styleName = camelCase(styleName)
        if (styleName === 'float') {
          styleName = 'cssFloat'
        }
        try {
          const computed = document.defaultView.getComputedStyle(element, '')
          return element.style[styleName] || computed ? computed[styleName] : null
        } catch (e) {
          return element.style[styleName]
        }
      }

/* istanbul ignore next */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (const prop in styleName) {
      if (Object.prototype.hasOwnProperty.call(styleName, prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}

/* istanbul ignore next */
export const isScroll = (el, vertical) => {
  if (isServer) return

  const determinedDirection = vertical !== null || vertical !== undefined
  const overflow = determinedDirection
    ? vertical
      ? getStyle(el, 'overflow-y')
      : getStyle(el, 'overflow-x')
    : getStyle(el, 'overflow')

  return overflow.match(/(scroll|auto)/)
}

/* istanbul ignore next */
export const getScrollContainer = (el, vertical) => {
  if (isServer) return

  let parent = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent)) {
      return window
    }
    if (isScroll(parent, vertical)) {
      return parent
    }
    parent = parent.parentNode
  }

  return parent
}

/* istanbul ignore next */
export const isInContainer = (el, container) => {
  if (isServer || !el || !container) return false

  const elRect = el.getBoundingClientRect()
  let containerRect

  if ([window, document, document.documentElement, null, undefined].includes(container)) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0
    }
  } else {
    containerRect = container.getBoundingClientRect()
  }

  return (
    elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right
  )
}
