<!-- MES 客户列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【基础】客户管理、供应商管理"
      url="https://doc.iocoder.cn/mes/md/client-vendor/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="客户编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入客户编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入客户名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="客户简称" prop="nickname">
        <el-input v-model="queryParams.nickname" placeholder="请输入客户简称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="英文名称" prop="englishName">
        <el-input v-model="queryParams.englishName" placeholder="请输入客户英文名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="客户类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择客户类型" clearable>
          <el-option v-for="dict in clientTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in statusOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['mes:md-client:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:md-client:import']"
          type="warning"
          plain
          icon="el-icon-upload2"
          @click="handleImport"
        >导入</el-button>
        <el-button
          v-hasPermi="['mes:md-client:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="客户编码" align="center" prop="code">
        <template v-slot="scope">
          <el-button type="text" @click="openForm('detail', scope.row.id)">{{ scope.row.code }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="客户名称" align="center" prop="name" width="150" />
      <el-table-column label="客户简称" align="center" prop="nickname" />
      <el-table-column label="客户类型" align="center" prop="type">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.MES_CLIENT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="客户电话" align="center" prop="telephone" />
      <el-table-column label="联系人1" align="center" prop="contact1Name" />
      <el-table-column label="联系人1-电话" align="center" prop="contact1Telephone" />
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template v-slot="scope">
          <el-button
            v-hasPermi="['mes:md-client:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['mes:md-client:delete']"
            type="text"
            size="mini"
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

    <md-client-form ref="form" @success="getList" />
    <md-client-import-form ref="importForm" @success="getList" />
  </div>
</template>

<script>
import { MdClientApi } from '@/api/mes/md/client'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import MdClientForm from './MdClientForm.vue'
import MdClientImportForm from './MdClientImportForm.vue'

export default {
  name: 'MesMdClient',
  components: { MdClientForm, MdClientImportForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      exportLoading: false,
      list: [],
      total: 0,
      clientTypeOptions: getIntDictOptions(DICT_TYPE.MES_CLIENT_TYPE),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: undefined,
        name: undefined,
        nickname: undefined,
        englishName: undefined,
        type: undefined,
        status: undefined
      }
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
        const response = await MdClientApi.getClientPage(this.queryParams)
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
        await this.$modal.confirm('是否确认删除客户？')
        await MdClientApi.deleteClient(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有客户数据项？')
        this.exportLoading = true
        const data = await MdClientApi.exportClient(this.queryParams)
        this.$download.excel(data, '客户.xls')
      } catch (error) {
        // 取消导出时保持当前列表
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
