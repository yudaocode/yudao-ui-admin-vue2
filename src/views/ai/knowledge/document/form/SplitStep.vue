<template>
  <div class="split-step">
    <section class="split-settings">
      <div class="section-header">
        <div class="section-title">
          分段设置
          <el-tooltip
            content="系统会自动将文档内容分割成多个段落，您可以根据需要调整分段方式和内容。"
            placement="top"
          >
            <i class="el-icon-warning-outline setting-tip" />
          </el-tooltip>
        </div>
        <el-button type="primary" plain size="small" @click="handleAutoSegment">
          预览分段
        </el-button>
      </div>
      <el-form label-width="120px">
        <el-form-item label="最大 Token 数">
          <el-input-number
            v-model="modelData.segmentMaxTokens"
            :min="1"
            :max="2048"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
    </section>

    <section>
      <div class="section-title preview-title">分段预览</div>
      <div class="file-selector">
        <el-dropdown v-if="modelData.list && modelData.list.length" trigger="click">
          <span class="file-trigger">
            <i class="el-icon-document" />
            <span>{{ currentFile ? currentFile.name : '请选择文件' }}</span>
            <span v-if="currentFile && currentFile.segments" class="segment-count">
              ({{ currentFile.segments.length }}个分片)
            </span>
            <i class="el-icon-arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(file, index) in modelData.list"
              :key="file.url || index"
              @click.native="selectFile(index)"
            >
              {{ file.name }}
              <span v-if="file.segments" class="segment-count">
                ({{ file.segments.length }}个分片)
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <span v-else class="empty-file">暂无上传文件</span>
      </div>

      <div class="file-preview">
        <div v-if="splitLoading" class="preview-loading">
          <i class="el-icon-loading" />
          <span>正在加载分段内容...</span>
        </div>
        <template v-else-if="currentFile && currentFile.segments && currentFile.segments.length">
          <div v-for="(segment, index) in currentFile.segments" :key="index" class="segment-item">
            <div class="segment-meta">
              分片-{{ index + 1 }} · {{ segment.contentLength || 0 }} 字符数 ·
              {{ segment.tokens || 0 }} Token
            </div>
            <div class="segment-content">{{ segment.content }}</div>
          </div>
        </template>
        <el-empty v-else description="暂无预览内容" />
      </div>
    </section>

    <div class="step-actions">
      <el-button v-if="!modelData.id" @click="$emit('prev')">上一步</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSave">
        保存并处理
      </el-button>
    </div>
  </div>
</template>

<script>
import { KnowledgeDocumentApi } from '@/api/ai/knowledge/document'
import { KnowledgeSegmentApi } from '@/api/ai/knowledge/segment'

export default {
  name: 'AiKnowledgeDocumentSplitStep',
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentFileIndex: 0,
      splitLoading: false,
      submitLoading: false
    }
  },
  computed: {
    modelData() {
      return this.value
    },
    currentFile() {
      const list = this.modelData.list || []
      return list[this.currentFileIndex] || null
    }
  },
  mounted() {
    if (!this.modelData.segmentMaxTokens) this.$set(this.modelData, 'segmentMaxTokens', 500)
    if (this.currentFile) this.splitContent(this.currentFile)
  },
  methods: {
    async selectFile(index) {
      this.currentFileIndex = Number(index)
      await this.splitContent(this.currentFile)
    },
    async splitContent(file) {
      if (!file || !file.url) {
        this.$modal.msgWarning('文件 URL 不存在')
        return
      }
      this.splitLoading = true
      try {
        const response = await KnowledgeSegmentApi.splitContent(
          file.url,
          Number(this.modelData.segmentMaxTokens)
        )
        this.$set(file, 'segments', response.data)
      } catch (error) {
        console.error('获取分段内容失败:', file, error)
      } finally {
        this.splitLoading = false
      }
    },
    async handleAutoSegment() {
      if (!this.currentFile) {
        this.$modal.msgWarning('请先选择文件')
        return
      }
      await this.splitContent(this.currentFile)
    },
    async handleSave() {
      if (!this.currentFile || !this.currentFile.segments || !this.currentFile.segments.length) {
        this.$modal.msgWarning('请先预览分段内容')
        return
      }
      this.submitLoading = true
      try {
        if (this.modelData.id) {
          await KnowledgeDocumentApi.updateKnowledgeDocument({
            id: this.modelData.id,
            segmentMaxTokens: this.modelData.segmentMaxTokens
          })
        } else {
          const response = await KnowledgeDocumentApi.createKnowledgeDocumentList({
            knowledgeId: this.modelData.knowledgeId,
            segmentMaxTokens: this.modelData.segmentMaxTokens,
            list: this.modelData.list.map(item => ({ name: item.name, url: item.url }))
          })
          const documentIds = response.data
          this.modelData.list.forEach((document, index) => {
            this.$set(document, 'id', documentIds[index])
          })
        }
        this.$emit('next')
      } catch (error) {
        console.error('保存失败:', this.modelData, error)
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.split-settings {
  margin-bottom: 20px;
}

.section-header,
.step-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.setting-tip {
  margin-left: 5px;
  color: #909399;
}

.preview-title,
.file-selector {
  margin-bottom: 10px;
}

.file-trigger {
  display: inline-flex;
  align-items: center;
  color: #303133;
  cursor: pointer;

  > i:first-child {
    margin-right: 5px;
    color: #f56c6c;
  }

  > i:last-child {
    margin-left: 5px;
  }
}

.segment-count,
.segment-meta,
.empty-file {
  color: #909399;
  font-size: 12px;
}

.segment-count {
  margin-left: 5px;
}

.file-preview {
  max-height: 600px;
  min-height: 160px;
  padding: 15px;
  overflow-y: auto;
  background: #f5f7fa;
  border-radius: 6px;
}

.preview-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  i {
    margin-right: 10px;
  }
}

.segment-item {
  margin-bottom: 10px;
}

.segment-meta {
  margin-bottom: 5px;
}

.segment-content {
  padding: 10px;
  color: #303133;
  background: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
}

.step-actions {
  margin-top: 20px;
}
</style>
