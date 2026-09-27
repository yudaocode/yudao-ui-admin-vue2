<!-- MES 设备类型列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】设备类型、设备台账" url="https://doc.iocoder.cn/mes/dv/device/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" size="small" @submit.native.prevent>
      <el-form-item label="类型名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入类型名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['mes:dv-machinery-type:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button type="danger" plain icon="el-icon-sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
      row-key="id"
      :default-expand-all="isExpandAll"
    >
      <el-table-column label="设备类型编码" align="center" prop="code" />
      <el-table-column label="设备类型名称" align="left" prop="name" />
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope"><dict-tag :type="COMMON_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template v-slot="scope">
          <el-button v-hasPermi="['mes:dv-machinery-type:create']" type="text" size="mini" @click="openForm('create', undefined, scope.row.id)">新增子类型</el-button>
          <el-button v-hasPermi="['mes:dv-machinery-type:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-hasPermi="['mes:dv-machinery-type:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <machinery-type-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { handleTree } from '@/utils/tree'
import { DvMachineryTypeApi } from '@/api/mes/dv/machinery/type'
import MachineryTypeForm from './MachineryTypeForm.vue'

const COMMON_STATUS = 'common_status'

export default {
  name: 'MesDvMachineryType',
  components: { MachineryTypeForm },
  data() {
    return {
      COMMON_STATUS,
      loading: true,
      list: [],
      queryParams: { name: undefined, status: undefined },
      statusOptions: getIntDictOptions(COMMON_STATUS),
      isExpandAll: true,
      refreshTable: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    parseTime,
    async getList() {
      this.loading = true
      try {
        const response = await DvMachineryTypeApi.getMachineryTypeList(this.queryParams)
        this.list = handleTree(response.data)
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      return this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      return this.handleQuery()
    },
    openForm(type, id, parentId) {
      this.$refs.form.open(type, id, parentId)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除设备类型？')
        await DvMachineryTypeApi.deleteMachineryType(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持列表
      }
    },
    async toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      await this.$nextTick()
      this.refreshTable = true
    }
  }
}
</script>
