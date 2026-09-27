import ep from './collections/ep.json'
import fa from './collections/fa.json'
import faSolid from './collections/fa-solid.json'

const collections = { ep, fa, 'fa-solid': faSolid }

export function resolveIcon(name) {
  const [prefix, key] = String(name || '').split(':')
  const collection = collections[prefix]
  if (!collection) return null
  function resolve(current, visited) {
    if (visited.has(current)) return null
    visited.add(current)
    const icon = collection.icons[current]
    if (icon) return { width: collection.width || 16, height: collection.height || 16, ...icon }
    const alias = collection.aliases && collection.aliases[current]
    if (!alias) return null
    const parent = resolve(alias.parent, visited)
    if (!parent) return null
    let body = parent.body
    if (alias.hFlip) body = `<g transform="translate(${parent.width} 0) scale(-1 1)">${body}</g>`
    if (alias.vFlip) body = `<g transform="translate(0 ${parent.height}) scale(1 -1)">${body}</g>`
    return { ...parent, body }
  }
  return resolve(key, new Set())
}
