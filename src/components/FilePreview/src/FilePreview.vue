<template>
  <div class="file-preview">
    <el-image
      v-if="previewType === 'image'"
      class="file-preview-image"
      fit="contain"
      :preview-src-list="[url]"
      :src="url"
    />
    <iframe
      v-else-if="previewType === 'iframe'"
      class="file-preview-frame"
      :src="url"
      title="文件在线预览"
    ></iframe>
    <video v-else-if="previewType === 'video'" class="file-preview-media" controls :src="url">
      当前浏览器不支持视频预览
    </video>
    <audio v-else-if="previewType === 'audio'" class="file-preview-audio" controls :src="url">
      当前浏览器不支持音频预览
    </audio>
    <el-alert v-else :closable="false" show-icon :title="unsupportedTitle" type="info" />
  </div>
</template>

<script>
const IMAGE_EXTENSIONS = new Set(['bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'])
const IFRAME_EXTENSIONS = new Set(['pdf', 'txt'])
const VIDEO_EXTENSIONS = new Set(['m4v', 'mov', 'mp4', 'ogg', 'webm'])
const AUDIO_EXTENSIONS = new Set(['aac', 'flac', 'm4a', 'mp3', 'wav'])

export default {
  name: 'FilePreview',
  props: {
    url: { type: String, required: true },
    fileName: { type: String, default: '' },
    fileType: { type: String, default: '' },
    downloadable: { type: Boolean, default: false }
  },
  computed: {
    declaredType() {
      return this.fileType ? this.fileType.trim().toLowerCase().replace(/^\./, '') : ''
    },
    extension() {
      if (this.declaredType && !this.declaredType.includes('/')) return this.declaredType
      const filePath = (this.fileName || this.url).split(/[?#]/)[0]
      const index = filePath.lastIndexOf('.')
      return index >= 0 ? filePath.slice(index + 1).toLowerCase() : ''
    },
    previewType() {
      if (this.declaredType.startsWith('image/')) return 'image'
      if (this.declaredType === 'application/pdf' || this.declaredType === 'text/plain') {
        return 'iframe'
      }
      if (this.declaredType.startsWith('video/')) return 'video'
      if (this.declaredType.startsWith('audio/')) return 'audio'
      if (IMAGE_EXTENSIONS.has(this.extension)) return 'image'
      if (IFRAME_EXTENSIONS.has(this.extension)) return 'iframe'
      if (VIDEO_EXTENSIONS.has(this.extension)) return 'video'
      if (AUDIO_EXTENSIONS.has(this.extension)) return 'audio'
      return 'unsupported'
    },
    unsupportedTitle() {
      return this.downloadable
        ? '当前文件格式暂不支持在线预览，可使用下载功能查看'
        : '当前文件格式暂不支持在线预览，且当前账号没有下载权限'
    }
  }
}
</script>

<style scoped>
.file-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  overflow: hidden;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.file-preview-image,
.file-preview-media {
  width: 100%;
  height: 520px;
}

.file-preview-frame {
  width: 100%;
  height: 620px;
  background: #fff;
  border: 0;
}

.file-preview-audio {
  width: min(560px, 90%);
}
</style>
