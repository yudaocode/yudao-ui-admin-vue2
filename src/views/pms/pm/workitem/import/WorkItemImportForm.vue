<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body :title="`${workItemTypeName}导入`" width="460px">
    <el-upload
      ref="uploadRef"
      :action="importUrl"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx,.xls"
      drag
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" class="el-upload__tip import-tip">
        <span>仅允许导入 xls、xlsx 格式文件。</span>
        <span>处理人请填写用户编号，状态请填写当前项目的状态名称。</span>
        <span>优先级、缺陷类型可直接使用模板下拉（缺陷类型仅缺陷填写），标签支持多个名称（用逗号分隔）。</span>
        <el-link :underline="false" type="primary" @click="downloadTemplate">下载模板</el-link>
      </div>
    </el-upload>
    <span slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { getAccessToken, getTenantId } from '@/utils/auth'
import { PmsWorkItemType } from '@/views/pms/pm/utils/constants'
import { getWorkItemTypeName } from '@/views/pms/pm/utils/format'

export default {
  name: 'PmsWorkItemImportForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      uploadHeaders: {},
      projectId: 0,
      workItemType: PmsWorkItemType.TASK
    }
  },
  computed: {
    workItemTypeName() {
      return getWorkItemTypeName(this.workItemType)
    },
    importUrl() {
      return process.env.VUE_APP_BASE_API +
        `/admin-api/pms/pm/work-item/import?projectId=${this.projectId}&type=${this.workItemType}`
    }
  },
  methods: {
    open(currentProjectId, currentWorkItemType) {
      this.dialogVisible = true
      this.projectId = currentProjectId
      this.workItemType = currentWorkItemType
      this.resetForm()
    },
    submitForm() {
      const files = this.$refs.uploadRef && this.$refs.uploadRef.uploadFiles
      if (!files || files.length === 0) {
        this.$message.error('请上传文件')
        return
      }
      this.uploadHeaders = {
        Authorization: 'Bearer ' + getAccessToken(),
        'tenant-id': getTenantId()
      }
      this.formLoading = true
      this.$nextTick(() => this.$refs.uploadRef && this.$refs.uploadRef.submit())
    },
    submitFormSuccess(response) {
      if (response.code !== 0) {
        this.$message.error(response.msg || '导入失败')
        this.resetForm()
        return
      }
      const failureEntries = Object.entries((response.data && response.data.failureReasons) || {})
      const failureText = failureEntries.map(([row, reason]) => `第 ${row} 行：${reason}`).join('；')
      const successCount = response.data ? response.data.successCount : 0
      this.$alert(
        `导入成功 ${successCount} 条，失败 ${failureEntries.length} 条` +
          (failureText ? `；${failureText}` : ''),
        '导入结果'
      )
      this.formLoading = false
      this.dialogVisible = false
      this.$emit('success')
    },
    submitFormError() {
      this.$message.error('上传失败，请重新上传')
      this.formLoading = false
    },
    resetForm() {
      this.formLoading = false
      this.$nextTick(() => this.$refs.uploadRef && this.$refs.uploadRef.clearFiles())
    },
    handleExceed() {
      this.$message.error('最多只能上传一个文件')
    },
    async downloadTemplate() {
      const data = await WorkItemApi.getWorkItemImportTemplate()
      this.$download.excel(data, '工作项导入模板.xlsx')
    }
  }
}
</script>

<style scoped>
.import-tip { display: flex; flex-direction: column; line-height: 22px; text-align: center; }
</style>
