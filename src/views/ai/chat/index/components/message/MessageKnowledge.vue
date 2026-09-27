<template>
  <div v-if="segments && segments.length" class="message-knowledge">
    <div class="message-knowledge__title">
      <i class="el-icon-document" />
      知识引用
    </div>
    <div class="message-knowledge__documents">
      <button
        v-for="item in documentList"
        :key="item.id"
        type="button"
        @click="openDocument(item)"
      >
        {{ item.title }}
        <span>（{{ item.segments.length }} 条）</span>
      </button>
    </div>

    <el-dialog
      :title="selectedDocument ? selectedDocument.title : '知识引用'"
      :visible.sync="dialogVisible"
      width="600px"
      append-to-body
    >
      <div v-if="selectedDocument" class="knowledge-detail">
        <div
          v-for="segment in selectedDocument.segments"
          :key="segment.id"
          class="knowledge-detail__segment"
        >
          <span>分段 {{ segment.id }}</span>
          <p>{{ segment.content }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'MessageKnowledge',
  props: {
    segments: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return { selectedDocument: null, dialogVisible: false }
  },
  computed: {
    documentList() {
      const documentMap = {}
      this.segments.forEach(segment => {
        const id = segment.documentId
        if (!documentMap[id]) {
          documentMap[id] = {
            id,
            title: segment.documentName || '未命名文档',
            segments: []
          }
        }
        documentMap[id].segments.push({ id: segment.id, content: segment.content })
      })
      return Object.keys(documentMap).map(key => documentMap[key])
    }
  },
  methods: {
    openDocument(document) {
      this.selectedDocument = document
      this.dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.message-knowledge {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f7fa;
}

.message-knowledge__title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
}

.message-knowledge__documents {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    padding: 8px 12px;
    border: 0;
    border-radius: 6px;
    color: #303133;
    background: #fff;
    cursor: pointer;

    &:hover { background: #e6f4ff; }
  }

  span { color: #909399; font-size: 12px; }
}

.knowledge-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.knowledge-detail__segment {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;

  > span {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    color: #606266;
    background: #f5f7fa;
    font-size: 12px;
  }

  p {
    margin: 10px 0 0;
    color: #303133;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}
</style>
