<!-- MES 生产工序列表 -->
<template>
  <div class="app-container">
    <doc-alert
      title="【生产】工序设置、工艺流程"
      url="https://doc.iocoder.cn/mes/pro/process-route/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="工序编码"
        prop="code"
      ><el-input
        v-model="queryParams.code"
        placeholder="请输入工序编码"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="工序名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        placeholder="请输入工序名称"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
      ><el-option
        v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item><el-button
                      icon="el-icon-search"
                      @click="handleQuery"
                    >搜索</el-button><el-button
                      icon="el-icon-refresh"
                      @click="resetQuery"
                    >重置</el-button>
        <el-button
          v-hasPermi="['mes:pro-process:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
        <el-button
          v-hasPermi="['mes:pro-process:export']"
          type="success"
          plain
          icon="el-icon-download"
          :loading="exportLoading"
          @click="handleExport"
        >导出</el-button></el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
      row-key="id"
    >
      <el-table-column
        label="工序编码"
        align="center"
        prop="code"
        width="150"
      ><template #default="scope"><el-button
        type="text"
        @click="openForm('detail', scope.row.id)"
      >{{ scope.row.code }}</el-button></template></el-table-column>
      <el-table-column
        label="工序名称"
        align="center"
        prop="name"
        width="200"
      /><el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        show-overflow-tooltip
      /><el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="操作"
        align="center"
        width="150"
      ><template #default="scope"><el-button
        v-hasPermi="['mes:pro-process:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['mes:pro-process:delete']"
        type="text"
        class="danger-text"
        @click="handleDelete(scope.row.id)"
      >删除</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <pro-process-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/plugins/download'
import { ProProcessApi } from '@/api/mes/pro/process'
import ProProcessForm from './ProProcessForm.vue'

export default {
  name: 'MesProProcess',
  components: { ProProcessForm },
  data() { return { DICT_TYPE, loading: true, list: [], total: 0, exportLoading: false, queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, status: undefined }} },
  created() { this.getList() },
  methods: {
    getIntDictOptions, dateFormatter,
    async getList() { this.loading = true; try { const response = await ProProcessApi.getProcessPage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); return this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除该生产工序？'); await ProProcessApi.deleteProcess(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { if (error !== 'cancel') throw error } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有生产工序数据项？'); this.exportLoading = true; const response = await ProProcessApi.exportProcess(this.queryParams); download.excel(response, '生产工序.xls') } catch (error) { if (error !== 'cancel') throw error } finally { this.exportLoading = false } }
  }
}
</script>

<style scoped>.danger-text { color: #f56c6c; }</style>
