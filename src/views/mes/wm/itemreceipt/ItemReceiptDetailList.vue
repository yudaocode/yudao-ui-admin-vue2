<!-- MES 采购入库上架明细列表 -->
<template><div class="detail-list"><el-table
  v-loading="loading"
  :data="list"
  border
  size="small"
><el-table-column
  label="仓库名称"
  align="center"
  prop="warehouseName"
  min-width="100"
/><el-table-column
  label="库区名称"
  align="center"
  prop="locationName"
  min-width="100"
/><el-table-column
  label="库位名称"
  align="center"
  prop="areaName"
  min-width="100"
/><el-table-column
  label="数量"
  align="center"
  prop="quantity"
  width="100"
/><el-table-column
  v-if="isStock"
  label="操作"
  align="center"
  width="120"
  fixed="right"
><template #default="scope"><el-button
  type="text"
  @click="$emit('edit-detail', scope.row.id)"
>编辑</el-button><el-button
  type="text"
  class="danger"
  @click="handleDelete(scope.row.id)"
>删除</el-button><!-- TODO @芋艿：【保留】标签打印 --></template></el-table-column></el-table></div></template>
<script>
import { WmItemReceiptDetailApi } from '@/api/mes/wm/itemreceipt/detail'
export default {
  name: 'ItemReceiptDetailList', props: { receiptId: { type: Number, required: true }, lineId: { type: Number, required: true }, itemId: { type: Number, required: true }, formType: { type: String, required: true }},
  data() { return { loading: false, list: [] } }, computed: { isStock() { return this.formType === 'stock' } }, mounted() { this.getList() },
  methods: { async getList() { this.loading = true; try { this.list = (await WmItemReceiptDetailApi.getItemReceiptDetailListByLineId(this.lineId)).data } finally { this.loading = false } }, async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该上架明细？'); await WmItemReceiptDetailApi.deleteItemReceiptDetail(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 用户取消时不做处理 */ } } }
}
</script>
<style scoped>.detail-list { padding: 10px 20px 10px 60px; }.danger { color: #f56c6c; }</style>
