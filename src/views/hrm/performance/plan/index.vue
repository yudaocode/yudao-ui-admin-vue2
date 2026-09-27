<template>
  <div class="hrm-performance-page">
    <doc-alert
      title="【绩效】绩效模板、绩效计划"
      url="https://doc.iocoder.cn/hrm/performance/template-plan/"
    />

    <!-- 搜索 -->
    <el-card shadow="never">
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="76px"
      >
        <el-form-item
          label="计划名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            clearable
            class="!w-220px"
            placeholder="请输入计划名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['hrm:performance:plan:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card shadow="never">
      <el-tabs
        v-model="activeStatus"
        class="-mt-10px mb-10px"
        @tab-click="handleStatusChange"
      >
        <el-tab-pane
          v-for="tab in statusTabs"
          :key="tab.value"
          :label="`${tab.label}（${tab.count}）`"
          :name="String(tab.value)"
        />
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="list"
      >
        <el-table-column
          label="计划名称"
          prop="name"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.id)"
            >
              {{ scope.row.name }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="考核模板"
          prop="assessmentTemplateName"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column
          label="结果模板"
          prop="resultTemplateName"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="考核周期"
          align="center"
          prop="cycle"
          width="120"
        />
        <el-table-column
          label="起止日期"
          align="center"
          min-width="190"
        >
          <template #default="scope">
            {{ formatHrmDateRange(scope.row.startTime, scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="参评/完成"
          align="center"
          width="110"
        >
          <template #default="scope">
            {{ scope.row.employeeCount || 0 }} / {{ scope.row.finishedCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          width="100"
        >
          <template #default="scope">
            <dict-tag
              :type="DICT_TYPE.HRM_PERFORMANCE_PLAN_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="阶段"
          align="center"
          prop="stageType"
          width="110"
        >
          <template #default="scope">
            <dict-tag
              :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
              :value="scope.row.stageType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="阶段人数"
          min-width="260"
        >
          <template #default="scope">
            <div
              v-if="getStageCountList(scope.row).length"
              class="flex flex-wrap gap-6px"
            >
              <el-tag
                v-for="item in getStageCountList(scope.row)"
                :key="item.stageType"
                effect="plain"
                size="small"
              >
                {{
                  getDictLabel(DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS, item.stageType) || '未知阶段'
                }}（{{ item.count }}）
              </el-tag>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="170"
          :formatter="dateFormatter"
        />
        <el-table-column
          label="操作"
          align="center"
          min-width="380"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="openForm('view', scope.row.id)"
            >
              查看考核设置
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.NOT_STARTED"
              v-hasPermi="['hrm:performance:plan:delete']"

              type="text"
              @click="handleDelete(scope.row)"
            >
              删除考核
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.NOT_STARTED"
              v-hasPermi="['hrm:performance:plan:update']"

              type="text"
              @click="openDetail(scope.row.id, 'employees')"
            >
              检查并开启考核
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.RUNNING && scope.row.scoringReady"
              v-hasPermi="['hrm:performance:plan:update']"

              type="text"
              @click="handleAction(scope.row, 'score')"
            >
              开始评分
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.RUNNING && scope.row.interviewReady"
              v-hasPermi="['hrm:performance:plan:update']"

              type="text"
              @click="handleAction(scope.row, 'interview')"
            >
              发起绩效面谈
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.RUNNING && scope.row.archiveReady"
              v-hasPermi="['hrm:performance:plan:update']"

              type="text"
              @click="handleAction(scope.row, 'archive')"
            >
              归档
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.RUNNING"
              v-hasPermi="['hrm:performance:plan:update']"

              type="text"
              @click="handleAction(scope.row, 'terminate')"
            >
              终止考核
            </el-button>
            <el-button
              v-if="
                scope.row.status === HrmPerformancePlanStatus.RUNNING ||
                  scope.row.status === HrmPerformancePlanStatus.TERMINATED
              "

              type="text"
              @click="openDetail(scope.row.id, 'employees')"
            >
              {{ scope.row.status === HrmPerformancePlanStatus.TERMINATED ? '考核记录' : '考核结果' }}
            </el-button>
            <el-button
              v-if="scope.row.status === HrmPerformancePlanStatus.ARCHIVED"
              v-hasPermi="['hrm:performance:plan:delete']"

              type="text"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { ref, reactive, computed, onMounted, getCurrentInstance } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as PerformancePlanApi from '@/api/hrm/performance/plan'
import { HrmPerformancePlanStatus } from '@/views/hrm/utils/constants'
import { formatHrmDateRange } from '@/views/hrm/utils/format'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlan' },
  __name: 'index',
  setup(__props, { expose: __expose }) {
    __expose()
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    const __router = getCurrentInstance().proxy.$router
    const push = (...args) => __router.push(...args) // 路由操作
    const loading = ref(false) // 列表的加载中
    const total = ref(0) // 列表的总页数
    const list = ref([]) // 列表的数据
    const statusCount = ref({}) // 状态数量
    const queryFormRef = ref() // 搜索的表单
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      name: '',
      status: HrmPerformancePlanStatus.NOT_STARTED
    })
    // Element UI 的 Tabs 内部状态是字符串；查询参数继续保持后端约定的数字枚举。
    const activeStatus = computed({
      get: () => String(queryParams.status),
      set: (value) => {
        queryParams.status = Number(value)
      }
    })
    const statusTabs = computed(() => [
      {
        label: '未开始',
        value: HrmPerformancePlanStatus.NOT_STARTED,
        count: statusCount.value[HrmPerformancePlanStatus.NOT_STARTED] || 0
      },
      {
        label: '进行中',
        value: HrmPerformancePlanStatus.RUNNING,
        count: statusCount.value[HrmPerformancePlanStatus.RUNNING] || 0
      },
      {
        label: '已归档',
        value: HrmPerformancePlanStatus.ARCHIVED,
        count: statusCount.value[HrmPerformancePlanStatus.ARCHIVED] || 0
      },
      {
        label: '已终止',
        value: HrmPerformancePlanStatus.TERMINATED,
        count: statusCount.value[HrmPerformancePlanStatus.TERMINATED] || 0
      }
    ])
    /** 查询列表 */
    async function getList() {
      loading.value = true
      try {
        const { data } = await PerformancePlanApi.getPerformancePlanPage(queryParams)
        list.value = data.list
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 查询状态统计 */
    async function getStatusCount() {
      statusCount.value = (await PerformancePlanApi.getPerformancePlanStatusCount(queryParams)).data
    }
    /** 刷新列表和状态统计 */
    async function refresh() {
      await Promise.all([getList(), getStatusCount()])
    }
    /** 搜索按钮操作 */
    function handleQuery() {
      queryParams.pageNo = 1
      refresh()
    }
    /** 重置按钮操作 */
    function resetQuery() {
      queryFormRef.value.resetFields()
      queryParams.status = HrmPerformancePlanStatus.NOT_STARTED
      handleQuery()
    }
    /** 切换状态 */
    function handleStatusChange() {
      queryParams.pageNo = 1
      getList()
    }
    /** 打开 KPI 考核表单 */
    function openForm(type, id) {
      push({
        name: 'HrmPerformancePlanForm',
        query: { type, id }
      })
    }
    /** 打开绩效计划详情 */
    function openDetail(id, tab) {
      if (!id) {
        return
      }
      push({ name: 'HrmPerformancePlanDetail', params: { id }, query: tab ? { tab } : undefined })
    }
    /** 获得阶段人数列表 */
    function getStageCountList(plan) {
      return Object.entries(plan.stageCountMap || {})
        .map(([stageType, count]) => ({ stageType: Number(stageType), count }))
        .filter((item) => item.count > 0)
        .sort((left, right) => left.stageType - right.stageType)
    }
    /** 执行绩效计划操作 */
    async function handleAction(plan, action) {
      const actionName = {
        score: '开始评分',
        interview: '发起绩效面谈',
        archive: '归档',
        terminate: '终止考核'
      }[action]
      try {
        await message.confirm(`确认${actionName}“${plan.name}”？`)
      } catch (error) {
        return
      }
      if (action === 'score') {
        await PerformancePlanApi.openPerformancePlanScoring(plan.id)
      } else if (action === 'interview') {
        await PerformancePlanApi.startPerformancePlanInterview(plan.id)
      } else if (action === 'archive') {
        await PerformancePlanApi.archivePerformancePlan(plan.id)
      } else {
        await PerformancePlanApi.terminatePerformancePlan(plan.id)
      }
      message.success('修改成功')
      await refresh()
    }
    /** 删除绩效计划 */
    async function handleDelete(plan) {
      try {
        await message.delConfirm(`确认删除绩效计划“${plan.name}”？`)
      } catch (error) {
        return
      }
      await PerformancePlanApi.deletePerformancePlan(plan.id)
      message.success('删除成功')
      await refresh()
    }
    /** 初始化 */
    onMounted(() => {
      refresh()
    })
    const __returned__ = { message, push, loading, total, list, statusCount, queryFormRef, queryParams, activeStatus, statusTabs, getList, getStatusCount, refresh, handleQuery, resetQuery, handleStatusChange, openForm, openDetail, getStageCountList, handleAction, handleDelete, get DICT_TYPE() { return DICT_TYPE }, get getDictLabel() { return getDictLabel }, get dateFormatter() { return dateFormatter }, get HrmPerformancePlanStatus() { return HrmPerformancePlanStatus }, get formatHrmDateRange() { return formatHrmDateRange } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
