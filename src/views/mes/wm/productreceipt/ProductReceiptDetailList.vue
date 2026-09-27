<template>
  <div class="wm-migrated">
    <div class="pl-60px pr-20px py-10px">
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
          label="数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          v-if="formType === 'stock'"
          label="操作"
          align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="$emit('edit-detail', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, toRefs, getCurrentInstance } from 'vue'
import { WmProductReceiptDetailApi } from '@/api/mes/wm/productreceipt/detail'
export default {
  name: 'ProductReceiptDetailList',
  props: { 'receiptId': { type: Number, required: true }, 'lineId': { type: Number, required: true }, 'itemId': { type: Number, required: true }, 'formType': { type: String, required: true }},
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const t = (...args) => vm.$t(...args)
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    }
    const loading = ref(false)
    const list = ref([])
    /** 查询明细列表 */
    const getList = async() => {
      loading.value = true
      try {
        list.value = (await WmProductReceiptDetailApi.getProductReceiptDetailListByLineId(props.lineId)).data
      } finally {
        loading.value = false
      }
    }
    /** 删除上架明细 */
    const handleDelete = async(detailId) => {
      try {
        await message.delConfirm();
        (await WmProductReceiptDetailApi.deleteProductReceiptDetail(detailId)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 初始化：延迟加载，展开时才触发 */
    onMounted(() => {
      getList()
    })
    return { ...toRefs(props), getList, handleDelete, list, loading, message, t }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
