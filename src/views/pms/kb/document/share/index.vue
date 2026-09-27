<template>
  <div v-loading="loading" class="knowledge-share-page">
    <el-card
      v-if="document"
      :body-style="{ padding: '40px 48px' }"
      class="knowledge-share-card"
      shadow="never"
    >
      <div
        v-if="document.type === PmsKnowledgeDocumentType.RICH_TEXT"
        v-dompurify-html="document.content || '<p>暂无内容</p>'"
        class="knowledge-share-content"
      ></div>
      <div v-else class="file-share-content">
        <div class="file-share-title">{{ document.title }}</div>
        <file-preview
          v-if="document.previewUrl"
          :downloadable="false"
          :file-name="document.title"
          :file-type="document.fileType"
          :url="document.previewUrl"
        />
        <el-empty v-else description="文件未上传" />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as KnowledgeDocumentShareApi from '@/api/pms/kb/interaction/share'
import { FilePreview } from '@/components/FilePreview'
import { PmsKnowledgeDocumentType } from '@/views/pms/kb/utils/constants'

export default {
  name: 'PmsKnowledgeDocumentShare',
  components: { FilePreview },
  data() {
    return { PmsKnowledgeDocumentType, loading: false, document: undefined }
  },
  created() {
    this.getDocument()
  },
  methods: {
    async getDocument() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentShareApi.getPublicKnowledgeDocument(
          String(this.$route.params.token)
        )
        this.document = response.data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.knowledge-share-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.knowledge-share-card {
  max-width: 960px;
  min-height: calc(100vh - 48px);
  margin: 0 auto;
}

.knowledge-share-content {
  color: #303133;
  font-size: 15px;
  line-height: 1.8;
  overflow-wrap: anywhere;

  ::v-deep h1 {
    margin: 0 0 20px;
    font-size: 28px;
    line-height: 1.4;
  }

  ::v-deep h2 {
    margin: 24px 0 14px;
    font-size: 22px;
    line-height: 1.4;
  }

  ::v-deep h3 {
    margin: 20px 0 12px;
    font-size: 18px;
  }

  ::v-deep p {
    margin: 0 0 14px;
  }

  ::v-deep img {
    max-width: 100%;
    height: auto;
  }
}

.file-share-content {
  min-height: 240px;
}

.file-share-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
}
</style>
