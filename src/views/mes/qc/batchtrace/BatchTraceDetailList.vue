<template>
  <div class="app-container qc-migrated">
    <el-table
      v-loading="loading"
      :data="batchList"
    >
      <el-table-column
        label="生产工单号"
        width="150px"
        align="center"
        prop="workOrderCode"
      />
      <el-table-column
        label="批次编号"
        align="center"
        prop="code"
      />
      <el-table-column
        label="产品物料编码"
        align="center"
        prop="itemCode"
      />
      <el-table-column
        label="产品物料名称"
        align="center"
        prop="itemName"
      />
      <el-table-column
        label="规格型号"
        align="center"
        prop="itemSpecification"
      />
      <el-table-column
        label="单位"
        align="center"
        prop="unitName"
      />
    </el-table>
  </div>
</template>

<script>
import { ref, watch, onMounted, toRefs } from 'vue'
import { BatchApi } from '@/api/mes/wm/batch'
export default {
  name: 'BatchTraceDetailList',
  props: { 'batchId': { type: Number }, 'batchCode': { type: String }, 'direction': { type: String, required: true }},
  setup(props, { emit }) {
    const loading = ref(true) // 列表的加载中
    const batchList = ref([]) // 列表的数据
    /** 查询列表 */
    const getList = async() => {
      if (!props.batchCode) {
        return
      }
      loading.value = true
      try {
        batchList.value =
                    props.direction === 'forward'
                      ? (await BatchApi.getForwardList(props.batchCode)).data : (await BatchApi.getBackwardList(props.batchCode)).data
      } finally {
        loading.value = false
      }
    }
    /** 监听批次编号变化 */
    watch(() => props.batchCode, (val) => {
      if (val) {
        getList()
      }
    })
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    return { ...toRefs(props), batchList, getList, loading }
  }
}
</script>

<style scoped>
.qc-content-wrap { margin-bottom: 20px; }
.qc-w-full { width: 100%; }
.qc-w-240 { width: 240px; }
.qc-w-220 { width: 220px; }
.qc-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.mb-10px { margin-bottom: 10px; }
.mt-10px { margin-top: 10px; }
.-mb-15px { margin-bottom: -15px; }
.overflow-hidden { overflow: hidden; }
</style>

