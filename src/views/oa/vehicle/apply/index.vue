<template>
  <div class="app-container oa-vehicle-apply">
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
      <el-form-item label="还车状态" prop="returnStatus">
        <el-select
          v-model="queryParams.returnStatus"
          placeholder="请选择还车状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="status in OA_VEHICLE_RETURN_STATUS"
            :key="status"
            :label="getDictLabel(DICT_TYPE.OA_VEHICLE_RETURN_STATUS, status)"
            :value="status"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['oa:vehicle-apply:create']"
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
      <el-table-column label="单据状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START" type="info" size="small">
            未提交
          </el-tag>
          <dict-tag v-else :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="车辆" prop="vehicleNo" width="130" />
      <el-table-column label="用车事由" prop="reason" min-width="180" show-overflow-tooltip />
      <el-table-column label="出车时间" prop="startTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="回车时间" prop="endTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="出车地点" prop="startLocation" min-width="160" show-overflow-tooltip />
      <el-table-column label="回车地点" prop="endLocation" min-width="160" show-overflow-tooltip />
      <el-table-column label="随行人" prop="passenger" min-width="160" show-overflow-tooltip />
      <el-table-column label="还车状态" width="110" align="center">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.returnStatus === OA_VEHICLE_RETURN_STATUS.RETURNED ? 'success' : 'info'"
            size="small"
          >
            {{ getDictLabel(DICT_TYPE.OA_VEHICLE_RETURN_STATUS, scope.row.returnStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请人" prop="userName" width="120" />
      <el-table-column label="申请部门" prop="deptName" width="160" show-overflow-tooltip />
      <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.processInstanceId"
            v-hasPermi="['oa:vehicle-apply:query']"
            type="text"
            size="mini"
            @click="handleProcessDetail(scope.row)"
          >进度</el-button>
          <el-button
            v-if="
              scope.row.status === BpmProcessInstanceStatus.APPROVE &&
                scope.row.returnStatus === OA_VEHICLE_RETURN_STATUS.PENDING_RETURN
            "
            v-hasPermi="['oa:vehicle-return:create']"
            type="text"
            size="mini"
            @click="openReturnForm(scope.row.id)"
          >还车</el-button>
          <template v-if="scope.row.status === BpmProcessInstanceStatus.NOT_START">
            <el-button
              v-hasPermi="['oa:vehicle-apply:update']"
              type="text"
              size="mini"
              @click="$refs.form.open('update', scope.row.id)"
            >修改</el-button>
            <el-button
              v-hasPermi="['oa:vehicle-apply:create']"
              type="text"
              size="mini"
              @click="handleSubmit(scope.row.id)"
            >提交</el-button>
            <el-button
              v-hasPermi="['oa:vehicle-apply:delete']"
              type="text"
              size="mini"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
          <el-button
            v-if="scope.row.status === BpmProcessInstanceStatus.RUNNING"
            v-hasPermi="['oa:vehicle-apply:update']"
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

    <!-- 表单及详情弹窗 -->
    <oa-vehicle-apply-form ref="form" @success="getList" />
    <oa-vehicle-apply-detail ref="detail" />
    <oa-vehicle-return-form ref="returnForm" @success="handleReturnSuccess" />
  </div>
</template>

<script>
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import OaVehicleApplyForm from './OaVehicleApplyForm.vue'
import OaVehicleApplyDetail from './OaVehicleApplyDetail.vue'
import OaVehicleReturnForm from '../return/OaVehicleReturnForm.vue'
import { OA_VEHICLE_RETURN_STATUS } from '@/views/oa/utils/constants'

export default {
  name: 'OaVehicleApply',
  components: { DeptSelect, OaVehicleApplyForm, OaVehicleApplyDetail, OaVehicleReturnForm },
  data() {
    return {
      DICT_TYPE,
      BpmProcessInstanceStatus,
      OA_VEHICLE_RETURN_STATUS,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        vehicleNo: undefined,
        status: undefined,
        deptId: undefined,
        createTime: [],
        returnStatus: undefined
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
    getDictLabel,
    // 保存还车草稿后进入还车列表继续提交
    handleReturnSuccess() {
      this.$router.push('/oa/vehicle/return')
    },
    getList() {
      this.loading = true
      return VehicleApplyApi.getVehicleApplyPage(this.queryParams).then(response => {
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
    // 审批进度
    handleProcessDetail(row) {
      this.$router.push({
        name: 'BpmProcessInstanceDetail',
        query: { id: row.processInstanceId }
      })
    },
    openDetail(id) {
      this.$refs.detail.open(id)
    },
    // 还车按钮操作
    openReturnForm(applyId) {
      this.$refs.returnForm.open('create', undefined, applyId)
    },
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除用车申请编号为“' + id + '”的数据项？').then(() => {
        return VehicleApplyApi.deleteVehicleApply(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    handleSubmit(id) {
      return this.$modal.confirm('确认提交用车申请？').then(() => {
        return VehicleApplyApi.submitVehicleApply(id)
      }).then(() => {
        this.$modal.msgSuccess('提交成功')
        return this.getList()
      }).catch(() => {})
    },
    handleCancel(id) {
      return this.$modal.confirm('确认取消用车申请？').then(() => {
        return VehicleApplyApi.cancelVehicleApply(id)
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
