<template>
  <el-dialog
    title="客户导入"
    :visible.sync="dialogVisible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <div class="owner-row">
      <span class="owner-label">负责人</span>
      <el-select
        v-model="ownerUserId"
        clearable
        filterable
        style="width: 240px"
      >
        <el-option
          v-for="item in userOptions"
          :key="item.id"
          :label="item.nickname"
          :value="item.id"
        />
      </el-select>
    </div>
    <el-upload
      ref="upload"
      :file-list="fileList"
      :auto-upload="false"
      :disabled="formLoading"
      :limit="1"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :on-exceed="handleExceed"
      accept=".xlsx,.xls"
      action="#"
      drag
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div
        slot="tip"
        class="el-upload__tip import-tip"
      >
        <div>
          <el-checkbox v-model="updateSupport" />
          是否更新已经存在的客户数据（“客户名称”重复）
        </div>
        <span>仅允许导入 xls、xlsx 格式文件。</span>
        <el-link
          :underline="false"
          class="template-link"
          type="primary"
          @click="importTemplate"
        >下载模板</el-link>
      </div>
    </el-upload>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button
        :disabled="formLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { handleImport, importCustomerTemplate } from '@/api/crm/customer'
import { getSimpleUserList } from '@/api/system/user'

export default {
  name: 'CrmCustomerImportForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      fileList: [],
      updateSupport: false,
      ownerUserId: undefined,
      userOptions: [],
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async open() {
      const requestId = ++this.requestSequence
      this.resetForm(false)
      this.dialogVisible = true
      this.formLoading = true
      try {
        const data = (await getSimpleUserList()).data
        if (requestId !== this.requestSequence) return
        this.userOptions = data
        this.ownerUserId = this.$store.getters.userId
      } finally {
        if (requestId === this.requestSequence) this.formLoading = false
      }
    },
    handleFileChange(file, files) {
      this.fileList = (files || []).slice(-1)
    },
    handleFileRemove() {
      this.fileList = []
    },
    async submitForm() {
      if (this.fileList.length === 0 || !this.fileList[0].raw) {
        this.$modal.msgError('请上传文件')
        return
      }
      this.formLoading = true
      try {
        const formData = new FormData()
        formData.append('updateSupport', String(this.updateSupport))
        formData.append('file', this.fileList[0].raw)
        formData.append('ownerUserId', String(this.ownerUserId))
        const response = await handleImport(formData)
        this.submitFormSuccess(response)
      } catch (error) {
        this.submitFormError()
      } finally {
        this.formLoading = false
      }
    },
    submitFormSuccess(response) {
      if (!response || response.code !== 0) {
        this.$modal.msgError((response && response.msg) || '上传失败，请您重新上传！')
        return
      }
      const data = response.data
      const created = data.createCustomerNames || []
      const updated = data.updateCustomerNames || []
      const failed = data.failureCustomerNames || {}
      const lines = [
        '上传成功数量：' + created.length + (created.length ? '；' + created.join('、') : ''),
        '更新成功数量：' + updated.length + (updated.length ? '；' + updated.join('、') : ''),
        '更新失败数量：' + Object.keys(failed).length + (Object.keys(failed).length
          ? '；' + Object.keys(failed).map(name => name + '：' + failed[name]).join('、')
          : '')
      ]
      this.$alert(lines.join('\n'), '客户导入结果', { confirmButtonText: '确定' })
      this.dialogVisible = false
      this.$emit('success')
    },
    submitFormError() {
      this.$modal.msgError('上传失败，请您重新上传！')
      this.resetForm(false)
    },
    resetForm(invalidateRequest = true) {
      if (invalidateRequest) this.requestSequence += 1
      this.fileList = []
      this.updateSupport = false
      this.ownerUserId = undefined
      this.userOptions = []
      this.$nextTick(() => this.$refs.upload && this.$refs.upload.clearFiles())
    },
    handleExceed() {
      this.$modal.msgError('最多只能上传一个文件！')
    },
    async importTemplate() {
      const response = await importCustomerTemplate()
      this.$download.excel(response.data, '客户导入模版.xls')
    }
  }
}
</script>

<style scoped>
.owner-row {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
.owner-label { margin-right: 10px; }
.import-tip { text-align: center; }
.template-link { margin-left: 6px; font-size: 12px; vertical-align: baseline; }
</style>
