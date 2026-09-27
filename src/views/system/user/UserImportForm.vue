<template>
  <el-dialog title="用户导入" :visible.sync="dialogVisible" width="420px" append-to-body>
    <el-upload ref="upload" drag :limit="1" accept=".xlsx,.xls" :headers="uploadHeaders" :action="uploadUrl + '?updateSupport=' + updateSupport" :auto-upload="false" :disabled="formLoading" :on-progress="handleProgress" :on-success="handleSuccess" :on-error="handleError">
      <i class="el-icon-upload" /><div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip">仅允许导入 xls、xlsx 格式文件。<el-link type="primary" :underline="false" @click="importTemplate">下载模板</el-link><div><el-checkbox v-model="updateSupport" /> 是否更新已经存在的用户数据</div></div>
    </el-upload>
    <div slot="footer" class="dialog-footer"><el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>
<script>
import { getAccessToken, getTenantId } from '@/utils/auth'
import { importUserTemplate } from '@/api/system/user'
import download from '@/plugins/download'
export default {
  name: 'SystemUserImportForm',
  data() { return { dialogVisible: false, formLoading: false, updateSupport: false, uploadHeaders: {}, uploadUrl: process.env.VUE_APP_BASE_API + '/admin-api/system/user/import' } },
  methods: { open() { this.dialogVisible = true; this.formLoading = false; this.updateSupport = false; this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles()) }, submitForm() { if (!this.$refs.upload || !this.$refs.upload.uploadFiles.length) { this.$modal.msgError('请上传文件'); return } this.uploadHeaders = { Authorization: 'Bearer ' + getAccessToken(), 'tenant-id': getTenantId() }; this.formLoading = true; this.$refs.upload.submit() }, handleProgress() { this.formLoading = true }, handleSuccess(response) { this.formLoading = false; if (response && response.code !== 0) { this.$modal.msgError(response.msg || '上传失败'); return } this.$modal.msgSuccess('用户导入成功'); this.dialogVisible = false; this.$emit('success') }, handleError() { this.formLoading = false; this.$modal.msgError('上传失败，请您重新上传！') }, importTemplate() { importUserTemplate().then(response => download.excel(response, '用户导入模版.xls')) } }
}
</script>
