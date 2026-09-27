<template>
  <div class="hrm-performance-page">
    <PerformancePlanDetailsHeader
      :loading="loading"
      :plan="plan"
      @back="close"
    >
      <div class="performance-actions">
        <el-button
          v-if="isEditable"
          v-hasPermi="['hrm:performance:plan:update']"
          type="primary"
          @click="openForm"
        >
          <i class="el-icon-edit mr-5px" />编辑
        </el-button>
        <el-button
          v-else
          type="primary"
          plain
          @click="openSettings"
        >
          <i class="el-icon-view mr-5px" />查看考核设置
        </el-button>
        <el-button
          v-if="isEditable"
          v-hasPermi="['hrm:performance:plan:update']"
          type="success"
          @click="handleAction('start')"
        >
          启动
        </el-button>
        <el-button
          v-if="plan.status === HrmPerformancePlanStatus.RUNNING && plan.scoringReady"
          v-hasPermi="['hrm:performance:plan:update']"
          type="warning"
          @click="handleAction('open')"
        >
          开启评分
        </el-button>
        <el-dropdown
          v-if="showMoreActions"
          trigger="click"
        >
          <el-button>更多<i class="el-icon-arrow-down ml-5px" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-if="plan.status === HrmPerformancePlanStatus.RUNNING && plan.interviewReady"
              @click.native="handleAction('interview')"
            >
              发起面谈
            </el-dropdown-item>
            <el-dropdown-item
              v-if="plan.status === HrmPerformancePlanStatus.RUNNING && plan.archiveReady"
              @click.native="handleAction('archive')"
            >
              归档
            </el-dropdown-item>
            <el-dropdown-item
              v-if="plan.status === HrmPerformancePlanStatus.RUNNING"
              @click.native="handleAction('terminate')"
            >
              终止
            </el-dropdown-item>
            <el-dropdown-item
              v-if="isEditable"
              @click.native="handleDelete"
            >删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </PerformancePlanDetailsHeader>

    <el-col>
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="详细资料"
          name="details"
        >
          <PerformancePlanDetailsInfo :plan="plan" />
        </el-tab-pane>
        <el-tab-pane
          :label="`参评员工（${employeeTotal}）`"
          name="employees"
        >
          <el-card shadow="never">
            <el-form
              ref="employeeQueryFormRef"
              :inline="true"
              :model="employeeQuery"
              class="-mb-15px"
              label-width="76px"
            >
              <el-form-item
                label="员工信息"
                prop="search"
              >
                <el-input
                  v-model="employeeQuery.search"
                  clearable
                  class="!w-220px"
                  placeholder="请输入姓名、工号或手机号"
                  @keyup.enter="handleEmployeeQuery"
                />
              </el-form-item>
              <el-form-item
                label="部门"
                prop="deptId"
              >
                <DeptSelect
                  v-model="employeeQuery.deptId"
                  class="!w-180px"
                />
              </el-form-item>
              <el-form-item
                label="聘用形式"
                prop="employeeType"
              >
                <el-select
                  v-model="employeeQuery.employeeType"
                  clearable
                  class="!w-150px"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="员工状态"
                prop="employeeStatus"
              >
                <el-select
                  v-model="employeeQuery.employeeStatus"
                  clearable
                  class="!w-150px"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_STATUS)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                label="当前阶段"
                prop="stageType"
              >
                <el-select
                  v-model="employeeQuery.stageType"
                  clearable
                  class="!w-150px"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="dict in getIntDictOptions(DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="结果等级">
                <el-select
                  v-model="resultLevelFilter"
                  clearable
                  class="!w-140px"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="level in levelList"
                    :key="level"
                    :label="level"
                    :value="level"
                  />
                  <el-option
                    label="未定级"
                    :value="RESULT_LEVEL_EMPTY_VALUE"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button @click="handleEmployeeQuery">
                  <i class="el-icon-search mr-5px" />搜索
                </el-button>
                <el-button @click="resetEmployeeQuery">
                  <i class="el-icon-refresh mr-5px" />重置
                </el-button>
                <el-button
                  v-if="isEditable"
                  v-hasPermi="['hrm:performance:plan:update']"
                  plain
                  type="primary"
                  @click="assessmentAddFormRef?.open(id)"
                >
                  <i class="el-icon-plus mr-5px" />添加员工
                </el-button>
                <el-button
                  v-if="isEditable"
                  v-hasPermi="['hrm:performance:plan:update']"
                  :disabled="!selectedEmployeeIds.length"
                  plain
                  type="danger"
                  @click="handleRemoveEmployees"
                >
                  <i class="el-icon-delete mr-5px" />移除员工
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card shadow="never">
            <div
              v-if="stageCountList.length"
              class="mb-12px flex flex-wrap gap-8px"
            >
              <el-tag
                v-for="item in stageCountList"
                :key="item.stageType"
                effect="plain"
              >
                {{
                  getDictLabel(DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS, item.stageType) || '未知阶段'
                }}（{{ item.count }}）
              </el-tag>
            </div>
            <el-table
              ref="employeeTableRef"
              v-loading="employeeLoading"
              :data="employeeList"
              row-key="id"
              @selection-change="handleEmployeeSelectionChange"
            >
              <el-table-column
                v-if="isEditable"
                type="selection"
                width="50"
              />
              <el-table-column
                label="员工姓名"
                prop="employeeName"
                min-width="130"
              >
                <template #default="scope">
                  <el-button
                    type="text"
                    @click="openAssessmentDetail(scope.row.id)"
                  >
                    {{ scope.row.employeeName || '-' }}
                  </el-button>
                </template>
              </el-table-column>
              <el-table-column
                label="工号"
                prop="jobNumber"
                min-width="120"
              />
              <el-table-column
                label="手机号"
                prop="mobile"
                min-width="130"
              />
              <el-table-column
                label="部门"
                prop="deptName"
                min-width="130"
                show-overflow-tooltip
              />
              <el-table-column
                align="center"
                label="聘用形式"
                width="100"
              >
                <template #default="scope">
                  <dict-tag
                    :type="DICT_TYPE.HRM_EMPLOYEE_TYPE"
                    :value="scope.row.employeeType"
                  />
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="员工状态"
                width="100"
              >
                <template #default="scope">
                  <dict-tag
                    :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
                    :value="scope.row.employeeStatus"
                  />
                </template>
              </el-table-column>
              <el-table-column
                align="center"
                label="阶段"
                width="120"
              >
                <template #default="scope">
                  <dict-tag
                    :type="DICT_TYPE.HRM_PERFORMANCE_STAGE_STATUS"
                    :value="scope.row.stageType"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="当前处理人"
                prop="currentHandlerName"
                min-width="120"
                show-overflow-tooltip
              />
              <el-table-column
                align="center"
                label="分数"
                prop="score"
                width="90"
              />
              <el-table-column
                align="center"
                label="等级"
                prop="resultLevel"
                width="90"
              />
              <el-table-column
                align="center"
                label="系数"
                prop="coefficient"
                width="90"
              />
            </el-table>
            <Pagination
              :page.sync="employeeQuery.pageNo"
              :limit.sync="employeeQuery.pageSize"
              :total="employeeTotal"
              @pagination="getEmployeeList"
            />
          </el-card>
        </el-tab-pane>
        <el-tab-pane
          label="操作日志"
          name="operateLog"
        >
          <el-card shadow="never">
            <el-timeline v-if="logList.length">
              <el-timeline-item
                v-for="(log, logIndex) in logList"
                :key="log.id || logIndex"
                :timestamp="formatDate(log.createTime)"
                placement="top"
              >
                <div class="flex items-center gap-8px">
                  <el-tag type="success">{{ log.userName || '-' }}</el-tag>
                  <span>{{ log.action || '-' }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty
              v-else
              description="暂无操作日志"
            />
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-col>

    <PerformancePlanAssessmentAddForm
      ref="assessmentAddFormRef"
      @success="getData"
    />
  </div>
</template>

<script>
import { Message, MessageBox } from 'element-ui'
import { ref, reactive, computed, onMounted, unref, getCurrentInstance } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { getOperateLogPage } from '@/api/hrm/operate-log'
import * as PerformancePlanApi from '@/api/hrm/performance/plan'
import * as PerformanceAssessmentApi from '@/api/hrm/performance/assessment'
import { HrmBizType, HrmPerformancePlanStatus } from '@/views/hrm/utils/constants'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import PerformancePlanAssessmentAddForm from '../PerformancePlanAssessmentAddForm.vue'
import PerformancePlanDetailsHeader from './PerformancePlanDetailsHeader.vue'
import PerformancePlanDetailsInfo from './PerformancePlanDetailsInfo.vue'
const RESULT_LEVEL_EMPTY_VALUE = '__RESULT_LEVEL_EMPTY__' // 未定级绩效结果的筛选哨兵值
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformancePlanDetail' },
  __name: 'index',
  components: { DeptSelect, PerformancePlanAssessmentAddForm, PerformancePlanDetailsHeader, PerformancePlanDetailsInfo },
  setup(__props, { expose: __expose }) {
    __expose()
    const route = getCurrentInstance().proxy.$route // 当前路由
    const message = {
      success: (text) => Message.success(text),
      warning: (text) => Message.warning(text),
      error: (text) => Message.error(text),
      confirm: (text) => MessageBox.confirm(text, '提示', { type: 'warning' }),
      delConfirm: (text = '是否确认删除所选数据项？') =>
        MessageBox.confirm(text, '提示', { type: 'warning' })
    } // 消息弹窗
    const __router = getCurrentInstance().proxy.$router
    const currentRoute = __router.currentRoute
    const push = (...args) => __router.push(...args) // 路由操作
    const __store = getCurrentInstance().proxy.$store
    const delView = (view) => __store.dispatch('tagsView/delView', view) // 页签操作
    const id = Number(route.params.id) // 绩效计划编号
    const loading = ref(false) // 详情加载中
    const employeeLoading = ref(false) // 参评员工加载中
    const plan = ref({ name: '' }) // 绩效计划
    const employeeList = ref([]) // 参评员工列表
    const employeeTotal = ref(0) // 参评员工总数
    const levelList = ref([]) // 结果等级列表
    const stageCountList = ref([]) // 阶段统计列表
    const selectedEmployeeIds = ref([]) // 选中的员工编号
    const logList = ref([]) // 操作日志列表
    const activeTab = ref(route.query.tab === 'employees' ? 'employees' : 'details') // 当前页签
    const assessmentAddFormRef = ref() // 新增考核表单 Ref
    const employeeQueryFormRef = ref() // 员工搜索表单 Ref
    const employeeTableRef = ref() // 员工表格 Ref
    const employeeQuery = reactive({
      pageNo: 1,
      pageSize: 10,
      planId: id,
      search: undefined,
      deptId: undefined,
      employeeType: undefined,
      employeeStatus: undefined,
      stageType: undefined,
      resultLevel: undefined,
      resultLevelEmpty: undefined
    })
    const resultLevelFilter = computed({
      get: () => employeeQuery.resultLevelEmpty ? RESULT_LEVEL_EMPTY_VALUE : employeeQuery.resultLevel,
      set: (value) => {
        employeeQuery.resultLevel = value && value !== RESULT_LEVEL_EMPTY_VALUE ? value : undefined
        employeeQuery.resultLevelEmpty = value === RESULT_LEVEL_EMPTY_VALUE ? true : undefined
      }
    })
    const isEditable = computed(() => plan.value.status === HrmPerformancePlanStatus.DRAFT ||
            plan.value.status === HrmPerformancePlanStatus.NOT_STARTED)
    const showMoreActions = computed(() => isEditable.value || plan.value.status === HrmPerformancePlanStatus.RUNNING)
    /** 关闭详情 */
    function close() {
      delView(unref(currentRoute))
      push({ name: 'HrmPerformancePlan' })
    }
    /** 打开 KPI 考核表单 */
    function openForm() {
      push({
        name: 'HrmPerformancePlanForm',
        query: { type: 'update', id }
      })
    }
    /** 查看 KPI 考核设置 */
    function openSettings() {
      push({
        name: 'HrmPerformancePlanForm',
        query: { type: 'view', id }
      })
    }
    /** 打开员工考核详情 */
    function openAssessmentDetail(assessmentId) {
      if (!assessmentId) {
        return
      }
      push({
        name: 'HrmPerformanceAssessmentDetail',
        params: { id: assessmentId },
        query: { planId: id }
      })
    }
    /** 获得计划详情 */
    async function getPlan() {
      loading.value = true
      try {
        const { data } = await PerformancePlanApi.getPerformancePlan(id)
        if (!data) {
          close()
          return
        }
        plan.value = data
      } finally {
        loading.value = false
      }
    }
    /** 获得参评员工 */
    async function getEmployeeList() {
      employeeLoading.value = true
      try {
        const { data } = await PerformanceAssessmentApi.getPerformanceAssessmentPage(employeeQuery)
        employeeList.value = data.list
        employeeTotal.value = data.total
        selectedEmployeeIds.value = []
                employeeTableRef.value?.clearSelection()
      } finally {
        employeeLoading.value = false
      }
    }
    /** 获得参评员工统计 */
    async function getEmployeeStatistics() {
      const [stageCountResponse, levelCountResponse] = await Promise.all([
        PerformancePlanApi.getPerformancePlanStageCount(id),
        PerformancePlanApi.getPerformancePlanLevelCount(id)
      ])
      const stageCounts = stageCountResponse.data
      const levelCounts = levelCountResponse.data
      stageCountList.value = stageCounts
      levelList.value = levelCounts
        .map((item) => item.levelName)
        .filter((levelName) => !!levelName)
    }
    /** 获得操作日志 */
    async function getOperateLog() {
      const { data } = await getOperateLogPage({
        bizType: HrmBizType.PERFORMANCE_PLAN,
        bizId: id
      })
      logList.value = data.list
    }
    /** 刷新详情 */
    async function getData() {
      await Promise.all([getPlan(), getEmployeeList(), getEmployeeStatistics(), getOperateLog()])
    }
    /** 搜索参评员工 */
    function handleEmployeeQuery() {
      employeeQuery.pageNo = 1
      getEmployeeList()
    }
    /** 重置参评员工搜索 */
    function resetEmployeeQuery() {
            employeeQueryFormRef.value?.resetFields()
            resultLevelFilter.value = undefined
            handleEmployeeQuery()
    }
    /** 处理参评员工选择 */
    function handleEmployeeSelectionChange(rows) {
      selectedEmployeeIds.value = rows
        .map((row) => row.employeeId)
        .filter((employeeId) => !!employeeId)
    }
    /** 移除参评员工 */
    async function handleRemoveEmployees() {
      try {
        await message.confirm(`确认移除选中的 ${selectedEmployeeIds.value.length} 名参评员工？`)
      } catch (error) {
        return
      }
      await PerformanceAssessmentApi.removePerformancePlanEmployees({
        planId: id,
        employeeIds: selectedEmployeeIds.value
      })
      message.success('参评员工移除成功')
      await getData()
    }
    /** 执行计划生命周期操作 */
    async function handleAction(action) {
      const actionName = {
        start: '启动计划',
        open: '开启评分',
        interview: '发起绩效面谈',
        archive: '归档计划',
        terminate: '终止计划'
      }[action]
      try {
        await message.confirm(`确认${actionName}？`)
      } catch (error) {
        return
      }
      if (action === 'start') {
        await PerformancePlanApi.startPerformancePlan(id)
      } else if (action === 'open') {
        await PerformancePlanApi.openPerformancePlanScoring(id)
      } else if (action === 'interview') {
        await PerformancePlanApi.startPerformancePlanInterview(id)
      } else if (action === 'archive') {
        await PerformancePlanApi.archivePerformancePlan(id)
      } else {
        await PerformancePlanApi.terminatePerformancePlan(id)
      }
      message.success('修改成功')
      if (action === 'terminate') {
        close()
        return
      }
      await getData()
    }
    /** 删除绩效计划 */
    async function handleDelete() {
      try {
        await message.delConfirm()
      } catch (error) {
        return
      }
      await PerformancePlanApi.deletePerformancePlan(id)
      message.success('删除成功')
      close()
    }
    /** 初始化 */
    onMounted(() => {
      getData()
    })
    const __returned__ = { RESULT_LEVEL_EMPTY_VALUE, route, message, currentRoute, push, delView, id, loading, employeeLoading, plan, employeeList, employeeTotal, levelList, stageCountList, selectedEmployeeIds, logList, activeTab, assessmentAddFormRef, employeeQueryFormRef, employeeTableRef, employeeQuery, resultLevelFilter, isEditable, showMoreActions, close, openForm, openSettings, openAssessmentDetail, getPlan, getEmployeeList, getEmployeeStatistics, getOperateLog, getData, handleEmployeeQuery, resetEmployeeQuery, handleEmployeeSelectionChange, handleRemoveEmployees, handleAction, handleDelete, get DICT_TYPE() { return DICT_TYPE }, get getDictLabel() { return getDictLabel }, get getIntDictOptions() { return getIntDictOptions }, get formatDate() { return formatDate }, get HrmPerformancePlanStatus() { return HrmPerformancePlanStatus }, DeptSelect, PerformancePlanAssessmentAddForm, PerformancePlanDetailsHeader, PerformancePlanDetailsInfo }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
