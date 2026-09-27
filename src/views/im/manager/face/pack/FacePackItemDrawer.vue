<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    size="65%"
    destroy-on-close
    append-to-body
  >
    <div class="drawer-content">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        label-width="68px"
        size="small"
      >
        <el-form-item
          label="表情名"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入表情名"
            clearable
            style="width: 200px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="status"
        >
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-search"
            @click="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click="resetQuery"
          >重置</el-button>
          <el-button
            v-hasPermi="['im:manager:face-pack-item:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            @click="openForm('create')"
          >新增表情</el-button>
          <el-button
            v-hasPermi="['im:manager:face-pack-item:delete']"
            type="danger"
            plain
            icon="el-icon-delete"
            :disabled="checkedIds.length === 0"
            @click="handleDeleteBatch"
          >批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="list"
        @selection-change="handleRowCheckboxChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          label="编号"
          align="center"
          prop="id"
          width="80"
        />
        <el-table-column
          label="表情图"
          align="center"
          prop="url"
          width="80"
        >
          <template #default="scope"><el-image
            v-if="scope.row.url"
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"
            fit="contain"
            style="width: 40px; height: 40px; border-radius: 4px"
          /></template>
        </el-table-column>
        <el-table-column
          label="表情名"
          align="center"
          prop="name"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column
          label="尺寸"
          align="center"
          width="100"
        >
          <template #default="scope">
            <span v-if="scope.row.width || scope.row.height">{{ scope.row.width || '?' }} × {{ scope.row.height || '?' }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column
          label="排序"
          align="center"
          prop="sort"
          width="80"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          width="80"
        >
          <template #default="scope"><dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          /></template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="160"
          fixed="right"
        >
          <template #default="scope">
            <el-button
              v-hasPermi="['im:manager:face-pack-item:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >编辑</el-button>
            <el-button
              v-hasPermi="['im:manager:face-pack-item:delete']"
              type="text"
              class="danger-text"
              @click="handleDelete(scope.row.id)"
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
      <FacePackItemForm
        ref="form"
        :pack-id="currentPackId"
        @success="getList"
      />
    </div>
  </el-drawer>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import {
  deleteManagerFacePackItem,
  deleteManagerFacePackItemList,
  getManagerFacePackItemPage
} from '@/api/im/manager/face/item'
import FacePackItemForm from './FacePackItemForm.vue'

export default {
  name: 'ImManagerFacePackItemDrawer',
  components: { FacePackItemForm },
  data() {
    return {
      DICT_TYPE,
      drawerVisible: false,
      drawerTitle: '',
      currentPackId: 0,
      loading: true,
      total: 0,
      list: [],
      checkedIds: [],
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      queryParams: { pageNo: 1, pageSize: 10, packId: 0, name: undefined, status: undefined }
    }
  },
  methods: {
    open(pack) {
      this.drawerVisible = true
      this.drawerTitle = '「' + pack.name + '」表情管理'
      this.currentPackId = pack.id
      this.queryParams.packId = pack.id
      this.queryParams.pageNo = 1
      this.queryParams.name = undefined
      this.queryParams.status = undefined
      return this.getList()
    },
    async getList() {
      this.loading = true
      try {
        const response = await getManagerFacePackItemPage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
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
      this.queryParams.packId = this.currentPackId
      return this.handleQuery()
    },
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
      } catch (error) {
        return
      }
      await deleteManagerFacePackItem(id)
      this.$modal.msgSuccess('删除成功')
      await this.getList()
    },
    handleRowCheckboxChange(rows) {
      this.checkedIds = rows.map(row => row.id)
    },
    async handleDeleteBatch() {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
      } catch (error) {
        return
      }
      await deleteManagerFacePackItemList(this.checkedIds)
      this.checkedIds = []
      this.$modal.msgSuccess('删除成功')
      await this.getList()
    }
  }
}
</script>

<style scoped>
.drawer-content { padding: 0 20px 20px; }
.danger-text { color: #f56c6c; }
</style>
