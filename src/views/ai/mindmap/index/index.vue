<template>
  <div class="ai-mindmap-page">
    <Left
      ref="left"
      :is-generating="isGenerating"
      @submit="submit"
      @direct-generate="directGenerate"
    />
    <Right
      ref="right"
      :generated-content="generatedContent"
      :is-end="isEnd"
      :is-generating="isGenerating"
      :is-start="isStart"
    />
  </div>
</template>

<script>
import Left from './components/Left.vue'
import Right from './components/Right.vue'
import { AiMindMapApi } from '@/api/ai/mindmap'
import { MindMapContentExample } from '../constants'

export default {
  name: 'AiMindMap',
  components: { Left, Right },
  data() {
    return {
      controller: null,
      isGenerating: false,
      isStart: false,
      isEnd: true,
      generatedContent: MindMapContentExample,
      streamPromise: null
    }
  },
  beforeDestroy() {
    this.stopStream()
  },
  methods: {
    directGenerate(existingContent) {
      this.isEnd = false
      this.generatedContent = existingContent
      this.$nextTick(() => {
        this.isEnd = true
      })
    },
    stopStream() {
      if (this.controller) this.controller.abort()
      this.controller = null
      this.isGenerating = false
      this.isStart = false
    },
    finishStream() {
      this.isEnd = true
      if (this.$refs.left) this.$refs.left.setGeneratedContent(this.generatedContent)
      this.controller = null
      this.isGenerating = false
      this.isStart = false
    },
    submit(data) {
      if (this.isGenerating) return
      this.isGenerating = true
      this.isStart = true
      this.isEnd = false
      this.generatedContent = ''
      const controller = new AbortController()
      this.controller = controller

      this.streamPromise = AiMindMapApi.generateMindMap({
        data,
        ctrl: controller,
        onMessage: async event => {
          if (!event.data) return
          const result = JSON.parse(event.data)
          if (result.code !== 0) {
            this.$modal.alert('生成思维导图异常! ' + (result.msg || ''))
            this.stopStream()
            return
          }
          this.generatedContent += result.data
          await this.$nextTick()
          if (this.$refs.right) this.$refs.right.scrollBottom()
        },
        onClose: () => {
          if (this.controller === controller) this.finishStream()
        },
        onError: error => {
          if (this.controller !== controller || controller.signal.aborted) return
          console.error('生成思维导图失败', error)
          this.stopStream()
          throw error
        }
      })
    }
  }
}
</script>

<style scoped>
.ai-mindmap-page {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  min-height: 600px;
}
</style>
