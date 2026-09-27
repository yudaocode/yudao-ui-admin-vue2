<!-- MES 物料批次属性配置 -->
<template>
  <el-form v-loading="loading" :model="formData" :disabled="isReadOnly">
    <div v-if="!isReadOnly" class="actions"><el-button type="primary" size="small" :loading="loading" @click="handleSave">保存批次属性</el-button></div>
    <el-row :gutter="20">
      <el-col :span="5"><el-checkbox v-model="formData.produceDateFlag">生产日期</el-checkbox></el-col>
      <el-col :span="5"><el-checkbox v-model="formData.qualityStatusFlag">质量状态</el-checkbox></el-col>
      <template v-if="itemOrProduct === MesItemOrProductEnum.ITEM.value">
        <el-col :span="5"><el-checkbox v-model="formData.vendorFlag">供应商</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.purchaseOrderCodeFlag">采购订单编号</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.lotNumberFlag">生产批号</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.expireDateFlag">有效期</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.receiptDateFlag">入库日期</el-checkbox></el-col>
      </template>
      <template v-if="itemOrProduct === MesItemOrProductEnum.PRODUCT.value">
        <el-col :span="5"><el-checkbox v-model="formData.clientFlag">客户</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.salesOrderCodeFlag">销售订单编号</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.workorderFlag">生产工单</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.taskFlag">生产任务</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.workstationFlag">工作站</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.toolFlag">工具</el-checkbox></el-col>
        <el-col :span="5"><el-checkbox v-model="formData.moldFlag">模具</el-checkbox></el-col>
      </template>
    </el-row>
  </el-form>
</template>

<script>
import { MdItemBatchConfigApi } from '@/api/mes/md/item/batchConfig'
import { MesItemOrProductEnum } from '@/views/mes/utils/constants'

const FLAG_KEYS = ['produceDateFlag', 'expireDateFlag', 'receiptDateFlag', 'vendorFlag', 'clientFlag', 'salesOrderCodeFlag', 'purchaseOrderCodeFlag', 'workorderFlag', 'taskFlag', 'workstationFlag', 'toolFlag', 'moldFlag', 'lotNumberFlag', 'qualityStatusFlag']

export default {
  name: 'MdItemBatchConfigForm',
  props: { itemId: { type: Number, required: true }, itemOrProduct: { type: String, required: true }, formType: { type: String, default: '' }},
  data() {
    return { MesItemOrProductEnum, loading: false, formData: this.getDefaultForm() }
  },
  computed: {
    isReadOnly() {
      return this.formType === 'detail'
    }
  },
  watch: {
    itemId: { immediate: true, handler(value) { if (value) this.loadData() } }
  },
  methods: {
    getDefaultForm() {
      const data = { itemId: this.itemId }
      FLAG_KEYS.forEach(key => { data[key] = false })
      return data
    },
    async loadData() {
      this.loading = true
      try {
        const data = (await MdItemBatchConfigApi.getBatchConfigByItemId(this.itemId)).data
        if (data) this.formData = { ...this.getDefaultForm(), ...data }
      } finally {
        this.loading = false
      }
    },
    async handleSave() {
      if (!FLAG_KEYS.some(key => this.formData[key])) {
        this.$modal.msgWarning('至少选择一个批次属性')
        return
      }
      this.loading = true
      try {
        this.formData.itemId = this.itemId
        await MdItemBatchConfigApi.saveBatchConfig(this.formData)
        this.$modal.msgSuccess('保存成功')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.actions { margin-bottom: 10px; text-align: right; }
.el-col { margin-bottom: 12px; }
</style>
