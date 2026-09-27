<template>
  <dialog-component title="选择办公用品" v-model="dialogVisible" width="850px">
    <!-- 搜索工作栏 -->
    <el-form :inline="true" :model="queryParams" @submit.native.prevent>
      <el-form-item label="物品名称">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入物品名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
      </el-form-item>
    </el-form>
    <!-- 可选物品 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="物品名称" prop="name" min-width="150" />
      <el-table-column label="规格型号" prop="model" min-width="110" />
      <el-table-column label="计量单位" prop="unit" width="90" align="center" />
      <el-table-column label="管理类型" width="100" align="center">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_SUPPLY_MANAGE_TYPE" :value="scope.row.manageType" />
        </template>
      </el-table-column>
      <el-table-column label="库存数量" prop="stockQuantity" width="95" align="center" />
      <el-table-column label="操作" width="80" align="center">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleSelect(scope.row)">选择</el-button>
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
  </dialog-component>
</template>

<script>
import * as SupplyItemApi from '@/api/oa/supply/item'
import DialogComponent from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'OaSupplyItemSelect',
  components: { DialogComponent },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, name: '' }
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
      this.queryParams.name = ''
      return this.handleQuery()
    },
    getList() {
      this.loading = true
      return SupplyItemApi.getSupplyItemSelectPage(this.queryParams).then(response => {
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
    handleSelect(item) {
      this.$emit('select', item)
      this.dialogVisible = false
    }
  }
}
</script>
