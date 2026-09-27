<template>
  <aside class="mindmap-left">
    <h3 class="title">思维导图创作中心</h3>
    <div class="form-area">
      <section class="form-section">
        <strong>您的需求？</strong>
        <el-input
          v-model="formData.prompt"
          maxlength="1024"
          :rows="5"
          class="content-input"
          placeholder="请输入提示词，让AI帮你完善"
          show-word-limit
          type="textarea"
        />
        <el-button
          class="action-button"
          type="primary"
          :loading="isGenerating"
          @click="$emit('submit', Object.assign({}, formData))"
        >
          智能生成思维导图
        </el-button>
      </section>

      <section class="form-section">
        <strong>使用已有内容生成？</strong>
        <el-input
          v-model="generatedContent"
          maxlength="1024"
          :rows="5"
          class="content-input"
          placeholder="例如：童话里的小屋应该是什么样子？"
          show-word-limit
          type="textarea"
        />
        <el-button
          class="action-button"
          type="primary"
          :disabled="isGenerating"
          @click="$emit('direct-generate', generatedContent)"
        >
          直接生成
        </el-button>
      </section>
    </div>
  </aside>
</template>

<script>
import { MindMapContentExample } from '../../constants'

export default {
  name: 'AiMindMapLeft',
  props: {
    isGenerating: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      formData: { prompt: '' },
      generatedContent: MindMapContentExample
    }
  },
  methods: {
    setGeneratedContent(newContent) {
      this.generatedContent = newContent || ''
    }
  }
}
</script>

<style lang="scss" scoped>
.mindmap-left {
  display: flex;
  flex: 0 0 350px;
  flex-direction: column;
  box-sizing: border-box;
  width: 350px;
  padding: 20px;
  overflow: hidden;
  background: #f5f7f9;
}

.title {
  width: 100%;
  height: 28px;
  margin: 0;
  color: #409eff;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
}

.form-area {
  flex-grow: 1;
  overflow-y: auto;
}

.form-section {
  margin-top: 30px;
}

.content-input,
.action-button {
  width: 100%;
  margin-top: 15px;
}

::v-deep .content-input textarea {
  border-radius: 7px;
}
</style>
