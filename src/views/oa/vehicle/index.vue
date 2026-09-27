<template>
  <div class="app-container oa-vehicle">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="120px"
      @submit.native.prevent
    >
      <el-form-item label="所属部门" prop="deptId">
        <dept-select v-model="queryParams.deptId" style="width: 240px" />
      </el-form-item>
      <el-form-item label="车牌号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入车牌号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入车辆名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择分类" clearable style="width: 240px">
          <el-option
            v-for="dict in categoryOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 240px">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="车型" prop="type">
        <el-input
          v-model="queryParams.type"
          placeholder="请输入车型"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="品牌型号" prop="brandModel">
        <el-input
          v-model="queryParams.brandModel"
          placeholder="请输入品牌型号"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="交强险到期时间" prop="compulsoryInsuranceExpireTime">
        <el-date-picker
          v-model="queryParams.compulsoryInsuranceExpireTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="商业险到期时间" prop="commercialInsuranceExpireTime">
        <el-date-picker
          v-model="queryParams.commercialInsuranceExpireTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="年检到期时间" prop="inspectionExpireTime">
        <el-date-picker
          v-model="queryParams.inspectionExpireTime"
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
          v-hasPermi="['oa:vehicle:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="所属部门" prop="deptName" min-width="140" show-overflow-tooltip />
      <el-table-column label="车牌号" prop="no" min-width="140" />
      <el-table-column label="车辆名称" prop="name" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_VEHICLE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="车辆照片" width="100" align="center">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.picUrl"
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            fit="cover"
            class="vehicle-pic"
          />
        </template>
      </el-table-column>
      <el-table-column label="车型" prop="type" min-width="100" show-overflow-tooltip />
      <el-table-column label="分类" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_VEHICLE_CATEGORY" :value="scope.row.category" />
        </template>
      </el-table-column>
      <el-table-column label="品牌型号" prop="brandModel" min-width="130" show-overflow-tooltip />
      <el-table-column label="座位数" prop="seatCount" width="90" align="center" />
      <el-table-column label="裸车价格（元）" prop="barePrice" width="140" align="center" />
      <el-table-column
        label="交强险到期时间"
        prop="compulsoryInsuranceExpireTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column
        label="商业险到期时间"
        prop="commercialInsuranceExpireTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column
        label="年检到期时间"
        prop="inspectionExpireTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column label="显示顺序" prop="sort" width="100" align="center" />
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column
        label="创建时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
        align="center"
      />
      <el-table-column label="操作" align="center" fixed="right" width="160">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['oa:vehicle:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['oa:vehicle:delete']"
            type="text"
            size="mini"
            class="danger-text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
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

    <!-- 新增和修改表单 -->
    <oa-vehicle-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils/formatTime'
import * as VehicleApi from '@/api/oa/vehicle'
import OaVehicleForm from './OaVehicleForm.vue'
import DeptSelect from '@/views/system/dept/components/DeptSelect.vue'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'

export default {
  name: 'OaVehicle',
  components: { OaVehicleForm, DeptSelect },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        no: undefined,
        name: undefined,
        category: undefined,
        deptId: undefined,
        status: undefined,
        type: undefined,
        brandModel: undefined,
        compulsoryInsuranceExpireTime: [],
        commercialInsuranceExpireTime: [],
        inspectionExpireTime: []
      }
    }
  },
  computed: {
    categoryOptions() {
      return getStrDictOptions(DICT_TYPE.OA_VEHICLE_CATEGORY)
    },
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.OA_VEHICLE_STATUS)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return VehicleApi.getVehiclePage(this.queryParams).then(response => {
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
    handleDelete(id) {
      return this.$modal.confirm('是否确认删除车辆编号为“' + id + '”的数据项？').then(() => {
        return VehicleApi.deleteVehicle(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.vehicle-pic {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.danger-text {
  color: #f56c6c;
}
</style>
