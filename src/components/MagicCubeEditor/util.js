// 判断两个矩形是否重叠
export function isOverlap(a, b) {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.height + a.top > b.top
  )
}

// 检查坐标点是否在矩形内
export function isContains(hotArea, point) {
  return (
    point.x >= hotArea.left &&
    point.x < hotArea.right &&
    point.y >= hotArea.top &&
    point.y < hotArea.bottom
  )
}

// 在两个坐标点中间创建矩形
export function createRect(a, b) {
  const left = Math.min(a.x, b.x)
  const left2 = Math.max(a.x, b.x)
  const top = Math.min(a.y, b.y)
  const top2 = Math.max(a.y, b.y)
  const right = left2 + 1
  const bottom = top2 + 1
  const height = bottom - top
  const width = right - left
  return { left, right, top, bottom, height, width }
}
