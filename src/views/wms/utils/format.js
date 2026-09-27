// WMS 展示格式化和表单配置
export const QUANTITY_PRECISION = 2
export const PRICE_PRECISION = 2
export const WEIGHT_PRECISION = 3
export const DIMENSION_PRECISION = 1

function toFiniteDecimal(value) {
  if (value === undefined || value === null || value === '') return undefined
  const number = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(number) ? number : undefined
}

export function formatQuantity(value) {
  const number = toFiniteDecimal(value)
  return number === undefined ? '' : number.toFixed(QUANTITY_PRECISION)
}

export function formatPrice(value) {
  const number = toFiniteDecimal(value)
  return number === undefined ? '' : number.toFixed(PRICE_PRECISION)
}

export function roundPrice(value) {
  return Number.isFinite(value) ? Number(Number(value).toFixed(PRICE_PRECISION)) : undefined
}

export function formatWeight(value) {
  const number = toFiniteDecimal(value)
  return number === undefined ? '' : number.toFixed(WEIGHT_PRECISION)
}

export function formatDimension(value) {
  const number = toFiniteDecimal(value)
  return number === undefined ? '' : number.toFixed(DIMENSION_PRECISION)
}

export function formatDimensionText(length, width, height) {
  const values = [length, width, height]
  if (values.every(value => toFiniteDecimal(value) !== undefined)) {
    return values.map(formatDimension).join(' * ')
  }
  return [
    toFiniteDecimal(length) !== undefined ? '长：' + formatDimension(length) : undefined,
    toFiniteDecimal(width) !== undefined ? '宽：' + formatDimension(width) : undefined,
    toFiniteDecimal(height) !== undefined ? '高：' + formatDimension(height) : undefined
  ].filter(Boolean).join(' ')
}

export function multiplyPrice(quantity, price) {
  if (quantity === undefined || quantity === null || price === undefined || price === null) return undefined
  return roundPrice(Number(quantity) * Number(price))
}

export function dividePrice(totalPrice, quantity) {
  if (totalPrice === undefined || totalPrice === null || !quantity) return undefined
  return roundPrice(Number(totalPrice) / Number(quantity))
}

export function getLossClass(value) {
  const number = toFiniteDecimal(value)
  return number !== undefined && number < 0 ? 'text-red-500' : ''
}

export function sumQuantity(list, getter) {
  return (list || []).reduce((sum, item) => {
    const number = toFiniteDecimal(getter(item))
    return number === undefined ? sum : sum + number
  }, 0)
}

export function sumPrice(list, getter) {
  return sumQuantity(list, getter)
}

export function formatSumQuantity(list, getter) {
  return formatQuantity(sumQuantity(list, getter))
}

export function formatSumPrice(list, getter) {
  return formatPrice(sumPrice(list, getter))
}
