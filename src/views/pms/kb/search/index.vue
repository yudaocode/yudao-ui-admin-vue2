<template>
  <div class="app-container">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />
    <el-form ref="queryForm" :inline="true" :model="queryParams" label-width="68px">
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          clearable
          placeholder="请输入文档标题或正文"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="知识库" prop="libraryId">
        <knowledge-library-select
          v-model="queryParams.libraryId"
          placeholder="请选择知识库"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creatorUserId">
        <user-select
          v-model="queryParams.creatorUserId"
          placeholder="请选择创建人"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="更新时间" prop="updateTime">
        <el-date-picker
          v-model="queryParams.updateTime"
          :default-time="['00:00:00', '23:59:59']"
          end-placeholder="结束日期"
          :picker-options="{ shortcuts: defaultShortcuts }"
          start-placeholder="开始日期"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 360px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" border stripe>
      <el-table-column label="文档标题" min-width="280">
        <template slot-scope="scope">
          <el-link type="primary" @click="openDocumentDetail(scope.row)">
            {{ scope.row.title }}
          </el-link>
          <span v-if="scope.row.fileSize != null" class="file-size">
            （{{ formatKnowledgeFileSize(scope.row.fileSize) }}）
          </span>
          <div
            v-if="scope.row.contentSummary"
            v-dompurify-html="highlightSummary(scope.row.contentSummary)"
            class="content-summary"
          ></div>
        </template>
      </el-table-column>
      <el-table-column label="知识库" min-width="180" prop="libraryName" />
      <el-table-column align="center" label="类型" width="130">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.PMS_KNOWLEDGE_DOCUMENT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creatorUserName" width="130" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="更新时间"
        prop="updateTime"
        width="180"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </div>
</template>

<script>
import * as KnowledgeDocumentApi from '@/api/pms/kb/content/document'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter, defaultShortcuts } from '@/utils/formatTime'
import KnowledgeLibrarySelect from '@/views/pms/kb/library/components/KnowledgeLibrarySelect.vue'
import UserSelect from '@/views/system/user/components/UserSelect.vue'
import { formatKnowledgeFileSize } from '@/views/pms/kb/utils/format'

export default {
  name: 'PmsKnowledgeSearch',
  components: { KnowledgeLibrarySelect, UserSelect },
  data() {
    const query = this.$route.query
    return {
      DICT_TYPE,
      defaultShortcuts,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        keyword: String(query.keyword || ''),
        libraryId: query.libraryId ? Number(query.libraryId) : undefined,
        creatorUserId: query.creatorUserId ? Number(query.creatorUserId) : undefined,
        updateTime: query.updateTime ? String(query.updateTime).split(',') : []
      }
    }
  },
  watch: {
    '$route.query': {
      deep: true,
      handler(query) {
        this.queryParams.keyword = String(query.keyword || '')
        this.queryParams.libraryId = query.libraryId ? Number(query.libraryId) : undefined
        this.queryParams.creatorUserId = query.creatorUserId
          ? Number(query.creatorUserId)
          : undefined
        this.queryParams.updateTime = query.updateTime ? String(query.updateTime).split(',') : []
        this.queryParams.pageNo = 1
        this.getList()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatKnowledgeFileSize,
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeDocumentApi.getKnowledgeDocumentSearchPage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
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
    openDocumentDetail(document) {
      this.$router.push('/pms/kb/library/' + document.libraryId + '/document/' + document.id)
    },
    highlightSummary(summary) {
      const keyword = this.queryParams.keyword.trim()
      if (!keyword) return summary
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return summary.replace(new RegExp('(' + escapedKeyword + ')', 'gi'), '<mark>$1</mark>')
    }
  }
}
</script>

<style scoped>
.file-size,
.content-summary {
  color: #909399;
  font-size: 12px;
}

.file-size {
  margin-left: 4px;
}

.content-summary {
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
