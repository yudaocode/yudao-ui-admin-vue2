<template>
  <div class="hrm-performance-page">
    <doc-alert
      title="【绩效】绩效考核、绩效档案"
      url="https://doc.iocoder.cn/hrm/performance/assessment/"
    />

    <el-card shadow="never">
      <div class="mb-16px flex items-center justify-between">
        <div class="flex items-center gap-12px">
          <el-button
            title="返回"
            type="text"
            @click="close"
          >
            <i class="el-icon-arrow-left" />
          </el-button>
          <el-avatar :size="44">{{ employee.employeeName?.slice(0, 1) }}</el-avatar>
          <div class="text-20px font-600">{{ employee.employeeName || '-' }}的绩效档案</div>
        </div>
        <el-button
          v-hasPermi="['hrm:performance:archive:delete']"
          type="danger"
          plain
          :disabled="!selectedIds.length"
          @click="handleDelete(selectedIds)"
        >
          <i class="el-icon-delete mr-5px" /> 批量删除
        </el-button>
      </div>
      <el-descriptions
        :column="4"
        border
        class="mb-16px"
      >
        <el-descriptions-item label="部门">{{ employee.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="职位">{{ employee.postName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工号">{{ employee.jobNumber || '-' }}</el-descriptions-item>
        <el-descriptions-item label="聘用形式">
          <dict-tag
            v-if="employee.employeeType != null"
            :type="DICT_TYPE.HRM_EMPLOYEE_TYPE"
            :value="employee.employeeType"
          />
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <el-form
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item label="考核计划">
          <el-select
            v-model="queryParams.planId"
            class="!w-260px"
            clearable
            filterable
            placeholder="请选择考核计划"
            @change="handleQuery"
          >
            <el-option
              v-for="plan in planList"
              :key="plan.id"
              :label="plan.name"
              :value="plan.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="46"
        />
        <el-table-column
          label="考核方案名称"
          prop="name"
          min-width="180"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="openAssessmentDetail(scope.row.id)"
            >
              {{ scope.row.name || '-' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="考核周期类型"
          align="center"
          width="120"
        >
          <template #default="scope">
            {{ formatHrmPerformanceCycleType(scope.row.cycleType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核周期"
          prop="cycle"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column
          label="考核状态"
          align="center"
          width="100"
        >
          <template #default><el-tag type="info">已归档</el-tag></template>
        </el-table-column>
        <el-table-column
          label="评分"
          align="center"
          prop="score"
          width="90"
        />
        <el-table-column
          label="考核结果"
          align="center"
          prop="resultLevel"
          width="100"
        />
        <el-table-column
          label="操作"
          align="center"
          width="110"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              v-hasPermi="['hrm:performance:archive:delete']"

              type="text"
              @click="handleDelete([scope.row.id])"
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
import { ref, reactive, computed, onMounted, unref, getCurrentInstance } from 'vue'
import { defineComponent as _defineComponent } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import * as PerformanceAssessmentApi from '@/api/hrm/performance/assessment'
import { formatHrmPerformanceCycleType } from '@/views/hrm/utils/format'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessmentEmployee' },
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
    const route = getCurrentInstance().proxy.$route // 当前路由
    const proxy = getCurrentInstance().proxy // 组件实例（setup 外异步调用时 getCurrentInstance() 为 null，需提前捕获）
    const __router = getCurrentInstance().proxy.$router
    const currentRoute = __router.currentRoute
    const push = (...args) => __router.push(...args) // 路由操作
    const delView = (view) => proxy.$store.dispatch('tagsView/delView', view) // 页签操作
    const employeeId = Number(route.params.employeeId) // 员工编号
    const loading = ref(false) // 加载中
    const total = ref(0) // 列表总数
    const list = ref([]) // 列表数据
    const planList = ref([]) // 绩效计划列表
    const employee = ref({
      employeeId,
      employeeName: '',
      assessmentCount: 0
    })
    const selectedRows = ref([]) // 选中的数据
    const selectedIds = computed(() => selectedRows.value.map((row) => row.id).filter((id) => id !== undefined))
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      employeeId,
      planId: undefined
    })
    /** 关闭员工绩效档案 */
    function close() {
      delView(unref(currentRoute))
      push('/hrm/performance/assessment')
    }
    /** 查询员工考核记录 */
    async function getList() {
      loading.value = true
      try {
        const { data } = await PerformanceAssessmentApi.getPerformanceAssessmentArchivePage(queryParams)
        list.value = data.list
        total.value = data.total
        const assessment = data.list[0]
        if (assessment) {
          employee.value.employeeName = assessment.employeeName || ''
          employee.value.jobNumber = assessment.jobNumber
          employee.value.deptName = assessment.deptName
          employee.value.postName = assessment.postName
          employee.value.employeeType = assessment.employeeType
          employee.value.assessmentCount = data.total
        }
        selectedRows.value = []
      } finally {
        loading.value = false
      }
    }
    /** 查询归档计划 */
    async function getPlanList() {
      planList.value = (await PerformanceAssessmentApi.getPerformanceArchivePlanSimpleList()).data
    }
    /** 搜索 */
    function handleQuery() {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置搜索 */
    function resetQuery() {
      queryParams.planId = undefined
      handleQuery()
    }
    /** 打开单次考核详情 */
    function openAssessmentDetail(id) {
      if (!id) {
        return
      }
      push({
        name: 'HrmPerformanceAssessmentDetail',
        params: { id },
        query: { employeeId, archived: 'true' }
      })
    }
    /** 选择考核记录 */
    function handleSelectionChange(rows) {
      selectedRows.value = rows
    }
    /** 删除考核记录 */
    async function handleDelete(ids) {
      if (!ids.length) {
        return
      }
      try {
        await message.delConfirm()
      } catch (error) {
        return
      }
      await PerformanceAssessmentApi.deletePerformanceArchiveRecords(ids)
      message.success('删除成功')
      await getList()
      if (!total.value) {
        close()
      }
    }
    /** 初始化 */
    onMounted(() => {
      Promise.all([getList(), getPlanList()])
    })
    const __returned__ = { message, route, currentRoute, push, delView, employeeId, loading, total, list, planList, employee, selectedRows, selectedIds, queryParams, close, getList, getPlanList, handleQuery, resetQuery, openAssessmentDetail, handleSelectionChange, handleDelete, get DICT_TYPE() { return DICT_TYPE }, get formatHrmPerformanceCycleType() { return formatHrmPerformanceCycleType } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
