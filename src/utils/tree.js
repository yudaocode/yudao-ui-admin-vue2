export const defaultProps = {
  children: 'children',
  label: 'name',
  value: 'id',
  isLeaf: 'leaf',
  emitPath: false
}

/** 将扁平数据按 parentId 构造成树。 */
export function handleTree(data, id, parentId, children) {
  if (!Array.isArray(data)) {
    console.warn('data must be an array')
    return []
  }
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    children: children || 'children'
  }
  const childrenMap = {}
  const nodes = {}
  const tree = []
  data.forEach(item => {
    const parent = item[config.parentId]
    if (!childrenMap[parent]) childrenMap[parent] = []
    nodes[item[config.id]] = item
    childrenMap[parent].push(item)
  })
  data.forEach(item => {
    if (!nodes[item[config.parentId]]) tree.push(item)
  })
  const attachChildren = node => {
    const list = childrenMap[node[config.id]]
    if (list) {
      node[config.children] = list
      list.forEach(attachChildren)
    }
  }
  tree.forEach(attachChildren)
  return tree
}

/** 获取指定节点的完整名称路径。 */
export function treeToString(tree, nodeId) {
  if (!Array.isArray(tree) || tree.length === 0) {
    console.warn('tree must be an array')
    return ''
  }
  const rootNode = tree.find(item => item.id === nodeId)
  if (rootNode) return rootNode.name
  let result = ''
  const find = list => {
    if (!Array.isArray(list) || list.length === 0) return false
    for (const item of list) {
      if (item.id === nodeId) {
        result += ` / ${item.name}`
        return true
      }
      if (item.children && item.children.length) {
        result += ` / ${item.name}`
        if (find(item.children)) return true
      }
    }
    return false
  }
  for (const item of tree) {
    result = item.name
    if (find(item.children)) break
  }
  return result
}
