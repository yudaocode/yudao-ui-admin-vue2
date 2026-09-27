<template>
  <el-card class="write-preview">
    <div
      slot="header"
      class="write-preview__header"
    >
      <h3>预览</h3>
      <el-button
        v-show="showCopy"
        v-clipboard:copy="content"
        v-clipboard:success="copySuccess"
        type="primary"
        size="small"
        class="write-preview__copy"
        icon="el-icon-document-copy"
      >复制</el-button>
    </div>

    <div
      ref="contentRef"
      class="write-preview__content"
    >
      <div class="write-preview__editor">
        <el-button
          v-show="isWriting"
          size="small"
          class="write-preview__stop"
          icon="el-icon-video-pause"
          @click="$emit('stop-stream')"
        >终止生成</el-button>
        <el-input
          id="inputId"
          v-model="compContent"
          type="textarea"
          autosize
          resize="none"
          placeholder="生成的内容……"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'AiWriteRight',
  props: {
    content: {
      type: String,
      default: ''
    },
    isWriting: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    compContent: {
      get() {
        return this.content
      },
      set(value) {
        this.$emit('update:content', value)
      }
    },
    showCopy() {
      return Boolean(this.content) && !this.isWriting
    }
  },
  methods: {
    scrollToBottom() {
      const content = this.$refs.contentRef
      if (content) content.scrollTo(0, content.scrollHeight)
    },
    copySuccess() {
      this.$message.success('复制成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.write-preview {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
}

.write-preview__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;

  h3 {
    margin: 0;
  }
}

.write-preview__copy {
  border-color: #846af7;
  background-color: #846af7;
}

.write-preview__content {
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.write-preview__editor {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  padding: 28px;
  background: #fff;
}

.write-preview__stop {
  position: absolute;
  bottom: 20px;
  left: 50%;
  z-index: 36;
  transform: translateX(-50%);
}

::v-deep .el-card__body {
  box-sizing: border-box;
  flex: 1;
  padding: 0;
  overflow-y: auto;
}

::v-deep .el-textarea__inner {
  padding: 0;
  border: 0;
  box-shadow: none;
}
</style>
