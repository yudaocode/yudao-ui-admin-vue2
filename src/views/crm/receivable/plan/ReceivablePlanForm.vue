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
      label-width="120px"
    >
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item
          label="回款期数"
          prop="period"
        ><el-input
          v-model="formData.period"
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
        ><el-option
          v-for="item in contractList"
          :key="item.id"
          :label="item.name || item.no"
          :value="item.id"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="16">
        <el-col :span="8"><el-form-item
          label="计划回款金额"
          prop="price"
        ><el-input-number
          v-model="formData.price"
          :min="0.01"
          :precision="2"
          controls-position="right"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="计划回款日期"
          prop="returnTime"
        ><el-date-picker
          v-model="formData.returnTime"
          type="date"
          value-format="timestamp"
          placeholder="选择日期"
          style="width: 100%"
        /></el-form-item></el-col>
        <el-col :span="8"><el-form-item
          label="提前几天提醒"
          prop="remindDays"
        ><el-input-number
          v-model="formData.remindDays"
          :min="0"
          controls-position="right"
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
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import * as CustomerApi from '@/api/crm/customer'
import * as ContractApi from '@/api/crm/contract'
import { getSimpleUserList } from '@/api/system/user'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

const blank = () => ({ id: undefined, period: undefined, customerId: undefined, contractId: undefined, price: undefined, returnTime: undefined, remindDays: 0, returnType: undefined, remark: undefined, ownerUserId: undefined })

export default {
  name: 'CrmReceivablePlanForm',
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
      formRules: {
        customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
        contractId: [{ required: true, message: '合同不能为空', trigger: 'change' }],
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }],
        price: [{ required: true, message: '计划回款金额不能为空', trigger: 'change' }],
        returnTime: [{ required: true, message: '计划回款日期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: { returnTypeDictDatas() { return getDictDatas(DICT_TYPE.CRM_RECEIVABLE_RETURN_TYPE) } },
  methods: {
    toNumber(value) { return value === '' || value === null || value === undefined ? value : Number(value) },
    async open(type, id, customerId, contractId) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改回款计划' : '新增回款计划'
      this.formData = blank()
      this.contractList = []
      this.formLoading = true
      try {
        const options = await Promise.all([getSimpleUserList(), CustomerApi.getCustomerSimpleList()])
        this.userList = (options[0]).data
        this.customerList = (options[1]).data
        if (id !== undefined && id !== null) {
          const data = (await ReceivablePlanApi.getReceivablePlan(id)).data
          if (data) this.formData = Object.assign(blank(), data)
        }
        if (this.formType === 'create') this.formData.ownerUserId = this.$store.getters.userId
        if (customerId) this.formData.customerId = customerId
        if (this.formData.customerId) await this.loadContracts(this.formData.customerId)
        if (contractId) this.formData.contractId = contractId
      } finally { this.formLoading = false }
    },
    async handleCustomerChange(customerId) {
      this.formData.contractId = undefined
      this.contractList = []
      if (customerId) await this.loadContracts(customerId)
    },
    async loadContracts(customerId) {
      this.contractList = (await ContractApi.getContractSimpleList(customerId)).data
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const action = this.formType === 'update' ? ReceivablePlanApi.updateReceivablePlan : ReceivablePlanApi.createReceivablePlan
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => { this.formLoading = false })
      })
    },
    resetForm() { this.formData = blank(); if (this.$refs.form) this.$refs.form.resetFields() }
  }
}
</script>
