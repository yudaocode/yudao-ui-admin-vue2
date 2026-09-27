<!-- MES 供应商列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【基础】客户管理、供应商管理"
      url="https://doc.iocoder.cn/mes/md/client-vendor/"
    />

    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="85px" size="small" @submit.native.prevent>
      <el-form-item label="供应商编码" prop="code"><el-input v-model="queryParams.code" placeholder="请输入供应商编码" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="供应商名称" prop="name"><el-input v-model="queryParams.name" placeholder="请输入供应商名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="供应商简称" prop="nickname"><el-input v-model="queryParams.nickname" placeholder="请输入供应商简称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="英文名称" prop="englishName"><el-input v-model="queryParams.englishName" placeholder="请输入英文名称" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="状态" prop="status"><el-select v-model="queryParams.status" placeholder="请选择状态" clearable><el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" /></el-select></el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['mes:md-vendor:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-hasPermi="['mes:md-vendor:import']" type="warning" plain icon="el-icon-upload2" @click="handleImport">导入</el-button>
        <el-button v-hasPermi="['mes:md-vendor:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="供应商编码" align="center" prop="code" width="120"><template v-slot="scope"><el-link type="primary" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-link></template></el-table-column>
      <el-table-column label="供应商名称" align="center" prop="name" min-width="180" />
      <el-table-column label="供应商简称" align="center" prop="nickname" width="100" />
      <el-table-column label="供应商等级" align="center" prop="level" width="120"><template v-slot="scope"><dict-tag :type="DICT_TYPE.MES_VENDOR_LEVEL" :value="scope.row.level" /></template></el-table-column>
      <el-table-column label="供应商评分" align="center" prop="score" width="100" />
      <el-table-column label="供应商电话" align="center" prop="telephone" width="130" />
      <el-table-column label="状态" align="center" prop="status" width="80"><template v-slot="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" width="120" fixed="right">
        <template v-slot="scope">
          <el-button v-hasPermi="['mes:md-vendor:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-hasPermi="['mes:md-vendor:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <md-vendor-form ref="form" @success="getList" />
    <md-vendor-import-form ref="importForm" @success="getList" />
  </div>
</template>

<script>
import { MdVendorApi } from '@/api/mes/md/vendor'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import MdVendorForm from './MdVendorForm.vue'
import MdVendorImportForm from './MdVendorImportForm.vue'

export default {
  name: 'MesMdVendor',
  components: { MdVendorForm, MdVendorImportForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      list: [],
      total: 0,
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        nickname: undefined,
        englishName: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.loading = true
      try {
        const response = await MdVendorApi.getVendorPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    handleImport() {
      this.$refs.importForm.open()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除供应商？')
        await MdVendorApi.deleteVendor(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有供应商数据项？')
        this.exportLoading = true
        const data = await MdVendorApi.exportVendor(this.queryParams)
        this.$download.excel(data, '供应商.xls')
      } catch (error) {
        // 取消导出时保持当前列表
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
