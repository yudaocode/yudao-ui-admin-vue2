<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="920px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="方案名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入方案名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="凭证字" prop="voucherWordId">
            <FmsVoucherWordSelect v-model="formData.voucherWordId" :options="voucherWords" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="来源科目" prop="subjectId">
            <FmsSubjectSelect
              v-model="formData.subjectId"
              :options="subjects"
              class="full-width"
              placeholder="请选择来源科目"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="取数规则" prop="formulaRule">
            <el-select v-model="formData.formulaRule" class="full-width">
              <el-option
                v-for="item in formulaRuleOptions.slice(0, 3)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="时间类型" prop="timeType">
            <el-select v-model="formData.timeType" class="full-width">
              <el-option
                v-for="item in timeTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="期末结转">
        <el-checkbox v-model="formData.periodEnd">用于期末结账前生成凭证</el-checkbox>
      </el-form-item>
    </el-form>

    <div class="rules-header">
      <span>凭证分录规则</span>
      <el-button type="text" icon="el-icon-plus" @click="addSubjectRule()">添加分录</el-button>
    </div>
    <el-table :data="formData.subjects" border max-height="360px">
      <el-table-column label="摘要" min-width="180">
        <template slot-scope="scope">
          <el-input v-model="scope.row.digest" placeholder="请输入摘要" />
        </template>
      </el-table-column>
      <el-table-column label="借/贷" width="105">
        <template slot-scope="scope">
          <el-select v-model="scope.row.direction">
            <el-option label="借" :value="FMS_DEBIT_CREDIT_DIRECTION.DEBIT" />
            <el-option label="贷" :value="FMS_DEBIT_CREDIT_DIRECTION.CREDIT" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="科目" min-width="280">
        <template slot-scope="scope">
          <FmsSubjectSelect v-model="scope.row.subjectId" :options="subjects" class="full-width" />
        </template>
      </el-table-column>
      <el-table-column label="金额比例%" width="130">
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.amountRatio"
            :min="0.01"
            :max="100"
            :controls="false"
            :precision="2"
            class="full-width"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template slot-scope="scope">
          <el-button type="text" class="danger-text" @click="formData.subjects.splice(scope.$index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="form-tip">借方和贷方的金额比例需要分别等于 100%，科目规则随方案保存为 JSON</div>

    <div slot="footer" class="form-footer">
      <el-button v-if="formData.id" type="text" class="danger-text" @click="deleteScheme">删除方案</el-button>
      <span v-else />
      <div>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { FmsClosingSchemeApi } from '@/api/fms/closing/scheme'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import FmsVoucherWordSelect from '@/views/fms/config/voucher-word/components/FmsVoucherWordSelect.vue'
import {
  FMS_CLOSING_TIME_TYPE,
  FMS_CLOSING_TIME_TYPE_OPTIONS,
  FMS_DEBIT_CREDIT_DIRECTION,
  FMS_FORMULA_RULE,
  FMS_FORMULA_RULE_OPTIONS
} from '@/views/fms/utils/constants'

function numberDictOptions(type, fallback) {
  const options = getDictDatas(type).map(item => ({ label: item.label, value: Number(item.value) }))
    .filter(item => Number.isFinite(item.value))
  return options.length ? options : fallback
}

export default {
  name: 'FmsClosingSchemeForm',
  components: { FmsSubjectSelect, FmsVoucherWordSelect },
  props: {
    accountSetId: { type: Number, required: true },
    subjects: { type: Array, required: true },
    voucherWords: { type: Array, required: true }
  },
  data() {
    return {
      FMS_DEBIT_CREDIT_DIRECTION,
      dialogVisible: false,
      submitting: false,
      formulaRuleOptions: numberDictOptions(DICT_TYPE.FMS_FORMULA_RULE, FMS_FORMULA_RULE_OPTIONS),
      timeTypeOptions: numberDictOptions(DICT_TYPE.FMS_CLOSING_TIME_TYPE, FMS_CLOSING_TIME_TYPE_OPTIONS),
      formData: this.createDefaultForm(),
      formRules: {
        name: [{ required: true, message: '方案名称不能为空', trigger: 'blur' }],
        voucherWordId: [{ required: true, message: '凭证字不能为空', trigger: 'change' }],
        subjectId: [{ required: true, message: '来源科目不能为空', trigger: 'change' }],
        formulaRule: [{ required: true, message: '取数规则不能为空', trigger: 'change' }],
        timeType: [{ required: true, message: '时间类型不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.formData.id ? '编辑期末结转方案' : '新增期末结转方案'
    }
  },
  methods: {
    createDefaultForm() {
      return {
        id: undefined,
        accountSetId: this.accountSetId,
        name: '',
        periodEnd: true,
        subjectId: undefined,
        formulaRule: FMS_FORMULA_RULE.BALANCE,
        timeType: FMS_CLOSING_TIME_TYPE.PERIOD_END,
        voucherWordId: undefined,
        subjects: []
      }
    },
    open(scheme, template) {
      this.formData = this.createDefaultForm()
      if (scheme) {
        this.formData = Object.assign(this.createDefaultForm(), scheme, {
          subjects: (scheme.subjects || []).map(item => Object.assign({}, item))
        })
      } else if (template) {
        const defaultWord = this.voucherWords.find(item => item.defaultStatus) || this.voucherWords[0]
        this.formData = Object.assign(this.createDefaultForm(), template, {
          id: undefined,
          accountSetId: this.accountSetId,
          formulaRule: template.formulaRule === undefined ? FMS_FORMULA_RULE.BALANCE : template.formulaRule,
          timeType: template.timeType === undefined ? FMS_CLOSING_TIME_TYPE.PERIOD_END : template.timeType,
          voucherWordId: defaultWord && defaultWord.id,
          subjects: (template.subjects || []).map(item => Object.assign({}, item))
        })
      } else {
        const defaultWord = this.voucherWords.find(item => item.defaultStatus) || this.voucherWords[0]
        this.formData.voucherWordId = defaultWord && defaultWord.id
        this.addSubjectRule(FMS_DEBIT_CREDIT_DIRECTION.DEBIT)
        this.addSubjectRule(FMS_DEBIT_CREDIT_DIRECTION.CREDIT)
      }
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    addSubjectRule(direction) {
      this.formData.subjects.push({
        subjectId: undefined,
        digest: this.formData.name || '期末结转',
        direction: direction === undefined ? FMS_DEBIT_CREDIT_DIRECTION.DEBIT : direction,
        amountRatio: 100
      })
    },
    validateSubjectRules() {
      if (this.formData.subjects.length < 2 || this.formData.subjects.some(item => !item.digest || !item.subjectId)) {
        this.$modal.msgWarning('请完整填写至少两条凭证分录规则')
        return false
      }
      const ratio = direction => this.formData.subjects
        .filter(item => item.direction === direction)
        .reduce((sum, item) => sum + Number(item.amountRatio), 0)
      if (Math.abs(ratio(FMS_DEBIT_CREDIT_DIRECTION.DEBIT) - 100) > 0.001 ||
          Math.abs(ratio(FMS_DEBIT_CREDIT_DIRECTION.CREDIT) - 100) > 0.001) {
        this.$modal.msgWarning('借方和贷方的金额比例需要分别等于 100%')
        return false
      }
      return true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateSubjectRules()) return
        this.submitting = true
        const operation = this.formData.id
          ? FmsClosingSchemeApi.updateClosingScheme(this.formData)
          : FmsClosingSchemeApi.createClosingScheme(this.formData)
        operation.then(() => {
          this.$modal.msgSuccess(this.formData.id ? '修改成功' : '创建成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.submitting = false })
      })
    },
    deleteScheme() {
      if (!this.formData.id) return
      this.$modal.confirm('确认删除该结账方案吗？').then(() => {
        return FmsClosingSchemeApi.deleteClosingScheme(this.accountSetId, this.formData.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.dialogVisible = false
        this.$emit('success')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-weight: 600; }
.form-tip { margin-top: 10px; color: #909399; font-size: 13px; }
.form-footer { display: flex; align-items: center; justify-content: space-between; }
.danger-text { color: #f56c6c; }
</style>
