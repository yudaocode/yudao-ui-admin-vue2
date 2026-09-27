<!-- MES 点检保养方案列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】点检保养项目、点检保养方案" url="https://doc.iocoder.cn/mes/dv/check-plan/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="85px" size="small" @submit.native.prevent>
      <el-form-item label="方案编码" prop="code"><el-input v-model="queryParams.code" placeholder="请输入方案编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="方案名称" prop="name"><el-input v-model="queryParams.name" placeholder="请输入方案名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="方案类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择方案类型" clearable><el-option v-for="dict in subjectTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable><el-option v-for="dict in planStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['mes:dv-check-plan:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-hasPermi="['mes:dv-check-plan:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="方案编码" align="center" prop="code" min-width="120"><template v-slot="scope"><el-button type="text" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-button></template></el-table-column>
      <el-table-column label="方案名称" align="center" prop="name" min-width="150" />
      <el-table-column label="方案类型" align="center" prop="type" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_SUBJECT_TYPE" :value="scope.row.type" /></template></el-table-column>
      <el-table-column label="周期数量" align="center" prop="cycleCount" min-width="80" />
      <el-table-column label="周期类型" align="center" prop="cycleType" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_CYCLE_TYPE" :value="scope.row.cycleType" /></template></el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</template></el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="180"><template v-slot="scope">{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</template></el-table-column>
      <el-table-column label="状态" align="center" prop="status" min-width="100"><template v-slot="scope"><dict-tag :type="MES_DV_CHECK_PLAN_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template v-slot="scope">
          <el-button v-if="scope.row.status === MesDvCheckPlanStatusEnum.PREPARE" v-hasPermi="['mes:dv-check-plan:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-if="scope.row.status === MesDvCheckPlanStatusEnum.PREPARE" v-hasPermi="['mes:dv-check-plan:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
          <el-button v-if="scope.row.status === MesDvCheckPlanStatusEnum.PREPARE" v-hasPermi="['mes:dv-check-plan:update']" type="text" size="mini" @click="handleEnable(scope.row.id)">启用</el-button>
          <el-button v-if="scope.row.status === MesDvCheckPlanStatusEnum.ENABLED" v-hasPermi="['mes:dv-check-plan:update']" type="text" size="mini" @click="handleDisable(scope.row.id)">停用</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <check-plan-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { DvCheckPlanApi } from '@/api/mes/dv/checkplan'
import { MesDvCheckPlanStatusEnum } from '@/views/mes/utils/constants'
import CheckPlanForm from './CheckPlanForm.vue'

const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'
const MES_DV_CHECK_PLAN_STATUS = 'mes_dv_check_plan_status'
const MES_DV_CYCLE_TYPE = 'mes_dv_cycle_type'

export default {
  name: 'MesDvCheckPlan',
  components: { CheckPlanForm },
  data() {
    return {
      MES_DV_SUBJECT_TYPE,
      MES_DV_CHECK_PLAN_STATUS,
      MES_DV_CYCLE_TYPE,
      MesDvCheckPlanStatusEnum,
      loading: true,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, type: undefined, status: undefined },
      subjectTypeOptions: getIntDictOptions(MES_DV_SUBJECT_TYPE),
      planStatusOptions: getIntDictOptions(MES_DV_CHECK_PLAN_STATUS),
      exportLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      try {
        const response = await DvCheckPlanApi.getCheckPlanPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除点检保养方案？')
        await DvCheckPlanApi.deleteCheckPlan(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持列表
      }
    },
    async handleEnable(id) {
      try {
        await this.$modal.confirm('确认启用该点检保养方案？启用后将不可修改或删除。')
        await DvCheckPlanApi.enableCheckPlan(id)
        this.$modal.msgSuccess('启用成功')
        await this.getList()
      } catch (error) {
        // 取消启用时保持列表
      }
    },
    async handleDisable(id) {
      try {
        await this.$modal.confirm('确认停用该点检保养方案？')
        await DvCheckPlanApi.disableCheckPlan(id)
        this.$modal.msgSuccess('停用成功')
        await this.getList()
      } catch (error) {
        // 取消停用时保持列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有点检保养方案数据项？')
        this.exportLoading = true
        const response = await DvCheckPlanApi.exportCheckPlan(this.queryParams)
        this.$download.excel(response, '点检保养方案.xls')
      } catch (error) {
        // 取消导出时不处理
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
