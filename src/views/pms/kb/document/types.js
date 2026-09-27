import { PmsKnowledgeDocumentType } from '@/views/pms/kb/utils/constants'

/** 获得目录节点图标。 */
export function getKnowledgeTreeNodeIcon(node) {
  if (node.kind === 'folder') return 'ep:folder'
  return node.type === PmsKnowledgeDocumentType.FILE ? 'ep:paperclip' : 'ep:document'
}

/** 获得目录节点类型名称。 */
export function getKnowledgeTreeNodeTypeName(node) {
  if (node.kind === 'folder') return '文件夹'
  return node.type === PmsKnowledgeDocumentType.FILE ? '文件' : '文档'
}
