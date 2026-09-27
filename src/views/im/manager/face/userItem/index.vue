<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="80px"
      size="small"
    >
      <el-form-item
        label="用户编号"
        prop="userId"
      >
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
        label="添加时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
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
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        width="100"
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
        label="所属用户"
        align="center"
        min-width="160"
      >
        <template #default="scope">
          <span>{{ scope.row.userNickname || '—' }}</span>
          <span class="user-id">({{ scope.row.userId }})</span>
        </template>
      </el-table-column>
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
        label="添加时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template #default="scope"><el-button
          v-hasPermi="['im:manager:face-user-item:delete']"
          type="text"
          class="danger-text"
          @click="handleDelete(scope.row.id)"
        >删除</el-button></template>
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
import { dateFormatter } from '@/utils'
import { deleteManagerFaceUserItem, getManagerFaceUserItemPage } from '@/api/im/manager/face/userItem'

export default {
  name: 'ImManagerFaceUserItem',
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, userId: undefined, name: undefined, createTime: [] }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getManagerFaceUserItemPage(this.queryParams)
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
      return this.handleQuery()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
      } catch (error) {
        return
      }
      await deleteManagerFaceUserItem(id)
      this.$modal.msgSuccess('删除成功')
      await this.getList()
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
.user-id { margin-left: 4px; color: #909399; font-size: 12px; }
</style>
