<template>
  <div class="hrm-performance-page">
    <doc-alert
      title="【绩效】绩效考核、绩效档案"
      url="https://doc.iocoder.cn/hrm/performance/assessment/"
    />

    <el-card shadow="never">
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item
          label="员工"
          prop="search"
        >
          <el-input
            v-model="queryParams.search"
            class="!w-240px"
            clearable
            placeholder="请输入员工姓名或工号"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-button
        v-hasPermi="['hrm:performance:archive:delete']"
        type="danger"
        plain
        :disabled="!selectedEmployeeIds.length"
        @click="handleDelete(selectedEmployeeIds)"
      >
        <i class="el-icon-delete mr-5px" /> 批量删除
      </el-button>
      <el-table
        v-loading="loading"
        class="mt-12px"
        :data="list"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="46"
        />
        <el-table-column
          label="员工姓名"
          prop="employeeName"
          min-width="130"
          fixed="left"
        >
          <template #default="scope">
            <el-button
              type="text"
              @click="openDetail(scope.row.employeeId)"
            >
              {{ scope.row.employeeName }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="工号"
          prop="jobNumber"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="部门"
          prop="deptName"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="职位"
          prop="postName"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column
          label="手机号"
          prop="mobile"
          width="130"
        />
        <el-table-column
          label="员工状态"
          align="center"
          width="100"
        >
          <template #default="scope">
            <dict-tag
              v-if="scope.row.employeeStatus != null"
              :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
              :value="scope.row.employeeStatus"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          label="最近考核计划"
          prop="latestPlanName"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column
          label="最近绩效评分"
          align="center"
          prop="latestScore"
          width="120"
        />
        <el-table-column
          label="最近绩效等级"
          align="center"
          prop="latestResultLevel"
          width="120"
        />
        <el-table-column
          label="考核次数"
          align="center"
          prop="assessmentCount"
          width="100"
        />
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
import { DICT_TYPE } from '@/utils/dict'
import * as PerformanceAssessmentApi from '@/api/hrm/performance/assessment'
export default /* @__PURE__*/ _defineComponent({
  ...{ name: 'HrmPerformanceAssessment' },
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
    const loading = ref(false) // 加载中
    const total = ref(0) // 列表总数
    const list = ref([]) // 列表数据
    const selectedRows = ref([]) // 选中的数据
    const selectedEmployeeIds = computed(() => selectedRows.value.map((row) => row.employeeId)) // 选中的员工编号
    const queryFormRef = ref() // 搜索表单 Ref
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      search: undefined
    })
    /** 查询绩效档案列表 */
    async function getList() {
      loading.value = true
      try {
        const { data } = await PerformanceAssessmentApi.getPerformanceArchiveEmployeePage(queryParams)
        list.value = data.list
        total.value = data.total
        selectedRows.value = []
      } finally {
        loading.value = false
      }
    }
    /** 搜索 */
    function handleQuery() {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置搜索 */
    function resetQuery() {
      queryFormRef.value.resetFields()
      handleQuery()
    }
    /** 选择员工 */
    function handleSelectionChange(rows) {
      selectedRows.value = rows
    }
    /** 打开员工绩效档案详情 */
    function openDetail(employeeId) {
      push({ name: 'HrmPerformanceAssessmentEmployee', params: { employeeId }})
    }
    /** 删除员工的全部绩效档案 */
    async function handleDelete(employeeIds) {
      if (!employeeIds.length) {
        return
      }
      try {
        await message.delConfirm()
      } catch (error) {
        return
      }
      await PerformanceAssessmentApi.deletePerformanceArchiveEmployeeRecords(employeeIds)
      message.success('删除成功')
      await getList()
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    const __returned__ = { message, push, loading, total, list, selectedRows, selectedEmployeeIds, queryFormRef, queryParams, getList, handleQuery, resetQuery, handleSelectionChange, openDetail, handleDelete, get DICT_TYPE() { return DICT_TYPE } }
    Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true })
    return __returned__
  }
})
</script>

<style lang="scss">
@import "~@/views/hrm/performance/styles.scss";
</style>
