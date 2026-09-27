<template>
  <el-dialog title="科目导入" :visible.sync="visible" width="620px" append-to-body>
    <template v-if="!result">
      <el-upload
        ref="upload"
        action="#"
        drag
        :auto-upload="false"
        :limit="1"
        :file-list="fileList"
        accept=".xls,.xlsx"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :on-exceed="handleExceed"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">仅允许导入 xls、xlsx 格式，且文件不超过 2 MB。</div>
      </el-upload>
      <div class="import-tip">一级科目的上级科目编码填写 0，多项辅助核算使用“/”分隔。</div>
      <el-link type="primary" :underline="false" :disabled="loading" @click="downloadTemplate">下载导入模板</el-link>
    </template>
    <template v-else>
      <el-result :icon="failureRows.length ? 'warning' : 'success'" :title="failureRows.length ? '科目导入完成，部分失败' : '科目导入成功'" :sub-title="resultSummary" />
      <el-table v-if="failureRows.length" :data="failureRows" border max-height="260px">
        <el-table-column label="导入行" prop="label" min-width="200" show-overflow-tooltip />
        <el-table-column label="失败原因" prop="reason" min-width="260" show-overflow-tooltip />
      </el-table>
    </template>
    <div slot="footer" class="dialog-footer">
      <template v-if="!result">
        <el-button type="primary" :loading="loading" @click="submit">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </template>
      <template v-else>
        <el-button @click="reset">继续导入</el-button>
        <el-button type="primary" @click="visible = false">完 成</el-button>
      </template>
    </div>
  </el-dialog>
</template>

<script>
import * as SubjectApi from '@/api/fms/config/subject'

export default {
  name: 'FmsSubjectImportForm',
  data() {
    return { visible: false, loading: false, templateLoading: false, accountSetId: 0, fileList: [], result: null }
  },
  computed: {
    failureRows() {
      const reasons = this.result && this.result.failureReasons
      return Object.keys(reasons || {}).map(label => ({ label, reason: reasons[label] }))
    },
    resultSummary() {
      if (!this.result) return ''
      return '共 ' + (this.result.totalCount || 0) + ' 个科目，成功 ' + ((this.result.successSubjectCodes || []).length) + ' 个，失败 ' + this.failureRows.length + ' 个'
    }
  },
  methods: {
    open(accountSetId) {
      this.accountSetId = Number(accountSetId) || 0
      this.visible = true
      this.reset()
    },
    handleChange(file, fileList) { this.fileList = fileList.slice(-1) },
    handleRemove(file, fileList) { this.fileList = fileList },
    handleExceed() { this.$modal.msgError('最多只能上传一个文件！') },
    submit() {
      const file = this.fileList[0] && this.fileList[0].raw
      if (!file) {
        this.$modal.msgError('请上传文件')
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        this.$modal.msgError('导入文件不能超过 2 MB')
        return
      }
      this.loading = true
      SubjectApi.importSubject(this.accountSetId, file).then(response => {
        this.result = response.data
        if ((this.result.successSubjectCodes || []).length) this.$emit('success')
      }).finally(() => { this.loading = false })
    },
    downloadTemplate() {
      if (this.templateLoading) return
      this.templateLoading = true
      SubjectApi.getSubjectImportTemplate().then(response => {
        this.$download.excel(response.data, '科目导入模板.xls')
      }).finally(() => { this.templateLoading = false })
    },
    reset() {
      this.loading = false
      this.fileList = []
      this.result = null
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    }
  }
}
</script>

<style scoped>
.import-tip { color: #909399; font-size: 12px; margin: 10px 0; }
.dialog-footer { text-align: right; }
</style>
