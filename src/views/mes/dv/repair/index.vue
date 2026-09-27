<!-- MES 维修工单列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】点检记录、保养记录、维修单" url="https://doc.iocoder.cn/mes/dv/check-record/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="90px" size="small" @submit.native.prevent>
      <el-form-item label="维修单编号" prop="code"><el-input v-model="queryParams.code" placeholder="请输入维修单编号" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="维修单名称" prop="name"><el-input v-model="queryParams.name" placeholder="请输入维修单名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="设备" prop="machineryId"><dv-machinery-select v-model="queryParams.machineryId" class="selector-width" /></el-form-item>
      <el-form-item label="维修结果" prop="result"><el-select v-model="queryParams.result" placeholder="请选择维修结果" clearable><el-option v-for="dict in resultOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item>
      <el-form-item label="单据状态" prop="status"><el-select v-model="queryParams.status" placeholder="请选择状态" clearable><el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['mes:dv-repair:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-hasPermi="['mes:dv-repair:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="维修单编号" align="center" prop="code" min-width="160"><template v-slot="scope"><el-button type="text" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-button></template></el-table-column>
      <el-table-column label="维修单名称" align="center" prop="name" min-width="150" /><el-table-column label="设备编码" align="center" prop="machineryCode" min-width="120" /><el-table-column label="设备名称" align="center" prop="machineryName" min-width="120" />
      <el-table-column label="报修日期" align="center" prop="requireDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.requireDate) }}</template></el-table-column>
      <el-table-column label="维修完成日期" align="center" prop="finishDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.finishDate) }}</template></el-table-column>
      <el-table-column label="验收日期" align="center" prop="confirmDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.confirmDate) }}</template></el-table-column>
      <el-table-column label="维修结果" align="center" prop="result" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_REPAIR_RESULT" :value="scope.row.result" /></template></el-table-column>
      <el-table-column label="维修人员" align="center" prop="acceptedUserNickname" min-width="100" /><el-table-column label="验收人员" align="center" prop="confirmUserNickname" min-width="100" />
      <el-table-column label="单据状态" align="center" prop="status" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_REPAIR_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="操作" align="center" width="240" fixed="right">
        <template v-slot="scope">
          <el-button v-if="scope.row.status === MesDvRepairStatusEnum.PREPARE" v-hasPermi="['mes:dv-repair:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-if="scope.row.status === MesDvRepairStatusEnum.PREPARE" v-hasPermi="['mes:dv-repair:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
          <el-button v-if="scope.row.status === MesDvRepairStatusEnum.CONFIRMED" v-hasPermi="['mes:dv-repair:update']" type="text" size="mini" @click="openForm('confirm', scope.row.id)">完成维修</el-button>
          <el-button v-if="scope.row.status === MesDvRepairStatusEnum.APPROVING" v-hasPermi="['mes:dv-repair:update']" type="text" size="mini" @click="openForm('finish', scope.row.id)">验收</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <repair-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { DvRepairApi } from '@/api/mes/dv/repair'
import { MesDvRepairStatusEnum } from '@/views/mes/utils/constants'
import DvMachinerySelect from '@/views/mes/dv/machinery/components/DvMachinerySelect.vue'
import RepairForm from './RepairForm.vue'
const MES_DV_REPAIR_RESULT = 'mes_dv_repair_result'
const MES_DV_REPAIR_STATUS = 'mes_dv_repair_status'
export default {
  name: 'MesDvRepair',
  components: { DvMachinerySelect, RepairForm },
  data() { return { MES_DV_REPAIR_RESULT, MES_DV_REPAIR_STATUS, MesDvRepairStatusEnum, loading: true, list: [], total: 0, exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, machineryId: undefined, result: undefined, status: undefined }, resultOptions: getIntDictOptions(MES_DV_REPAIR_RESULT), statusOptions: getIntDictOptions(MES_DV_REPAIR_STATUS) } },
  created() { this.getList() },
  methods: {
    parseTime,
    async getList() { this.loading = true; try { const response = await DvRepairApi.getRepairPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() { this.resetForm('queryForm'); return this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除维修工单？'); await DvRepairApi.deleteRepair(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除时保持列表 */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有维修工单数据项？'); this.exportLoading = true; const response = await DvRepairApi.exportRepair(this.queryParams); this.$download.excel(response, '维修工单.xls') } catch (error) { /* 取消导出时不处理 */ } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.selector-width { width: 240px; }</style>
