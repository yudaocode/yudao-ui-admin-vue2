<template>
  <div class="iframe-component">
    <div v-if="showPreview" class="iframe-preview">
      <iframe
        :src="displayUrl"
        :width="width"
        :height="height"
        :frameborder="frameborder"
        :allowfullscreen="allowfullscreen"
        :sandbox="sandbox || undefined"
        class="iframe-content"
      />
    </div>
    <div v-else class="iframe-placeholder">
      <el-empty description="请在右侧属性面板配置 URL 地址" />
    </div>
  </div>
</template>

<script>
import { isUrl } from '@/utils/is'

export default {
  name: 'IframeComponent',
  props: {
    value: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '500px'
    },
    width: {
      type: String,
      default: '100%'
    },
    frameborder: {
      type: String,
      default: '0'
    },
    allowfullscreen: {
      type: Boolean,
      default: true
    },
    sandbox: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayUrl() {
      return this.url || this.value || ''
    },
    showPreview() {
      return this.displayUrl && isUrl(this.displayUrl)
    }
  }
}
</script>

<style scoped>
.iframe-component {
  width: 100%;
}

.iframe-preview {
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.iframe-content {
  display: block;
  border: none;
}

.iframe-placeholder {
  display: flex;
  min-height: 200px;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
}
</style>
