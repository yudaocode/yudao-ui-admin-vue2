<template>
  <div v-if="attachmentUrls && attachmentUrls.length" class="message-files">
    <button
      v-for="(url, index) in attachmentUrls"
      :key="url + index"
      type="button"
      class="message-file"
      :title="getFileName(url)"
      @click="openFile(url)"
    >
      <span class="message-file__icon" :class="getFileTypeClass(getFileName(url))">
        <i :class="getFileIcon(getFileName(url))" />
      </span>
      <span class="message-file__name">{{ getFileName(url) }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'MessageFiles',
  props: {
    attachmentUrls: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getFileName(url) {
      const value = String(url || '').split(/[?#]/)[0]
      try {
        return decodeURIComponent(value.slice(value.lastIndexOf('/') + 1)) || 'unknown'
      } catch (error) {
        return value.slice(value.lastIndexOf('/') + 1) || 'unknown'
      }
    },
    getFileIcon(filename) {
      const extension = String(filename).split('.').pop().toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
        return 'el-icon-picture-outline'
      }
      return 'el-icon-document'
    },
    getFileTypeClass(filename) {
      const extension = String(filename).split('.').pop().toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'is-image'
      if (extension === 'pdf') return 'is-pdf'
      if (['doc', 'docx'].includes(extension)) return 'is-word'
      if (['xls', 'xlsx'].includes(extension)) return 'is-sheet'
      if (['ppt', 'pptx'].includes(extension)) return 'is-slide'
      if (['mp3', 'wav', 'm4a', 'aac'].includes(extension)) return 'is-audio'
      if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return 'is-video'
      return 'is-file'
    },
    openFile(url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
}
</script>

<style lang="scss" scoped>
.message-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.message-file {
  display: flex;
  min-width: 150px;
  max-width: 280px;
  align-items: center;
  padding: 9px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f5f7fa;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    border-color: #c6e2ff;
    background: #ecf5ff;
    transform: translateY(-1px);
  }
}

.message-file__icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  background: #909399;

  &.is-image { background: #e6a23c; }
  &.is-pdf { background: #f56c6c; }
  &.is-word { background: #409eff; }
  &.is-sheet { background: #67c23a; }
  &.is-slide { background: #f08c46; }
  &.is-audio { background: #b565d8; }
  &.is-video { background: #f56c6c; }
}

.message-file__name {
  min-width: 0;
  margin-left: 9px;
  overflow: hidden;
  color: #303133;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
