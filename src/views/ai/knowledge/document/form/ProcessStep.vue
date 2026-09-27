<template>
  <div class="process-step">
    <div class="process-list">
      <div v-for="(file, index) in modelData.list" :key="file.id || index" class="process-row">
        <div class="process-file">
          <i class="el-icon-document" />
          <span>{{ file.name }}</span>
        </div>
        <div class="process-progress">
          <el-progress
            :percentage="file.progress || 0"
            :stroke-width="10"
            :status="isProcessComplete(file) ? 'success' : undefined"
          />
        </div>
        <div class="segment-total">分段数量：{{ file.count ? file.count : '-' }}</div>
      </div>
    </div>
    <div class="process-actions">
      <el-button
        :type="allProcessComplete ? 'success' : 'primary'"
        :disabled="!allProcessComplete"
        @click="$emit('complete')"
      >
        完成
      </el-button>
    </div>
  </div>
</template>

<script>
import { KnowledgeSegmentApi } from '@/api/ai/knowledge/segment'

export default {
  name: 'AiKnowledgeDocumentProcessStep',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pollingTimer: null
    }
  },
  computed: {
    modelData() {
      return this.value
    },
    allProcessComplete() {
      const list = this.modelData.list || []
      return list.every(file => this.isProcessComplete(file))
    }
  },
  mounted() {
    const list = (this.modelData.list || []).map(file => Object.assign({}, file, { progress: 0 }))
    this.$emit('input', Object.assign({}, this.modelData, { list }))
    this.$nextTick(this.getProcessList)
  },
  beforeDestroy() {
    this.clearPolling()
  },
  methods: {
    isProcessComplete(file) {
      return file.progress === 100
    },
    clearPolling() {
      if (!this.pollingTimer) return
      window.clearTimeout(this.pollingTimer)
      this.pollingTimer = null
    },
    schedulePolling(delay) {
      this.clearPolling()
      this.pollingTimer = window.setTimeout(this.getProcessList, delay)
    },
    async getProcessList() {
      const documentIds = (this.modelData.list || [])
        .filter(item => item.id)
        .map(item => item.id)
      if (!documentIds.length) return
      try {
        const response = await KnowledgeSegmentApi.getKnowledgeSegmentProcessList(documentIds)
        const processList = response.data
        const updatedList = (this.modelData.list || []).map(file => {
          const processInfo = processList.find(item => item.documentId === file.id)
          if (!processInfo) return file
          const progress = processInfo.embeddingCount && processInfo.count
            ? Math.floor((processInfo.embeddingCount / processInfo.count) * 100)
            : 0
          return Object.assign({}, file, {
            progress: Math.min(100, progress),
            count: processInfo.count || 0
          })
        })
        this.$emit('input', Object.assign({}, this.modelData, { list: updatedList }))
        if (!updatedList.every(file => this.isProcessComplete(file))) this.schedulePolling(3000)
      } catch (error) {
        console.error('获取处理进度失败:', error)
        this.schedulePolling(5000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.process-list {
  margin-top: 15px;
}

.process-row {
  display: flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border-left: 4px solid #409eff;
  border-radius: 3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s;

  &:hover {
    background: #ecf5ff;
  }
}

.process-file {
  display: flex;
  align-items: center;
  width: 200px;
  min-width: 200px;
  margin-right: 10px;
  color: #303133;
  font-size: 13px;

  i {
    flex-shrink: 0;
    margin-right: 8px;
    color: #409eff;
  }

  span {
    overflow-wrap: anywhere;
  }
}

.process-progress {
  flex: 1;
  min-width: 120px;
}

.segment-total {
  margin-left: 10px;
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
}

.process-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .process-row {
    align-items: stretch;
    flex-direction: column;
  }

  .process-file,
  .segment-total {
    width: auto;
    margin: 4px 0;
  }
}
</style>
