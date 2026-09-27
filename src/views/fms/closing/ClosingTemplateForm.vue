<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="920px" append-to-body>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="100px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="formData.name" maxlength="255" placeholder="请输入模板名称" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="模板分类" prop="category">
            <el-select v-model="formData.category" class="full-width">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="显示顺序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" :controls="false" class="full-width" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="10">
          <el-form-item label="来源科目">
            <FmsSubjectSelect
              v-model="formData.subjectId"
              :options="subjects"
              clearable
              class="full-width"
              placeholder="可在使用模板时补充"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="取数规则">
            <el-select v-model="formData.formulaRule" clearable class="full-width">
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
          <el-form-item label="时间类型">
            <el-select v-model="formData.timeType" clearable class="full-width">
              <el-option v-for="item in timeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <template slot-scope="scope"><el-input v-model="scope.row.digest" placeholder="请输入摘要" /></template>
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
        <template slot-scope="scope"><FmsSubjectSelect v-model="scope.row.subjectId" :options="subjects" class="full-width" /></template>
      </el-table-column>
      <el-table-column label="金额比例%" width="130">
        <template slot-scope="scope">
          <el-input-number v-model="scope.row.amountRatio" :min="0.01" :max="100" :controls="false" :precision="2" class="full-width" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template slot-scope="scope">
          <el-button type="text" class="danger-text" @click="formData.subjects.splice(scope.$index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer">
      <el-button type="primary" :loading="submitting" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsClosingTemplateApi } from '@/api/fms/closing/template'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import FmsSubjectSelect from '@/views/fms/config/subject/components/FmsSubjectSelect.vue'
import {
  FMS_CLOSING_TEMPLATE_CATEGORY,
  FMS_CLOSING_TEMPLATE_CATEGORY_OPTIONS,
  FMS_CLOSING_TIME_TYPE_OPTIONS,
  FMS_DEBIT_CREDIT_DIRECTION,
  FMS_FORMULA_RULE_OPTIONS
} from '@/views/fms/utils/constants'

function numberDictOptions(type, fallback) {
  const options = getDictDatas(type).map(item => ({ label: item.label, value: Number(item.value) }))
    .filter(item => Number.isFinite(item.value))
  return options.length ? options : fallback
}

export default {
  name: 'FmsClosingTemplateForm',
  components: { FmsSubjectSelect },
  props: {
    accountSetId: { type: Number, required: true },
    subjects: { type: Array, required: true }
  },
  data() {
    return {
      FMS_DEBIT_CREDIT_DIRECTION,
      dialogVisible: false,
      dialogTitle: '',
      submitting: false,
      formType: '',
      categoryOptions: numberDictOptions(DICT_TYPE.FMS_CLOSING_TEMPLATE_CATEGORY, FMS_CLOSING_TEMPLATE_CATEGORY_OPTIONS),
      formulaRuleOptions: numberDictOptions(DICT_TYPE.FMS_FORMULA_RULE, FMS_FORMULA_RULE_OPTIONS),
      timeTypeOptions: numberDictOptions(DICT_TYPE.FMS_CLOSING_TIME_TYPE, FMS_CLOSING_TIME_TYPE_OPTIONS),
      formData: this.createDefaultForm(),
      formRules: {
        name: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '模板分类不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        id: undefined,
        accountSetId: this.accountSetId,
        presetCode: undefined,
        name: '',
        category: FMS_CLOSING_TEMPLATE_CATEGORY.DAILY_EXPENSE,
        periodEnd: true,
        subjectId: undefined,
        formulaRule: undefined,
        timeType: undefined,
        subjects: [],
        sort: 0,
        createTime: undefined
      }
    },
    open(type, template, category) {
      this.dialogTitle = type === 'create' ? '新增结账模板' : '编辑结账模板'
      this.formType = type
      const defaultCategory = category === undefined ? FMS_CLOSING_TEMPLATE_CATEGORY.DAILY_EXPENSE : category
      this.formData = Object.assign(this.createDefaultForm(), template || { category: defaultCategory }, {
        accountSetId: this.accountSetId,
        subjects: template && Array.isArray(template.subjects)
          ? template.subjects.map(item => Object.assign({}, item))
          : []
      })
      if (!template) {
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
      const total = direction => this.formData.subjects.filter(item => item.direction === direction)
        .reduce((sum, item) => sum + Number(item.amountRatio), 0)
      if (Math.abs(total(FMS_DEBIT_CREDIT_DIRECTION.DEBIT) - 100) > 0.001 ||
          Math.abs(total(FMS_DEBIT_CREDIT_DIRECTION.CREDIT) - 100) > 0.001) {
        this.$modal.msgWarning('借方和贷方的金额比例需要分别等于 100%')
        return false
      }
      return true
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid || !this.validateSubjectRules()) return
        this.submitting = true
        const operation = this.formType === 'update'
          ? FmsClosingTemplateApi.updateClosingTemplate(this.formData)
          : FmsClosingTemplateApi.createClosingTemplate(this.formData)
        operation.then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.submitting = false })
      })
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
.rules-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; font-weight: 600; }
.danger-text { color: #f56c6c; }
</style>
