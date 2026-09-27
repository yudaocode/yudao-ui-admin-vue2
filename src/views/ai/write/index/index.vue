<template>
  <div class="ai-write-create">
    <Left
      :is-writing="isWriting"
      class="ai-write-create__left"
      @submit="generateWrite"
      @reset="reset"
      @example="handleExampleClick"
    />
    <Right
      ref="rightRef"
      :content.sync="writeResult"
      :is-writing="isWriting"
      class="ai-write-create__right"
      @stop-stream="stopStream"
    />
  </div>
</template>

<script>
import Left from './components/Left.vue'
import Right from './components/Right.vue'
import { WriteApi } from '@/api/ai/write/index'

export default {
  name: 'AiWriteCreate',
  components: { Left, Right },
  data() {
    return {
      writeResult: '',
      isWriting: false,
      abortController: null,
      streamPromise: null
    }
  },
  beforeDestroy() {
    this.stopStream()
  },
  methods: {
    stopStream() {
      if (this.abortController) this.abortController.abort()
      this.abortController = null
      this.isWriting = false
    },
    generateWrite(data) {
      const controller = new AbortController()
      this.abortController = controller
      this.writeResult = ''
      this.isWriting = true
      this.streamPromise = WriteApi.writeStream({
        data,
        ctrl: controller,
        onMessage: async event => {
          if (!event.data) return
          const result = JSON.parse(event.data)
          if (result.code !== 0) {
            this.$modal.alert('写作异常! ' + (result.msg || ''))
            this.stopStream()
            return
          }
          this.writeResult += result.data
          await this.$nextTick()
          if (this.$refs.rightRef) this.$refs.rightRef.scrollToBottom()
        },
        onClose: () => {
          if (this.abortController === controller) this.stopStream()
        },
        onError: error => {
          if (this.abortController !== controller || controller.signal.aborted) return
          console.error('写作异常', error)
          this.stopStream()
          throw error
        }
      })
    },
    handleExampleClick(example) {
      this.writeResult = example.data
    },
    reset() {
      this.writeResult = ''
    }
  }
}
</script>

<style scoped>
.ai-write-create {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  min-height: 600px;
}

.ai-write-create__left {
  flex: none;
}

.ai-write-create__right {
  flex: 1;
  min-width: 0;
}
</style>
