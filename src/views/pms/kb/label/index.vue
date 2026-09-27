<template>
  <div class="app-container">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <el-card class="label-card" shadow="never">
          <div class="label-header">
            <span>文档标签</span>
            <el-button
              v-hasPermi="['pms:kb:library:update']"
              type="text"
              @click="openLabelManage"
            >管理</el-button>
          </div>
          <el-input
            v-model="labelKeyword"
            class="label-search"
            clearable
            placeholder="请输入标签名称"
            prefix-icon="el-icon-search"
          />
          <div v-loading="labelLoading" class="label-list-wrap">
            <el-scrollbar v-if="filteredLabelList.length" class="label-scrollbar">
              <el-button
                v-for="label in filteredLabelList"
                :key="label.id"
                :plain="selectedLabelId !== label.id"
                :type="selectedLabelId === label.id ? 'primary' : 'default'"
                class="label-button"
                @click="handleSelectLabel(label.id)"
              >
                <span class="label-dot" :style="{ backgroundColor: label.color }"></span>
                <span class="label-name">{{ label.name }}</span>
              </el-button>
            </el-scrollbar>
            <el-empty v-else :image-size="70" description="暂无标签" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="20" :xs="24">
        <el-card shadow="never">
          <div v-if="selectedLabel" class="document-header">
            <div>当前标签：{{ selectedLabel.name }}（{{ total }}）</div>
            <el-button type="text" @click="clearSelectedLabel">清除筛选</el-button>
          </div>
          <el-table
            v-if="selectedLabel"
            v-loading="loading"
            :data="documentList"
            :show-overflow-tooltip="true"
            border
          >
            <el-table-column label="文档标题" min-width="240">
              <template slot-scope="scope">
                <el-link type="primary" @click="openDocumentDetail(scope.row)">
                  {{ scope.row.title }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="知识库" min-width="180" prop="libraryName" />
            <el-table-column label="创建人" prop="creatorUserName" width="130" />
            <el-table-column
              :formatter="dateFormatter"
              align="center"
              label="更新时间"
              prop="updateTime"
              width="180"
            />
          </el-table>
          <el-empty v-else description="暂无可用标签" />
          <pagination
            v-if="selectedLabel"
            :limit.sync="queryParams.pageSize"
            :page.sync="queryParams.pageNo"
            :total="total"
            @pagination="getDocumentList"
          />
        </el-card>
      </el-col>
    </el-row>
    <knowledge-label-manage-dialog ref="labelManage" @success="getLabelList" />
  </div>
</template>

<script>
import * as KnowledgeDocumentLabelApi from '@/api/pms/kb/content/document/label'
import { dateFormatter } from '@/utils/formatTime'
import KnowledgeLabelManageDialog from './KnowledgeLabelManageDialog.vue'

export default {
  name: 'PmsKnowledgeDocumentLabel',
  components: { KnowledgeLabelManageDialog },
  data() {
    return {
      labelLoading: true,
      loading: false,
      labelList: [],
      labelKeyword: '',
      selectedLabelId: this.$route.query.labelId ? Number(this.$route.query.labelId) : undefined,
      documentList: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10 }
    }
  },
  computed: {
    filteredLabelList() {
      const keyword = this.labelKeyword.trim()
      return this.labelList.filter(label => label.name.includes(keyword))
    },
    selectedLabel() {
      return this.labelList.find(label => label.id === this.selectedLabelId)
    }
  },
  watch: {
    '$route.query.labelId'(labelId) {
      this.selectedLabelId = labelId ? Number(labelId) : undefined
      this.getDocumentList()
    }
  },
  created() {
    this.getLabelList()
  },
  methods: {
    dateFormatter,
    openLabelManage() {
      this.$refs.labelManage.open()
    },
    async getLabelList() {
      this.labelLoading = true
      try {
        const response = await KnowledgeDocumentLabelApi.getKnowledgeDocumentLabelList()
        this.labelList = response.data
        if (!this.labelList.some(label => label.id === this.selectedLabelId)) {
          this.selectedLabelId = this.labelList.length ? this.labelList[0].id : undefined
          this.queryParams.pageNo = 1
        }
        await this.getDocumentList()
      } finally {
        this.labelLoading = false
      }
    },
    async getDocumentList() {
      if (!this.selectedLabelId) {
        this.documentList = []
        this.total = 0
        return
      }
      this.loading = true
      try {
        const response = await KnowledgeDocumentLabelApi.getKnowledgeDocumentPageByLabel(
          Object.assign({}, this.queryParams, { labelId: this.selectedLabelId })
        )
        const data = response.data
        this.documentList = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleSelectLabel(labelId) {
      this.selectedLabelId = labelId
      this.queryParams.pageNo = 1
      this.$router.replace({ query: { labelId: String(labelId) }})
      return this.getDocumentList()
    },
    clearSelectedLabel() {
      this.selectedLabelId = undefined
      this.queryParams.pageNo = 1
      this.documentList = []
      this.total = 0
      this.$router.replace({ query: {}})
    },
    openDocumentDetail(document) {
      this.$router.push('/pms/kb/library/' + document.libraryId + '/document/' + document.id)
    }
  }
}
</script>

<style scoped>
.label-card {
  min-height: 300px;
}

.label-header,
.document-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
}

.label-search {
  margin-bottom: 12px;
}

.label-list-wrap {
  min-height: 120px;
}

.label-scrollbar {
  height: calc(100vh - 300px);
}

.label-button {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin: 0 0 6px;
}

.label-dot {
  flex: 0 0 10px;
  width: 10px;
  height: 10px;
  margin-right: 8px;
  border-radius: 50%;
}

.label-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
