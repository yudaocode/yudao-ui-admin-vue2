<template>
  <el-dialog title="导入辅助核算项目" :visible.sync="dialogVisible" append-to-body width="680px">
    <template v-if="!importResult">
      <div class="import-section">
        <div class="section-title">一、请按照数据模板的格式准备要导入的辅助核算项目</div>
        <el-button type="text" :loading="templateLoading" @click="downloadTemplate">
          <i class="el-icon-download" /> 下载《{{ auxiliaryType && auxiliaryType.name }}导入模板》
        </el-button>
        <div class="import-tip">{{ templateTip }}</div>
      </div>
      <div class="import-section">
        <div class="section-title">二、请选择需要导入的文件</div>
        <el-upload
          ref="upload"
          action="#"
          drag
          :auto-upload="false"
          :file-list="fileList"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleChange"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
        >
          <i class="el-icon-upload upload-icon" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
          <div slot="tip" class="el-upload__tip">仅支持 xls、xlsx 格式，文件不能超过 2MB</div>
        </el-upload>
      </div>
    </template>

    <template v-else>
      <el-result
        :icon="failureCount ? 'warning' : 'success'"
        :sub-title="resultSummary"
        :title="failureCount ? '导入完成，部分数据未导入' : '辅助核算项目导入成功'"
      />
      <el-table v-if="failureCount" :data="failureRows" border max-height="260px">
        <el-table-column label="导入行" min-width="220" prop="label" show-overflow-tooltip />
        <el-table-column label="失败原因" min-width="260" prop="reason" show-overflow-tooltip />
      </el-table>
    </template>

    <div slot="footer" class="dialog-footer">
      <template v-if="!importResult">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          :disabled="!fileList.length"
          :loading="formLoading"
          type="primary"
          @click="submitImport"
        >开始导入</el-button>
      </template>
      <template v-else>
        <el-button @click="resetImport">继续导入</el-button>
        <el-button type="primary" @click="dialogVisible = false">完 成</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { FMS_AUXILIARY_TYPE } from '@/views/fms/utils/constants'

export default {
  name: 'FmsAuxiliaryItemImportForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      templateLoading: false,
      accountSetId: 0,
      auxiliaryType: null,
      fileList: [],
      importResult: null
    }
  },
  computed: {
    failureRows() {
      const reasons = (this.importResult && this.importResult.failureReasons) || {}
      return Object.keys(reasons).map(label => ({ label, reason: reasons[label] }))
    },
    failureCount() {
      return this.failureRows.length
    },
    resultSummary() {
      if (!this.importResult) return ''
      const successCount = (this.importResult.successItemCodes || []).length
      return '共 ' + (this.importResult.totalCount || 0) + ' 个项目，成功 ' + successCount +
        ' 个，失败 ' + this.failureCount + ' 个'
    },
    templateTip() {
      const type = Number(this.auxiliaryType && this.auxiliaryType.type)
      if (type === FMS_AUXILIARY_TYPE.CUSTOMER || type === FMS_AUXILIARY_TYPE.SUPPLIER) {
        return '编码、名称为必填项，备注可选；已有编码不会被覆盖'
      }
      if (type === FMS_AUXILIARY_TYPE.INVENTORY) {
        return '编码、名称为必填项，规格、单位可选；已有编码不会被覆盖'
      }
      return '编码、名称为必填项；已有编码不会被覆盖'
    }
  },
  methods: {
    open(accountSetId, auxiliaryType) {
      this.accountSetId = Number(accountSetId) || 0
      this.auxiliaryType = auxiliaryType || null
      if (!this.accountSetId || !this.auxiliaryType) return
      this.dialogVisible = true
      this.resetImport()
    },
    downloadTemplate() {
      if (!this.auxiliaryType || this.templateLoading) return
      this.templateLoading = true
      FmsAuxiliaryItemApi.getAuxiliaryItemImportTemplate(this.auxiliaryType.type).then(response => {
        this.$download.excel(response.data, this.auxiliaryType.name + '导入模板.xlsx')
      }).finally(() => {
        this.templateLoading = false
      })
    },
    submitImport() {
      const rawFile = this.fileList[0] && this.fileList[0].raw
      if (!rawFile || !this.auxiliaryType) {
        this.$modal.msgError('请选择需要导入的文件')
        return
      }
      if (rawFile.size > 2 * 1024 * 1024) {
        this.$modal.msgError('导入文件不能超过 2MB')
        return
      }
      this.formLoading = true
      FmsAuxiliaryItemApi.importAuxiliaryItem(this.accountSetId, this.auxiliaryType.id, rawFile).then(response => {
        this.importResult = response.data
        if ((this.importResult.successItemCodes || []).length) this.$emit('success')
      }).finally(() => {
        this.formLoading = false
      })
    },
    resetImport() {
      this.fileList = []
      this.importResult = null
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    },
    handleChange(file, fileList) {
      this.fileList = fileList.slice(-1)
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handleExceed(files) {
      const file = files && files[0]
      if (!file) return
      if (this.$refs.upload) this.$refs.upload.clearFiles()
      this.fileList = [{ name: file.name, raw: file, size: file.size }]
    }
  }
}
</script>

<style scoped>
.import-section { padding: 0 28px; }
.import-section + .import-section { margin-top: 28px; }
.section-title { margin-bottom: 12px; color: #303133; font-size: 15px; font-weight: 600; }
.import-tip { margin-top: 6px; color: #909399; font-size: 13px; }
.upload-icon { color: #c0c4cc; font-size: 56px; }
</style>
