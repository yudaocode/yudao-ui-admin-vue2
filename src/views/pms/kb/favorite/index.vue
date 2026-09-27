<template>
  <div class="app-container">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />

    <el-tabs v-model="activeType" @tab-click="handleTypeChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="知识库" name="1" />
      <el-tab-pane label="文档" name="3" />
      <el-tab-pane label="文件夹" name="2" />
      <el-tab-pane label="文件" name="4" />
    </el-tabs>
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" border stripe>
      <el-table-column label="名称" min-width="260">
        <template slot-scope="scope">
          <el-link type="primary" @click="openItem(scope.row)">
            <svg-icon class="item-icon" :icon-class="getKnowledgeObjectIcon(scope.row.type)" />
            {{ scope.row.name }}
          </el-link>
          <div v-if="scope.row.description" class="secondary-text">
            {{ scope.row.description }}
          </div>
          <div v-if="scope.row.fileType || scope.row.fileSize != null" class="secondary-text">
            <span v-if="scope.row.fileType">{{ scope.row.fileType.toUpperCase() }}</span>
            <span v-if="scope.row.fileType && scope.row.fileSize != null"> · </span>
            <span v-if="scope.row.fileSize != null">
              {{ formatKnowledgeFileSize(scope.row.fileSize) }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template slot-scope="scope">{{ getKnowledgeObjectTypeName(scope.row.type) }}</template>
      </el-table-column>
      <el-table-column label="所属知识库" min-width="180" prop="libraryName" />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="内容更新时间"
        prop="targetUpdateTime"
        width="180"
      />
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="关注时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="是否关注" width="100">
        <template slot-scope="scope">
          <el-switch :value="true" @change="handleCancelFavorite(scope.row)" />
        </template>
      </el-table-column>
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
import * as KnowledgeFavoriteApi from '@/api/pms/kb/interaction/favorite'
import { dateFormatter } from '@/utils/formatTime'
import { PmsKnowledgeObjectType } from '@/views/pms/kb/utils/constants'
import {
  formatKnowledgeFileSize,
  getKnowledgeObjectIcon,
  getKnowledgeObjectTypeName
} from '@/views/pms/kb/utils/format'

export default {
  name: 'PmsKnowledgeFavorite',
  data() {
    return {
      loading: false,
      activeType: 'all',
      list: [],
      total: 0,
      queryParams: { pageNo: 1, pageSize: 10, type: undefined }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatKnowledgeFileSize,
    getKnowledgeObjectIcon,
    getKnowledgeObjectTypeName,
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeFavoriteApi.getKnowledgeFavoritePage(this.queryParams)
        const data = response.data
        this.list = data.list
        this.total = data.total
      } finally {
        this.loading = false
      }
    },
    handleTypeChange(tab) {
      const name = tab.name
      this.queryParams.type = name === 'all' ? undefined : Number(name)
      this.queryParams.pageNo = 1
      return this.getList()
    },
    openItem(item) {
      if (item.type === PmsKnowledgeObjectType.LIBRARY) {
        this.$router.push('/pms/kb/library/' + item.libraryId)
        return
      }
      if (item.documentId) {
        this.$router.push('/pms/kb/library/' + item.libraryId + '/document/' + item.documentId)
        return
      }
      this.$router.push('/pms/kb/library/' + item.libraryId + '/folder/' + item.folderId)
    },
    async handleCancelFavorite(item) {
      try {
        await this.$modal.confirm('确认取消关注“' + item.name + '”吗？')
        await KnowledgeFavoriteApi.deleteKnowledgeFavorite(item.type, item.entityId)
        this.$modal.msgSuccess('已取消关注')
        await this.getList()
      } catch (error) {
        // 用户取消时保留当前列表。
      }
    }
  }
}
</script>

<style scoped>
.item-icon {
  margin-right: 6px;
}

.secondary-text {
  color: #909399;
  font-size: 12px;
}
</style>
