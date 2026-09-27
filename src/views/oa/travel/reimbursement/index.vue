<template>
  <div class="app-container oa-travel-reimbursement">
    <doc-alert title="【流程】出差、费用报销" url="https://doc.iocoder.cn/oa/travel-reimbursement/" />
    <!-- 搜索 -->
    <content-wrap>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
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
        <el-form-item label="单据状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择单据状态"
            clearable
            style="width: 240px"
          >
            <el-option label="未提交" :value="-1" />
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请部门" prop="deptId">
          <dept-select v-model="queryParams.deptId" placeholder="请选择申请部门" style="width: 240px" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-select
            v-model="queryParams.payStatus"
            placeholder="请选择支付状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in payStatusOptions"
              :key="String(dict.value)"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-hasPermi="['oa:travel-reimbursement:save']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="$refs.form.open('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>

    <!-- 列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="单据编号" min-width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row.id)">{{ scope.row.no }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="单据状态" width="110" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info">未提交</el-tag>
            <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column
          label="关联出差单号"
          prop="travelApplyNo"
          min-width="200"
          header-align="center"
        />
        <el-table-column
          label="出差事由"
          prop="reason"
          min-width="220"
          header-align="center"
          show-overflow-tooltip
        />
        <el-table-column label="开始日期" width="180" header-align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.startTime) }}</template>
        </el-table-column>
        <el-table-column label="结束日期" width="180" header-align="center">
          <template slot-scope="scope">{{ formatDate(scope.row.endTime) }}</template>
        </el-table-column>
        <el-table-column
          label="报销总金额"
          prop="totalPrice"
          width="130"
          align="right"
          header-align="center"
        />
        <el-table-column label="支付状态" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_PAY_STATUS" :value="scope.row.payStatus" />
          </template>
        </el-table-column>
        <el-table-column label="申请人" prop="creatorName" width="120" header-align="center" />
        <el-table-column label="申请部门" prop="deptName" min-width="140" header-align="center" />
        <el-table-column
          label="创建时间"
          prop="createTime"
          :formatter="dateFormatter"
          width="180"
          header-align="center"
        />
        <el-table-column label="操作" fixed="right" width="260" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="isEditable(scope.row)"
              v-hasPermi="['oa:travel-reimbursement:save']"
              type="text"
              size="mini"
              @click="openUpdate(scope.row.id)"
            >修改</el-button>
            <el-button
              v-if="isEditable(scope.row)"
              v-hasPermi="['oa:travel-reimbursement:save']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row.id)"
            >提交</el-button>
            <el-button
              v-if="isEditable(scope.row)"
              v-hasPermi="['oa:travel-reimbursement:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
            <el-button
              v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
              v-hasPermi="['oa:travel-reimbursement:save']"
              type="text"
              size="mini"
              @click="handleCancel(scope.row.id)"
            >撤回</el-button>
            <el-button
              v-if="scope.row.processInstanceId"
              type="text"
              size="mini"
              @click="openProcess(scope.row)"
            >审批进度</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </content-wrap>

    <!-- 表单及详情 -->
    <oa-travel-reimbursement-form ref="form" @success="getList" />
    <oa-travel-reimbursement-detail ref="detail" />
  </div>
</template>

<script>
import * as TravelApi from '@/api/oa/travel/reimbursement'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import OaTravelReimbursementForm from './OaTravelReimbursementForm.vue'
import OaTravelReimbursementDetail from './OaTravelReimbursementDetail.vue'
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { formatDate, dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'

export default {
  name: 'OaTravelReimbursement',
  components: { DeptSelect, OaTravelReimbursementForm, OaTravelReimbursementDetail },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        deptId: undefined,
        createTime: [],
        payStatus: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS).filter(item => item.value !== -1)
    },
    payStatusOptions() {
      return getBoolDictOptions(DICT_TYPE.OA_PAY_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatDate,
    dateFormatter,
    getList() {
      this.loading = true
      return TravelApi.getTravelReimbursementPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    openUpdate(id) {
      this.$refs.form.open('update', id)
    },
    isEditable(row) {
      return [
        BpmProcessInstanceStatus.NOT_START,
        BpmProcessInstanceStatus.REJECT,
        BpmProcessInstanceStatus.CANCEL
      ].includes(row.status)
    },
    handleDelete(id) {
      return this.$modal.delConfirm().then(() => {
        return TravelApi.deleteTravelReimbursement(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleSubmit(id) {
      return this.$modal.confirm('确认提交差旅报销申请？').then(() => {
        return TravelApi.submitTravelReimbursement(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleCancel(id) {
      return this.$modal.confirm('确认撤回当前单据？').then(() => {
        return TravelApi.cancelTravelReimbursement(id)
      }).then(() => {
        this.$modal.msgSuccess('撤回成功')
        return this.getList()
      }).catch(() => {})
    },
    openProcess(row) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      })
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
