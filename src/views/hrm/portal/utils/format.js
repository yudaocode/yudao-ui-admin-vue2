export function formatHrmScore(value) {
  return value === null || value === undefined ? '-' : Number(value).toFixed(2)
}
