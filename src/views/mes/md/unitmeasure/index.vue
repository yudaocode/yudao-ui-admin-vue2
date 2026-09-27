<!-- MES 计量单位列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【基础】物料产品、分类、计量单位"
      url="https://doc.iocoder.cn/mes/md/product/"
    />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item label="单位编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入单位编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入单位名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          v-hasPermi="['mes:md-unit-measure:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:md-unit-measure:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="单位编码" align="center" prop="code" />
      <el-table-column label="单位名称" align="center" prop="name" />
      <el-table-column label="是否主单位" align="center" prop="primaryFlag">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.primaryFlag" />
        </template>
      </el-table-column>
      <el-table-column label="与主单位换算比例" align="center" prop="changeRate" />
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="130">
        <template v-slot="scope">
          <el-button
            v-hasPermi="['mes:md-unit-measure:update']"
            type="text"
            size="mini"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['mes:md-unit-measure:delete']"
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

    <unit-measure-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { MdUnitMeasureApi } from '@/api/mes/md/unitmeasure'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import UnitMeasureForm from './UnitMeasureForm.vue'

export default {
  name: 'MesMdUnitMeasure',
  components: { UnitMeasureForm },
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
        const response = await MdUnitMeasureApi.getUnitMeasurePage(this.queryParams)
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
        await this.$modal.confirm('是否确认删除计量单位？')
        await MdUnitMeasureApi.deleteUnitMeasure(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 取消删除时保持当前列表
      }
    },
    async handleExport() {
      try {
        await this.$modal.confirm('是否确认导出所有计量单位数据项？')
        this.exportLoading = true
        const data = await MdUnitMeasureApi.exportUnitMeasure(this.queryParams)
        this.$download.excel(data, '计量单位.xls')
      } catch (error) {
        // 取消导出时保持当前列表
      } finally {
        this.exportLoading = false
      }
    }
  }
}
</script>
