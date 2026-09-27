<template>
  <div class="app-container">
    <doc-alert
      title="AI 工具调用（function calling）"
      url="https://doc.iocoder.cn/ai/tool/"
    />
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      @submit.native.prevent
    >
      <el-form-item
        label="工具名称"
        prop="name"
      ><el-input
        v-model="queryParams.name"
        clearable
        placeholder="请输入工具名称"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        clearable
        placeholder="请选择状态"
      ><el-option
        v-for="item in statusDictDatas"
        :key="item.value"
        :label="item.label"
        :value="Number(item.value)"
      /></el-select></el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      ><el-date-picker
        v-model="queryParams.createTime"
        type="daterange"
        value-format="yyyy-MM-dd HH:mm:ss"
        :default-time="['00:00:00', '23:59:59']"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      /></el-form-item>
      <el-form-item><el-button
        type="primary"
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['ai:tool:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button></el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    ><el-table-column
      label="工具编号"
      prop="id"
      align="center"
    /><el-table-column
      label="工具名称"
      prop="name"
      align="center"
    /><el-table-column
      label="工具描述"
      prop="description"
      align="center"
      min-width="220"
    /><el-table-column
      label="状态"
      prop="status"
      align="center"
    ><template #default="scope"><dict-tag
      :type="DICT_TYPE.COMMON_STATUS"
      :value="scope.row.status"
    /></template></el-table-column><el-table-column
      label="创建时间"
      prop="createTime"
      align="center"
      width="180"
    ><template #default="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column><el-table-column
      label="操作"
      align="center"
      width="150"
    ><template #default="scope"><el-button
      v-hasPermi="['ai:tool:update']"
      type="text"
      size="mini"
      @click="openForm('update', scope.row.id)"
    >编辑</el-button><el-button
      v-hasPermi="['ai:tool:delete']"
      type="text"
      size="mini"
      @click="handleDelete(scope.row.id)"
    >删除</el-button></template></el-table-column></el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <tool-form
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { ToolApi } from '@/api/ai/model/tool'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import ToolForm from './ToolForm.vue'

export default {
  name: 'AiTool',
  components: { ToolForm },
  data() { return { DICT_TYPE, loading: true, list: [], total: 0, statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS), queryParams: { pageNo: 1, pageSize: 10, name: undefined, description: undefined, status: undefined, createTime: [] }} },
  created() { this.getList() },
  methods: {
    getList() { this.loading = true; return ToolApi.getToolPage(this.queryParams).then(response => { this.list = response.data.list; this.total = response.data.total }).finally(() => { this.loading = false }) },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    openForm(type, id) { this.$refs.form.open(type, id) },
    handleDelete(id) { this.$modal.confirm('是否删除所选中数据？').then(() => ToolApi.deleteTool(id)).then(() => { this.$modal.msgSuccess('删除成功'); this.getList() }).catch(() => {}) }
  }
}
</script>
