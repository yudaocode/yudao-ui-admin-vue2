<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="88px"
      >
        <el-form-item
          label="候选人"
          prop="search"
        ><el-input
          v-model="queryParams.search"
          class="query-width"
          clearable
          placeholder="请输入姓名、手机号或邮箱"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          label="应聘职位"
          prop="postId"
        ><recruit-post-select
          v-model="queryParams.postId"
          class="query-width"
          placeholder="请选择应聘职位"
        /></el-form-item>
        <el-form-item
          label="招聘负责人"
          prop="ownerEmployeeId"
        ><hrm-employee-select
          v-model="queryParams.ownerEmployeeId"
          class="query-width"
          :entry-status="HrmEmployeeEntryStatus.ACTIVE"
          placeholder="请选择招聘负责人"
          title="选择招聘负责人"
        /></el-form-item>
        <el-form-item
          label="招聘渠道"
          prop="channelId"
        ><recruit-channel-select
          v-model="queryParams.channelId"
          class="query-width"
          placeholder="请选择招聘渠道"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="性别"
          prop="sex"
        ><el-select
          v-model="queryParams.sex"
          class="query-width"
          clearable
          placeholder="请选择性别"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="年龄"
          prop="minAge"
        ><div class="range-query"><el-input-number
          v-model="queryParams.minAge"
          :controls="false"
          :max="99"
          :min="0"
          class="range-input"
          placeholder="最小年龄"
        /><span>至</span><el-input-number
          v-model="queryParams.maxAge"
          :controls="false"
          :max="99"
          :min="0"
          class="range-input"
          placeholder="最大年龄"
        /></div></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="工作年限"
          prop="minWorkTime"
        ><div class="range-query"><el-input-number
          v-model="queryParams.minWorkTime"
          :controls="false"
          :min="0"
          class="range-input"
          placeholder="最小年限"
        /><span>至</span><el-input-number
          v-model="queryParams.maxWorkTime"
          :controls="false"
          :min="0"
          class="range-input"
          placeholder="最大年限"
        /></div></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="学历"
          prop="education"
        ><el-select
          v-model="queryParams.education"
          class="query-width"
          clearable
          placeholder="请选择学历"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_CANDIDATE_EDUCATION)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="毕业院校"
          prop="graduateSchool"
        ><el-input
          v-model="queryParams.graduateSchool"
          class="query-width"
          clearable
          placeholder="请输入毕业院校"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="最近单位"
          prop="latestWorkPlace"
        ><el-input
          v-model="queryParams.latestWorkPlace"
          class="query-width"
          clearable
          placeholder="请输入最近工作单位"
          @keyup.enter.native="handleQuery"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="面试官"
          prop="interviewEmployeeId"
        ><hrm-employee-select
          v-model="queryParams.interviewEmployeeId"
          class="query-width"
          :entry-status="HrmEmployeeEntryStatus.ACTIVE"
          placeholder="请选择面试官"
          title="选择面试官"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="面试时间"
          prop="interviewTime"
        ><el-date-picker
          v-model="queryParams.interviewTime"
          :default-time="['00:00:00', '23:59:59']"
          class="range-date"
          end-placeholder="结束时间"
          range-separator="-"
          start-placeholder="开始时间"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="创建人"
          prop="creator"
        ><user-select
          v-model="queryParams.creator"
          class="query-width"
          placeholder="请选择创建人"
        /></el-form-item>
        <el-form-item
          v-show="showMoreQuery"
          label="创建时间"
          prop="createTime"
        ><el-date-picker
          v-model="queryParams.createTime"
          :default-time="['00:00:00', '23:59:59']"
          class="range-date"
          end-placeholder="结束时间"
          range-separator="-"
          start-placeholder="开始时间"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
        /></el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            type="text"
            @click="showMoreQuery = !showMoreQuery"
          ><i :class="showMoreQuery ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" /> {{ showMoreQuery ? '收起' : '展开' }}</el-button>
          <el-button
            v-hasPermi="['hrm:recruit:candidate:create']"
            plain
            type="primary"
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
          <el-dropdown
            v-if="hasBatchPermission"
            :disabled="!hasBatchOperations || !selectedIds.length"
            class="left-space"
            @command="handleBatchCommand"
          >
            <el-button
              :disabled="!hasBatchOperations || !selectedIds.length"
              plain
              type="primary"
            ><i class="el-icon-s-operation" /> 批量操作 <i class="el-icon-arrow-down" /></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-if="canBatchUpdateStatus && checkPermi(['hrm:recruit:candidate:update'])"
                command="status"
              >批量流转</el-dropdown-item>
              <el-dropdown-item
                v-if="canBatchInterview && checkPermi(['hrm:recruit:interview:create'])"
                command="interview"
              >批量面试</el-dropdown-item>
              <el-dropdown-item
                v-if="canBatchUpdatePostOrChannel && checkPermi(['hrm:recruit:candidate:update'])"
                command="post"
              >修改职位</el-dropdown-item>
              <el-dropdown-item
                v-if="canBatchUpdatePostOrChannel && checkPermi(['hrm:recruit:candidate:update'])"
                command="channel"
              >修改渠道</el-dropdown-item>
              <el-dropdown-item
                v-if="canBatchEliminate && checkPermi(['hrm:recruit:candidate:update'])"
                command="eliminate"
              >批量淘汰</el-dropdown-item>
              <el-dropdown-item
                v-if="canBatchDelete && checkPermi(['hrm:recruit:candidate:delete'])"
                command="delete"
                :divided="hasBatchNonDeleteOperations"
              >批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            v-hasPermi="['hrm:recruit:candidate:delete']"
            class="left-space"
            plain
            type="warning"
            icon="el-icon-brush"
            @click="openCleanForm"
          >一键清理</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      class="table-card"
      shadow="never"
    >
      <el-tabs
        v-model="activeStatus"
        @tab-click="handleStatusTabClick"
      >
        <el-tab-pane name="all"><span slot="label">全部<span class="count">（{{ allStatusCount }}）</span></span></el-tab-pane>
        <el-tab-pane
          v-for="item in statusTabOptions"
          :key="item.value"
          :name="item.value"
        ><span slot="label">{{ item.label }}<span class="count">（{{ item.count }}）</span></span></el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          :selectable="isCandidateSelectable"
          align="center"
          fixed="left"
          type="selection"
          width="50"
        />
        <el-table-column
          align="center"
          fixed="left"
          label="姓名"
          min-width="110"
          prop="name"
        ><template slot-scope="scope"><el-link
          :underline="false"
          type="primary"
          @click="openDetail(scope.row.id)"
        >{{ scope.row.name }}</el-link></template></el-table-column>
        <el-table-column
          align="center"
          label="应聘职位"
          min-width="160"
          prop="postName"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="用人部门"
          min-width="130"
          prop="deptName"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="候选人状态"
          prop="status"
          width="190"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_CANDIDATE_STATUS"
          :value="scope.row.status"
        /><span v-if="scope.row.status === HrmRecruitCandidateStatus.INTERVIEW && scope.row.interviewResult && scope.row.interviewResult !== HrmRecruitInterviewResult.UNFINISHED">（面试{{ getDictLabel(DICT_TYPE.HRM_RECRUIT_INTERVIEW_RESULT, scope.row.interviewResult) }}）</span></template></el-table-column>
        <el-table-column
          align="center"
          label="手机号码"
          prop="mobile"
          width="130"
        />
        <el-table-column
          align="center"
          label="性别"
          prop="sex"
          width="80"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.SYSTEM_USER_SEX"
          :value="scope.row.sex"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="年龄"
          prop="age"
          width="80"
        />
        <el-table-column
          align="center"
          label="邮箱"
          min-width="180"
          prop="email"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="招聘负责人"
          min-width="130"
          prop="ownerEmployeeName"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="工作年限"
          prop="workTime"
          width="100"
        ><template slot-scope="scope">{{ scope.row.workTime != null ? `${scope.row.workTime} 年` : '-' }}</template></el-table-column>
        <el-table-column
          align="center"
          label="学历"
          prop="education"
          width="90"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_CANDIDATE_EDUCATION"
          :value="scope.row.education"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="毕业院校"
          min-width="140"
          prop="graduateSchool"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="最近工作单位"
          min-width="150"
          prop="latestWorkPlace"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="招聘渠道"
          min-width="120"
          prop="channelName"
          show-overflow-tooltip
        />
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="面试时间"
          prop="interviewTime"
          width="180"
        />
        <el-table-column
          align="center"
          label="面试轮次"
          prop="stageNumber"
          width="100"
        />
        <el-table-column
          align="center"
          label="主面试官"
          min-width="120"
          prop="interviewEmployeeName"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="面试方式"
          prop="interviewType"
          width="110"
        ><template slot-scope="scope"><dict-tag
          v-if="scope.row.interviewType != null"
          :type="DICT_TYPE.HRM_RECRUIT_INTERVIEW_TYPE"
          :value="scope.row.interviewType"
        /><span v-else>-</span></template></el-table-column>
        <el-table-column
          align="center"
          label="其他面试官"
          min-width="150"
        ><template slot-scope="scope">{{ formatNames(scope.row.otherInterviewEmployeeNames) }}</template></el-table-column>
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="创建时间"
          prop="createTime"
          width="180"
        />
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="180"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:recruit:candidate:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-if="getPrimaryAction(scope.row)"
              type="text"
              @click="handlePrimaryAction(getPrimaryAction(scope.row).command, scope.row)"
            >{{ getPrimaryAction(scope.row).label }}</el-button>
            <el-dropdown
              v-if="getMoreActions(scope.row).length"
              class="left-space"
              @command="handleMoreCommand($event, scope.row)"
            >
              <el-button type="text">更多</el-button>
              <el-dropdown-menu slot="dropdown"><el-dropdown-item
                v-for="(action, index) in getMoreActions(scope.row)"
                :key="action.command"
                :command="action.command"
                :divided="index > 0 && action.command === 'delete'"
              >{{ action.label }}</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <recruit-candidate-form
      ref="form"
      @success="refreshList"
    />
    <recruit-candidate-status-list-form
      ref="statusListForm"
      @success="handleBatchSuccess"
    />
    <recruit-candidate-post-list-form
      ref="postListForm"
      @success="handleBatchSuccess"
    />
    <recruit-candidate-channel-list-form
      ref="channelListForm"
      @success="handleBatchSuccess"
    />
    <recruit-candidate-eliminate-form
      ref="eliminateForm"
      @success="handleBatchSuccess"
    />
    <employee-form
      ref="employeeForm"
      @success="refreshList"
    />
    <recruit-candidate-clean-form
      ref="cleanForm"
      @success="refreshList"
    />
    <recruit-interview-form
      ref="interviewForm"
      @success="handleBatchSuccess"
    />
    <recruit-interview-result-form
      ref="interviewResultForm"
      @success="refreshList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getDictDataLabel, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { checkPermi } from '@/utils/permission'
import * as RecruitCandidateApi from '@/api/hrm/recruit/candidate'
import { getRecruitInterview } from '@/api/hrm/recruit/interview'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import EmployeeForm from '@/views/hrm/employee/EmployeeForm.vue'
import RecruitChannelSelect from '@/views/hrm/recruit/channel/components/RecruitChannelSelect.vue'
import RecruitPostSelect from '@/views/hrm/recruit/post/components/RecruitPostSelect.vue'
import RecruitCandidateForm from './RecruitCandidateForm.vue'
import RecruitCandidateChannelListForm from './RecruitCandidateChannelListForm.vue'
import RecruitCandidateCleanForm from './RecruitCandidateCleanForm.vue'
import RecruitCandidateEliminateForm from './RecruitCandidateEliminateForm.vue'
import RecruitCandidatePostListForm from './RecruitCandidatePostListForm.vue'
import RecruitCandidateStatusListForm from './RecruitCandidateStatusListForm.vue'
import RecruitInterviewForm from './RecruitInterviewForm.vue'
import RecruitInterviewResultForm from './RecruitInterviewResultForm.vue'
import { executeHrmBatch } from '@/views/hrm/utils/batch'
import {
  HRM_RECRUIT_CANDIDATE_EMPLOYEE_EDUCATION_MAP,
  HrmEmployeeEntryStatus,
  HrmEmployeeStatus,
  HrmEmployeeType,
  HrmRecruitCandidateStatus,
  HrmRecruitInterviewResult
} from '@/views/hrm/utils/constants'

const candidateDeleteStatuses = [HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW, HrmRecruitCandidateStatus.INTERVIEW_PASS, HrmRecruitCandidateStatus.ELIMINATED]

export default {
  name: 'HrmRecruitCandidate',
  components: { UserSelect, HrmEmployeeSelect, EmployeeForm, RecruitChannelSelect, RecruitPostSelect, RecruitCandidateForm, RecruitCandidateChannelListForm, RecruitCandidateCleanForm, RecruitCandidateEliminateForm, RecruitCandidatePostListForm, RecruitCandidateStatusListForm, RecruitInterviewForm, RecruitInterviewResultForm },
  data() {
    return {
      DICT_TYPE, HrmEmployeeEntryStatus, HrmRecruitCandidateStatus, HrmRecruitInterviewResult,
      loading: true, total: 0, list: [], statusCounts: [], activeStatus: 'all', showMoreQuery: false, selectedIds: [], candidateDeleteStatuses,
      queryParams: { pageNo: 1, pageSize: 10, search: '', postId: undefined, ownerEmployeeId: undefined, sex: undefined, minAge: undefined, maxAge: undefined, minWorkTime: undefined, maxWorkTime: undefined, education: undefined, graduateSchool: '', latestWorkPlace: '', channelId: undefined, interviewEmployeeId: undefined, interviewTime: [], creator: undefined, status: undefined, createTime: [] }
    }
  },
  computed: {
    statusTabOptions() { const countMap = Object.fromEntries(this.statusCounts.map(item => [item.status, item.count])); return getIntDictOptions(DICT_TYPE.HRM_RECRUIT_CANDIDATE_STATUS).map(item => ({ label: item.label, value: String(item.value), count: countMap[Number(item.value)] == null ? 0 : countMap[Number(item.value)] })) },
    allStatusCount() { return this.statusCounts.reduce((total, item) => total + item.count, 0) },
    activeStatusValue() { return this.activeStatus === 'all' ? undefined : Number(this.activeStatus) },
    canBatchUpdateStatus() { return this.isActiveStatusIn([HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW_PASS]) },
    canBatchInterview() { return this.isActiveStatusIn([HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW_PASS]) },
    canBatchUpdatePostOrChannel() { return this.canBatchUpdateStatus },
    canBatchEliminate() { return this.isActiveStatusIn([HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW, HrmRecruitCandidateStatus.INTERVIEW_PASS, HrmRecruitCandidateStatus.OFFER_SENT, HrmRecruitCandidateStatus.PENDING_ENTRY]) },
    canBatchDelete() { return this.isActiveStatusIn(this.candidateDeleteStatuses) },
    hasBatchPermission() { return checkPermi(['hrm:recruit:candidate:update']) || checkPermi(['hrm:recruit:interview:create']) || checkPermi(['hrm:recruit:candidate:delete']) },
    hasBatchNonDeleteOperations() { return (checkPermi(['hrm:recruit:candidate:update']) && (this.canBatchUpdateStatus || this.canBatchUpdatePostOrChannel || this.canBatchEliminate)) || (checkPermi(['hrm:recruit:interview:create']) && this.canBatchInterview) },
    hasBatchOperations() { return this.hasBatchNonDeleteOperations || (checkPermi(['hrm:recruit:candidate:delete']) && this.canBatchDelete) }
  },
  created() {
    if (this.$route.query.status) { const status = Number(this.$route.query.status); this.activeStatus = String(status); this.queryParams.status = status }
    this.refreshList()
  },
  methods: {
    getIntDictOptions, checkPermi, dateFormatter,
    getDictLabel(type, value) { return getDictDataLabel(type, value) },
    isActiveStatusIn(statuses) { return this.activeStatusValue !== undefined && statuses.includes(this.activeStatusValue) },
    async getList() { this.loading = true; try { const response = await RecruitCandidateApi.getRecruitCandidatePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    async getStatusCounts() { const response = await RecruitCandidateApi.getRecruitCandidateStatusCount(this.queryParams); this.statusCounts = response.data },
    async refreshList() { await Promise.all([this.getList(), this.getStatusCounts()]) },
    handleQuery() { this.queryParams.pageNo = 1; this.selectedIds = []; this.refreshList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.queryParams.maxAge = undefined; this.queryParams.maxWorkTime = undefined; this.activeStatus = 'all'; this.queryParams.status = undefined; this.handleQuery() },
    handleStatusTabClick(tab) { if (tab.name === undefined) return; this.queryParams.status = tab.name === 'all' ? undefined : Number(tab.name); this.handleQuery() },
    isCandidateSelectable() { return this.activeStatus !== 'all' },
    handleSelectionChange(rows) { this.selectedIds = rows.map(row => row.id) },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'HrmRecruitCandidateDetail', params: { id }}) },
    openInterview(id) { this.$refs.interviewForm.open('create', id) },
    openReinterview(id) { this.$refs.interviewForm.open('create', id, undefined, '安排复试') },
    openBatchInterview() { if (this.selectedIds.length) this.$refs.interviewForm.open('batch', this.selectedIds) },
    async openInterviewResult(candidate) { if (!candidate.interviewId) { this.$modal.msgWarning('请先安排面试'); return } const response = await getRecruitInterview(candidate.interviewId); this.$refs.interviewResultForm.open(response.data) },
    async openInterviewChange(candidate) { if (!candidate.id || !candidate.interviewId) return; const response = await getRecruitInterview(candidate.interviewId); this.$refs.interviewForm.open('update', candidate.id, response.data) },
    async openInterviewCancel(candidate) { if (!candidate.interviewId) return; const response = await getRecruitInterview(candidate.interviewId); this.$refs.interviewResultForm.open(response.data, HrmRecruitInterviewResult.CANCELED) },
    openBatchStatusForm() { if (this.activeStatusValue) this.$refs.statusListForm.open(this.selectedIds, this.activeStatusValue) },
    openBatchPostForm() { this.$refs.postListForm.open(this.selectedIds) },
    openBatchChannelForm() { this.$refs.channelListForm.open(this.selectedIds) },
    openEliminateForm(candidate) { if (candidate.id) this.$refs.eliminateForm.open(candidate.id, candidate.name) },
    openBatchEliminateForm() { this.$refs.eliminateForm.open(this.selectedIds) },
    openEntryForm(candidate) { if (!candidate.id) return; const entryTime = candidate.entryTime ? Number(candidate.entryTime) : Date.now(); this.$refs.employeeForm.open('candidate', undefined, { candidateId: candidate.id, name: candidate.name, mobile: candidate.mobile, sex: candidate.sex, age: candidate.age, email: candidate.email, highestEducation: candidate.education == null ? undefined : HRM_RECRUIT_CANDIDATE_EMPLOYEE_EDUCATION_MAP[candidate.education], deptId: candidate.deptId, postName: candidate.postName, channelId: candidate.channelId, entryStatus: HrmEmployeeEntryStatus.PENDING_ENTRY, status: HrmEmployeeStatus.PROBATION, type: HrmEmployeeType.FORMAL, entryTime, companyAgeStartTime: entryTime, probation: 3, remark: candidate.remark }) },
    openCleanForm() { this.$refs.cleanForm.open() },
    getPrimaryAction(candidate) { if (checkPermi(['hrm:recruit:interview:update']) && candidate.status === HrmRecruitCandidateStatus.INTERVIEW && candidate.interviewId && candidate.interviewResult === HrmRecruitInterviewResult.CANCELED) return { command: 'interview-change', label: '重新安排' }; if (checkPermi(['hrm:recruit:interview:update']) && candidate.status === HrmRecruitCandidateStatus.INTERVIEW && candidate.interviewId && candidate.interviewResult !== HrmRecruitInterviewResult.CANCELED) return { command: 'interview-result', label: '登记结果' }; if (checkPermi(['hrm:employee:update']) && candidate.status === HrmRecruitCandidateStatus.PENDING_ENTRY && candidate.employeeId) return { command: 'confirm-entry', label: '确认入职' }; if (checkPermi(['hrm:recruit:candidate:update']) && [HrmRecruitCandidateStatus.INTERVIEW_PASS, HrmRecruitCandidateStatus.OFFER_SENT].includes(candidate.status) && !candidate.employeeId) return { command: 'convert-employee', label: '转为员工' }; if (checkPermi(['hrm:recruit:interview:create']) && [HrmRecruitCandidateStatus.NEW, HrmRecruitCandidateStatus.PRIMARY_PASS, HrmRecruitCandidateStatus.INTERVIEW_PASS].includes(candidate.status)) return { command: 'interview', label: '安排面试' }; return undefined },
    async handlePrimaryAction(command, candidate) { if (command === 'interview-result') return this.openInterviewResult(candidate); if (command === 'interview-change') return this.openInterviewChange(candidate); if (command === 'confirm-entry') return this.handleConfirmEntry(candidate); if (command === 'convert-employee') return this.openEntryForm(candidate); if (command === 'interview' && candidate.id) this.openInterview(candidate.id) },
    getMoreActions(candidate) { const actions = []; if (checkPermi(['hrm:recruit:interview:update']) && candidate.status === HrmRecruitCandidateStatus.INTERVIEW && candidate.interviewId && candidate.interviewResult !== HrmRecruitInterviewResult.CANCELED) actions.push({ command: 'interview-change', label: '更改面试安排' }, { command: 'interview-cancel', label: '取消面试' }); if (checkPermi(['hrm:recruit:interview:create']) && candidate.status === HrmRecruitCandidateStatus.INTERVIEW_PASS) actions.push({ command: 'reinterview', label: '安排复试' }); if (checkPermi(['hrm:recruit:candidate:update'])) { if (candidate.status === HrmRecruitCandidateStatus.NEW) actions.push({ command: 'primary-pass', label: '初选通过' }); if (candidate.status === HrmRecruitCandidateStatus.INTERVIEW_PASS) actions.push({ command: 'offer', label: '发 Offer' }); if (candidate.status === HrmRecruitCandidateStatus.ELIMINATED) actions.push({ command: 'restore', label: '恢复为新候选人' }); if (![HrmRecruitCandidateStatus.ELIMINATED, HrmRecruitCandidateStatus.JOINED].includes(candidate.status)) actions.push({ command: 'eliminate', label: '淘汰' }) } if (checkPermi(['hrm:recruit:candidate:delete']) && !candidate.employeeId && candidate.status != null && this.candidateDeleteStatuses.includes(candidate.status)) actions.push({ command: 'delete', label: '删除' }); return actions },
    async handleMoreCommand(command, candidate) { if (command === 'primary-pass') return this.handleStatus(candidate, HrmRecruitCandidateStatus.PRIMARY_PASS); if (command === 'offer') return this.handleStatus(candidate, HrmRecruitCandidateStatus.OFFER_SENT); if (command === 'restore') return this.handleStatus(candidate, HrmRecruitCandidateStatus.NEW); if (command === 'interview-change') return this.openInterviewChange(candidate); if (command === 'interview-cancel') return this.openInterviewCancel(candidate); if (command === 'reinterview' && candidate.id) return this.openReinterview(candidate.id); if (command === 'eliminate') return this.openEliminateForm(candidate); if (command === 'delete') await this.handleDelete(candidate.id) },
    async handleStatus(candidate, status) { if (!candidate.id) return; await RecruitCandidateApi.updateRecruitCandidateStatus({ id: candidate.id, status }); this.$modal.msgSuccess(this.$t('common.updateSuccess')); await this.refreshList() },
    handleConfirmEntry(candidate) { if (candidate.employeeId) this.$refs.employeeForm.open('confirm', candidate.employeeId) },
    async handleDelete(id) { if (!id) return; try { await this.$modal.confirm('是否确认删除该候选人?'); await RecruitCandidateApi.deleteRecruitCandidate(id); this.$modal.msgSuccess(this.$t('common.delSuccess')); await this.refreshList() } catch (error) {} },
    async handleBatchDelete() { if (!this.selectedIds.length) return; try { await this.$modal.confirm(`确认删除选中的 ${this.selectedIds.length} 位候选人吗？`); const success = await executeHrmBatch(this, this.selectedIds.map(id => RecruitCandidateApi.deleteRecruitCandidate(id))); if (success) await this.handleBatchSuccess() } catch (error) {} },
    async handleBatchCommand(command) { if (command === 'status') return this.openBatchStatusForm(); if (command === 'interview') return this.openBatchInterview(); if (command === 'post') return this.openBatchPostForm(); if (command === 'channel') return this.openBatchChannelForm(); if (command === 'eliminate') return this.openBatchEliminateForm(); if (command === 'delete') await this.handleBatchDelete() },
    async handleBatchSuccess() { this.selectedIds = []; await this.refreshList() },
    formatNames(names) { return (names || []).join('、') || '-' }
  }
}
</script>

<style scoped>
.table-card { margin-top: 16px; }
.query-width { width: 240px; }
.range-date { width: 360px; }
.range-query { display: flex; width: 240px; align-items: center; gap: 8px; }
.range-input { min-width: 0; flex: 1; }
.left-space { margin-left: 12px; }
.count { color: #909399; }
</style>
