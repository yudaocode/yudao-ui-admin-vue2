<template>
  <el-dialog
    title="导入初始余额"
    :visible.sync="visible"
    width="680px"
    append-to-body
    @closed="resetImport"
  >
    <template v-if="result === null">
      <div class="import-section">
        <div class="section-title">一、请下载当前账套的初始余额模板</div>
        <el-button type="text" :loading="templateLoading" @click="downloadTemplate">
          <i class="el-icon-download" /> 下载《财务初始余额导入模板》
        </el-button>
        <div class="import-tip">模板已带出末级科目；辅助核算项目按“类别:名称/类别:名称”填写</div>
      </div>
      <div class="import-section">
        <div class="section-title">二、填写完成后上传模板</div>
        <el-upload
          ref="upload"
          action="#"
          drag
          :auto-upload="false"
          :limit="1"
          :file-list="fileList"
          accept=".xlsx,.xls"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          <div slot="tip" class="el-upload__tip">仅支持 xls、xlsx 格式</div>
        </el-upload>
      </div>
    </template>

    <el-result
      v-else
      icon="success"
      title="初始余额导入成功"
      :sub-title="'已更新 ' + result + ' 个末级科目'"
    />

    <div slot="footer" class="dialog-footer">
      <template v-if="result === null">
        <el-button @click="visible = false">取 消</el-button>
        <el-button
          :disabled="!fileList.length"
          :loading="formLoading"
          type="primary"
          @click="submitImport"
        >开始导入</el-button>
      </template>
      <template v-else>
        <el-button @click="resetImport">继续导入</el-button>
        <el-button type="primary" @click="visible = false">完 成</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { FmsInitialBalanceApi } from '@/api/fms/config/initial-balance'

export default {
  name: 'FmsInitialBalanceImportForm',
  data() {
    return {
      visible: false,
      formLoading: false,
      templateLoading: false,
      accountSetId: 0,
      fileList: [],
      result: null
    }
  },
  methods: {
    open(accountSetId) {
      this.accountSetId = Number(accountSetId) || 0
      this.resetImport()
      this.visible = true
    },
    downloadTemplate() {
      if (!this.accountSetId || this.templateLoading) return
      this.templateLoading = true
      FmsInitialBalanceApi.getInitialBalanceImportTemplate(this.accountSetId).then(response => {
        this.$download.excel(response.data, '财务初始余额导入模板.xlsx')
      }).finally(() => {
        this.templateLoading = false
      })
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    submitImport() {
      const rawFile = this.fileList[0] && this.fileList[0].raw
      if (!rawFile) {
        this.$modal.msgWarning('请选择需要导入的文件')
        return
      }
      this.formLoading = true
      FmsInitialBalanceApi.importInitialBalance(this.accountSetId, rawFile).then(response => {
        this.result = Number(response.data) || 0
        this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    },
    resetImport() {
      this.formLoading = false
      this.fileList = []
      this.result = null
      this.$nextTick(() => {
        if (this.$refs.upload) this.$refs.upload.clearFiles()
      })
    },
    handleExceed() {
      this.$modal.msgWarning('每次只能上传一个文件')
    }
  }
}
</script>

<style scoped>
.import-section { padding: 0 28px; }
.import-section + .import-section { margin-top: 28px; }
.section-title { margin-bottom: 12px; color: #303133; font-size: 15px; font-weight: 600; }
.import-tip { margin-top: 6px; color: #909399; font-size: 13px; }
.dialog-footer { text-align: right; }
</style>
