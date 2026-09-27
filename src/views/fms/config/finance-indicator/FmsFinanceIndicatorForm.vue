<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="620px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item label="指标名称" prop="name">
        <el-input v-model="formData.name" maxlength="100" placeholder="请输入指标名称" />
      </el-form-item>
      <el-form-item label="指标编码" prop="code">
        <el-input
          v-model="formData.code"
          :disabled="formType === 'update'"
          maxlength="64"
          placeholder="请输入指标编码"
        />
      </el-form-item>
      <el-form-item label="取数报表" prop="type">
        <el-select v-model="formData.type" placeholder="请选择取数报表" style="width: 100%">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.FMS_FINANCE_INDICATOR_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="formula">
        <span slot="label" class="formula-label">
          指标公式
          <el-tooltip content="支持报表行次公式（L1+L2-L3）或报表科目公式 JSON" placement="top">
            <i class="el-icon-question formula-help" />
          </el-tooltip>
        </span>
        <el-input
          v-model="formData.formula"
          :rows="4"
          maxlength="2000"
          placeholder="例如：L1+L2-L3，或科目公式 JSON"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { FmsFinanceIndicatorApi } from '@/api/fms/config/finance-indicator'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { FMS_FINANCE_INDICATOR_TYPE } from '@/views/fms/utils/constants'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'FmsFinanceIndicatorForm',
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '指标名称不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '指标编码不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '请选择取数报表', trigger: 'change' }],
        formula: [{ required: true, message: '指标公式不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      },
      requestSequence: 0
    }
  },
  methods: {
    defaultForm(accountSetId) {
      return {
        id: undefined,
        accountSetId: Number(accountSetId) || 0,
        name: '',
        code: '',
        type: FMS_FINANCE_INDICATOR_TYPE.INCOME_STATEMENT,
        formula: 'L1',
        sort: 10,
        status: CommonStatusEnum.ENABLE
      }
    },
    getIntDictOptions(type) {
      return (getDictDatas(type) || []).map(item => Object.assign({}, item, { value: Number(item.value) }))
    },
    open(type, accountSetId, id) {
      const sequence = ++this.requestSequence
      this.formLoading = false
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增财务指标' : '修改财务指标'
      this.formData = this.defaultForm(accountSetId)
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (!id) return
      this.formLoading = true
      return FmsFinanceIndicatorApi.getFinanceIndicator(accountSetId, id).then(response => {
        if (sequence !== this.requestSequence) return
        this.formData = Object.assign(this.defaultForm(accountSetId), response.data)
      }).finally(() => {
        if (sequence === this.requestSequence) this.formLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? FmsFinanceIndicatorApi.createFinanceIndicator(this.formData)
          : FmsFinanceIndicatorApi.updateFinanceIndicator(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.formula-label { display: inline-flex; align-items: center; white-space: nowrap; }
.formula-help { margin-left: 4px; color: #909399; cursor: help; }
</style>
