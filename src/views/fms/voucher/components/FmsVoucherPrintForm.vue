<template>
  <div>
    <el-dialog :visible.sync="dialogVisible" append-to-body title="凭证打印" width="500px">
      <el-form ref="form" :model="formData" :rules="formRules" label-position="top">
        <el-form-item label="打印类型" prop="paperType">
          <el-radio-group v-model="formData.paperType">
            <el-radio label="A4">A4</el-radio>
            <el-radio label="B5">B5</el-radio>
            <el-radio label="CUSTOM">自定义纸张</el-radio>
          </el-radio-group>
          <div v-if="formData.paperType === 'CUSTOM'" class="inline-fields">
            <span>宽度</span>
            <el-input-number v-model="formData.width" :controls="false" :min="1" />
            <span>毫米</span>
            <span>长度</span>
            <el-input-number v-model="formData.height" :controls="false" :min="1" />
            <span>毫米</span>
          </div>
        </el-form-item>
        <el-form-item label="图像方向">
          <el-radio-group v-model="formData.orientation">
            <el-radio label="portrait">纵向</el-radio>
            <el-radio label="landscape">横向</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="边框调整">
          <div class="inline-fields">
            <span>左</span>
            <el-input-number v-model="formData.marginLeft" :controls="false" :min="0" />
            <span>毫米</span>
            <span>上</span>
            <el-input-number v-model="formData.marginTop" :controls="false" :min="0" />
            <span>毫米</span>
          </div>
        </el-form-item>
        <el-form-item label="字体大小">
          <div class="inline-fields">
            <el-input-number v-model="formData.fontSize" :controls="false" :min="12" :max="24" />
            <span>像素</span>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="submitForm">保存并打印</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
    <iframe ref="printIframe" class="print-iframe" title="凭证打印" />
  </div>
</template>

<script>
import { buildVoucherPrintHtml, DEFAULT_VOUCHER_PRINT_SETTING } from './print'

export default {
  name: 'FmsVoucherPrintForm',
  data() {
    const validatePaper = (rule, value, callback) => {
      if (this.formData.paperType !== 'CUSTOM' || (this.formData.width && this.formData.height)) callback()
      else callback(new Error('请输入自定义纸张的宽度和长度'))
    }
    return {
      dialogVisible: false,
      accountSetId: 0,
      companyName: '',
      vouchers: [],
      formData: Object.assign({}, DEFAULT_VOUCHER_PRINT_SETTING),
      formRules: {
        paperType: [
          { required: true, message: '请选择打印类型', trigger: 'change' },
          { validator: validatePaper, trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    open(accountSetId, companyName, vouchers) {
      this.accountSetId = Number(accountSetId) || 0
      this.companyName = companyName || ''
      this.vouchers = Array.isArray(vouchers) ? vouchers : []
      let cached = {}
      try {
        cached = JSON.parse(localStorage.getItem(this.getStorageKey(this.accountSetId)) || '{}')
      } catch (error) {
        cached = {}
      }
      this.formData = Object.assign({}, DEFAULT_VOUCHER_PRINT_SETTING, cached)
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        try {
          localStorage.setItem(this.getStorageKey(this.accountSetId), JSON.stringify(this.formData))
        } catch (error) {
          this.$modal.msgWarning('打印设置未能保存，本次仍可继续打印')
        }
        this.printHtml(buildVoucherPrintHtml(this.companyName, this.vouchers, this.formData))
        this.dialogVisible = false
      })
    },
    printHtml(html) {
      const frame = this.$refs.printIframe
      const printDocument = frame && frame.contentDocument
      const printWindow = frame && frame.contentWindow
      if (!printDocument || !printWindow) return
      printDocument.open()
      printDocument.write(html)
      printDocument.close()
      const ready = printDocument.fonts && printDocument.fonts.ready
      Promise.resolve(ready).then(() => {
        printWindow.focus()
        printWindow.print()
      })
    },
    previewHtml(html) {
      const previewWindow = window.open('', '_blank')
      if (!previewWindow) {
        this.$modal.msgWarning('浏览器阻止了新窗口，请允许弹出窗口后重试')
        return
      }
      previewWindow.document.open()
      previewWindow.document.write(html)
      previewWindow.document.close()
      previewWindow.focus()
    },
    getStorageKey(accountSetId) {
      return 'fmsVoucherPrintSetting:' + accountSetId
    }
  }
}
</script>

<style scoped>
.inline-fields { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.inline-fields .el-input-number { width: 78px; }
.print-iframe { position: fixed; top: 0; left: -9999px; width: 1px; height: 1px; border: 0; opacity: 0; pointer-events: none; }
</style>
