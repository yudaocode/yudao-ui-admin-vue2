<template>
  <!-- 上传文件并登记云盘节点 -->
  <el-upload
    :show-file-list="false"
    :http-request="handleUpload"
    :disabled="uploadLoading"
    class="oa-file-upload"
  >
    <el-button type="primary" size="small" :loading="uploadLoading" icon="el-icon-upload2">
      上传文件
    </el-button>
  </el-upload>
</template>

<script>
import * as NodeApi from '@/api/oa/file/node'
import * as FileApi from '@/api/infra/file'
import { OA_FILE_NODE_TYPE } from '@/views/oa/utils/constants'

export default {
  name: 'OaFileUpload',
  props: {
    parentId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      uploadLoading: false // 文件上传中
    }
  },
  methods: {
    /** 上传文件 */
    async handleUpload(options) {
      // 保存上传开始时的目标目录，避免切换目录后登记到其他位置
      const parentId = this.parentId
      this.uploadLoading = true
      try {
        // 上传文件，获得平台文件地址
        const result = await FileApi.updateFile({
          file: options.file,
          directory: 'oa/file'
        })
        if (result.code !== 0) {
          throw new Error('上传失败')
        }
        // 登记云盘节点，分类由后端根据文件扩展名计算
        await NodeApi.createFileNode({
          parentId,
          type: OA_FILE_NODE_TYPE.FILE,
          name: options.file.name,
          url: result.data,
          size: options.file.size
        })
        this.$modal.msgSuccess('上传成功')
        this.$emit('success')
      } finally {
        this.uploadLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-file-upload {
  display: inline-block;
  margin-left: 10px;
}
</style>
