<template>
  <div class="app-container">
    <doc-alert
      title="【基础】编码规则"
      url="https://doc.iocoder.cn/mes/md/autocode/"
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
        label="规则编码"
        prop="code"
      ><el-input
        v-model="queryParams.code"
        placeholder="请输入规则编码"
        clearable
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="规则名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        placeholder="请输入规则名称"
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
        v-for="dict in statusOptions"
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
      >重置</el-button><el-button
        v-hasPermi="['mes:auto-code-rule:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button><el-button
        v-hasPermi="['mes:auto-code-rule:export']"
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
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="规则编码"
        align="center"
        prop="code"
        width="150"
      /><el-table-column
        label="规则名称"
        align="center"
        prop="name"
        width="200"
      /><el-table-column
        label="规则描述"
        align="center"
        prop="description"
        show-overflow-tooltip
      /><el-table-column
        label="最大长度"
        align="center"
        prop="maxLength"
        width="100"
      />
      <el-table-column
        label="是否补齐"
        align="center"
        prop="padded"
        width="100"
      ><template v-slot="scope"><dict-tag
        :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
        :value="scope.row.padded"
      /></template></el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
      ><template v-slot="scope"><dict-tag
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
        width="180"
      ><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      ><template v-slot="scope"><el-button
        v-hasPermi="['mes:auto-code-rule:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['mes:auto-code-rule:delete']"
        type="text"
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
    <auto-code-rule-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { AutoCodeRuleApi } from '@/api/mes/md/autocode/rule'
import AutoCodeRuleForm from './AutoCodeRuleForm.vue'
export default {
  name: 'MesAutoCodeRule', components: { AutoCodeRuleForm },
  data() { return { DICT_TYPE, loading: true, exportLoading: false, list: [], total: 0, statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS), queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, status: undefined }} },
  created() { this.getList() },
  methods: {
    parseTime,
    async getList() { this.loading = true; try { const response = await AutoCodeRuleApi.getAutoCodeRulePage(this.queryParams); this.list = response.data.list; this.total = response.data.total } finally { this.loading = false } },
    handleQuery() { this.queryParams.pageNo = 1; return this.getList() }, resetQuery() { this.resetForm('queryForm'); return this.handleQuery() }, openForm(type, id) { this.$refs.form.open(type, id) },
    async handleDelete(id) { try { await this.$modal.confirm('是否确认删除编码规则？'); await AutoCodeRuleApi.deleteAutoCodeRule(id); this.$modal.msgSuccess('删除成功'); await this.getList() } catch (error) { /* 取消删除 */ } },
    async handleExport() { try { await this.$modal.confirm('是否确认导出所有编码规则数据项？'); this.exportLoading = true; const response = await AutoCodeRuleApi.exportAutoCodeRule(this.queryParams); this.$download.excel(response, '编码规则.xls') } catch (error) { /* 取消导出 */ } finally { this.exportLoading = false } }
  }
}
</script>
