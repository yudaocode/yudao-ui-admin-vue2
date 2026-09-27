<!-- 设备台账 - 维修工单列表 -->
<template>
  <div>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="维护单编号" align="center" prop="code" width="120" />
      <el-table-column label="维修单名称" align="center" prop="name" min-width="120" />
      <el-table-column label="保修日期" align="center" prop="requireDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.requireDate) }}</template></el-table-column>
      <el-table-column label="维修完成日期" align="center" prop="finishDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.finishDate) }}</template></el-table-column>
      <el-table-column label="验收日期" align="center" prop="confirmDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.confirmDate) }}</template></el-table-column>
      <el-table-column label="维修人员" align="center" prop="acceptedUserNickname" width="100" />
      <el-table-column label="验收人员" align="center" prop="confirmUserNickname" width="100" />
      <el-table-column label="维修结果" align="center" prop="result" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_REPAIR_RESULT" :value="scope.row.result" /></template></el-table-column>
      <el-table-column label="单据状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_REPAIR_STATUS" :value="scope.row.status" /></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { DvRepairApi } from '@/api/mes/dv/repair'
const MES_DV_REPAIR_RESULT = 'mes_dv_repair_result'
const MES_DV_REPAIR_STATUS = 'mes_dv_repair_status'
export default {
  name: 'MachineryRepairList',
  props: { machineryId: { type: Number, required: true }},
  data() {
    return {
      MES_DV_REPAIR_RESULT,
      MES_DV_REPAIR_STATUS,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, machineryId: undefined }
    }
  },
  watch: {
    machineryId: {
      immediate: true,
      handler(value) {
        this.queryParams.machineryId = value
        this.queryParams.pageNo = 1
        this.getList()
      }
    }
  },
  methods: {
    parseTime,
    async getList() {
      if (!this.queryParams.machineryId) return
      this.loading = true
      try { const response = await DvRepairApi.getRepairPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false }
    }
  }
}
</script>
