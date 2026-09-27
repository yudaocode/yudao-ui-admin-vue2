<template>
  <div>
    <knowledge-recycle-detail
      v-if="detail"
      :detail="detail"
      @back="detail = undefined"
      @permanent-delete="handlePermanentDelete"
      @restore="handleRestore"
    />
    <template v-else>
      <div class="recycle-header">
        <span>最近删除</span>
        <span>内容最多保留 30 天，之后将被永久删除</span>
      </div>
      <el-tabs v-model="activeTypeName" class="recycle-tabs">
        <el-tab-pane
          :label="'文档 (' + countByType(PmsKnowledgeObjectType.DOCUMENT) + ')'"
          :name="String(PmsKnowledgeObjectType.DOCUMENT)"
        />
        <el-tab-pane
          :label="'文件夹 (' + countByType(PmsKnowledgeObjectType.FOLDER) + ')'"
          :name="String(PmsKnowledgeObjectType.FOLDER)"
        />
        <el-tab-pane
          :label="'文件 (' + countByType(PmsKnowledgeObjectType.FILE) + ')'"
          :name="String(PmsKnowledgeObjectType.FILE)"
        />
      </el-tabs>
      <el-table v-loading="loading" :data="filteredList" :show-overflow-tooltip="true" border>
        <el-table-column label="名称" min-width="240">
          <template slot-scope="scope">
            <el-button type="text" @click="handleDetail(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="类型" width="100">
          <template slot-scope="scope">
            <dict-tag :type="DICT_TYPE.PMS_KNOWLEDGE_OBJECT_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="删除人" prop="deleteUserName" width="130" />
        <el-table-column
          v-if="activeType === PmsKnowledgeObjectType.FILE"
          label="大小"
          prop="fileSize"
          width="120"
        >
          <template slot-scope="scope">
            {{ scope.row.fileSize == null ? '-' : formatKnowledgeFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column
          :formatter="dateFormatter"
          label="删除时间"
          prop="deleteTime"
          width="180"
        />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" @click="handleRestore(scope.row)">恢复</el-button>
            <el-button class="danger-text" type="text" @click="handlePermanentDelete(scope.row)">
              彻底删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
import * as KnowledgeRecycleApi from '@/api/pms/kb/recycle'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { formatKnowledgeFileSize } from '@/views/pms/kb/utils/format'
import { PmsKnowledgeObjectType } from '@/views/pms/kb/utils/constants'
import KnowledgeRecycleDetail from './KnowledgeRecycleDetail.vue'

export default {
  name: 'PmsKnowledgeRecyclePanel',
  components: { KnowledgeRecycleDetail },
  props: {
    libraryId: { type: Number, required: true }
  },
  data() {
    return {
      DICT_TYPE,
      PmsKnowledgeObjectType,
      loading: false,
      list: [],
      activeType: PmsKnowledgeObjectType.DOCUMENT,
      detail: undefined
    }
  },
  computed: {
    activeTypeName: {
      get() {
        return String(this.activeType)
      },
      set(value) {
        this.activeType = Number(value)
      }
    },
    filteredList() {
      return this.list.filter(record => record.type === this.activeType)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatKnowledgeFileSize,
    countByType(type) {
      return this.list.filter(record => record.type === type).length
    },
    async getList() {
      this.loading = true
      try {
        const response = await KnowledgeRecycleApi.getKnowledgeContentRecycleList(this.libraryId)
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
        this.$emit('success')
      } catch (error) {
        // 用户取消时保留回收站。
      }
    },
    async handleDetail(record) {
      try {
        const response = await KnowledgeRecycleApi.getKnowledgeContentRecycleDetail(record.id)
        this.detail = response.data
      } catch (error) {
        // 请求失败时保留列表视图。
      }
    },
    async handlePermanentDelete(record) {
      try {
        await this.$modal.confirm('彻底删除后不可恢复，确认删除“' + record.name + '”吗？')
        await KnowledgeRecycleApi.permanentDeleteKnowledgeRecycle(record.id)
        this.$modal.msgSuccess('彻底删除成功')
        await this.getList()
        this.$emit('success')
      } catch (error) {
        // 用户取消时保留回收站。
      }
    }
  }
}
</script>

<style scoped>
.recycle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recycle-header span:first-child {
  font-size: 20px;
  font-weight: 600;
}

.recycle-header span:last-child {
  color: #909399;
  font-size: 12px;
}

.recycle-tabs {
  margin-top: 12px;
}

.danger-text {
  color: #f56c6c;
}

::v-deep .el-tabs__item,
::v-deep .el-table {
  font-size: 14px;
}
</style>
