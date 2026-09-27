<template>
  <div class="app-container oa-seal-apply">
    <doc-alert
      title="【行政】办公用品、用印管理"
      url="https://doc.iocoder.cn/oa/administration/supply-seal/"
    />
    <!-- 搜索工作栏 -->
    <content-wrap>
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="80px"
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
        <el-form-item label="印章" prop="sealId">
          <oa-seal-select v-model="queryParams.sealId" style="width: 240px" />
        </el-form-item>
        <el-form-item label="单据状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择单据状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用印类型" prop="type">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择用印类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in typeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用印方式" prop="mode">
          <el-select
            v-model="queryParams.mode"
            placeholder="请选择用印方式"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in modeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用印状态" prop="useStatus">
          <el-select
            v-model="queryParams.useStatus"
            placeholder="请选择用印状态"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in useStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="紧急" prop="urgent">
          <el-select v-model="queryParams.urgent" placeholder="请选择" clearable style="width: 240px">
            <el-option
              v-for="dict in urgentOptions"
              :key="String(dict.value)"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用印时间" prop="expectedUseTime">
          <el-date-picker
            v-model="queryParams.expectedUseTime"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="申请部门" prop="deptId">
          <dept-select v-model="queryParams.deptId" style="width: 240px" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            type="datetimerange"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            v-hasPermi="['oa:seal-apply:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增</el-button>
        </el-form-item>
      </el-form>
    </content-wrap>
    <!-- 申请列表 -->
    <content-wrap>
      <el-table v-loading="loading" :data="list" border stripe>
        <el-table-column label="单据编号" min-width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="openDetail(scope.row.id)">
              {{ scope.row.no }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="单据状态" width="110" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info">未提交</el-tag>
            <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="印章编号" prop="sealNo" min-width="160" />
        <el-table-column label="紧急" width="80" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.urgent" />
          </template>
        </el-table-column>
        <el-table-column label="印章" prop="sealName" min-width="160" />
        <el-table-column label="用印事由" prop="reason" min-width="180" show-overflow-tooltip />
        <el-table-column label="用印类型" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_APPLY_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="用印方式" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_USE_MODE" :value="scope.row.mode" />
          </template>
        </el-table-column>
        <el-table-column label="用印状态" width="110" align="center">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.OA_SEAL_USE_STATUS" :value="scope.row.useStatus" />
          </template>
        </el-table-column>
        <el-table-column
          label="预计用印时间"
          prop="expectedUseTime"
          :formatter="dateFormatter"
          width="180"
        />
        <el-table-column
          label="预计归还时间"
          prop="expectedReturnTime"
          :formatter="dateFormatter"
          width="180"
        />
        <el-table-column label="保管人" prop="keeperName" width="120" />
        <el-table-column label="申请人" prop="userName" width="120" />
        <el-table-column label="申请部门" prop="deptName" width="150" />
        <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
        <el-table-column label="操作" fixed="right" width="220" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.processInstanceId"
              v-hasPermi="['oa:seal-apply:query']"
              type="text"
              size="mini"
              @click="handleProcessDetail(scope.row)"
            >进度</el-button>
            <template v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START">
              <el-button
                v-hasPermi="['oa:seal-apply:update']"
                type="text"
                size="mini"
                @click="openForm('update', scope.row.id)"
              >修改</el-button>
              <el-button
                v-hasPermi="['oa:seal-apply:create']"
                type="text"
                size="mini"
                @click="handleSubmit(scope.row.id)"
              >提交</el-button>
              <el-button
                v-hasPermi="['oa:seal-apply:delete']"
                type="text"
                size="mini"
                class="danger-text"
                @click="handleDelete(scope.row.id)"
              >删除</el-button>
            </template>
            <el-button
              v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
              v-hasPermi="['oa:seal-apply:update']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleCancel(scope.row.id)"
            >撤销</el-button>
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
    <!-- 添加或修改用印申请弹窗 -->
    <oa-seal-apply-form ref="form" @success="getList" />
    <!-- 用印申请详情弹窗 -->
    <oa-seal-apply-detail ref="detail" />
  </div>
</template>

<script>
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import OaSealSelect from '../components/OaSealSelect.vue'
import * as SealApplyApi from '@/api/oa/seal/apply'
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import OaSealApplyForm from './OaSealApplyForm.vue'
import OaSealApplyDetail from './OaSealApplyDetail.vue'

export default {
  name: 'OaSealApply',
  components: { DeptSelect, OaSealSelect, OaSealApplyForm, OaSealApplyDetail },
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
        sealId: undefined,
        deptId: undefined,
        createTime: [],
        expectedUseTime: [],
        status: undefined,
        type: undefined,
        mode: undefined,
        useStatus: undefined,
        urgent: undefined
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)
    },
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_APPLY_TYPE)
    },
    modeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_USE_MODE)
    },
    useStatusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_SEAL_USE_STATUS)
    },
    urgentOptions() {
      return getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return SealApplyApi.getSealApplyPage(this.queryParams).then(response => {
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
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    handleProcessDetail(row) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      })
    },
    handleSubmit(id) {
      return this.$modal.confirm('确认提交用印申请？').then(() => {
        return SealApplyApi.submitSealApply(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleCancel(id) {
      return this.$modal.confirm('确认撤销用印申请？').then(() => {
        return SealApplyApi.cancelSealApply(id)
      }).then(() => {
        this.$modal.msgSuccess('撤销成功')
        return this.getList()
      }).catch(() => {})
    },
    handleDelete(id) {
      return this.$modal.confirm('确认删除用印申请？').then(() => {
        return SealApplyApi.deleteSealApply(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}
</style>
