<!-- MES 工单物料需求列表（只读） -->
<template><el-table
  v-loading="loading"
  :data="list"
  stripe
  show-overflow-tooltip
><el-table-column
  label="物料编码"
  align="center"
  prop="itemCode"
  width="120"
/><el-table-column
  label="物料名称"
  align="center"
  prop="itemName"
  min-width="150"
/><el-table-column
  label="规格型号"
  align="center"
  prop="itemSpecification"
  width="120"
/><el-table-column
  label="单位"
  align="center"
  prop="unitMeasureName"
  width="80"
/><el-table-column
  label="物料/产品"
  align="center"
  prop="itemOrProduct"
  width="100"
><template #default="scope"><dict-tag
  :type="DICT_TYPE.MES_MD_ITEM_OR_PRODUCT"
  :value="scope.row.itemOrProduct"
/></template></el-table-column><el-table-column
  label="需求数量"
  align="center"
  prop="quantity"
  width="120"
/></el-table></template>

<script>
import { ProWorkOrderBomApi } from '@/api/mes/pro/workorder/bom'
import { DICT_TYPE } from '@/utils/dict'

export default { name: 'WorkOrderItemList', props: { workOrderId: { type: Number, required: true }}, data() { return { DICT_TYPE, loading: false, list: [] } }, created() { this.getList() }, methods: { async getList() { this.loading = true; try { const response = await ProWorkOrderBomApi.getWorkOrderBomItemListByWorkOrderId(this.workOrderId); this.list = response.data } finally { this.loading = false } } }}
</script>
