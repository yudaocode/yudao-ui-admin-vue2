<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="72px"
      >
        <el-form-item
          label="职位名称"
          prop="postName"
        >
          <el-input
            v-model="queryParams.postName"
            class="query-width"
            clearable
            placeholder="请输入职位名称"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="工作性质"
          prop="jobNature"
        >
          <el-select
            v-model="queryParams.jobNature"
            class="query-width"
            clearable
            placeholder="请选择工作性质"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_JOB_NATURE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="工作城市"
          prop="areaId"
        >
          <area-select
            v-model="queryParams.areaId"
            class="query-width"
            placeholder="请选择工作城市"
          />
        </el-form-item>
        <el-form-item
          label="用人部门"
          prop="deptId"
        >
          <dept-select
            v-model="queryParams.deptId"
            class="query-width"
            placeholder="请选择用人部门"
          />
        </el-form-item>
        <el-form-item
          label="招聘负责人"
          prop="ownerEmployeeId"
        >
          <hrm-employee-select
            v-model="queryParams.ownerEmployeeId"
            class="query-width"
            :entry-status="HrmEmployeeEntryStatus.ACTIVE"
            placeholder="请选择招聘负责人"
            title="选择招聘负责人"
          />
        </el-form-item>
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
            v-hasPermi="['hrm:recruit:post:create']"
            plain
            type="primary"
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
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
        <el-tab-pane
          v-for="item in statusTabOptions"
          :key="item.value"
          :name="item.value"
        >
          <span slot="label">{{ item.label }} <span class="count">（{{ item.count }}）</span></span>
        </el-tab-pane>
      </el-tabs>
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column
          align="center"
          fixed="left"
          label="职位名称"
          prop="postName"
          width="180"
        >
          <template slot-scope="scope"><el-link
            :underline="false"
            type="primary"
            @click="openDetail(scope.row.id)"
          >{{ scope.row.postName }}</el-link></template>
        </el-table-column>
        <el-table-column
          align="center"
          label="用人部门"
          prop="deptName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="工作性质"
          prop="jobNature"
          width="100"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_JOB_NATURE"
          :value="scope.row.jobNature"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="工作城市"
          prop="areaName"
          width="200"
        ><template slot-scope="scope">{{ scope.row.areaName || '-' }}</template></el-table-column>
        <el-table-column
          align="center"
          label="招聘人数"
          prop="recruitNum"
          width="100"
        />
        <el-table-column
          align="center"
          label="已入职人数"
          prop="hasEntryNum"
          width="110"
        ><template slot-scope="scope">{{ scope.row.hasEntryNum == null ? 0 : scope.row.hasEntryNum }}</template></el-table-column>
        <el-table-column
          align="center"
          label="招聘进度"
          prop="recruitSchedule"
          width="100"
        ><template slot-scope="scope">{{ formatRecruitPostSchedule(scope.row) }}</template></el-table-column>
        <el-table-column
          align="center"
          label="工作经验"
          prop="workTime"
          width="110"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_WORK_TIME"
          :value="scope.row.workTime"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="学历要求"
          prop="educationRequire"
          width="120"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_POST_EDUCATION"
          :value="scope.row.educationRequire"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="薪资范围"
          prop="minSalary"
          width="180"
        ><template slot-scope="scope">{{ formatRecruitPostSalary(scope.row) }}</template></el-table-column>
        <el-table-column
          align="center"
          label="年龄要求"
          prop="minAge"
          width="110"
        ><template slot-scope="scope">{{ formatRecruitPostAge(scope.row) }}</template></el-table-column>
        <el-table-column
          align="center"
          label="紧急程度"
          prop="emergencyLevel"
          width="100"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_EMERGENCY_LEVEL"
          :value="scope.row.emergencyLevel"
        /></template></el-table-column>
        <el-table-column
          align="center"
          label="最迟到岗时间"
          prop="latestEntryTime"
          width="120"
        ><template slot-scope="scope">{{ scope.row.latestEntryTime ? formatDate(scope.row.latestEntryTime, 'YYYY-MM-DD') : '-' }}</template></el-table-column>
        <el-table-column
          align="center"
          label="招聘负责人"
          prop="ownerEmployeeName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="职位类型"
          prop="postTypeName"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          align="center"
          label="面试官"
          prop="interviewEmployeeNames"
          width="160"
        ><template slot-scope="scope">{{ formatNames(scope.row.interviewEmployeeNames) }}</template></el-table-column>
        <el-table-column
          align="center"
          label="状态"
          prop="status"
          width="100"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_RECRUIT_POST_STATUS"
          :value="scope.row.status"
        /></template></el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="160"
        >
          <template slot-scope="scope">
            <el-button
              v-hasPermi="['hrm:recruit:post:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['hrm:recruit:post:update']"
              type="text"
              :class="isRecruiting(scope.row) ? 'warning-text' : 'success-text'"
              @click="handleStatus(scope.row)"
            >{{ isRecruiting(scope.row) ? '停止招聘' : '重新招聘' }}</el-button>
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

    <recruit-post-form
      ref="form"
      @success="refreshList"
    />
  </div>
</template>

<script>
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getRecruitPostPage, getRecruitPostStatusCount, updateRecruitPostStatus } from '@/api/hrm/recruit/post'
import AreaSelect from '@/views/system/area/components/AreaSelect.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import HrmEmployeeSelect from '@/views/hrm/employee/components/HrmEmployeeSelect.vue'
import RecruitPostForm from './RecruitPostForm.vue'
import { HrmEmployeeEntryStatus, HrmRecruitPostStatus } from '@/views/hrm/utils/constants'
import { formatRecruitPostAge, formatRecruitPostSalary, formatRecruitPostSchedule } from '@/views/hrm/utils/format'

export default {
  name: 'HrmRecruitPost',
  components: { AreaSelect, DeptSelect, HrmEmployeeSelect, RecruitPostForm },
  data() {
    return {
      DICT_TYPE,
      HrmEmployeeEntryStatus,
      loading: true,
      total: 0,
      list: [],
      statusCounts: [],
      activeStatus: String(HrmRecruitPostStatus.RECRUITING),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        postName: '',
        jobNature: undefined,
        areaId: undefined,
        deptId: undefined,
        ownerEmployeeId: undefined,
        status: HrmRecruitPostStatus.RECRUITING
      }
    }
  },
  computed: {
    statusTabOptions() {
      const countMap = Object.fromEntries(this.statusCounts.map(item => [item.status, item.count]))
      return getIntDictOptions(DICT_TYPE.HRM_RECRUIT_POST_STATUS).map(item => ({
        label: item.label,
        value: String(item.value),
        count: countMap[Number(item.value)] == null ? 0 : countMap[Number(item.value)]
      }))
    }
  },
  created() { this.refreshList() },
  methods: {
    getIntDictOptions,
    formatDate,
    formatRecruitPostAge,
    formatRecruitPostSalary,
    formatRecruitPostSchedule,
    async getList() {
      this.loading = true
      try {
        const response = await getRecruitPostPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    async getStatusCounts() {
      const response = await getRecruitPostStatusCount(this.queryParams)
      this.statusCounts = response.data
    },
    async refreshList() { await Promise.all([this.getList(), this.getStatusCounts()]) },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.refreshList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.activeStatus = String(HrmRecruitPostStatus.RECRUITING)
      this.queryParams.status = HrmRecruitPostStatus.RECRUITING
      this.handleQuery()
    },
    handleStatusTabClick(tab) {
      if (tab.name === undefined) return
      this.queryParams.status = Number(tab.name)
      this.handleQuery()
    },
    openForm(type, id) { this.$refs.form.open(type, id) },
    openDetail(id) { this.$router.push({ name: 'HrmRecruitPostDetail', params: { id }}) },
    isRecruiting(post) { return post.status === HrmRecruitPostStatus.RECRUITING },
    async handleStatus(row) {
      if (!row.id) return
      if (this.isRecruiting(row)) {
        let stopReason
        try {
          const result = await this.$prompt('请输入停止原因', '停止招聘', {
            inputPlaceholder: '例如：岗位暂停',
            confirmButtonText: '确 定',
            cancelButtonText: '取 消',
            inputValidator: value => {
              const reason = String(value == null ? '' : value).trim()
              if (!reason) return '停止原因不能为空'
              return reason.length <= 255 || '停止原因不能超过 255 个字符'
            }
          })
          stopReason = result.value.trim()
        } catch (error) {
          return
        }
        await updateRecruitPostStatus({ id: row.id, status: HrmRecruitPostStatus.STOPPED, stopReason })
      } else {
        await updateRecruitPostStatus({ id: row.id, status: HrmRecruitPostStatus.RECRUITING })
      }
      this.$modal.msgSuccess(this.$t('common.updateSuccess'))
      await this.refreshList()
    },
    formatNames(names) { return (names || []).join('、') || '-' }
  }
}
</script>

<style scoped>
.table-card { margin-top: 16px; }
.query-width { width: 240px; }
.count { color: #909399; }
.warning-text { color: #e6a23c; }
.success-text { color: #67c23a; }
</style>
