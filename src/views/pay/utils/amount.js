/**
 * Pay amount helpers. The pay APIs use fen (integer cents), while forms are
 * presented in yuan. Keep conversion local to the pay module so values sent
 * to the backend are explicit and consistent with the Vue3 screens.
 */
export function fenToYuan(value) {
  if (value === undefined || value === null || value === '') return '-'
  const number = Number(value)
  return Number.isFinite(number) ? (number / 100).toFixed(2) : '-'
}

export function yuanToFen(value) {
  if (value === undefined || value === null || value === '') return 0
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number * 100) : 0
}
