<template>
  <div class="wm-migrated">
    <el-dialog
      :visible.sync="dialogVisible"
      title="SN 码明细"
      width="1000px"
      append-to-body
    >
      <el-descriptions
        :column="3"
        border
        class="mb-20px"
      >
        <el-descriptions-item label="物料编码">{{
        detailGroup?.itemCode || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="物料名称">{{
        detailGroup?.itemName || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{
        detailGroup?.batchCode || '-'
        }}</el-descriptions-item>
      </el-descriptions>
      <el-table
        v-loading="detailLoading"
        :data="detailList"
        stripe
        max-height="520"
      >
        <el-table-column
          label="SN 码"
          align="center"
          prop="code"
          min-width="180"
        />
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          min-width="120"
        />
        <el-table-column
          label="物料名称"
          align="center"
          prop="itemName"
          min-width="150"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          min-width="120"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitName"
          min-width="80"
        />
        <el-table-column
          label="批次号"
          align="center"
          prop="batchCode"
          min-width="120"
        />
        <el-table-column
          label="生成时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180px"
        />
        <el-table-column
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-sn:query']"
              type="text"
              @click="handleBarcode(scope.row)"
            >
              条码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 条码详情弹窗 -->
    <BarcodeDetail ref="barcodeDetailRef" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import * as WmSnApi from '@/api/mes/wm/sn'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
export default {
  name: 'WmSnDetailDialog',
  components: { BarcodeDetail },
  setup(props, { emit }) {
    const dialogVisible = ref(false) // 明细弹窗是否展示
    const detailLoading = ref(false) // 明细列表的加载中
    const detailGroup = ref()
    const detailList = ref([]) // 明细列表的数据
    /** 查看 SN 码明细 */
    const open = async(row) => {
      if (!row.uuid) {
        return
      }
      dialogVisible.value = true
      detailGroup.value = row
      detailLoading.value = true
      try {
        detailList.value = (await WmSnApi.getSnListByUuid(row.uuid)).data
      } finally {
        detailLoading.value = false
      }
    }
    /** 查看 SN 码条码 */
    const barcodeDetailRef = ref()
    const handleBarcode = async(row) => {
      if (!row.id) {
        return
      }
      await barcodeDetailRef.value.openByBusiness(row.id, BarcodeBizTypeEnum.SN, row.code, row.itemName)
    }
    return { BarcodeDetail, barcodeDetailRef, dateFormatter, detailGroup, detailList, detailLoading, dialogVisible, handleBarcode, open }
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
