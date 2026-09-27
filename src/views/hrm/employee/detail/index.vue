<template>
  <div class="app-container hrm-employee-detail">
    <employee-details-header
      :employee="employee"
      :loading="detailLoading"
    >
      <div class="header-actions">
        <el-button
          v-hasPermi="['hrm:employee:update']"
          :disabled="!employee.id"
          type="primary"
          icon="el-icon-edit"
          @click="openEmployeeForm"
        >编辑</el-button>
        <el-button
          v-if="employee.entryStatus === HrmEmployeeEntryStatus.PENDING_ENTRY"
          v-hasPermi="['hrm:employee:update']"
          type="success"
          plain
          icon="el-icon-circle-check"
          @click="handleConfirmEntry"
        >确认入职</el-button>
        <el-button
          v-if="employee.entryStatus === HrmEmployeeEntryStatus.LEFT"
          v-hasPermi="['hrm:employee:update']"
          type="warning"
          plain
          icon="el-icon-refresh"
          @click="openRehire"
        >办理再入职</el-button>
        <el-dropdown
          v-if="changeableEntryStatuses.includes(employee.entryStatus || 0)"
          v-hasPermi="['hrm:employee:update']"
          trigger="click"
          @command="openChangeAction"
        >
          <el-button
            type="primary"
            plain
          >
            <i class="el-icon-sort" /> 办理异动 <i class="el-icon-arrow-down" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="action in changeActionOptions"
              :key="action.changeType"
              :command="action.changeType"
            >
              <i :class="action.icon" /> {{ action.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-dropdown
          v-if="moreActionOptions.length"
          trigger="click"
          @command="handleMoreCommand"
        >
          <el-button plain>更多 <i class="el-icon-arrow-down" /></el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(action, index) in moreActionOptions"
              :key="action.command"
              :command="action.command"
              :divided="index > 0 && action.command === 'delete'"
            >
              <i :class="action.icon" /> {{ action.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </employee-details-header>

    <div v-loading="detailLoading">
      <el-tabs v-model="activeTab">
        <el-tab-pane
          label="岗位信息"
          name="post"
        >
          <employee-post-info
            ref="postInfo"
            :employee="employee"
            :employee-id="employeeId"
            @edit-quit="openQuit"
            @refresh="getEmployeeData"
          />
        </el-tab-pane>
        <el-tab-pane
          label="基本信息"
          name="basic"
          lazy
        >
          <employee-basic-info
            :employee="employee"
            :employee-id="employeeId"
          />
        </el-tab-pane>
        <el-tab-pane
          label="员工合同"
          name="contract"
          lazy
        >
          <el-card shadow="never">
            <div slot="header">合同信息</div>
            <employee-contract-list :employee-id="employeeId" />
          </el-card>
        </el-tab-pane>
        <el-tab-pane
          label="工资社保"
          name="salary"
          lazy
        >
          <employee-salary-social-security :employee-id="employeeId" />
        </el-tab-pane>
        <el-tab-pane
          label="材料附件"
          name="file"
          lazy
        >
          <employee-material-files
            :employee-id="employeeId"
            @success="getOperateLog"
          />
        </el-tab-pane>
        <el-tab-pane
          label="操作记录"
          name="operateLog"
        >
          <div class="operate-log-list">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in logList"
                :key="index"
                :timestamp="formatDate(log.createTime)"
                placement="top"
              >
                <div class="operate-log-content">
                  <el-tag type="success">{{ log.userName }}</el-tag>
                  <span>{{ log.action }}</span>
                </div>
                <span
                  slot="dot"
                  :style="{ backgroundColor: getUserTypeColor(log.userType) }"
                  class="operate-log-dot"
                >{{ getUserTypeInitial(log.userType) }}</span>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <employee-form
      ref="employeeForm"
      @success="getEmployeeData"
    />
    <employee-regular-form
      ref="regularForm"
      @success="handleEmployeeChangeSuccess"
    />
    <employee-transfer-form
      ref="transferForm"
      @success="handleEmployeeChangeSuccess"
    />
    <employee-promote-form
      ref="promoteForm"
      @success="handleEmployeeChangeSuccess"
    />
    <employee-demote-form
      ref="demoteForm"
      @success="handleEmployeeChangeSuccess"
    />
    <employee-full-time-form
      ref="fullTimeForm"
      @success="handleEmployeeChangeSuccess"
    />
    <employee-quit-form
      ref="quitForm"
      @success="handleEmployeeQuitSuccess"
    />
  </div>
</template>

<script>
import { getOperateLogPage } from '@/api/hrm/operate-log'
import * as EmployeeApi from '@/api/hrm/employee'
import { DICT_TYPE, getDictData, getDictDataLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { checkPermi } from '@/utils/permission'
import {
  HrmBizType,
  HrmEmployeeChangeType,
  HrmEmployeeEntryStatus,
  HrmEmployeeStatus
} from '@/views/hrm/utils/constants'
import EmployeeDemoteForm from '../EmployeeDemoteForm.vue'
import EmployeeForm from '../EmployeeForm.vue'
import EmployeeFullTimeForm from '../EmployeeFullTimeForm.vue'
import EmployeePromoteForm from '../EmployeePromoteForm.vue'
import EmployeeQuitForm from '../EmployeeQuitForm.vue'
import EmployeeRegularForm from '../EmployeeRegularForm.vue'
import EmployeeTransferForm from '../EmployeeTransferForm.vue'
import EmployeeBasicInfo from './EmployeeBasicInfo.vue'
import EmployeeContractList from './EmployeeContractList.vue'
import EmployeeDetailsHeader from './EmployeeDetailsHeader.vue'
import EmployeeMaterialFiles from './EmployeeMaterialFiles.vue'
import EmployeePostInfo from './EmployeePostInfo.vue'
import EmployeeSalarySocialSecurity from './EmployeeSalarySocialSecurity.vue'

export default {
  name: 'HrmEmployeeDetail',
  components: {
    EmployeeBasicInfo,
    EmployeeContractList,
    EmployeeDemoteForm,
    EmployeeDetailsHeader,
    EmployeeForm,
    EmployeeFullTimeForm,
    EmployeeMaterialFiles,
    EmployeePostInfo,
    EmployeePromoteForm,
    EmployeeQuitForm,
    EmployeeRegularForm,
    EmployeeSalarySocialSecurity,
    EmployeeTransferForm
  },
  data() {
    return {
      HrmEmployeeEntryStatus,
      activeTab: 'post',
      changeableEntryStatuses: [
        HrmEmployeeEntryStatus.ACTIVE,
        HrmEmployeeEntryStatus.PENDING_LEAVE
      ],
      detailLoading: true,
      employee: {},
      employeeId: undefined,
      logList: []
    }
  },
  computed: {
    changeActionOptions() {
      const actions = [
        {
          label: '调整部门/岗位',
          changeType: HrmEmployeeChangeType.TRANSFER,
          icon: 'el-icon-sort'
        },
        {
          label: '晋升',
          changeType: HrmEmployeeChangeType.PROMOTION,
          icon: 'el-icon-top'
        },
        {
          label: '降级',
          changeType: HrmEmployeeChangeType.DEMOTION,
          icon: 'el-icon-bottom'
        }
      ]
      if (this.employee.status === HrmEmployeeStatus.PROBATION) {
        actions.unshift({
          label: '办理转正',
          changeType: HrmEmployeeChangeType.REGULAR,
          icon: 'el-icon-circle-check'
        })
      }
      if (
        this.employee.status === HrmEmployeeStatus.INTERN ||
        this.employee.status === HrmEmployeeStatus.PART_TIME
      ) {
        actions.push({
          label: '转为全职',
          changeType: HrmEmployeeChangeType.FULL_TIME,
          icon: 'el-icon-user-solid'
        })
      }
      return actions
    },
    moreActionOptions() {
      const actions = []
      if (
        this.employee.entryStatus === HrmEmployeeEntryStatus.ACTIVE &&
        checkPermi(['hrm:employee:update'])
      ) {
        actions.push({ label: '设置离职', command: 'quit', icon: 'el-icon-remove' })
      }
      if (
        this.employee.entryStatus === HrmEmployeeEntryStatus.PENDING_LEAVE &&
        checkPermi(['hrm:employee:update'])
      ) {
        actions.push({ label: '取消离职', command: 'cancelQuit', icon: 'el-icon-refresh-left' })
      }
      if (
        this.employee.entryStatus === HrmEmployeeEntryStatus.LEFT &&
        checkPermi(['hrm:employee:update'])
      ) {
        actions.push({ label: '修改离职信息', command: 'quit', icon: 'el-icon-edit' })
      }
      if (checkPermi(['hrm:employee:delete'])) {
        actions.push({ label: '删除', command: 'delete', icon: 'el-icon-delete' })
      }
      return actions
    }
  },
  created() {
    this.employeeId = Number(this.$route.params.id)
    if (!Number.isSafeInteger(this.employeeId) || this.employeeId <= 0) {
      this.$modal.msgWarning('参数错误，员工编号不能为空！')
      this.close()
      return
    }
    this.getEmployeeData()
  },
  methods: {
    formatDate,
    close() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({ name: 'HrmEmployee' })
    },
    async getEmployeeData() {
      this.detailLoading = true
      try {
        const response = await EmployeeApi.getEmployee(this.employeeId)
        if (!response.data) {
          this.$modal.msgWarning('员工档案不存在')
          this.close()
          return
        }
        this.employee = response.data
        await this.getOperateLog()
      } finally {
        this.detailLoading = false
      }
    },
    async getOperateLog() {
      const response = await getOperateLogPage({
        bizType: HrmBizType.EMPLOYEE,
        bizId: this.employeeId
      })
      this.logList = response.data.list
    },
    handleConfirmEntry() {
      this.$refs.employeeForm.open('confirm', this.employeeId)
    },
    openEmployeeForm() {
      this.$refs.employeeForm.open('update', this.employeeId)
    },
    openRehire() {
      this.$refs.employeeForm.open('rehire', this.employeeId)
    },
    openChangeAction(command) {
      const refs = {
        [HrmEmployeeChangeType.REGULAR]: 'regularForm',
        [HrmEmployeeChangeType.TRANSFER]: 'transferForm',
        [HrmEmployeeChangeType.PROMOTION]: 'promoteForm',
        [HrmEmployeeChangeType.DEMOTION]: 'demoteForm',
        [HrmEmployeeChangeType.FULL_TIME]: 'fullTimeForm'
      }
      const refName = refs[Number(command)]
      if (refName) this.$refs[refName].open(this.employee)
    },
    openQuit() {
      this.$refs.quitForm.open(this.employee)
    },
    async handleCancelQuit() {
      try {
        const result = await this.$prompt(
          `请输入取消员工“${this.employee.name}”离职安排的原因`,
          '取消离职',
          {
            inputValidator: reason => {
              if (!reason || !reason.trim()) return '取消原因不能为空'
              return reason.length <= 500 || '取消原因不能超过 500 个字符'
            }
          }
        )
        await EmployeeApi.cancelEmployeeQuit({
          employeeId: this.employeeId,
          reason: result.value
        })
        this.$modal.msgSuccess('已取消离职')
        await this.handleEmployeeQuitSuccess()
      } catch (error) {}
    },
    async handleDelete() {
      await this.$modal.confirm(`确认删除员工“${this.employee.name}”的档案吗？`)
      await EmployeeApi.deleteEmployee(this.employeeId)
      this.$modal.msgSuccess('删除成功')
      this.close()
    },
    handleMoreCommand(command) {
      if (command === 'quit') this.openQuit()
      else if (command === 'cancelQuit') this.handleCancelQuit()
      else if (command === 'delete') this.handleDelete()
    },
    handleEmployeeChangeSuccess() {
      const postInfo = this.$refs.postInfo
      return Promise.all([
        this.getEmployeeData(),
        postInfo && postInfo.refreshChangeRecordList()
      ])
    },
    handleEmployeeQuitSuccess() {
      const postInfo = this.$refs.postInfo
      return Promise.all([this.getEmployeeData(), postInfo && postInfo.refreshQuitInfo()])
    },
    getUserTypeColor(type) {
      const dict = getDictData(DICT_TYPE.USER_TYPE, type)
      const colors = {
        success: '#67C23A',
        info: '#909399',
        warning: '#E6A23C',
        danger: '#F56C6C'
      }
      return (dict && colors[dict.colorType]) || '#409EFF'
    },
    getUserTypeInitial(type) {
      return getDictDataLabel(DICT_TYPE.USER_TYPE, type).charAt(0)
    }
  }
}
</script>

<style lang="scss" scoped>
.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.operate-log-list {
  padding-top: 20px;

  ::v-deep .el-timeline {
    margin: 10px 0 0 110px;
  }

  ::v-deep .el-timeline-item__wrapper {
    position: relative;
    top: -20px;
  }

  ::v-deep .el-timeline-item__timestamp {
    position: absolute;
    top: 10px;
    left: -150px;
  }
}

.operate-log-content {
  display: flex;
  align-items: center;
  min-height: 30px;
  padding: 10px;
  background-color: #fff;
  gap: 10px;
}

.operate-log-content::before {
  position: absolute;
  top: 10px;
  left: 13px;
  border-color: transparent #fff transparent transparent;
  border-style: solid;
  border-width: 8px;
  content: '';
}

.operate-log-dot {
  position: absolute;
  left: -5px;
  display: flex;
  width: 20px;
  height: 20px;
  font-size: 10px;
  color: #fff;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
}
</style>
