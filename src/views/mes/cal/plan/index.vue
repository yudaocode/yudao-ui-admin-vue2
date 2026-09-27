<!-- MES 排班计划列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【排班】排班计划、排班日历" url="https://doc.iocoder.cn/mes/cal/calendar/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="85px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="计划编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入计划编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="计划名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入计划名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="queryParams.startDate"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endDate">
        <el-date-picker
          v-model="queryParams.endDate"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
      </el-form-item>
      <el-form-item label="轮班方式" prop="shiftType">
        <el-select v-model="queryParams.shiftType" placeholder="请选择轮班方式" clearable>
          <el-option v-for="dict in shiftTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in planStatusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['mes:cal-plan:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:cal-plan:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="计划编码" align="center" prop="code" min-width="120">
        <template v-slot="scope">
          <el-link type="primary" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="计划名称" align="center" prop="name" min-width="150" />
      <el-table-column label="班组类型" align="center" prop="calendarType" min-width="100">
        <template v-slot="scope"><dict-tag :type="MES_CAL_CALENDAR_TYPE" :value="scope.row.calendarType" /></template>
      </el-table-column>
      <el-table-column label="开始日期" align="center" prop="startDate" width="180">
        <template v-slot="scope">{{ formatDate(scope.row.startDate, 'YYYY-MM-DD') }}</template>
      </el-table-column>
      <el-table-column label="结束日期" align="center" prop="endDate" width="180">
        <template v-slot="scope">{{ formatDate(scope.row.endDate, 'YYYY-MM-DD') }}</template>
      </el-table-column>
      <el-table-column label="轮班方式" align="center" prop="shiftType" min-width="100">
        <template v-slot="scope"><dict-tag :type="MES_CAL_SHIFT_TYPE" :value="scope.row.shiftType" /></template>
      </el-table-column>
      <el-table-column label="倒班方式" align="center" prop="shiftMethod" min-width="100">
        <template v-slot="scope"><dict-tag :type="MES_CAL_SHIFT_METHOD" :value="scope.row.shiftMethod" /></template>
      </el-table-column>
      <el-table-column label="单据状态" align="center" prop="status" min-width="100">
        <template v-slot="scope"><dict-tag :type="MES_CAL_PLAN_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template v-slot="scope">
          <el-button
            v-if="scope.row.status === MesCalPlanStatusEnum.PREPARE"
            v-hasPermi="['mes:cal-plan:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.status === MesCalPlanStatusEnum.PREPARE"
            v-hasPermi="['mes:cal-plan:delete']"
            type="text"
            size="mini"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <cal-plan-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { CalPlanApi } from '@/api/mes/cal/plan'
import { getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { parseTime } from '@/utils/ruoyi'
import { MesCalPlanStatusEnum } from '@/views/mes/utils/constants'
import CalPlanForm from './CalPlanForm.vue'

const MES_CAL_CALENDAR_TYPE = 'mes_cal_calendar_type'
const MES_CAL_SHIFT_TYPE = 'mes_cal_shift_type'
const MES_CAL_SHIFT_METHOD = 'mes_cal_shift_method'
const MES_CAL_PLAN_STATUS = 'mes_cal_plan_status'

export default {
  name: 'MesCalPlan',
  components: { CalPlanForm },
  data() {
    return {
      MES_CAL_CALENDAR_TYPE,
      MES_CAL_SHIFT_TYPE,
      MES_CAL_SHIFT_METHOD,
      MES_CAL_PLAN_STATUS,
      MesCalPlanStatusEnum,
      loading: true,
      exportLoading: false,
      list: [],
      total: 0,
      shiftTypeOptions: getIntDictOptions(MES_CAL_SHIFT_TYPE),
      planStatusOptions: getIntDictOptions(MES_CAL_PLAN_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        startDate: undefined,
        endDate: undefined,
        shiftType: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    formatDate,
    async getList() {
      this.loading = true
      try {
        const response = await CalPlanApi.getPlanPage(this.queryParams)
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
        await this.$modal.confirm('是否确认删除排班计划？')
        await CalPlanApi.deletePlan(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有排班计划数据项？')
        this.exportLoading = true
        const data = await CalPlanApi.exportPlan(this.queryParams)
        this.$download.excel(data, '排班计划.xls')
      } catch (error) {
        // 取消导出时保持当前列表
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
