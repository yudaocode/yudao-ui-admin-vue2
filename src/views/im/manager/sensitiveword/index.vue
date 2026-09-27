<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="敏感词"
        prop="word"
      ><el-input
        v-model="queryParams.word"
        placeholder="请输入敏感词"
        clearable
        style="width: 240px"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-select
        v-model="queryParams.status"
        placeholder="请选择状态"
        clearable
        style="width: 240px"
      ><el-option
        v-for="dict in statusOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      ><el-date-picker
        v-model="queryParams.createTime"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 240px"
      /></el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button><el-button
        v-hasPermi="['im:manager:sensitive-word:create']"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="openForm('create')"
      >新增</el-button><el-button
        v-hasPermi="['im:manager:sensitive-word:delete']"
        type="danger"
        plain
        icon="el-icon-delete"
        :disabled="checkedIds.length === 0"
        @click="handleDeleteBatch"
      >批量删除</el-button></el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        width="100"
      />
      <el-table-column
        label="敏感词"
        align="center"
        prop="word"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.COMMON_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="创建人"
        align="center"
        prop="creatorName"
        width="120"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      ><template #default="scope"><el-button
        v-hasPermi="['im:manager:sensitive-word:update']"
        type="text"
        @click="openForm('update', scope.row.id)"
      >编辑</el-button><el-button
        v-hasPermi="['im:manager:sensitive-word:delete']"
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
    <SensitiveWordForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { deleteManagerSensitiveWord, deleteManagerSensitiveWordList, getManagerSensitiveWordPage } from '@/api/im/manager/sensitiveword'
import SensitiveWordForm from './SensitiveWordForm.vue'

export default {
  name: 'ImSensitiveWord',
  components: { SensitiveWordForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      checkedIds: [],
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      queryParams: { pageNo: 1, pageSize: 10, word: undefined, status: undefined, createTime: [] }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getManagerSensitiveWordPage(this.queryParams)
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
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否确认删除所选数据项?')
      } catch (error) {
        return
      }
      await deleteManagerSensitiveWord(id)
      this.$modal.msgSuccess(this.$t('common.delSuccess'))
      await this.getList()
    },
    handleRowCheckboxChange(rows) {
      this.checkedIds = rows.map(row => row.id)
    },
    async handleDeleteBatch() {
      try {
        await this.$modal.confirm('是否确认删除所选数据项?')
      } catch (error) {
        return
      }
      await deleteManagerSensitiveWordList(this.checkedIds)
      this.checkedIds = []
      this.$modal.msgSuccess(this.$t('common.delSuccess'))
      await this.getList()
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
</style>
