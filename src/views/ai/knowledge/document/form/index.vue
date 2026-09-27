<template>
  <div class="app-container document-form-page">
    <div class="document-form-shell">
      <header class="document-form-header">
        <div class="header-title">
          <i class="el-icon-arrow-left back-icon" role="button" tabindex="0" @click="handleBack" />
          <span>{{ formData.id ? '编辑知识库文档' : '创建知识库文档' }}</span>
        </div>
        <div class="steps">
          <div
            v-for="(step, index) in steps"
            :key="step.title"
            :class="['step-item', { active: currentStep === index }]"
          >
            <span class="step-number">{{ index + 1 }}</span>
            <span>{{ step.title }}</span>
          </div>
        </div>
        <div class="header-spacer" />
      </header>

      <main class="document-form-content">
        <div class="step-panel">
          <upload-step
            v-if="currentStep === 0"
            ref="uploadDocument"
            v-model="formData"
            @next="goToNextStep"
          />
          <split-step
            v-else-if="currentStep === 1"
            ref="documentSegment"
            v-model="formData"
            @prev="goToPrevStep"
            @next="goToNextStep"
          />
          <process-step
            v-else
            ref="processComplete"
            v-model="formData"
            @complete="handleBack"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { KnowledgeDocumentApi } from '@/api/ai/knowledge/document'
import UploadStep from './UploadStep.vue'
import SplitStep from './SplitStep.vue'
import ProcessStep from './ProcessStep.vue'

export default {
  name: 'AiKnowledgeDocumentForm',
  components: { UploadStep, SplitStep, ProcessStep },
  data() {
    return {
      currentStep: 0,
      steps: [{ title: '上传文档' }, { title: '文档分段' }, { title: '处理并完成' }],
      formData: this.getDefaultFormData()
    }
  },
  watch: {
    '$route.fullPath': {
      immediate: true,
      handler() {
        this.initData()
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        knowledgeId: undefined,
        id: undefined,
        segmentMaxTokens: 500,
        list: []
      }
    },
    async initData() {
      this.currentStep = 0
      this.formData = this.getDefaultFormData()
      if (this.$route.query.knowledgeId) {
        this.formData.knowledgeId = this.$route.query.knowledgeId
      }
      const documentId = this.$route.query.id
      if (documentId) {
        this.formData.id = documentId
        const response = await KnowledgeDocumentApi.getKnowledgeDocument(documentId)
        const document = response.data
        this.formData.segmentMaxTokens = document.segmentMaxTokens
        this.formData.list = [{
          id: document.id,
          name: document.name,
          url: document.url,
          segments: []
        }]
        this.goToNextStep()
      }
    },
    goToNextStep() {
      if (this.currentStep < this.steps.length - 1) this.currentStep += 1
    },
    goToPrevStep() {
      if (this.currentStep > 0) this.currentStep -= 1
    },
    async handleBack() {
      try {
        await this.$store.dispatch('tagsView/delView', this.$route)
      } catch (error) {
        // 页签不存在时仍需返回文档列表。
      }
      this.$router.push({
        name: 'AiKnowledgeDocument',
        query: { knowledgeId: this.formData.knowledgeId }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.document-form-shell {
  position: relative;
  min-height: 620px;
  padding-top: 50px;
  background: #fff;
}

.document-form-header {
  position: absolute;
  z-index: 10;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  border-bottom: 1px solid #dcdfe6;
}

.header-title,
.header-spacer {
  display: flex;
  align-items: center;
  width: 200px;
  min-width: 200px;
}

.header-title {
  overflow: hidden;
  font-size: 16px;

  span {
    overflow: hidden;
    margin-left: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.back-icon {
  flex-shrink: 0;
  cursor: pointer;
}

.steps {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: center;
  height: 100%;
}

.step-item {
  display: flex;
  position: relative;
  align-items: center;
  height: 100%;
  margin: 0 15px;
  color: #909399;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;

  &.active {
    color: #3473ff;
    border-bottom: 2px solid #3473ff;

    .step-number {
      color: #fff;
      background: #3473ff;
      border-color: #3473ff;
    }
  }
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  color: #606266;
  background: #fff;
  border: 2px solid #dcdfe6;
  border-radius: 50%;
  font-size: 15px;
}

.document-form-content {
  min-height: 500px;
  padding: 30px 20px;
}

.step-panel {
  max-width: 560px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  .header-title,
  .header-spacer {
    width: 150px;
    min-width: 150px;
  }

  .step-item {
    margin: 0 6px;
    font-size: 14px;
  }
}
</style>
