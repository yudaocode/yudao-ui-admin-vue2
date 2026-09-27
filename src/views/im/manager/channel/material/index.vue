<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="频道"
        prop="channelId"
      >
        <ChannelSelect
          v-model="queryParams.channelId"
          placeholder="全部"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item
        label="标题"
        prop="title"
      >
        <el-input
          v-model="queryParams.title"
          placeholder="标题关键字"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
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
        <el-button
          v-hasPermi="['im:manager:channel-material:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增素材</el-button>
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
        width="80"
      />
      <el-table-column
        label="封面"
        align="center"
        prop="coverUrl"
        width="80"
      >
        <template #default="scope"><el-image
          v-if="scope.row.coverUrl"
          :src="scope.row.coverUrl"
          fit="cover"
          style="width: 40px; height: 40px; border-radius: 4px"
        /></template>
      </el-table-column>
      <el-table-column
        label="频道"
        align="center"
        prop="channelName"
        width="120"
      />
      <el-table-column
        label="内容类型"
        align="center"
        prop="type"
        width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_CHANNEL_MATERIAL_TYPE"
          :value="scope.row.type"
        /></template>
      </el-table-column>
      <el-table-column
        label="标题"
        align="left"
        prop="title"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="摘要"
        align="left"
        prop="summary"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="170"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['im:manager:channel-material:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['im:manager:channel-material:delete']"
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
    <ChannelMaterialForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { deleteManagerChannelMaterial, getManagerChannelMaterialPage } from '@/api/im/manager/channel/material'
import ChannelSelect from '../list/components/ChannelSelect.vue'
import ChannelMaterialForm from './ChannelMaterialForm.vue'

export default {
  name: 'ImChannelMaterial',
  components: { ChannelMaterialForm, ChannelSelect },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, channelId: undefined, title: undefined }
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
        const response = await getManagerChannelMaterialPage(this.queryParams)
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
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await deleteManagerChannelMaterial(id)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：取消或删除请求失败时保持当前列表
      }
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
</style>
