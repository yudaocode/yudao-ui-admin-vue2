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
        label="编码"
        prop="code"
      >
        <el-input
          v-model="queryParams.code"
          placeholder="频道业务码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="频道名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择"
          clearable
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
          v-hasPermi="['im:manager:channel:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
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
        label="头像"
        align="center"
        prop="avatar"
        width="70"
      >
        <template #default="scope">
          <el-image
            v-if="scope.row.avatar"
            :src="scope.row.avatar"
            fit="contain"
            style="width: 32px; height: 32px; border-radius: 4px"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="编码"
        align="center"
        prop="code"
        width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="名称"
        align="center"
        prop="name"
        min-width="120"
        show-overflow-tooltip
      />
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
            v-hasPermi="['im:manager:channel:update']"
            type="text"
            @click="openForm('update', scope.row.id)"
          >编辑</el-button>
          <el-button
            v-hasPermi="['im:manager:channel:delete']"
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
    <ChannelForm
      ref="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { deleteManagerChannel, getManagerChannelPage } from '@/api/im/manager/channel'
import ChannelForm from './ChannelForm.vue'

export default {
  name: 'ImChannel',
  components: { ChannelForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      queryParams: { pageNo: 1, pageSize: 10, code: undefined, name: undefined, status: undefined }
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
        const response = await getManagerChannelPage(this.queryParams)
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
        await deleteManagerChannel(id)
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
