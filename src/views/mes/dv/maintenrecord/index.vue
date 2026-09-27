<!-- MES 设备保养记录列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】点检记录、保养记录、维修单" url="https://doc.iocoder.cn/mes/dv/check-record/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px" size="small" @submit.native.prevent>
      <el-form-item label="保养计划" prop="planId"><dv-check-plan-select v-model="queryParams.planId" class="selector-width" /></el-form-item>
      <el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="queryParams.machineryId" class="selector-width" /></el-form-item>
      <el-form-item label="保养人" prop="userId"><user-select-v2 v-model="queryParams.userId" placeholder="请选择保养人" class="selector-width" /></el-form-item>
      <el-form-item label="保养时间" prop="maintenTime"><el-date-picker v-model="queryParams.maintenTime" value-format="yyyy-MM-dd HH:mm:ss" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['mes:dv-mainten-record:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-hasPermi="['mes:dv-mainten-record:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="设备编码" align="center" prop="machineryCode" min-width="160"><template v-slot="scope"><el-button type="text" @click="openForm('detail', scope.row.id)">{{ scope.row.machineryCode }}</el-button></template></el-table-column>
      <el-table-column label="设备名称" align="center" prop="machineryName" /><el-table-column label="品牌" align="center" prop="machineryBrand" />
      <el-table-column label="规格型号" align="center" prop="machinerySpecification" /><el-table-column label="计划名称" align="center" prop="planName" />
      <el-table-column label="保养时间" align="center" prop="maintenTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.maintenTime) }}</template></el-table-column>
      <el-table-column label="保养人" align="center" prop="nickname" width="120" />
      <el-table-column label="状态" align="center" prop="status" width="100"><template v-slot="scope"><dict-tag :type="MES_MAINTEN_RECORD_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="操作" align="center" width="160" fixed="right">
        <template v-slot="scope">
          <el-button v-if="scope.row.status === MesDvMaintenRecordStatusEnum.PREPARE" v-hasPermi="['mes:dv-mainten-record:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-if="scope.row.status === MesDvMaintenRecordStatusEnum.PREPARE" v-hasPermi="['mes:dv-mainten-record:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <mainten-record-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { parseTime } from '@/utils/ruoyi'
import { DvMaintenRecordApi } from '@/api/mes/dv/maintenrecord'
import { MesDvMaintenRecordStatusEnum } from '@/views/mes/utils/constants'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import DvCheckPlanSelect from '@/views/mes/dv/checkplan/components/DvCheckPlanSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import MaintenRecordForm from './MaintenRecordForm.vue'
const MES_MAINTEN_RECORD_STATUS = 'mes_mainten_record_status'
export default {
  name: 'MesDvMaintenRecord',
  components: { DvMachinerySelect, DvCheckPlanSelect, UserSelectV2, MaintenRecordForm },
  data() {
    return {
      MES_MAINTEN_RECORD_STATUS,
      MesDvMaintenRecordStatusEnum,
      loading: true,
      list: [],
      total: 0,
      exportLoading: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        planId: undefined,
        machineryId: undefined,
        userId: undefined,
        maintenTime: []
      }
    }
  },
  created() { this.getList() },
  methods: {
    parseTime,
    async getList() { this.loading = true; try { const response = await DvMaintenRecordApi.getMaintenRecordPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() { this.resetForm('queryForm'); return this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除保养记录？'); await DvMaintenRecordApi.deleteMaintenRecord(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除时保持列表 */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有设备保养记录数据项？'); this.exportLoading = true; const response = await DvMaintenRecordApi.exportMaintenRecord(this.queryParams); this.$download.excel(response, '设备保养记录.xls') } catch (error) { /* 取消导出时不处理 */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.selector-width { width: 240px; }</style>
