<!-- 设备台账 - 点检记录列表 -->
<template>
  <div>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="计划编码" align="center" prop="planCode" width="120" />
      <el-table-column label="计划名称" align="center" prop="planName" min-width="120" />
      <el-table-column label="开始时间" align="center" prop="planStartDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.planStartDate) }}</template></el-table-column>
      <el-table-column label="结束日期" align="center" prop="planEndDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.planEndDate) }}</template></el-table-column>
      <el-table-column label="频率数量" align="center" prop="planCycleCount" width="100" />
      <el-table-column label="频率类型" align="center" prop="planCycleType" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_CYCLE_TYPE" :value="scope.row.planCycleType" /></template></el-table-column>
      <el-table-column label="点检时间" align="center" prop="checkTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.checkTime) }}</template></el-table-column>
      <el-table-column label="点检人" align="center" prop="nickname" width="100" />
      <el-table-column label="设备编码" align="center" prop="machineryCode" width="120" />
      <el-table-column label="设备名称" align="center" prop="machineryName" width="120" />
      <el-table-column label="品牌" align="center" prop="machineryBrand" width="100" />
      <el-table-column label="规格型号" align="center" prop="machinerySpecification" width="120" />
      <el-table-column label="状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_DV_CHECK_RECORD_STATUS" :value="scope.row.status" /></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { DvCheckRecordApi } from '@/api/mes/dv/checkrecord'
const MES_DV_CYCLE_TYPE = 'mes_dv_cycle_type'
const MES_DV_CHECK_RECORD_STATUS = 'mes_dv_check_record_status'
export default {
  name: 'MachineryCheckRecordList',
  props: { machineryId: { type: Number, required: true }},
  data() {
    return {
      MES_DV_CYCLE_TYPE,
      MES_DV_CHECK_RECORD_STATUS,
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
      try { const response = await DvCheckRecordApi.getCheckRecordPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false }
    }
  }
}
</script>
