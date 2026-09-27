<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="批次追溯"
    width="960"
    append-to-body
  >
    <el-descriptions
      :column="3"
      border
    >
      <el-descriptions-item label="批次编号">
        {{ detailData.code }}
      </el-descriptions-item>
      <el-descriptions-item label="物资编码">
        {{ detailData.itemCode }}
      </el-descriptions-item>
      <el-descriptions-item label="物资名称">
        {{ detailData.itemName }}
      </el-descriptions-item>
      <el-descriptions-item
        label="规格型号"
        :span="3"
      >
        {{ detailData.itemSpecification }}
      </el-descriptions-item>
      <el-descriptions-item label="采购订单编号">
        {{ detailData.purchaseOrderCode }}
      </el-descriptions-item>
      <el-descriptions-item label="供应商编码">
        {{ detailData.vendorCode }}
      </el-descriptions-item>
      <el-descriptions-item label="供应商名称">
        {{ detailData.vendorName }}
      </el-descriptions-item>
      <el-descriptions-item label="销售订单编号">
        {{ detailData.salesOrderCode }}
      </el-descriptions-item>
      <el-descriptions-item label="客户编码">
        {{ detailData.clientCode }}
      </el-descriptions-item>
      <el-descriptions-item label="客户名称">
        {{ detailData.clientName }}
      </el-descriptions-item>
      <el-descriptions-item label="生产批号">
        {{ detailData.lotNumber }}
      </el-descriptions-item>
      <el-descriptions-item label="生产工单">
        {{ detailData.workOrderCode }}
      </el-descriptions-item>
      <el-descriptions-item label="工作站编码">
        {{ detailData.workstationCode }}
      </el-descriptions-item>
    </el-descriptions>
    <el-tabs
      type="border-card"
      class="mt-10px"
    >
      <el-tab-pane label="向前追溯">
        <BatchTraceDetailList
          :batch-id="detailData.id"
          :batch-code="detailData.code"
          direction="forward"
        />
      </el-tab-pane>
      <el-tab-pane label="向后追溯">
        <BatchTraceDetailList
          :batch-id="detailData.id"
          :batch-code="detailData.code"
          direction="backward"
        />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { ref } from 'vue'
import BatchTraceDetailList from './BatchTraceDetailList.vue'
export default {
  name: 'BatchTraceDetail',
  components: { BatchTraceDetailList },
  setup(props, { emit }) {
    const dialogVisible = ref(false) // 弹窗的是否展示
    const detailData = ref({}) // 详情数据
    /** 打开弹窗 */
    const open = async(data) => {
      dialogVisible.value = true
      detailData.value = data
    }
    return { BatchTraceDetailList, detailData, dialogVisible, open }
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

