<template>
  <el-dialog :visible.sync="dialogVisible" append-to-body title="导入凭证" width="750px" @closed="resetImport">
    <el-steps :active="step" align-center finish-status="success" class="steps">
      <el-step title="上传文件" />
      <el-step title="导入数据" />
      <el-step title="导入完成" />
    </el-steps>

    <div v-if="step === 0" class="import-content">
      <section>
        <h4>一、请按照数据模板的格式准备要导入的数据</h4>
        <el-button type="text" :loading="templateLoading" @click="downloadTemplate">
          <i class="el-icon-download" /> 下载《凭证导入模板》
        </el-button>
        <div class="tip">导入文件请勿超过 2MB</div>
      </section>
      <section>
        <h4>二、请选择需要导入的文件</h4>
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
      </section>
    </div>

    <div v-else-if="step === 1" class="importing">
      <i class="el-icon-loading loading-icon" />
      <h3>凭证正在导入，请稍候</h3>
      <div class="tip">系统会按同一日期、凭证字和凭证号合并分录</div>
    </div>

    <el-result
      v-else
      :icon="result && result.failureVoucherCount ? 'warning' : 'success'"
      :title="result && result.failureVoucherCount ? '凭证导入完成，部分数据未导入' : '凭证导入成功'"
      :sub-title="importResultSummary"
    >
      <template slot="extra">
        <el-button v-if="result && result.errorFileUrl" type="primary" plain @click="downloadErrorFile">
          <i class="el-icon-download" /> 下载错误数据
        </el-button>
      </template>
    </el-result>

    <div slot="footer">
      <template v-if="step === 0">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="!fileList.length" @click="submitImport">开始导入</el-button>
      </template>
      <template v-else-if="step === 2">
        <el-button @click="resetImport">继续导入</el-button>
        <el-button type="primary" @click="dialogVisible = false">完 成</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { FmsVoucherApi } from '@/api/fms/voucher'

export default {
  name: 'FmsVoucherImportForm',
  data() {
    return {
      dialogVisible: false,
      step: 0,
      accountSetId: 0,
      templateLoading: false,
      fileList: [],
      result: null
    }
  },
  computed: {
    importResultSummary() {
      const value = this.result || {}
      return '共 ' + Number(value.totalVoucherCount || 0) + ' 张凭证、' + Number(value.totalRowCount || 0) +
        ' 条分录，成功 ' + Number(value.successVoucherCount || 0) + ' 张、' + Number(value.successRowCount || 0) +
        ' 条，失败 ' + Number(value.failureVoucherCount || 0) + ' 张、' + Number(value.failureRowCount || 0) + ' 条'
    }
  },
  methods: {
    open(accountSetId) {
      this.accountSetId = Number(accountSetId) || 0
      this.resetImport()
      this.dialogVisible = true
    },
    downloadTemplate() {
      if (!this.accountSetId || this.templateLoading) return
      this.templateLoading = true
      FmsVoucherApi.getVoucherImportTemplate(this.accountSetId).then(response => {
        this.$download.excel(response.data, '凭证导入模板.xlsx')
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
      if (rawFile.size > 2 * 1024 * 1024) {
        this.$modal.msgError('导入文件不能超过 2MB')
        return
      }
      this.step = 1
      FmsVoucherApi.importVoucher(this.accountSetId, rawFile).then(response => {
        this.result = response.data
        this.step = 2
        if (Number(this.result.successVoucherCount) > 0) this.$emit('success')
      }).catch(() => {
        this.step = 0
      })
    },
    downloadErrorFile() {
      if (!this.result || !this.result.errorFileUrl) return
      const link = document.createElement('a')
      link.href = this.result.errorFileUrl
      link.download = '凭证导入错误数据.xlsx'
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    resetImport() {
      this.step = 0
      this.fileList = []
      this.result = null
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    },
    handleExceed() {
      this.$modal.msgWarning('每次只能上传一个文件')
    }
  }
}
</script>

<style scoped>
.steps { margin-bottom: 28px; }
.import-content { min-height: 340px; padding: 0 36px; }
.import-content section + section { margin-top: 28px; }
.import-content h4 { margin: 0 0 12px; font-size: 15px; }
.tip { margin-top: 8px; color: #909399; font-size: 13px; }
.importing { display: flex; min-height: 330px; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.loading-icon { color: #409eff; font-size: 58px; }
</style>
