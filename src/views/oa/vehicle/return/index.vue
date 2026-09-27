<template>
  <div class="app-container oa-vehicle-return">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="85px"
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
          <el-option label="未提交" :value="BpmProcessInstanceStatus.NOT_START" />
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车辆" prop="vehicleNo">
        <el-input
          v-model="queryParams.vehicleNo"
          placeholder="请输入车牌号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用车申请单" prop="applyNo">
        <el-input
          v-model="queryParams.applyNo"
          placeholder="请输入用车申请单"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="申请部门" prop="deptId">
        <dept-select v-model="queryParams.deptId" style="width: 240px" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:vehicle-return:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="单据编号" min-width="220">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="openDetail(scope.row.id)">{{ scope.row.no }}</el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="流程实例编号"
        prop="processInstanceId"
        min-width="220"
        show-overflow-tooltip
      />
      <el-table-column label="单据状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
            未提交
          </el-tag>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="用车申请单" prop="applyNo" min-width="220" show-overflow-tooltip />
      <el-table-column label="车辆" prop="vehicleNo" width="130" />
      <el-table-column
        label="回车时间"
        prop="actualReturnTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column label="回车地点" prop="returnLocation" min-width="160" show-overflow-tooltip />
      <el-table-column label="申请人" prop="userName" width="120" />
      <el-table-column label="申请部门" prop="deptName" width="160" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.processInstanceId"
            v-hasPermi="['oa:vehicle-return:query']"
            type="text"
            size="mini"
            @click="handleProcessDetail(scope.row)"
          >进度</el-button>
          <template v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START">
            <el-button
              v-hasPermi="['oa:vehicle-return:update']"
              type="text"
              size="mini"
              @click="openForm('update', scope.row.id)"
            >修改</el-button>
            <el-button
              v-hasPermi="['oa:vehicle-return:create']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row.id)"
            >提交</el-button>
            <el-button
              v-hasPermi="['oa:vehicle-return:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
            v-hasPermi="['oa:vehicle-return:update']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleCancel(scope.row.id)"
          >取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 表单弹窗：添加/修改 -->
    <oa-vehicle-return-form ref="form" @success="getList" />
    <!-- 详情弹窗 -->
    <oa-vehicle-return-detail ref="detail" />
  </div>
</template>

<script>
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import * as VehicleReturnApi from '@/api/oa/vehicle/return'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import OaVehicleReturnForm from './OaVehicleReturnForm.vue'
import OaVehicleReturnDetail from './OaVehicleReturnDetail.vue'

export default {
  name: 'OaVehicleReturn',
  components: { DeptSelect, OaVehicleReturnForm, OaVehicleReturnDetail },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        status: undefined,
        vehicleNo: undefined,
        applyNo: undefined,
        deptId: undefined,
        createTime: []
      }
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS).filter(
        item => item.value !== BpmProcessInstanceStatus.NOT_START
      )
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return VehicleReturnApi.getVehicleReturnPage(this.queryParams).then(response => {
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
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除还车申请编号为“' + id + '”的数据项？').then(() => {
        return VehicleReturnApi.deleteVehicleReturn(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleSubmit(id) {
      return this.$modal.confirm('确认提交还车申请？').then(() => {
        return VehicleReturnApi.submitVehicleReturn(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleCancel(id) {
      return this.$modal.confirm('确认取消还车申请？').then(() => {
        return VehicleReturnApi.cancelVehicleReturn(id)
      }).then(() => {
        this.$modal.msgSuccess('取消成功')
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
