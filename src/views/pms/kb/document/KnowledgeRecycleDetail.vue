<template>
  <div>
    <div class="detail-header">
      <div class="breadcrumb-row">
        <el-button type="text" @click="$emit('back')">
          <i class="el-icon-arrow-left" />最近删除
        </el-button>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.key">
            <el-button class="breadcrumb-button" type="text" @click="openNode(item.key)">
              {{ item.name }}
            </el-button>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="detail-actions">
        <el-button size="small" type="primary" @click="$emit('restore', detail.root)">
          <i class="el-icon-refresh-left" />恢复
        </el-button>
        <el-button size="small" type="danger" @click="$emit('permanent-delete', detail.root)">
          <i class="el-icon-delete" />彻底删除
        </el-button>
      </div>
    </div>
    <el-alert
      :closable="false"
      :title="'“' + detail.root.name + '”删除于 ' + deleteTimeText"
      type="info"
      class="delete-alert"
    />
    <div v-if="currentNode && currentNode.type === PmsKnowledgeObjectType.FOLDER">
      <div class="node-title"><i class="el-icon-folder-opened" />{{ currentNode.name }}</div>
      <div v-if="currentChildren.length" class="child-grid">
        <button
          v-for="item in currentChildren"
          :key="item.key"
          type="button"
          class="child-button"
          @click="openNode(item.key)"
        >
          <i :class="item.type === PmsKnowledgeObjectType.FOLDER
            ? 'el-icon-folder'
            : 'el-icon-document'" />
          <span>{{ item.name }}</span>
          <i class="el-icon-arrow-right" />
        </button>
      </div>
      <el-empty v-else description="该文件夹没有级联删除内容" />
    </div>
    <div v-else-if="currentNode">
      <div class="node-title"><i class="el-icon-document" />{{ currentNode.name }}</div>
      <div v-loading="previewLoading">
        <div
          v-if="preview && currentNode.type === PmsKnowledgeObjectType.DOCUMENT"
          v-dompurify-html="preview.content || '<p>暂无内容</p>'"
          class="pms-knowledge-rich-text"
        ></div>
        <template
          v-else-if="preview && currentNode.type === PmsKnowledgeObjectType.FILE && preview.content"
        >
          <div class="preview-meta">
            <el-tag type="info">{{ preview.fileType || '文件' }}</el-tag>
            <span v-if="preview.fileSize != null">
              {{ formatKnowledgeFileSize(preview.fileSize) }}
            </span>
          </div>
          <file-preview
            :file-name="preview.name"
            :file-type="preview.fileType"
            :url="preview.content"
          />
        </template>
        <el-empty v-else description="该内容暂无可预览数据" />
      </div>
    </div>
  </div>
</template>

<script>
import * as KnowledgeRecycleApi from '@/api/pms/kb/recycle'
import { FilePreview } from '@/components/FilePreview'
import { formatDate } from '@/utils/formatTime'
import { PmsKnowledgeObjectType } from '@/views/pms/kb/utils/constants'
import { formatKnowledgeFileSize } from '@/views/pms/kb/utils/format'

export default {
  name: 'PmsKnowledgeRecycleDetail',
  components: { FilePreview },
  props: {
    detail: { type: Object, required: true }
  },
  data() {
    return {
      PmsKnowledgeObjectType,
      currentKey: '',
      previewLoading: false,
      preview: undefined
    }
  },
  computed: {
    deleteTimeText() {
      return this.detail.root.deleteTime
        ? formatDate(this.detail.root.deleteTime, 'YYYY-MM-DD HH:mm')
        : '未知时间'
    },
    nodes() {
      return [{
        key: this.nodeKey(this.detail.root.type, this.detail.root.entityId),
        id: this.detail.root.entityId,
        type: this.detail.root.type,
        name: this.detail.root.name
      }].concat(this.detail.children.map(item => ({
        key: this.nodeKey(item.type, item.id),
        id: item.id,
        type: item.type,
        name: item.name,
        parentId: item.parentId,
        folderId: item.folderId
      })))
    },
    currentNode() {
      return this.nodes.find(node => node.key === this.currentKey) || this.nodes[0]
    },
    currentChildren() {
      if (!this.currentNode || this.currentNode.type !== PmsKnowledgeObjectType.FOLDER) return []
      return this.nodes.filter(node =>
        node.key !== this.currentNode.key &&
        (node.parentId === this.currentNode.id ||
          ((!node.parentId || node.parentId === 0) && node.folderId === this.currentNode.id))
      )
    },
    breadcrumbs() {
      if (!this.currentNode) return []
      const result = []
      let node = this.currentNode
      while (node) {
        result.unshift(node)
        const parentId = node.parentId || node.folderId
        node = parentId ? this.nodes.find(item => item.id === parentId) : undefined
      }
      if (result[0] && this.nodes[0] && result[0].key !== this.nodes[0].key) {
        result.unshift(this.nodes[0])
      }
      return result
    }
  },
  created() {
    this.openNode(this.nodes.length ? this.nodes[0].key : '')
  },
  methods: {
    formatKnowledgeFileSize,
    nodeKey(type, id) {
      return type + '-' + id
    },
    async openNode(key) {
      this.currentKey = key
      const node = this.nodes.find(item => item.key === key)
      if (!node || node.type === PmsKnowledgeObjectType.FOLDER) {
        this.preview = undefined
        return
      }
      this.previewLoading = true
      try {
        const response = await KnowledgeRecycleApi.getKnowledgeContentRecyclePreview(
          this.detail.root.id,
          node.id
        )
        this.preview = response.data
      } finally {
        this.previewLoading = false
      }
    }
  }
}
</script>

<style scoped>
.detail-header,
.breadcrumb-row,
.detail-actions,
.node-title,
.preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-header {
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  gap: 16px;
}

.breadcrumb-row {
  min-width: 0;
}

.breadcrumb-button {
  max-width: 220px;
  padding: 0;
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-actions {
  flex-shrink: 0;
}

.delete-alert,
.node-title {
  margin-bottom: 12px;
}

.node-title {
  font-size: 18px;
  font-weight: 600;
  gap: 10px;
}

.node-title i {
  color: #409eff;
  font-size: 22px;
}

.child-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.child-button {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  color: #303133;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  gap: 10px;
}

.child-button:hover {
  background: #f5f7fa;
}

.child-button span {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-button i:first-child {
  color: #409eff;
  font-size: 20px;
}

.child-button i:last-child,
.preview-meta {
  color: #909399;
}

.preview-meta {
  justify-content: flex-end;
  margin-bottom: 12px;
  font-size: 12px;
}
</style>
