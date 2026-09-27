<template>
  <div class="detail-list">
    <el-table
      v-loading="loading"
      :data="list"
      border
      size="small"
    >
      <el-table-column
        label="仓库名称"
        align="center"
        prop="warehouseName"
        min-width="100"
      />
      <el-table-column
        label="库区名称"
        align="center"
        prop="locationName"
        min-width="100"
      />
      <el-table-column
        label="库位名称"
        align="center"
        prop="areaName"
        min-width="100"
      />
      <el-table-column
        label="批次号"
        align="center"
        prop="batchCode"
        min-width="120"
      />
      <el-table-column
        label="数量"
        align="center"
        prop="quantity"
        width="100"
      />
      <el-table-column
        v-if="isPick"
        label="操作"
        align="center"
        width="120"
        fixed="right"
      ><template #default="scope"><el-button
        type="text"
        @click="$emit('edit-detail', scope.row.id)"
      >编辑</el-button><el-button
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { WmProductSalesDetailApi } from '@/api/mes/wm/productsales/detail'

export default {
  name: 'ProductSalesDetailList',
  props: {
    salesId: { type: Number, required: true },
    lineId: { type: Number, required: true },
    itemId: { type: Number, required: true },
    formType: { type: String, required: true }
  },
  data() {
    return { loading: false, list: [] }
  },
  computed: {
    isPick() {
      return this.formType === 'stock'
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await WmProductSalesDetailApi.getProductSalesDetailListByLineId(this.lineId)
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    async handleDelete(detailId) {
      try {
        await this.$modal.confirm('是否确认删除所选数据项?')
        await WmProductSalesDetailApi.deleteProductSalesDetail(detailId)
        this.$modal.msgSuccess(this.$t('common.delSuccess'))
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败不追加提示
      }
    }
  }
}
</script>

<style scoped>
.detail-list { padding: 10px 20px 10px 60px; }
.danger-text { color: #f56c6c; }
</style>
