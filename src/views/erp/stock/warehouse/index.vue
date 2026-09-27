<template>
  <div class="app-container">
    <doc-alert
      title="【库存】产品库存、库存明细"
      url="https://doc.iocoder.cn/erp/stock/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="仓库名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入仓库名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="仓库状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择仓库状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
        <el-button
          v-hasPermi="['erp:warehouse:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['erp:warehouse:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="仓库名称"
        align="center"
        prop="name"
      />
      <el-table-column
        label="仓库地址"
        align="center"
        prop="address"
      />
      <el-table-column
        label="仓储费"
        align="center"
        prop="warehousePrice"
        width="100"
      >
        <template #default="scope">{{ formatPrice(scope.row.warehousePrice) }}</template>
      </el-table-column>
      <el-table-column
        label="搬运费"
        align="center"
        prop="truckagePrice"
        width="100"
      >
        <template #default="scope">{{ formatPrice(scope.row.truckagePrice) }}</template>
      </el-table-column>
      <el-table-column
        label="负责人"
        align="center"
        prop="principal"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
      />
      <el-table-column
        label="排序"
        align="center"
        prop="sort"
        width="80"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="90"
      >
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="是否默认"
        align="center"
        prop="defaultStatus"
        width="90"
      >
        <template #default="scope">
          <el-switch
            v-model="scope.row.defaultStatus"
            :active-value="true"
            :inactive-value="false"
            @change="handleDefaultStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="130"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['erp:warehouse:update']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['erp:warehouse:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
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

    <warehouse-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  deleteWarehouse,
  exportWarehouse,
  getWarehousePage,
  updateWarehouseDefaultStatus
} from '@/api/erp/stock/warehouse'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import WarehouseForm from './WarehouseForm.vue'

export default {
  name: 'ErpWarehouse',
  components: { WarehouseForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      exportLoading: false,
      total: 0,
      list: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return getWarehousePage(this.queryParams)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除仓库“' + (row.name || row.id) + '”？').then(() => {
        return deleteWarehouse(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    },
    handleDefaultStatusChange(row) {
      const text = row.defaultStatus ? '设置' : '取消'
      this.$modal.confirm('确认要' + text + '“' + row.name + '”默认吗？').then(() => {
        return updateWarehouseDefaultStatus(row.id, row.defaultStatus)
      }).then(() => {
        this.getList()
      }).catch(() => {
        row.defaultStatus = !row.defaultStatus
      })
    },
    handleExport() {
      this.$modal.confirm('是否确认导出所有仓库数据项？').then(() => {
        this.exportLoading = true
        return exportWarehouse(this.queryParams)
      }).then(response => {
        this.$download.excel(response.data, '仓库.xls')
      }).catch(() => {}).finally(() => {
        this.exportLoading = false
      })
    },
    formatPrice(value) {
      if (value === undefined || value === null || value === '') return ''
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(2) : ''
    }
  }
}
</script>
