<template>
  <Dialog v-model="dialogVisible" :title="fileName" width="900px">
    <!-- 获得后端授权地址后预览，关闭弹窗时卸载媒体内容 -->
    <div v-loading="loading" class="oa-file-preview__body">
      <FilePreview
        v-if="dialogVisible && fileUrl"
        :url="fileUrl"
        :file-name="fileName"
        :file-type="fileType"
        :downloadable="true"
      />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="loading || !fileUrl" type="primary" @click="handleDownload">
        下 载
      </el-button>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import FilePreview from '@/components/FilePreview'
import * as NodeApi from '@/api/oa/file/node'
import { OA_FILE_PERMISSION_LEVEL } from '@/views/oa/utils/constants'

export default {
  name: 'OaFilePreview',
  components: { Dialog, FilePreview },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      loading: false, // 文件地址加载中
      fileId: undefined, // 文件编号
      fileName: '', // 文件名称
      fileType: '', // 文件扩展名
      fileUrl: '' // 后端授权的临时文件地址
    }
  },
  methods: {
    /** 打开文件预览 */
    open(row) {
      // 预览沿用下载权限，不能通过列表中的原始地址绕过后端校验
      if ((row.level || 0) < OA_FILE_PERMISSION_LEVEL.DOWNLOAD) {
        this.$modal.msgWarning('当前仅具有查看文件信息的权限')
        return
      }
      this.dialogVisible = true
      this.fileId = row.id
      this.fileName = row.name
      this.fileType = row.extension || ''
      this.fileUrl = ''
      this.loading = true
      return NodeApi.getFileNode(row.id).then(response => {
        const data = response.data
        if (!data.url) {
          this.$modal.msgWarning('当前文件不可预览或下载')
          this.dialogVisible = false
          return
        }
        this.fileName = data.name
        this.fileType = data.extension || ''
        this.fileUrl = data.url
      }).catch(() => {
        // 请求失败由公共请求拦截器提示，关闭未能加载的预览弹窗
        this.dialogVisible = false
      }).finally(() => {
        this.loading = false
      })
    },
    /** 下载当前文件 */
    handleDownload() {
      // 下载时重新查询详情，避免沿用已过期的临时地址或已撤销的共享权限
      return NodeApi.getFileNode(this.fileId).then(response => {
        const data = response.data
        if (!data.url) {
          this.$modal.msgWarning('当前文件不可下载')
          return
        }
        window.open(data.url, '_blank', 'noopener,noreferrer')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-file-preview__body {
  min-height: 360px;
}
</style>
