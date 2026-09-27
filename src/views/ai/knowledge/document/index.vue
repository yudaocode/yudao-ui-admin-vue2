<template>
  <div class="app-container ai-knowledge-document">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="文件名称" prop="name">
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入文件名称"
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          v-hasPermi="['ai:knowledge:create']"
          @click="handleCreate"
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
      <el-table-column label="文档编号" align="center" prop="id" width="100" />
      <el-table-column label="文件名称" align="center" prop="name" min-width="180" />
      <el-table-column label="字符数" align="center" prop="contentLength" width="100" />
      <el-table-column label="Token 数" align="center" prop="tokens" width="100" />
      <el-table-column
        label="分片最大 Token 数"
        align="center"
        prop="segmentMaxTokens"
        min-width="150"
      />
      <el-table-column label="召回次数" align="center" prop="retrievalCount" width="100" />
      <el-table-column label="是否启用" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="CommonStatusEnum.ENABLE"
            :inactive-value="CommonStatusEnum.DISABLE"
            :disabled="!canUpdate"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="上传时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:update']"
            @click="handleUpdate(scope.row.id)"
          >编辑</el-button>
          <el-button
            type="text"
            size="mini"
            v-hasPermi="['ai:knowledge:query']"
            @click="handleSegment(scope.row.id)"
          >分段</el-button>
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
  </div>
</template>

<script>
import { KnowledgeDocumentApi } from '@/api/ai/knowledge/document'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'AiKnowledgeDocument',
  data() {
    return {
      CommonStatusEnum,
      loading: true,
      list: [],
      total: 0,
      statusOptions: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
        knowledgeId: undefined
      }
    }
  },
  computed: {
    canUpdate() {
      return checkPermi(['ai:knowledge:update'])
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(route) {
        if (route.name !== 'AiKnowledgeDocument') return
        this.initialize(route.query.knowledgeId)
      }
    }
  },
  methods: {
    initialize(knowledgeId) {
      if (!knowledgeId) {
        this.$modal.msgError('知识库 ID 不存在，无法查看文档列表')
        this.$router.push({ name: 'AiKnowledge' }).catch(() => {})
        return
      }
      this.queryParams.knowledgeId = knowledgeId
      this.queryParams.pageNo = 1
      this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentApi.getKnowledgeDocumentPage(this.queryParams)
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
    handleCreate() {
      this.$router.push({
        name: 'AiKnowledgeDocumentCreate',
        query: { knowledgeId: this.queryParams.knowledgeId }
      })
    },
    handleUpdate(id) {
      this.$router.push({
        name: 'AiKnowledgeDocumentUpdate',
        query: { id, knowledgeId: this.queryParams.knowledgeId }
      })
    },
    async handleDelete(row) {
      try {
        await this.$modal.confirm('确认删除文档“' + row.name + '”吗？')
        await KnowledgeDocumentApi.deleteKnowledgeDocument(row.id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除时无需提示。
      }
    },
    async handleStatusChange(row) {
      const changedStatus = row.status
      const action = changedStatus === CommonStatusEnum.ENABLE ? '启用' : '禁用'
      try {
        await this.$modal.confirm('确认要“' + action + '”文档“' + row.name + '”吗？')
        await KnowledgeDocumentApi.updateKnowledgeDocumentStatus({
          id: row.id,
          status: changedStatus
        })
        this.$modal.msgSuccess('修改成功')
        await this.getList()
      } catch (error) {
        row.status = changedStatus === CommonStatusEnum.ENABLE
          ? CommonStatusEnum.DISABLE
          : CommonStatusEnum.ENABLE
      }
    },
    handleSegment(id) {
      this.$router.push({ name: 'AiKnowledgeSegment', query: { documentId: id }})
    }
  }
}
</script>
