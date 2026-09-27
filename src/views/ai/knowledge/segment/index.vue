<template>
  <div class="app-container ai-knowledge-segment">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="文档编号" prop="documentId">
        <el-input
          v-model="queryParams.documentId"
          clearable
          placeholder="请输入文档编号"
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
      <el-table-column label="分段编号" align="center" prop="id" width="100" />
      <el-table-column type="expand">
        <template slot-scope="scope">
          <div class="content-expand">
            <div class="content-title">完整内容：</div>
            {{ scope.row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="切片内容"
        align="center"
        prop="content"
        min-width="250"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="字符数" align="center" prop="contentLength" width="90" />
      <el-table-column label="token 数量" align="center" prop="tokens" width="110" />
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

    <knowledge-segment-form ref="form" @success="getList" />
  </div>
</template>

<script>
import { KnowledgeSegmentApi } from '@/api/ai/knowledge/segment'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { checkPermi } from '@/utils/permission'
import KnowledgeSegmentForm from './KnowledgeSegmentForm.vue'

export default {
  name: 'AiKnowledgeSegment',
  components: { KnowledgeSegmentForm },
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
        documentId: undefined,
        content: undefined,
        status: undefined
      }
    }
  },
  computed: {
    canUpdate() {
      return checkPermi(['ai:knowledge:update'])
    }
  },
  watch: {
    '$route.query.documentId': {
      immediate: true,
      handler(documentId) {
        this.initialize(documentId)
      }
    }
  },
  methods: {
    initialize(documentId) {
      if (!documentId) {
        this.$modal.msgError('文档 ID 不存在，无法查看分段列表')
        this.$router.push({ name: 'AiKnowledgeDocument' }).catch(() => {})
        return
      }
      this.queryParams.documentId = documentId
      this.queryParams.pageNo = 1
      this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeSegmentApi.getKnowledgeSegmentPage(this.queryParams)
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
      this.$refs.form.open(type, id, this.queryParams.documentId)
    },
    async handleDelete(row) {
      try {
        await this.$modal.confirm('确认删除分段“' + row.id + '”吗？')
        await KnowledgeSegmentApi.deleteKnowledgeSegment(row.id)
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
        await this.$modal.confirm('确认要“' + action + '”该分段吗？')
        await KnowledgeSegmentApi.updateKnowledgeSegmentStatus({
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
    }
  }
}
</script>

<style lang="scss" scoped>
.content-expand {
  padding: 10px 20px;
  line-height: 1.5;
  white-space: pre-wrap;
  background: #f9f9f9;
  border-left: 3px solid #409eff;
  border-radius: 4px;
}

.content-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
}
</style>
