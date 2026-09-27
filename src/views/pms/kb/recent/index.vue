<template>
  <div class="app-container">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="今天" name="todayItems" />
      <el-tab-pane label="昨天" name="yesterdayItems" />
      <el-tab-pane label="最近 30 天" name="recent30DayItems" />
    </el-tabs>
    <el-table v-loading="loading" :data="activeItems" :show-overflow-tooltip="true" border>
      <el-table-column label="名称" min-width="260">
        <template slot-scope="scope">
          <el-link type="primary" @click="openItem(scope.row)">
            <svg-icon class="item-icon" :icon-class="getKnowledgeObjectIcon(scope.row.type)" />
            {{ scope.row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template slot-scope="scope">{{ getKnowledgeObjectTypeName(scope.row.type) }}</template>
      </el-table-column>
      <el-table-column label="所属知识库" min-width="180" prop="libraryName" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="浏览时间"
        prop="createTime"
        width="180"
      />
    </el-table>
  </div>
</template>

<script>
import * as KnowledgeViewRecordApi from '@/api/pms/kb/interaction/view-record'
import { dateFormatter } from '@/utils/formatTime'
import { getKnowledgeObjectIcon, getKnowledgeObjectTypeName } from '@/views/pms/kb/utils/format'

export default {
  name: 'PmsKnowledgeRecent',
  data() {
    return {
      loading: false,
      activeTab: 'todayItems',
      recent: { todayItems: [], yesterdayItems: [], recent30DayItems: [] }
    }
  },
  computed: {
    activeItems() {
      return this.recent[this.activeTab]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getKnowledgeObjectIcon,
    getKnowledgeObjectTypeName,
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeViewRecordApi.getKnowledgeRecentViewRecordList()
        Object.assign(this.recent, response.data)
      } finally {
        this.loading = false
      }
    },
    openItem(item) {
      if (item.documentId) {
        this.$router.push('/pms/kb/library/' + item.libraryId + '/document/' + item.documentId)
        return
      }
      this.$router.push('/pms/kb/library/' + item.libraryId + '/folder/' + item.folderId)
    }
  }
}
</script>

<style scoped>
.item-icon {
  margin-right: 6px;
}
</style>
