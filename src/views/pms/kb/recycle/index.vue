<template>
  <div class="app-container">
    <doc-alert title="【PMS】文档与协作" url="https://doc.iocoder.cn/pms/kb/document/" />
    <el-alert
      class="recycle-alert"
      :closable="false"
      show-icon
      title="恢复时会保留此前单独删除的子项；彻底删除后无法恢复。"
      type="warning"
    />
    <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" border>
      <el-table-column label="名称" min-width="240" prop="name" />
      <el-table-column align="center" label="类型" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.PMS_KNOWLEDGE_OBJECT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="删除人" prop="deleteUserName" width="130" />
      <el-table-column :formatter="dateFormatter" label="删除时间" prop="deleteTime" width="180" />
      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" @click="handleRestore(scope.row)">恢复</el-button>
          <el-button class="danger-text" type="text" @click="handlePermanentDelete(scope.row)">
            彻底删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import * as KnowledgeRecycleApi from '@/api/pms/kb/recycle'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'

export default {
  name: 'PmsKnowledgeRecycle',
  data() {
    return { DICT_TYPE, loading: false, list: [] }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeRecycleApi.getKnowledgeLibraryRecycleList()
        this.list = response.data
      } finally {
        this.loading = false
      }
    },
    async handleRestore(record) {
      try {
        await this.$modal.confirm('确认恢复“' + record.name + '”吗？')
        await KnowledgeRecycleApi.restoreKnowledgeRecycle(record.id)
        this.$modal.msgSuccess('恢复成功')
        await this.getList()
      } catch (error) {
        // 用户取消时保留当前列表。
      }
    },
    async handlePermanentDelete(record) {
      try {
        await this.$modal.confirm('彻底删除后不可恢复，确认删除“' + record.name + '”吗？')
        await KnowledgeRecycleApi.permanentDeleteKnowledgeRecycle(record.id)
        this.$modal.msgSuccess('彻底删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消时保留当前列表。
      }
    }
  }
}
</script>

<style scoped>
.recycle-alert {
  margin-bottom: 12px;
}

.danger-text {
  color: #f56c6c;
}
</style>
