<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="900px"
    append-to-body
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item
          label="回款编号"
          prop="no"
        ><el-input
          v-model="formData.no"
          disabled
          placeholder="保存后自动生成"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="负责人"
          prop="ownerUserId"
        ><el-select
          v-model="formData.ownerUserId"
          filterable
          :disabled="formType !== 'create'"
          placeholder="请选择负责人"
          style="width: 100%"
        ><el-option
          v-for="item in userList"
          :key="item.id"
          :label="item.nickname || item.username"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="回款方式"
          prop="returnType"
        ><el-select
          v-model="formData.returnType"
          clearable
          placeholder="请选择回款方式"
          style="width: 100%"
        ><el-option
          v-for="item in returnTypeDictDatas"
          :key="item.value"
          :label="item.label"
          :value="toNumber(item.value)"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item
          label="客户名称"
          prop="customerId"
        ><el-select
          v-model="formData.customerId"
          filterable
          :disabled="formType !== 'create'"
          clearable
          placeholder="请选择客户"
          style="width: 100%"
          @change="handleCustomerChange"
        ><el-option
          v-for="item in customerList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        /></el-select></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="合同编号"
          prop="contractId"
        ><el-select
          v-model="formData.contractId"
          filterable
          :disabled="formType !== 'create' || !formData.customerId"
          clearable
          placeholder="请选择合同"
          style="width: 100%"
          @change="handleContractChange"
        ><el-option
          v-for="item in contractList"
          :key="item.id"
          :label="item.name || item.no"
          :value="item.id"
          :disabled="item.auditStatus !== undefined && Number(item.auditStatus) !== 20"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item
          label="回款期数"
          prop="planId"
        ><el-select
          v-model="formData.planId"
          :disabled="formType !== 'create' || !formData.contractId"
          clearable
          placeholder="请选择回款期数"
          style="width: 100%"
          @change="handlePlanChange"
        ><el-option
          v-for="item in planList"
          :key="item.id"
          :label="'第 ' + item.period + ' 期'"
          :value="item.id"
          :disabled="!!item.receivableId"
        /></el-select></el-form-item></el-col>
        <el-col :span="6"><el-form-item
          label="回款金额"
          prop="price"
        ><el-input-number
          v-model="formData.price"
          :min="0.01"
          :precision="2"
          controls-position="right"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="6"><el-form-item
          label="回款日期"
          prop="returnTime"
        ><el-date-picker
          v-model="formData.returnTime"
          type="date"
          value-format="timestamp"
          placeholder="选择日期"
          style="width: 100%"
        /></el-form-item></el-col>
      </el-row>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        type="textarea"
        :rows="3"
        placeholder="请输入备注"
      /></el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    ><el-button
      type="primary"
      :loading="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></div>
  </el-dialog>
</template>

<script>
import * as ReceivableApi from '@/api/crm/receivable'
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import * as CustomerApi from '@/api/crm/customer'
import * as ContractApi from '@/api/crm/contract'
import { getSimpleUserList } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

const blank = () => ({ id: undefined, no: undefined, planId: undefined, customerId: undefined, contractId: undefined, ownerUserId: undefined, returnType: undefined, price: undefined, returnTime: undefined, remark: undefined })

export default {
  name: 'CrmReceivableForm',
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: blank(),
      userList: [],
      customerList: [],
      contractList: [],
      planList: [],
      formRules: {
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        contractId: [{ required: true, message: '合同不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        returnTime: [{ required: true, message: '回款日期不能为空', trigger: 'change' }],
        price: [{ required: true, message: '回款金额不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    returnTypeDictDatas() { return getDictDatas(DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE) }
  },
  methods: {
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    async open(type, id, receivablePlan) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改回款' : '新增回款'
      this.formData = blank()
      this.contractList = []
      this.planList = []
      this.formLoading = true
      try {
        const optionResults = await Promise.all([
          getSimpleUserList(),
          CustomerApi.getCustomerSimpleList()
        ])
        this.userList = (optionResults[0]).data
        this.customerList = (optionResults[1]).data
        if (id !== undefined && id !== null) {
          const data = (await ReceivableApi.getReceivable(id)).data
          if (data) this.formData = Object.assign(blank(), data, { contractId: data.contractId || (data.contract && data.contract.id) })
        }
        if (this.formType === 'create') this.formData.ownerUserId = this.$store.getters.userId
        // 从回款计划创建时先设置关联键，再加载合同/计划选项，确保下拉框可见且可编辑。
        if (receivablePlan && !this.formData.customerId) this.formData.customerId = receivablePlan.customerId
        if (receivablePlan && !this.formData.contractId) this.formData.contractId = receivablePlan.contractId
        if (this.formData.customerId) await this.loadContracts(this.formData.customerId)
        if (this.formData.contractId) await this.loadPlans(this.formData.customerId, this.formData.contractId)
        if (receivablePlan) this.applyPlan(receivablePlan)
      } finally { this.formLoading = false }
    },
    async handleCustomerChange(customerId) {
      this.formData.contractId = undefined
      this.formData.planId = undefined
      this.contractList = []
      this.planList = []
      if (customerId) await this.loadContracts(customerId)
    },
    async loadContracts(customerId) {
      this.contractList = (await ContractApi.getContractSimpleList(customerId)).data
    },
    async handleContractChange(contractId) {
      this.formData.planId = undefined
      this.planList = []
      if (contractId) {
        await this.loadPlans(this.formData.customerId, contractId)
        const contract = this.contractList.find(item => item.id === contractId)
        if (contract && this.formType === 'create' && contract.totalReceivablePrice !== undefined) this.formData.price = Number(contract.totalPrice || 0) - Number(contract.totalReceivablePrice || 0)
      }
    },
    async loadPlans(customerId, contractId) {
      this.planList = (await ReceivablePlanApi.getReceivablePlanSimpleList(customerId, contractId)).data
    },
    handlePlanChange(planId) {
      const plan = this.planList.find(item => item.id === planId)
      if (plan) { this.formData.price = plan.price; this.formData.returnType = plan.returnType }
    },
    applyPlan(plan) {
      this.formData.customerId = plan.customerId
      this.formData.contractId = plan.contractId
      this.formData.planId = plan.id
      this.formData.price = plan.price
      this.formData.returnType = plan.returnType
      if (plan.returnTime) this.formData.returnTime = plan.returnTime
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const action = this.formType === 'update' ? ReceivableApi.updateReceivable : ReceivableApi.createReceivable
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    },
    resetForm() {
      this.formData = blank()
      if (this.$refs.form) this.$refs.form.resetFields()
    }
  }
}
</script>
