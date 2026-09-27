<template>
  <div class="app-container oa-work-report">
    <!-- 汇报类型与搜索工作栏 -->
    <el-tabs v-model="activeType" class="report-tabs" @tab-click="handleTypeChange">
      <el-tab-pane label="工作日报" :name="String(OA_WORK_REPORT_TYPE.DAILY)" />
      <el-tab-pane label="工作周报" :name="String(OA_WORK_REPORT_TYPE.WEEKLY)" />
      <el-tab-pane label="工作月报" :name="String(OA_WORK_REPORT_TYPE.MONTHLY)" />
    </el-tabs>

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      class="query-form"
      @submit.native.prevent
    >
      <el-form-item label="单据编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入单据编号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="汇报状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择汇报状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请部门" prop="deptId">
        <dept-select v-model="queryParams.deptId" style="width: 240px" />
      </el-form-item>
      <el-form-item
        v-if="activeType === String(OA_WORK_REPORT_TYPE.WEEKLY)"
        label="汇报周次"
        prop="reportWeek"
      >
        <el-input
          v-model="queryParams.reportWeek"
          placeholder="请输入周次，如 2026-12"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        v-if="activeType === String(OA_WORK_REPORT_TYPE.MONTHLY)"
        label="汇报月份"
        prop="reportMonth"
      >
        <el-date-picker
          v-model="queryParams.reportMonth"
          type="month"
          value-format="yyyy-MM"
          style="width: 240px"
          placeholder="请选择汇报月份"
        />
      </el-form-item>
      <el-form-item label="开始日期" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 240px"
          placeholder="请选择开始日期"
        />
      </el-form-item>
      <el-form-item label="结束日期" prop="endTime">
        <el-date-picker
          v-model="queryParams.endTime"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 240px"
          placeholder="请选择结束日期"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:work-report:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 工作汇报列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="单据编号" prop="no" width="185" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openForm('detail', scope.row.id)">
            {{ scope.row.no }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="status" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_WORK_REPORT_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="汇报类型" align="center" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_WORK_REPORT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="activeType !== String(OA_WORK_REPORT_TYPE.DAILY)"
        :label="activeType === String(OA_WORK_REPORT_TYPE.WEEKLY) ? '汇报周次' : '汇报月份'"
        prop="periodKey"
        align="center"
        width="120"
      />
      <el-table-column label="汇报标题" prop="title" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button type="text" class="link-button" @click="openForm('detail', scope.row.id)">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="开始日期" prop="startTime" :formatter="dateFormatter2" align="center" width="120" />
      <el-table-column label="结束日期" prop="endTime" :formatter="dateFormatter2" align="center" width="120" />
      <el-table-column label="申请人" prop="userName" align="center" width="120" />
      <el-table-column label="申请部门" prop="deptName" align="center" width="130" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="操作" align="center" width="210" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:work-report:update']"
            type="text"
            size="mini"
            @click="handleStatusChange(scope.row)"
          >{{ scope.row.status === OA_WORK_REPORT_STATUS.DRAFT ? '提交' : '取消提交' }}</el-button>
          <el-button
            v-if="scope.row.status === OA_WORK_REPORT_STATUS.DRAFT"
            v-hasPermi="['oa:work-report:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="scope.row.status === OA_WORK_REPORT_STATUS.DRAFT"
            v-hasPermi="['oa:work-report:delete']"
            type="text"
            size="mini"
            class="danger-text"
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

    <!-- 工作汇报表单 -->
    <oa-work-report-form ref="formRef" @success="getList" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as WorkReportApi from '@/api/oa/workreport'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { OA_WORK_REPORT_STATUS, OA_WORK_REPORT_TYPE } from '@/views/oa/utils/constants-collab'
import { formatWorkReportWeek, getWorkReportWeekStart } from '@/views/oa/utils/format-collab'
import OaWorkReportForm from './OaWorkReportForm.vue'

/** 获取起止日期范围（含结束日的最后一秒） */
function getDateRange(beginDate, endDate) {
  return [
    dayjs(beginDate).startOf('d').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(endDate).endOf('d').format('YYYY-MM-DD HH:mm:ss')
  ]
}

export default {
  name: 'OaWorkReport',
  components: { DeptSelect, OaWorkReportForm },
  data() {
    return {
      DICT_TYPE,
      OA_WORK_REPORT_STATUS,
      OA_WORK_REPORT_TYPE,
      loading: true,
      total: 0,
      list: [],
      activeType: String(OA_WORK_REPORT_TYPE.DAILY),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        type: OA_WORK_REPORT_TYPE.DAILY,
        no: undefined,
        deptId: undefined,
        reportWeek: undefined,
        reportMonth: undefined,
        startTime: undefined,
        endTime: undefined,
        status: undefined,
        createTime: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_WORK_REPORT_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    dateFormatter2,
    getList() {
      // 1. 将周次或月份转换为完整周期的开始时间范围
      let periodTime
      if (this.queryParams.reportWeek) {
        if (
          !/^[0-9]{4}-(0[1-9]|[1-4][0-9]|5[0-3])$/.test(this.queryParams.reportWeek) ||
          formatWorkReportWeek(getWorkReportWeekStart(this.queryParams.reportWeek).valueOf()) !==
            this.queryParams.reportWeek
        ) {
          this.$modal.msgWarning('周次格式为 yyyy-ww')
          return Promise.resolve()
        }
        const weekStartTime = getWorkReportWeekStart(this.queryParams.reportWeek)
        periodTime = getDateRange(weekStartTime, weekStartTime.add(6, 'day'))
      } else if (this.queryParams.reportMonth) {
        const monthDate = dayjs(this.queryParams.reportMonth + '-01')
        periodTime = getDateRange(monthDate.startOf('M'), monthDate.endOf('M'))
      }
      // 2. 查询工作汇报列表，不向接口传递页面的周次、月份字段
      this.loading = true
      const params = Object.assign({}, this.queryParams, { periodTime })
      delete params.reportWeek
      delete params.reportMonth
      return WorkReportApi.getWorkReportPage(params).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 切换汇报类型 */
    handleTypeChange(pane) {
      this.queryParams.type = Number(pane.name)
      this.activeType = pane.name
      this.queryParams.reportWeek = undefined
      this.queryParams.reportMonth = undefined
      return this.handleQuery()
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.type = Number(this.activeType)
      return this.handleQuery()
    },
    /** 提交或取消提交工作汇报 */
    handleStatusChange(row) {
      const isDraft = row.status === OA_WORK_REPORT_STATUS.DRAFT
      // 1. 确认汇报状态操作
      return this.$modal.confirm(isDraft ? '确认提交该工作汇报吗？' : '确认取消提交并恢复为草稿吗？').then(() => {
        // 2. 更新状态并刷新列表，不发起审批
        return isDraft ? WorkReportApi.submitWorkReport(row.id) : WorkReportApi.cancelWorkReport(row.id)
      }).then(() => {
        this.$modal.msgSuccess(isDraft ? '提交成功' : '取消提交成功')
        return this.getList()
      }).catch(() => {})
    },
    openForm(type, id) {
      this.$refs.formRef.open(type, id, Number(this.activeType))
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除工作汇报编号为“' + id + '”的数据项？').then(() => {
        return WorkReportApi.deleteWorkReport(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.query-form {
  margin-top: 16px;
}

.danger-text {
  color: #f56c6c;
}
</style>
