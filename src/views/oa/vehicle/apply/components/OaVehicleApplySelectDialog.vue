<template>
  <Dialog title="选择用车申请单" v-model="dialogVisible" width="1200px" append-to-body>
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
      <el-form-item label="车辆" prop="vehicleNo">
        <el-input
          v-model="queryParams.vehicleNo"
          placeholder="请输入车牌号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      row-key="id"
      @row-click="handleSelect"
    >
      <el-table-column label="选择" width="60" align="center">
        <template slot-scope="scope">
          <el-radio
            v-model="selectedId"
            :label="scope.row.id"
            @change="handleSelect(scope.row)"
          ><span> </span></el-radio>
        </template>
      </el-table-column>
      <el-table-column label="单据编号" prop="no" min-width="200" show-overflow-tooltip />
      <el-table-column label="车牌号" prop="vehicleNo" width="120" />
      <el-table-column label="用车事由" prop="reason" min-width="160" show-overflow-tooltip />
      <el-table-column label="出车时间" prop="startTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="回车时间" prop="endTime" :formatter="dateFormatter" width="180" align="center" />
      <el-table-column label="申请人" prop="userName" width="120" />
      <el-table-column label="部门" prop="deptName" min-width="140" show-overflow-tooltip />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="loading || !selectedItem" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import { dateFormatter } from '@/utils/formatTime'

export default {
  name: 'OaVehicleApplySelectDialog',
  components: { Dialog },
  props: {
    status: {
      type: Number,
      default: undefined
    },
    returnStatus: {
      type: Number,
      default: undefined
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        vehicleNo: undefined,
        status: undefined,
        returnStatus: undefined
      },
      selectedItem: undefined,
      selectedId: undefined
    }
  },
  methods: {
    dateFormatter,
    // 打开弹窗，恢复当前申请选择
    open(item) {
      this.dialogVisible = true
      this.queryParams.pageNo = 1
      this.queryParams.no = undefined
      this.queryParams.vehicleNo = undefined
      // 由调用方限定可选范围
      this.queryParams.status = this.status
      this.queryParams.returnStatus = this.returnStatus
      this.selectedItem = item
      this.selectedId = item ? item.id : undefined
      this.getList()
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
      // 搜索时保留调用方的状态限定
      this.queryParams.status = this.status
      this.queryParams.returnStatus = this.returnStatus
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      return this.handleQuery()
    },
    handleSelect(item) {
      this.selectedItem = item
      this.selectedId = item.id
    },
    // 确认选择
    submitForm() {
      if (!this.selectedItem) {
        return
      }
      this.$emit('selected', this.selectedItem)
      this.dialogVisible = false
    }
  }
}
</script>
