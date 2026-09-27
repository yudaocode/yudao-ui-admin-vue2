<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="420px"
    append-to-body
  >
    <el-upload
      ref="upload"
      :action="importUrl"
      :auto-upload="false"
      :disabled="formLoading"
      :file-list="fileList"
      :headers="uploadHeaders"
      :limit="1"
      :before-upload="beforeUpload"
      :on-change="handleFileChange"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div
        slot="tip"
        class="el-upload__tip"
      >
        <span>仅允许导入 xls、xlsx 格式文件。</span>
        <el-link
          :underline="false"
          type="primary"
          @click="importTemplate"
        >下载模板</el-link>
      </div>
    </el-upload>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  getChangeSalaryImportTemplate,
  getFixSalaryImportTemplate
} from '@/api/hrm/salary/employee-info'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/plugins/download'

export default {
  name: 'HrmSalaryEmployeeInfoImportForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      uploadHeaders: {},
      fileList: [],
      importType: 'fix'
    }
  },
  computed: {
    dialogTitle() {
      return '薪资档案' + (this.importType === 'fix' ? '定薪' : '调薪') + '导入'
    },
    importUrl() {
      return process.env.VUE_APP_BASE_API +
        '/admin-api/hrm/salary/employee-info/import-' + this.importType
    }
  },
  methods: {
    open(type) {
      this.dialogVisible = true
      this.importType = type
      this.fileList = []
      this.resetForm()
    },
    submitForm() {
      if (this.fileList.length === 0) {
        this.$modal.msgError('请上传文件')
        return
      }
      this.uploadHeaders = {
        Authorization: 'Bearer ' + getAccessToken(),
        'tenant-id': getTenantId()
      }
      this.formLoading = true
      this.$nextTick(() => this.$refs.upload.submit())
    },
    submitFormSuccess(response) {
      if (response.code !== 0) {
        this.$modal.msgError(response.msg)
        this.resetForm()
        return
      }
      const successJobNumbers = response.data.successJobNumbers
      const failureEntries = Object.entries(response.data.failureJobNumbers)
      let text = '导入成功数量：' + successJobNumbers.length + '；'
      successJobNumbers.slice(0, 10).forEach(jobNumber => {
        text += '< ' + jobNumber + ' >'
      })
      if (successJobNumbers.length > 10) {
        text += '其余 ' + (successJobNumbers.length - 10) + ' 条已省略。'
      }
      text += '导入失败数量：' + failureEntries.length + '；'
      failureEntries.slice(0, 10).forEach(([jobNumber, reason]) => {
        text += '< ' + jobNumber + ': ' + reason + ' >'
      })
      if (failureEntries.length > 10) {
        text += '其余 ' + (failureEntries.length - 10) + ' 条已省略。'
      }
      this.$alert(text)
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
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleExceed() {
      this.$modal.msgError('最多只能上传一个文件！')
    },
    beforeUpload(file) {
      const extension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase()
      if (!['xls', 'xlsx'].includes(extension)) {
        this.$modal.msgError('仅允许导入 xls、xlsx 格式文件')
        this.formLoading = false
        this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
        return false
      }
      return true
    },
    async importTemplate() {
      const response = this.importType === 'fix'
        ? await getFixSalaryImportTemplate()
        : await getChangeSalaryImportTemplate()
      download.excel(
        response,
        this.importType === 'fix' ? '薪资档案定薪导入模板.xls' : '薪资档案调薪导入模板.xls'
      )
    }
  }
}
</script>
