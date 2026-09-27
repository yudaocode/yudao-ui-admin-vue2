<template>
  <div class="app-container knowledge-retrieval">
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="retrieval-card" shadow="never">
          <div slot="header">
            <h3 class="retrieval-title">召回测试</h3>
            <div class="retrieval-description">根据给定的查询文本测试召回效果。</div>
          </div>
          <div class="content-input">
            <el-input
              v-model="queryParams.content"
              type="textarea"
              :rows="8"
              placeholder="请输入文本"
            />
            <span class="content-counter">{{ queryParams.content.length }} / 200</span>
          </div>
          <div class="setting-row">
            <span class="setting-label">topK:</span>
            <el-input-number v-model="queryParams.topK" :min="1" :max="20" />
          </div>
          <div class="setting-row">
            <span class="setting-label">相似度:</span>
            <el-input-number
              v-model="queryParams.similarityThreshold"
              :min="0"
              :max="1"
              :precision="2"
              :step="0.01"
            />
          </div>
          <div class="retrieval-actions">
            <el-button type="primary" :loading="loading" @click="getRetrievalResult">
              测试
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="retrieval-card result-card" shadow="never">
          <el-empty v-if="loading" description="正在检索中..." />
          <div v-else-if="segments.length > 0" class="result-count">
            {{ segments.length }} 个召回段落
          </div>
          <el-empty v-else description="暂无召回结果" />
          <div v-for="(segment, index) in segments" :key="index" class="segment-result">
            <div class="segment-meta">
              <span>
                分段({{ segment.id }}) · {{ segment.contentLength }} 字符数 ·
                {{ segment.tokens }} Token
              </span>
              <span class="segment-score">score: {{ segment.score }}</span>
            </div>
            <div :class="['segment-content', { collapsed: !segment.expanded }]">
              {{ segment.content }}
            </div>
            <div class="segment-footer">
              <span class="document-name">
                <i class="el-icon-document" />
                {{ segment.documentName || '未知文档' }}
              </span>
              <el-button size="mini" @click="toggleExpand(segment)">
                {{ segment.expanded ? '收起' : '展开' }}
                <i :class="segment.expanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { KnowledgeApi } from '@/api/ai/knowledge/knowledge'
import { KnowledgeSegmentApi } from '@/api/ai/knowledge/segment'

export default {
  name: 'AiKnowledgeRetrieval',
  data() {
    return {
      loading: false,
      segments: [],
      queryParams: {
        id: undefined,
        content: '',
        topK: 10,
        similarityThreshold: 0.5
      }
    }
  },
  watch: {
    '$route.query.id': {
      immediate: true,
      handler(id) {
        this.initialize(id)
      }
    }
  },
  methods: {
    async initialize(id) {
      this.segments = []
      if (!id) {
        this.$modal.msgError('知识库 ID 不存在，无法进行召回测试')
        this.$router.back()
        return
      }
      this.queryParams.id = id
      await this.getKnowledgeInfo(id)
    },
    async getKnowledgeInfo(id) {
      try {
        const response = await KnowledgeApi.getKnowledge(id)
        const knowledge = response.data
        if (!knowledge) return
        this.queryParams.topK = knowledge.topK || this.queryParams.topK
        this.queryParams.similarityThreshold =
          knowledge.similarityThreshold || this.queryParams.similarityThreshold
      } catch (error) {
        // 请求错误由请求层统一提示。
      }
    },
    async getRetrievalResult() {
      if (!this.queryParams.content) {
        this.$modal.msgWarning('请输入查询文本')
        return
      }
      this.loading = true
      this.segments = []
      try {
        const response = await KnowledgeSegmentApi.searchKnowledgeSegment({
          knowledgeId: this.queryParams.id,
          content: this.queryParams.content,
          topK: this.queryParams.topK,
          similarityThreshold: this.queryParams.similarityThreshold
        })
        const data = response.data || []
        this.segments = data.map(segment => Object.assign({}, segment, { expanded: false }))
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    toggleExpand(segment) {
      this.$set(segment, 'expanded', !segment.expanded)
    }
  }
}
</script>

<style lang="scss" scoped>
.knowledge-retrieval {
  .retrieval-card {
    min-height: 430px;
    margin-bottom: 20px;
  }

  .retrieval-title {
    margin: 0 0 6px;
  }

  .retrieval-description,
  .setting-label,
  .segment-meta,
  .document-name {
    color: #909399;
  }

  .retrieval-description {
    font-size: 14px;
  }

  .content-input {
    position: relative;
    margin-bottom: 18px;
  }

  .content-counter {
    position: absolute;
    right: 12px;
    bottom: 10px;
    color: #c0c4cc;
    font-size: 12px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .setting-label {
    width: 72px;
  }

  .retrieval-actions {
    display: flex;
    justify-content: flex-end;
  }

  .result-count {
    margin-bottom: 16px;
    font-weight: 600;
  }

  .segment-result {
    margin-bottom: 18px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  .segment-meta,
  .segment-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .segment-meta {
    margin-bottom: 8px;
    font-size: 12px;
  }

  .segment-score {
    flex-shrink: 0;
    margin-left: 12px;
    padding: 4px 8px;
    color: #409eff;
    background: #ecf5ff;
    border-radius: 12px;
    font-weight: 600;
  }

  .segment-content {
    max-height: 500px;
    margin-bottom: 10px;
    padding: 10px;
    overflow: auto;
    background: #f5f7fa;
    border-radius: 4px;
    white-space: pre-wrap;
    transition: max-height 0.1s;
  }

  .segment-content.collapsed {
    display: -webkit-box;
    max-height: 42px;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .document-name i {
    margin-right: 5px;
  }
}
</style>
