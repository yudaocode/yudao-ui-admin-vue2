<template>
  <el-dialog title="结转损益参数设置" :visible.sync="dialogVisible" width="680px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="230px">
      <el-form-item label="凭证日期" prop="closingDay">
        <el-date-picker
          v-model="voucherDate"
          type="date"
          value-format="yyyy-MM-dd"
          format="yyyy年MM月dd日"
          :clearable="false"
          :picker-options="datePickerOptions"
        />
      </el-form-item>
      <el-form-item label="凭证字" prop="voucherWordId">
        <FmsVoucherWordSelect v-model="formData.voucherWordId" :options="voucherWords" class="field-width" />
      </el-form-item>
      <el-form-item label="凭证摘要" prop="digest">
        <el-input v-model="formData.digest" class="digest-width" placeholder="请输入凭证摘要" />
      </el-form-item>
      <el-form-item label="凭证分类" prop="voucherType">
        <el-radio-group v-model="formData.voucherType" class="voucher-types">
          <el-radio v-for="item in voucherTypeOptions" :key="item.value" :label="item.value">
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="“以前年度损益调整”科目" prop="priorYearAdjustmentSubjectId">
        <FmsSubjectSelect
          v-model="formData.priorYearAdjustmentSubjectId"
          :options="profitLossSubjects"
          class="digest-width"
          placeholder="请选择科目"
        />
      </el-form-item>
      <el-form-item label="“以前年度损益调整”结转科目" prop="adjustmentClosingSubjectId">
        <FmsSubjectSelect
          v-model="formData.adjustmentClosingSubjectId"
          :options="closingSubjects"
          class="digest-width"
          placeholder="请选择科目"
        />
      </el-form-item>
      <el-form-item label="其他损益科目的结转科目" prop="otherClosingSubjectId">
        <FmsSubjectSelect
          v-model="formData.otherClosingSubjectId"
          :options="closingSubjects"
          class="digest-width"
          placeholder="请选择科目"
        />
      </el-form-item>
      <el-form-item label-width="0">
        <el-checkbox v-model="formData.reverseBalance">
          结转方式：按余额反向结转
          <el-tooltip placement="top">
            <div slot="content">选中时按科目实际余额的相反方向结转<br />未选中时按科目属性中定义的余额方向反向结转</div>
            <i class="el-icon-question" />
          </el-tooltip>
        </el-checkbox>
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { FmsClosingSchemeApi } from '@/api/fms/closing/scheme'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import {
  FMS_CLOSING_VOUCHER_TYPE,
  FMS_CLOSING_VOUCHER_TYPE_OPTIONS,
  FMS_SUBJECT_TYPE
} from '@/views/fms/utils/constants'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

function numberDictOptions(type, fallback) {
  const options = getDictDatas(type).map(item => ({ label: item.label, value: Number(item.value) }))
    .filter(item => Number.isFinite(item.value))
  return options.length ? options : fallback
}

export default {
  name: 'FmsProfitLossSettingsForm',
  components: { FmsSubjectSelect, FmsVoucherWordSelect },
  props: {
    accountSetId: { type: Number, required: true },
    month: { type: String, required: true },
    subjects: { type: Array, required: true },
    voucherWords: { type: Array, required: true }
  },
  data() {
    return {
      dialogVisible: false,
      submitting: false,
      voucherDate: '',
      voucherTypeOptions: numberDictOptions(DICT_TYPE.FMS_CLOSING_VOUCHER_TYPE, FMS_CLOSING_VOUCHER_TYPE_OPTIONS),
      formData: this.createDefaultForm(),
      formRules: {
        voucherWordId: [{ required: true, message: '凭证字不能为空', trigger: 'change' }],
        digest: [{ required: true, message: '凭证摘要不能为空', trigger: 'blur' }],
        voucherType: [{ required: true, message: '凭证分类不能为空', trigger: 'change' }],
        priorYearAdjustmentSubjectId: [{ required: true, message: '以前年度损益调整科目不能为空', trigger: 'change' }],
        adjustmentClosingSubjectId: [{ required: true, message: '以前年度损益调整结转科目不能为空', trigger: 'change' }],
        otherClosingSubjectId: [{ required: true, message: '其他损益结转科目不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    profitLossSubjects() {
      return this.subjects.filter(item => Number(item.type) === FMS_SUBJECT_TYPE.PROFIT_LOSS)
    },
    closingSubjects() {
      return this.subjects.filter(item => Number(item.type) !== FMS_SUBJECT_TYPE.PROFIT_LOSS)
    },
    datePickerOptions() {
      return { disabledDate: this.disabledDate }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        accountSetId: this.accountSetId,
        voucherWordId: undefined,
        digest: '结转损益',
        voucherType: FMS_CLOSING_VOUCHER_TYPE.COMBINED_GAIN_AND_LOSS,
        priorYearAdjustmentSubjectId: undefined,
        adjustmentClosingSubjectId: undefined,
        otherClosingSubjectId: undefined,
        reverseBalance: true,
        closingDay: 31
      }
    },
    findSubjectId(code) {
      const subject = this.subjects.find(item => item.code === code)
      return subject && subject.id
    },
    open(settings) {
      this.formData = this.createDefaultForm()
      const defaultWord = this.voucherWords.find(item => item.defaultStatus) || this.voucherWords[0]
      this.formData.voucherWordId = defaultWord && defaultWord.id
      this.formData.priorYearAdjustmentSubjectId = this.findSubjectId('6000')
      this.formData.adjustmentClosingSubjectId = this.findSubjectId('310415')
      this.formData.otherClosingSubjectId = this.findSubjectId('3103')
      if (settings) {
        const legacySettings = !settings.priorYearAdjustmentSubjectId
        this.formData = Object.assign(this.formData, {
          voucherWordId: settings.voucherWordId || this.formData.voucherWordId,
          digest: settings.digest || this.formData.digest,
          voucherType: settings.voucherType === undefined ? this.formData.voucherType : settings.voucherType,
          priorYearAdjustmentSubjectId: settings.priorYearAdjustmentSubjectId || this.formData.priorYearAdjustmentSubjectId,
          adjustmentClosingSubjectId: settings.adjustmentClosingSubjectId || this.formData.adjustmentClosingSubjectId,
          otherClosingSubjectId: settings.otherClosingSubjectId || this.formData.otherClosingSubjectId,
          reverseBalance: legacySettings
            ? this.formData.reverseBalance
            : (settings.reverseBalance === undefined ? this.formData.reverseBalance : settings.reverseBalance),
          closingDay: settings.closingDay || this.formData.closingDay
        })
      }
      const parts = this.month.split('-').map(Number)
      const maxDay = new Date(parts[0], parts[1], 0).getDate()
      const closingDay = Math.min(this.formData.closingDay || 31, maxDay)
      this.voucherDate = this.month + '-' + pad(closingDay)
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.voucherDate) {
          this.$modal.msgWarning('凭证日期不能为空')
          return
        }
        this.formData.closingDay = Number(this.voucherDate.slice(-2))
        this.submitting = true
        FmsClosingSchemeApi.saveProfitLossSettings(this.formData).then(() => {
          this.$modal.msgSuccess('保存成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.submitting = false })
      })
    },
    disabledDate(date) {
      return formatDate(date).slice(0, 7) !== this.month
    }
  }
}
</script>

<style scoped>
.field-width { width: 260px; }
.digest-width { width: 360px; }
.voucher-types { display: flex; flex-direction: column; align-items: flex-start; }
.voucher-types .el-radio { margin: 0 0 10px; white-space: normal; line-height: 22px; }
</style>
