<template>
  <div>
    <Dialog v-model="dialogVisible" :title="(currentUser && currentUser.userName || '') + '的汇报明细'" width="760px">
      <el-descriptions :column="3" class="user-desc">
        <el-descriptions-item label="姓名">{{ currentUser && currentUser.userName }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ currentUser && currentUser.deptName }}</el-descriptions-item>
        <el-descriptions-item label="统计周期">
          {{ formatDate(queryParams.startTime, 'YYYY-MM-DD') }} ~
          {{ formatDate(queryParams.endTime, 'YYYY-MM-DD') }}
        </el-descriptions-item>
      </el-descriptions>
      <el-tabs v-model="detailTab">
        <el-tab-pane :label="'已填 ' + ((currentUser && currentUser.submittedReports) || []).length" name="submitted">
          <el-table :data="(currentUser && currentUser.submittedReports) || []" border max-height="360">
            <el-table-column label="日期" prop="startTime" :formatter="dateFormatter2" width="120" />
            <el-table-column label="汇报标题" prop="title" min-width="260" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-button type="text" class="link-button" @click="openReportDetail(scope.row.id)">
                  {{ scope.row.title }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" width="100">
              <template slot-scope="scope">
                <dict-tag :type="DICT_TYPE.OA_WORK_REPORT_STATUS" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column
              label="提交时间"
              prop="createTime"
              :formatter="dateFormatter"
              align="center"
              width="170"
            />
          </el-table>
        </el-tab-pane>
        <el-tab-pane :label="'未填 ' + (currentUser ? currentUser.missingCount : 0)" name="missing">
          <el-table :data="missingRows" border max-height="360">
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column
              v-if="queryParams.type !== OA_WORK_REPORT_TYPE.DAILY"
              :label="queryParams.type === OA_WORK_REPORT_TYPE.WEEKLY ? '周次' : '月份'"
              prop="periodKey"
              width="130"
            />
            <el-table-column
              :label="queryParams.type === OA_WORK_REPORT_TYPE.DAILY ? '应填日期' : '起始日期'"
              prop="startDate"
              width="130"
            />
            <el-table-column
              v-if="queryParams.type === OA_WORK_REPORT_TYPE.DAILY"
              label="星期"
              prop="weekDay"
              width="100"
            />
            <el-table-column label="逾期天数" prop="overdueDays" width="110" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </Dialog>

    <!-- 工作汇报详情 -->
    <oa-work-report-form ref="workReportFormRef" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import * as WorkReportApi from '@/api/oa/workreport'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate, dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { OA_WEEKDAY_NAMES, OA_WORK_REPORT_TYPE } from '@/views/oa/utils/constants-collab'
import { getWorkReportWeekStart } from '@/views/oa/utils/format-collab'
import OaWorkReportForm from '../OaWorkReportForm.vue'

export default {
  name: 'OaWorkReportStatisticsDetail',
  components: { Dialog, OaWorkReportForm },
  data() {
    return {
      DICT_TYPE,
      OA_WORK_REPORT_TYPE,
      dialogVisible: false,
      detailTab: 'submitted',
      currentUser: undefined,
      queryParams: {
        type: 1,
        startTime: '',
        endTime: '',
        queryStartTime: '',
        queryEndTime: ''
      }
    }
  },
  computed: {
    /** 未填明细，逾期从统计范围内的周期起始日期计算 */
    missingRows() {
      return ((this.currentUser && this.currentUser.missingPeriodKeys) || []).map(periodKey => {
        const periodStartTime =
          this.queryParams.type === this.OA_WORK_REPORT_TYPE.WEEKLY
            ? getWorkReportWeekStart(periodKey)
            : dayjs(this.queryParams.type === this.OA_WORK_REPORT_TYPE.MONTHLY ? periodKey + '-01' : periodKey)
        const startTime = periodStartTime.isBefore(this.queryParams.startTime, 'day')
          ? dayjs(this.queryParams.startTime)
          : periodStartTime
        return {
          periodKey,
          startDate: startTime.format('YYYY-MM-DD'),
          weekDay: OA_WEEKDAY_NAMES[startTime.day()],
          overdueDays: Math.max(0, dayjs().startOf('day').diff(startTime.startOf('day'), 'day'))
        }
      })
    }
  },
  methods: {
    formatDate,
    dateFormatter,
    dateFormatter2,
    /** 打开弹窗 */
    open(user, tab, params) {
      // 1. 回填员工及统计条件
      this.currentUser = user
      this.detailTab = tab
      this.queryParams = Object.assign({}, params)
      // 2. 展示汇报明细
      this.dialogVisible = true
    },
    /** 打开工作汇报详情 */
    openReportDetail(id) {
      this.$refs.workReportFormRef.open('detail', id)
    }
  }
}
</script>

<style scoped>
.user-desc {
  margin-bottom: 16px;
}
</style>
