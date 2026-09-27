<template>
  <div class="app-container ai-knowledge-page">
    <doc-alert title="AI 知识库" url="https://doc.iocoder.cn/ai/knowledge/" />

    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="95px"
      @submit.native.prevent
    >
      <el-form-item label="知识库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入知识库名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择是否启用">
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
          :default-time="['00:00:00', '23:59:59']"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          v-hasPermi="['ai:knowledge:create']"
          @click="openForm('create')"
        >
          新增
        </el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="知识库名称" align="center" prop="name" min-width="140" />
      <el-table-column label="知识库描述" align="center" prop="description" min-width="180" />
      <el-table-column label="向量化模型" align="center" prop="embeddingModel" min-width="140" />
      <el-table-column label="是否启用" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:update']"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:query']"
            @click="handleDocument(scope.row.id)"
          >文档</el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:query']"
            @click="handleRetrieval(scope.row.id)"
          >召回测试</el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:delete']"
            @click="handleDelete(scope.row)"
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

    <knowledge-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { KnowledgeApi } from '@/api/ai/knowledge/knowledge'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import KnowledgeForm from './KnowledgeForm.vue'

export default {
  name: 'AiKnowledge',
  components: { KnowledgeForm },
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
        name: undefined,
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
        const response = await KnowledgeApi.getKnowledgePage(this.queryParams)
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
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(row) {
      try {
        await this.$modal.confirm('确认删除知识库“' + row.name + '”吗？')
        await KnowledgeApi.deleteKnowledge(row.id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时无需提示。
      }
    },
    handleDocument(id) {
      this.$router.push({ name: 'AiKnowledgeDocument', query: { knowledgeId: id }})
    },
    handleRetrieval(id) {
      this.$router.push({ name: 'AiKnowledgeRetrieval', query: { id }})
    }
  }
}
</script>
