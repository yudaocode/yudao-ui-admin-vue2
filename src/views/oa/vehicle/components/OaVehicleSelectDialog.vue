<template>
  <Dialog title="选择车辆" v-model="dialogVisible" width="1200px" append-to-body>
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="85px"
      @submit.native.prevent
    >
      <el-form-item label="车牌号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入车牌号"
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
      <el-form-item label="车型" prop="type">
        <el-input
          v-model="queryParams.type"
          placeholder="请输入车型"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="车辆分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="请选择车辆分类" clearable style="width: 240px">
          <el-option
            v-for="dict in categoryOptions"
            :key="dict.value"
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
      <el-table-column label="车牌号" prop="no" min-width="130" />
      <el-table-column label="车辆名称" prop="name" min-width="160" show-overflow-tooltip />
      <el-table-column label="品牌型号" prop="brandModel" min-width="150" show-overflow-tooltip />
      <el-table-column label="车型" prop="type" min-width="100" show-overflow-tooltip />
      <el-table-column label="车辆分类" min-width="120" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_VEHICLE_CATEGORY" :value="scope.row.category" />
        </template>
      </el-table-column>
      <el-table-column label="座位数" prop="seatCount" width="90" align="center" />
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
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'

export default {
  name: 'OaVehicleSelectDialog',
  components: { Dialog },
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
        no: undefined,
        brandModel: undefined,
        type: undefined,
        category: undefined
      },
      selectedItem: undefined,
      selectedId: undefined
    }
  },
  computed: {
    categoryOptions() {
      return getStrDictOptions(DICT_TYPE.OA_VEHICLE_CATEGORY)
    }
  },
  methods: {
    // 打开弹窗，恢复当前车辆选择
    open(item) {
      this.dialogVisible = true
      this.queryParams.pageNo = 1
      this.queryParams.no = undefined
      this.queryParams.brandModel = undefined
      this.queryParams.type = undefined
      this.queryParams.category = undefined
      this.selectedItem = item
      this.selectedId = item ? item.id : undefined
      this.getList()
    },
    // 查询用车申请可选车辆
    getList() {
      this.loading = true
      return VehicleApplyApi.getAvailableVehiclePage(this.queryParams).then(response => {
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
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      return this.handleQuery()
    },
    // 选择车辆
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
