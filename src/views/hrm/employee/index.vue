<template>
  <div class="app-container hrm-employee-page">
    <doc-alert
      title="【员工】员工管理"
      url="https://doc.iocoder.cn/hrm/employee/"
    />
    <el-card
      shadow="never"
      class="search-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="82px"
        @submit.native.prevent
      >
        <el-form-item
          label="员工姓名"
          prop="name"
        ><el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入员工姓名"
          class="query-field"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        ><el-input
          v-model="queryParams.mobile"
          clearable
          placeholder="请输入手机号"
          class="query-field"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="性别"
          prop="sex"
        ><el-select
          v-model="queryParams.sex"
          clearable
          placeholder="请选择性别"
          class="query-field"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item>
        <el-form-item
          label="入职时间"
          prop="entryTime"
        ><el-date-picker
          v-model="queryParams.entryTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="query-range"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="工号"
          prop="jobNumber"
        ><el-input
          v-model="queryParams.jobNumber"
          clearable
          placeholder="请输入工号"
          class="query-field"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="部门"
          prop="deptId"
        ><dept-select
          v-model="queryParams.deptId"
          class="query-field"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="岗位"
          prop="postName"
        ><el-input
          v-model="queryParams.postName"
          clearable
          placeholder="请输入岗位"
          class="query-field"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="转正时间"
          prop="regularTime"
        ><el-date-picker
          v-model="queryParams.regularTime"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="query-range"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="工作地点"
          prop="workAddress"
        ><el-input
          v-model="queryParams.workAddress"
          clearable
          placeholder="请输入工作地点"
          class="query-field"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="招聘渠道"
          prop="channelId"
        ><recruit-channel-select
          v-model="queryParams.channelId"
          class="query-field"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="聘用形式"
          prop="type"
        ><el-select
          v-model="queryParams.type"
          clearable
          placeholder="请选择聘用形式"
          class="query-field"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.HRM_EMPLOYEE_TYPE)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button><el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            type="text"
            @click="showMoreQuery = !showMoreQuery"
          ><i :class="showMoreQuery ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" /> {{ showMoreQuery ? '收起' : '展开' }}</el-button>
          <el-button
            v-hasPermi="['hrm:employee:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-button
            v-hasPermi="['hrm:employee:create']"
            type="primary"
            plain
            icon="el-icon-user-solid"
            @click="openCreateFromUser"
          >从后台用户建档</el-button>
          <el-button
            v-hasPermi="['hrm:employee:import']"
            type="warning"
            plain
            icon="el-icon-upload2"
            @click="handleImport"
          >导入</el-button>
          <el-button
            v-hasPermi="['hrm:employee:export']"
            type="success"
            plain
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExport"
          >导出</el-button>
          <el-dropdown
            v-if="canBatchOperate"
            :disabled="checkedIds.length === 0"
            class="batch-dropdown"
            @command="handleBatchCommand"
          ><el-button
            :disabled="checkedIds.length === 0"
            :loading="batchDeleteLoading"
            plain
            type="primary"
          ><i class="el-icon-operation" /> 批量操作<i class="el-icon-arrow-down el-icon--right" /></el-button><el-dropdown-menu slot="dropdown"><el-dropdown-item
            v-if="checkPermi(['hrm:insurance:employee-info:update'])"
            command="insurance-scheme"
          >设置参保方案</el-dropdown-item><el-dropdown-item
            v-if="checkPermi(['hrm:employee:delete'])"
            command="delete"
          >批量删除</el-dropdown-item><el-dropdown-item
            v-if="checkPermi(['hrm:employee:update'])"
            command="send-profile-fill-message"
          >发送填写档案通知</el-dropdown-item></el-dropdown-menu></el-dropdown>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <el-tabs
        v-model="activeStatus"
        @tab-click="handleStatusTabClick"
      ><el-tab-pane
        v-for="item in statusTabOptions"
        :key="item.value"
        :name="item.value"
      ><span slot="label">{{ item.label }} <span class="tab-count">（{{ item.count }}）</span></span></el-tab-pane></el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="50"
        />
        <el-table-column
          label="员工姓名"
          align="center"
          prop="name"
          fixed="left"
          min-width="120"
        ><template slot-scope="scope"><el-link
          type="primary"
          :underline="false"
          @click="openDetail(scope.row.id)"
        >{{ scope.row.name }}</el-link></template></el-table-column>
        <el-table-column
          label="手机号"
          align="center"
          prop="mobile"
          min-width="130"
        /><el-table-column
          label="招聘渠道"
          align="center"
          prop="channelName"
          min-width="120"
        ><template slot-scope="scope">{{ scope.row.channelName || '-' }}</template></el-table-column>
        <el-table-column
          label="性别"
          align="center"
          prop="sex"
          width="80"
        ><template slot-scope="scope"><dict-tag
          v-if="scope.row.sex != null"
          :type="DICT_TYPE.SYSTEM_USER_SEX"
          :value="scope.row.sex"
        /><span v-else>-</span></template></el-table-column>
        <el-table-column
          label="入职时间"
          align="center"
          prop="entryTime"
          width="180"
          :formatter="dateFormatter"
        /><el-table-column
          label="部门"
          align="center"
          prop="deptName"
          min-width="120"
        /><el-table-column
          label="工号"
          align="center"
          prop="jobNumber"
          min-width="120"
        /><el-table-column
          label="岗位"
          align="center"
          prop="postName"
          min-width="130"
        /><el-table-column
          label="直属上级"
          align="center"
          prop="leaderEmployeeName"
          min-width="120"
        />
        <el-table-column
          label="聘用形式"
          align="center"
          prop="type"
          width="100"
        ><template slot-scope="scope"><dict-tag
          v-if="scope.row.type != null"
          :type="DICT_TYPE.HRM_EMPLOYEE_TYPE"
          :value="scope.row.type"
        /><span v-else>-</span></template></el-table-column>
        <el-table-column
          label="员工状态"
          align="center"
          prop="status"
          width="100"
        ><template slot-scope="scope"><dict-tag
          v-if="scope.row.status != null"
          :type="DICT_TYPE.HRM_EMPLOYEE_STATUS"
          :value="scope.row.status"
        /><span v-else>-</span></template></el-table-column>
        <el-table-column
          label="入职状态"
          align="center"
          prop="entryStatus"
          width="100"
        ><template slot-scope="scope"><dict-tag
          v-if="scope.row.entryStatus != null"
          :type="DICT_TYPE.HRM_EMPLOYEE_ENTRY_STATUS"
          :value="scope.row.entryStatus"
        /><span v-else>-</span></template></el-table-column>
        <el-table-column
          label="转正时间"
          align="center"
          prop="regularTime"
          width="180"
          :formatter="dateFormatter"
        /><el-table-column
          label="工作地点"
          align="center"
          prop="workAddress"
          min-width="140"
        /><el-table-column
          label="银行卡号"
          align="center"
          prop="salaryCardNumber"
          min-width="170"
        /><el-table-column
          label="开户地区"
          align="center"
          prop="salaryCardAreaName"
          min-width="180"
        /><el-table-column
          label="银行名称"
          align="center"
          prop="salaryCardBankName"
          min-width="140"
        /><el-table-column
          label="开户支行"
          align="center"
          prop="salaryCardBankBranchName"
          min-width="160"
        /><el-table-column
          label="个人社保账号"
          align="center"
          prop="socialSecurityNumber"
          min-width="150"
        /><el-table-column
          label="个人公积金账号"
          align="center"
          prop="accumulationFundNumber"
          min-width="160"
        />
        <el-table-column
          label="操作"
          align="center"
          width="140"
          fixed="right"
        ><template slot-scope="scope"><el-button
          v-hasPermi="['hrm:employee:update']"
          type="text"
          @click="openForm('update', scope.row.id)"
        >编辑</el-button><el-dropdown
          v-if="getEmployeeMoreActions(scope.row).length"
          class="more-dropdown"
          @command="handleMoreCommand($event, scope.row)"
        ><el-button type="text">更多</el-button><el-dropdown-menu slot="dropdown"><el-dropdown-item
          v-for="(action, index) in getEmployeeMoreActions(scope.row)"
          :key="action.command"
          :command="action.command"
          :divided="index > 0 && action.command === 'delete'"
        >{{ action.label }}</el-dropdown-item></el-dropdown-menu></el-dropdown></template></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
    <employee-form
      ref="form"
      @success="handleEmployeeChanged"
    /><employee-create-from-user-form
      ref="createFromUserForm"
      @success="handleEmployeeChanged"
    /><employee-import-form
      ref="importForm"
      @success="handleEmployeeChanged"
    /><employee-regular-form
      ref="regularForm"
      @success="handleEmployeeChanged"
    /><employee-transfer-form
      ref="transferForm"
      @success="handleEmployeeChanged"
    /><employee-promote-form
      ref="promoteForm"
      @success="handleEmployeeChanged"
    /><employee-demote-form
      ref="demoteForm"
      @success="handleEmployeeChanged"
    /><employee-full-time-form
      ref="fullTimeForm"
      @success="handleEmployeeChanged"
    /><employee-quit-form
      ref="quitForm"
      @success="handleEmployeeChanged"
    /><employee-insurance-scheme-form
      ref="insuranceSchemeForm"
      @success="handleEmployeeChanged"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDataLabel, getIntDictOptions } from '@/utils/dict'
import download from '@/plugins/download'
import { dateFormatter } from '@/utils'
import { checkPermi } from '@/utils/permission'
import * as EmployeeApi from '@/api/hrm/employee'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import RecruitChannelSelect from '@/views/hrm/recruit/channel/components/RecruitChannelSelect.vue'
import { HrmEmployeeEntryStatus, HrmEmployeeStatus, HrmEmployeeStatusTab, HrmEmployeeSurveyType, HrmEmployeeTodoType } from '@/views/hrm/utils/constants'
import EmployeeDemoteForm from './EmployeeDemoteForm.vue'
import EmployeeCreateFromUserForm from './EmployeeCreateFromUserForm.vue'
import EmployeeForm from './EmployeeForm.vue'
import EmployeeFullTimeForm from './EmployeeFullTimeForm.vue'
import EmployeeImportForm from './EmployeeImportForm.vue'
import EmployeePromoteForm from './EmployeePromoteForm.vue'
import EmployeeQuitForm from './EmployeeQuitForm.vue'
import EmployeeRegularForm from './EmployeeRegularForm.vue'
import EmployeeTransferForm from './EmployeeTransferForm.vue'
import EmployeeInsuranceSchemeForm from './EmployeeInsuranceSchemeForm.vue'

export default {
  name: 'HrmEmployee',
  components: { DeptSelect, RecruitChannelSelect, EmployeeDemoteForm, EmployeeCreateFromUserForm, EmployeeForm, EmployeeFullTimeForm, EmployeeImportForm, EmployeePromoteForm, EmployeeQuitForm, EmployeeRegularForm, EmployeeTransferForm, EmployeeInsuranceSchemeForm },
  data() {
    return {
      DICT_TYPE, loading: true, total: 0, list: [], statusCounts: [], activeStatus: String(HrmEmployeeStatusTab.FULL_TIME), showMoreQuery: false, checkedIds: [], checkedEmployees: [], exportLoading: false, batchDeleteLoading: false,
      queryParams: { pageNo: 1, pageSize: 10, name: undefined, mobile: undefined, sex: undefined, entryTime: undefined, jobNumber: undefined, deptId: undefined, leaderEmployeeId: undefined, postName: undefined, regularTime: undefined, workAddress: undefined, channelId: undefined, type: undefined, entryStatus: undefined, status: undefined, statusCategory: HrmEmployeeStatusTab.FULL_TIME, surveyType: undefined, todoType: undefined },
      statusItems: [
        { status: HrmEmployeeStatusTab.ACTIVE, label: '在职' }, { status: HrmEmployeeStatusTab.FULL_TIME, label: '全职' },
        { status: HrmEmployeeStatus.INTERN, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.INTERN) }, { status: HrmEmployeeStatus.LABOR, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.LABOR) }, { status: HrmEmployeeStatus.CONSULTANT, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.CONSULTANT) }, { status: HrmEmployeeStatus.REHIRE, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.REHIRE) }, { status: HrmEmployeeStatus.OUTSOURCE, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.OUTSOURCE) }, { status: HrmEmployeeStatus.PART_TIME, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.PART_TIME) }, { status: HrmEmployeeStatus.PROBATION, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.PROBATION) }, { status: HrmEmployeeStatus.REGULAR, label: getDictDataLabel(DICT_TYPE.HRM_EMPLOYEE_STATUS, HrmEmployeeStatus.REGULAR) },
        { status: HrmEmployeeStatusTab.PENDING_ENTRY, label: '待入职' }, { status: HrmEmployeeStatusTab.PENDING_LEAVE, label: '待离职' }, { status: HrmEmployeeStatusTab.LEFT, label: '已离职' }
      ]
    }
  },
  computed: {
    statusTabOptions() { const countMap = Object.fromEntries(this.statusCounts.map(item => [item.status, item.count])); return this.statusItems.map(item => ({ label: item.label, value: String(item.status), count: countMap[item.status] || 0 })) },
    canBatchOperate() { return checkPermi(['hrm:insurance:employee-info:update', 'hrm:employee:delete', 'hrm:employee:update']) }
  },
  created() { this.applyHomeFilter(); this.refreshList() },
  methods: {
    getIntDictOptions, checkPermi, dateFormatter,
    async getList() { this.loading = true; try { const response = await EmployeeApi.getEmployeePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    async getStatusCounts() { const response = await EmployeeApi.getEmployeeStatusCount(this.queryParams); this.statusCounts = response.data },
    async refreshList() { await Promise.all([this.getList(), this.getStatusCounts()]) },
    handleQuery() { this.queryParams.pageNo = 1; this.checkedIds = []; this.refreshList() },
    resetQuery() { if (this.$refs.queryForm) this.$refs.queryForm.resetFields(); this.activeStatus = String(HrmEmployeeStatusTab.ACTIVE); this.queryParams.statusCategory = HrmEmployeeStatusTab.ACTIVE; this.queryParams.surveyType = undefined; this.queryParams.todoType = undefined; this.handleQuery() },
    handleStatusTabClick(tab) { if (tab.name === undefined) return; this.queryParams.statusCategory = Number(tab.name); this.queryParams.entryStatus = undefined; this.queryParams.status = undefined; this.queryParams.surveyType = undefined; this.queryParams.todoType = undefined; this.handleQuery() },
    applyHomeFilter() { this.queryParams.statusCategory = HrmEmployeeStatusTab.FULL_TIME; this.queryParams.surveyType = undefined; this.queryParams.todoType = undefined; this.activeStatus = String(HrmEmployeeStatusTab.FULL_TIME); const category = Number(this.$route.query.statusCategory); if (Object.values(HrmEmployeeStatusTab).includes(category)) { this.queryParams.statusCategory = category; this.activeStatus = String(category) } const surveyType = Number(this.$route.query.surveyType); this.queryParams.surveyType = Object.values(HrmEmployeeSurveyType).includes(surveyType) ? surveyType : undefined; if (this.queryParams.surveyType) { let surveyCategory; if (surveyType === HrmEmployeeSurveyType.LEAVE) surveyCategory = HrmEmployeeStatusTab.LEFT; else if (surveyType === HrmEmployeeSurveyType.PENDING_ENTRY) surveyCategory = HrmEmployeeStatusTab.PENDING_ENTRY; else if (surveyType === HrmEmployeeSurveyType.PENDING_LEAVE) surveyCategory = HrmEmployeeStatusTab.PENDING_LEAVE; this.queryParams.statusCategory = surveyCategory; this.activeStatus = surveyCategory ? String(surveyCategory) : '' } const todoType = Number(this.$route.query.todoType); this.queryParams.todoType = Object.values(HrmEmployeeTodoType).includes(todoType) ? todoType : undefined; const leaderId = Number(this.$route.query.leaderEmployeeId); this.queryParams.leaderEmployeeId = Number.isSafeInteger(leaderId) && leaderId > 0 ? leaderId : undefined },
    openDetail(id) { if (id !== undefined) this.$router.push({ name: 'HrmEmployeeDetail', params: { id }}) }, openForm(type, id) { this.$refs.form.open(type, id) }, openCreateFromUser() { this.$refs.createFromUserForm.open() }, handleImport() { this.$refs.importForm.open() }, openRehire(id) { if (id !== undefined) this.$refs.form.open('rehire', id) }, openQuit(employee) { this.$refs.quitForm.open(employee) },
    getEmployeeMoreActions(employee) { const actions = []; if (checkPermi(['hrm:insurance:employee-info:update']) && this.isEmployeeInsuranceEligible(employee)) actions.push({ command: 'insurance-scheme', label: '设置参保方案' }); if (checkPermi(['hrm:employee:update'])) { if (employee.entryStatus === HrmEmployeeEntryStatus.PENDING_ENTRY) actions.push({ command: 'confirm-entry', label: '确认入职' }); else if (employee.entryStatus === HrmEmployeeEntryStatus.LEFT) actions.push({ command: 'rehire', label: '办理再入职' }, { command: 'quit', label: '修改离职信息' }); else if ([HrmEmployeeEntryStatus.ACTIVE, HrmEmployeeEntryStatus.PENDING_LEAVE].includes(employee.entryStatus)) { if (employee.status === HrmEmployeeStatus.PROBATION) actions.push({ command: 'regular', label: '办理转正' }); actions.push({ command: 'transfer', label: '调整部门/岗位' }, { command: 'promotion', label: '晋升' }, { command: 'demotion', label: '降级' }); if ([HrmEmployeeStatus.INTERN, HrmEmployeeStatus.PART_TIME].includes(employee.status)) actions.push({ command: 'full-time', label: '转为全职' }); actions.push(employee.entryStatus === HrmEmployeeEntryStatus.ACTIVE ? { command: 'quit', label: '办理离职' } : { command: 'cancel-quit', label: '取消离职' }) } } if (checkPermi(['hrm:employee:delete'])) actions.push({ command: 'delete', label: '删除' }); return actions },
    async handleMoreCommand(command, employee) { if (!employee.id) return; const refs = { regular: 'regularForm', transfer: 'transferForm', promotion: 'promoteForm', demotion: 'demoteForm', 'full-time': 'fullTimeForm' }; if (command === 'insurance-scheme') return this.$refs.insuranceSchemeForm.open([employee.id]); if (refs[command]) return this.$refs[refs[command]].open(employee); if (command === 'confirm-entry') return this.$refs.form.open('confirm', employee.id); if (command === 'rehire') return this.openRehire(employee.id); if (command === 'quit') return this.openQuit(employee); if (command === 'cancel-quit') { try { const result = await this.$prompt(`请输入取消员工“${employee.name}”离职安排的原因`, '取消离职', { inputValidator: reason => !reason || !reason.trim() ? '取消原因不能为空' : reason.length <= 500 || '取消原因不能超过 500 个字符' }); await EmployeeApi.cancelEmployeeQuit({ employeeId: employee.id, reason: result.value }); this.$modal.msgSuccess('已取消离职'); await this.handleEmployeeChanged() } catch (error) {} return } if (command === 'delete') await this.handleDelete(employee.id) },
    async handleEmployeeChanged() { this.checkedIds = []; this.checkedEmployees = []; await this.refreshList() }, handleSelectionChange(rows) { this.checkedEmployees = rows; this.checkedIds = rows.map(row => row.id).filter(id => id !== undefined) },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有员工档案数据项?'); this.exportLoading = true; const response = await EmployeeApi.exportEmployee(this.queryParams); download.excel(response, '员工档案.xlsx') } catch (error) {} finally { this.exportLoading = false } },
    async handleDelete(id) { if (id === undefined) return; try { await this.$modal.confirm('是否确认删除该员工档案?'); await EmployeeApi.deleteEmployee(id); this.$modal.msgSuccess(this.$t('common.delSuccess')); await this.handleEmployeeChanged() } catch (error) {} },
    async handleBatchDelete() { if (!this.checkedIds.length) return; const ids = [...this.checkedIds]; try { await this.$confirm(`确定删除选中的 ${ids.length} 份员工档案吗？已绑定的后台账号及历史业务记录将保留。`, '批量删除员工', { type: 'warning' }); this.batchDeleteLoading = true; await EmployeeApi.deleteEmployeeList(ids); this.$modal.msgSuccess(this.$t('common.delSuccess')); await this.handleEmployeeChanged() } catch (error) {} finally { this.batchDeleteLoading = false } },
    async handleBatchCommand(command) { if (command === 'insurance-scheme') { const eligible = this.checkedEmployees.filter(this.isEmployeeInsuranceEligible); if (eligible.length !== this.checkedEmployees.length) return this.$modal.msgWarning('只能为正式或试用且未离职的员工设置参保方案'); this.$refs.insuranceSchemeForm.open(eligible.map(item => item.id).filter(id => id !== undefined)); return } if (command === 'delete') return this.handleBatchDelete(); if (command === 'send-profile-fill-message') await this.handleSendArchiveFillMessage() },
    async handleSendArchiveFillMessage() { if (!this.checkedIds.length) return; try { await this.$confirm(`确定向选中的 ${this.checkedIds.length} 名员工发送填写档案通知吗？`, '发送填写档案通知', { type: 'info' }); const response = await EmployeeApi.sendEmployeeProfileFillMessage([...this.checkedIds]); const result = response.data; this.$modal.msgSuccess(`通知发送完成：成功 ${result.successCount} 人，跳过 ${result.skippedCount} 人，失败 ${result.failureCount} 人`) } catch (error) {} },
    isEmployeeInsuranceEligible(employee) { return [HrmEmployeeStatus.REGULAR, HrmEmployeeStatus.PROBATION].includes(employee.status) && employee.entryStatus !== HrmEmployeeEntryStatus.LEFT }
  }
}
</script>

<style scoped>.search-card { margin-bottom: 16px; }.query-field { width: 220px; }.query-range { width: 360px; }.batch-dropdown, .more-dropdown { margin-left: 12px; }.tab-count { color: #909399; }</style>
