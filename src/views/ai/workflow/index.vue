<template>
  <div class="app-container ai-workflow-page">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="流程标识" prop="code">
        <el-input
          v-model="queryParams.code"
          clearable
          placeholder="请输入流程标识"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程名称" prop="name">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入流程名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="状态">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          v-hasPermi="['ai:workflow:create']"
          @click="openForm('create')"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="流程标识" align="center" prop="code" />
      <el-table-column label="流程名称" align="center" prop="name" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="150">
        <template v-slot="scope">
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:workflow:update']"
            @click="openForm('update', scope.row.id)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:workflow:delete']"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
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
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { getWorkflowPage, deleteWorkflow } from '@/api/ai/workflow'

export default {
  name: 'AiWorkflow',
  data() {
    return {
      DICT_TYPE,
      loading: true,
      list: [],
      total: 0,
      statusOptions: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        code: '',
        name: '',
        status: undefined,
        createTime: []
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
        const response = await getWorkflowPage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('确认删除该工作流吗？')
        await deleteWorkflow(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时不提示错误
      }
    },
    openForm(type, id) {
      if (type === 'create') return this.$router.push({ name: 'AiWorkflowCreate' })
      return this.$router.push({
        name: 'AiWorkflowUpdate',
        params: { id, type }
      })
    }
  }
}
</script>

<style scoped>
.ai-workflow-page .el-input,
.ai-workflow-page .el-select {
  width: 240px;
}
</style>
