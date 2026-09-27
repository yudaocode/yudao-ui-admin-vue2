<!-- MES 设备导入表单 -->
<template>
  <el-dialog title="设备导入" :visible.sync="dialogVisible" width="400px" append-to-body>
    <el-upload
      ref="upload"
      drag
      :limit="1"
      accept=".xlsx,.xls"
      :headers="uploadHeaders"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :file-list="fileList"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip import-tip">
        <div><el-checkbox v-model="updateSupport" /> 是否更新已经存在的设备数据</div>
        <span>仅允许导入 xls、xlsx 格式文件。</span>
        <el-link type="primary" :underline="false" @click="importTemplate">下载模板</el-link>
      </div>
    </el-upload>
    <span slot="footer"><el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DvMachineryApi } from '@/api/mes/dv/machinery'
import { getAccessToken, getTenantId } from '@/utils/auth'

export default {
  name: 'MachineryImportForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      uploadHeaders: {},
      fileList: [],
      updateSupport: 0,
      importUrl: process.env.VUE_APP_BASE_API + '/admin-api/mes/dv/machinery/import'
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.updateSupport = 0
      this.fileList = []
      this.resetForm()
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
    },
    submitForm() {
      if (this.fileList.length === 0) {
        this.$modal.msgError('请上传文件')
        return
      }
      this.uploadHeaders = { Authorization: 'Bearer ' + getAccessToken(), 'tenant-id': getTenantId() }
      this.formLoading = true
      this.$nextTick(() => this.$refs.upload.submit())
    },
    submitFormSuccess(response) {
      if (response.code !== 0) {
        this.$modal.msgError(response.msg)
        this.resetForm()
        return
      }
      const data = response.data
      let text = '上传成功数量：' + data.createCodes.length + ';'
      for (const code of data.createCodes) text += '< ' + code + ' >'
      text += '更新成功数量：' + data.updateCodes.length + ';'
      for (const code of data.updateCodes) text += '< ' + code + ' >'
      text += '更新失败数量：' + Object.keys(data.failureCodes).length + ';'
      for (const code in data.failureCodes) text += '< ' + code + ': ' + data.failureCodes[code] + ' >'
      this.$alert(text, '导入结果', { dangerouslyUseHTMLString: true })
      this.formLoading = false
      this.dialogVisible = false
      this.$emit('success')
    },
    submitFormError() {
      this.$modal.msgError('上传失败，请您重新上传！')
      this.formLoading = false
    },
    resetForm() {
      this.formLoading = false
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    },
    handleExceed() {
      this.$modal.msgError('最多只能上传一个文件！')
    },
    async importTemplate() {
      const response = await DvMachineryApi.importTemplate()
      this.$download.excel(response, '设备导入模板.xls')
    }
  }
}
</script>

<style scoped>.import-tip { text-align: center; }</style>
