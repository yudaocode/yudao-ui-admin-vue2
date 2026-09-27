<template>
  <dialog-component title="选择出差申请单" v-model="dialogVisible" width="1100px" append-to-body>
    <!-- 搜索 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" @submit.native.prevent>
      <el-form-item label="单据编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入单据编号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="出差事由" prop="reason">
        <el-input
          v-model="queryParams.reason"
          placeholder="请输入出差事由"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="报销状态" prop="reimburseStatus">
        <el-select
          v-model="queryParams.reimburseStatus"
          placeholder="请选择报销状态"
          clearable
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in reimburseStatusOptions"
            :key="String(dict.value)"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 列表：仅从本人已审批通过的申请中选择 -->
    <el-table
      v-loading="loading"
      :data="list"
      row-key="id"
      height="440"
      highlight-current-row
      @row-click="handleSelect"
      @row-dblclick="handleConfirmRow"
    >
      <el-table-column width="55" align="center">
        <template slot-scope="scope">
          <el-radio
            v-model="selectedId"
            :label="scope.row.id"
            :aria-label="'选择 ' + scope.row.no"
            @change="handleSelect(scope.row)"
          ><span>&nbsp;</span></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="单据编号" prop="no" width="180" />
      <el-table-column label="出差事由" prop="reason" min-width="220" show-overflow-tooltip />
      <el-table-column label="开始日期" width="180">
        <template slot-scope="scope">{{ formatDate(scope.row.startTime) }}</template>
      </el-table-column>
      <el-table-column label="结束日期" width="180">
        <template slot-scope="scope">{{ formatDate(scope.row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="天数" prop="days" width="80" align="center" />
      <el-table-column label="报销状态" width="110" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_REIMBURSE_STATUS" :value="scope.row.reimburseStatus" />
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
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="loading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </dialog-component>
</template>

<script>
import * as TravelApi from '@/api/oa/travel/apply'
import DialogComponent from '@/components/Dialog'
import { DICT_TYPE, getBoolDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaTravelApplySelect',
  components: { DialogComponent },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: '',
        reason: '',
        reimburseStatus: undefined
      },
      selectedId: undefined,
      selectedApply: undefined
    }
  },
  computed: {
    reimburseStatusOptions() {
      return getBoolDictOptions(DICT_TYPE.OA_REIMBURSE_STATUS)
    }
  },
  methods: {
    formatDate,
    open(id) {
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
        this.queryParams.pageNo = 1
        this.selectedId = id
        this.selectedApply = undefined
        return this.getList()
      })
    },
    getList() {
      this.loading = true
      return TravelApi.getApprovedTravelApplyList().then(response => {
        const applies = response.data || []
        const no = this.queryParams.no
        const reason = this.queryParams.reason
        const reimburseStatus = this.queryParams.reimburseStatus
        const filteredList = applies.filter(item =>
          (!no || (item.no || '').includes(no)) &&
          (!reason || (item.reason || '').includes(reason)) &&
          (reimburseStatus === undefined || reimburseStatus === null || reimburseStatus === item.reimburseStatus))
        // 回显原有选择，并按当前页截取列表
        this.selectedApply = applies.find(item => item.id === this.selectedId)
        this.total = filteredList.length
        const start = (this.queryParams.pageNo - 1) * this.queryParams.pageSize
        this.list = filteredList.slice(start, start + this.queryParams.pageSize)
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
    handleSelect(row) {
      this.selectedId = row.id
      this.selectedApply = row
    },
    handleConfirmRow(row) {
      this.handleSelect(row)
      this.submitForm()
    },
    submitForm() {
      if (!this.selectedApply) {
        return this.$modal.msgWarning('请选择出差申请单')
      }
      this.$emit('select', this.selectedApply)
      this.dialogVisible = false
    }
  }
}
</script>
