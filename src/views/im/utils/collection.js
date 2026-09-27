export function countBy(list, iteratee) {
  return list.reduce((result, item) => {
    const key = iteratee(item)
    result[key] = (result[key] || 0) + 1
    return result
  }, {})
}

export function union(...lists) {
  return Array.from(new Set([].concat(...lists)))
}

export function isEqual(left, right) {
  if (left === right) return true
  if (left == null || right == null || typeof left !== 'object' || typeof right !== 'object') return false
  if (Array.isArray(left) !== Array.isArray(right)) return false
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false
  return leftKeys.every(key => Object.prototype.hasOwnProperty.call(right, key) && isEqual(left[key], right[key]))
}

export function debounce(fn, wait) {
  let timer
  function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
  debounced.cancel = () => clearTimeout(timer)
  debounced.flush = () => {
    clearTimeout(timer)
    return fn()
  }
  return debounced
}
