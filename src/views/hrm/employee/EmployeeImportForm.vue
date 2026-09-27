<template>
  <el-dialog
    title="员工档案导入"
    :visible.sync="dialogVisible"
    width="460px"
    append-to-body
  >
    <el-upload
      ref="upload"
      :file-list="fileList"
      :action="importUrl + '?duplicateStrategy=' + duplicateStrategy"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx,.xls"
      drag
    >
      <i class="el-icon-upload" /><div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div
        slot="tip"
        class="el-upload__tip import-tip"
      ><div>重复员工：<el-radio-group v-model="duplicateStrategy"><el-radio :label="1">跳过</el-radio><el-radio :label="2">覆盖</el-radio><el-radio :label="3">判失败</el-radio></el-radio-group></div><span>仅允许导入 xls、xlsx 格式文件。</span><el-link
        :underline="false"
        class="template-link"
        type="primary"
        @click="importTemplate"
      >下载模板</el-link></div>
    </el-upload>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>
<script>
import { importEmployeeTemplate } from '@/api/hrm/employee'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/plugins/download'
export default {
  name: 'HrmEmployeeImportForm',
  data() { return { dialogVisible: false, formLoading: false, uploadHeaders: {}, fileList: [], duplicateStrategy: 3, importUrl: process.env.VUE_APP_BASE_API + '/admin-api/hrm/employee/import' } },
  methods: {
    open() { this.dialogVisible = true; this.duplicateStrategy = 3; this.fileList = []; this.resetForm() },
    handleFileChange(file, files) { this.fileList = files.slice(-1) }, handleFileRemove() { this.fileList = [] },
    submitForm() { if (!this.fileList.length) { this.$modal.msgError('请上传文件'); return } this.uploadHeaders = { Authorization: 'Bearer ' + getAccessToken(), 'tenant-id': getTenantId() }; this.formLoading = true; this.$nextTick(() => this.$refs.upload.submit()) },
    submitFormSuccess(response) { if (response.code !== 0) { this.$modal.msgError(response.msg); this.resetForm(); return } const data = response.data; let text = '上传成功数量：' + data.createJobNumbers.length + ';'; data.createJobNumbers.forEach(item => { text += '< ' + item + ' >' }); text += '更新成功数量：' + data.updateJobNumbers.length + ';'; data.updateJobNumbers.forEach(item => { text += '< ' + item + ' >' }); text += '跳过数量：' + data.skipJobNumbers.length + ';'; data.skipJobNumbers.forEach(item => { text += '< ' + item + ' >' }); text += '更新失败数量：' + Object.keys(data.failureJobNumbers).length + ';'; Object.keys(data.failureJobNumbers).forEach(item => { text += '< ' + item + ': ' + data.failureJobNumbers[item] + ' >' }); this.$alert(text, '员工档案导入结果', { dangerouslyUseHTMLString: true }); this.formLoading = false; this.dialogVisible = false; this.$emit('success') },
    submitFormError() { this.$modal.msgError('上传失败，请您重新上传！'); this.formLoading = false },
    resetForm() { this.formLoading = false; this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles()) },
    handleExceed() { this.$modal.msgError('最多只能上传一个文件！') },
    async importTemplate() { const response = await importEmployeeTemplate(); download.excel(response, '员工档案导入模板.xlsx') }
  }
}
</script>
<style scoped>.import-tip { text-align: center; }.template-link { margin-left: 6px; font-size: 12px; vertical-align: baseline; }</style>
