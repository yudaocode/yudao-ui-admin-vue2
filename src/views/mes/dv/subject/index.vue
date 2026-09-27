<!-- MES 点检保养项目列表 -->
<template>
  <div class="app-container">
    <doc-alert title="【设备】点检保养项目、点检保养方案" url="https://doc.iocoder.cn/mes/dv/check-plan/" />
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="100px" size="small" @submit.native.prevent>
      <el-form-item label="项目编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入项目编码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="项目类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择项目类型" clearable>
          <el-option v-for="dict in subjectTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button v-hasPermi="['mes:dv-subject:create']" type="primary" plain icon="el-icon-plus" @click="openForm('create')">新增</el-button>
        <el-button v-hasPermi="['mes:dv-subject:export']" type="success" plain icon="el-icon-download" :loading="exportLoading" @click="handleExport">导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="项目编码" align="center" prop="code" width="120" />
      <el-table-column label="项目名称" align="center" prop="name" min-width="150" />
      <el-table-column label="项目类型" align="center" prop="type" width="100">
        <template v-slot="scope"><dict-tag :type="MES_DV_SUBJECT_TYPE" :value="scope.row.type" /></template>
      </el-table-column>
      <el-table-column label="项目内容" align="center" prop="content" min-width="200" />
      <el-table-column label="标准" align="center" prop="standard" min-width="200" />
      <el-table-column label="状态" align="center" prop="status" width="80">
        <template v-slot="scope"><dict-tag :type="COMMON_STATUS" :value="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template v-slot="scope">
          <el-button v-hasPermi="['mes:dv-subject:update']" type="text" size="mini" @click="openForm('update', scope.row.id)">编辑</el-button>
          <el-button v-hasPermi="['mes:dv-subject:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <subject-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { DvSubjectApi } from '@/api/mes/dv/subject'
import SubjectForm from './SubjectForm.vue'

const COMMON_STATUS = 'common_status'
const MES_DV_SUBJECT_TYPE = 'mes_dv_subject_type'

export default {
  name: 'MesDvSubject',
  components: { SubjectForm },
  data() {
    return {
      COMMON_STATUS,
      MES_DV_SUBJECT_TYPE,
      loading: true,
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, type: undefined, status: undefined },
      subjectTypeOptions: getIntDictOptions(MES_DV_SUBJECT_TYPE),
      statusOptions: getIntDictOptions(COMMON_STATUS),
      exportLoading: false
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
        const response = await DvSubjectApi.getSubjectPage(this.queryParams)
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
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除点检保养项目？')
        await DvSubjectApi.deleteSubject(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有点检保养项目数据项？')
        this.exportLoading = true
        const response = await DvSubjectApi.exportSubject(this.queryParams)
        this.$download.excel(response, '点检保养项目.xls')
      } catch (error) {
        // 取消导出时不处理
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
