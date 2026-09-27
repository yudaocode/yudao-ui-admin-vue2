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
        label="发送时间"
        prop="sendTime"
      >
        <el-date-picker
          v-model="queryParams.sendTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始"
          end-placeholder="结束"
          style="width: 300px"
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
          v-hasPermi="['im:manager:channel-message:send']"
          type="primary"
          plain
          icon="el-icon-position"
          @click="openSendForm"
        >立即推送</el-button>
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
        prop="materialCoverUrl"
        width="80"
      >
        <template #default="scope"><el-image
          v-if="scope.row.materialCoverUrl"
          :src="scope.row.materialCoverUrl"
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
        label="素材标题"
        align="left"
        prop="materialTitle"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        label="接收人"
        align="center"
        prop="receiverUserIds"
        width="120"
      >
        <template #default="scope">
          <el-tag
            v-if="!scope.row.receiverUserIds || scope.row.receiverUserIds.length === 0"
            type="warning"
            size="small"
          >全员</el-tag>
          <span v-else>{{ scope.row.receiverUserIds.length }} 人</span>
        </template>
      </el-table-column>
      <el-table-column
        label="发送时间"
        align="center"
        prop="sendTime"
        width="170"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['im:manager:channel-message:delete']"
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
    <ChannelMessageSendForm
      ref="sendForm"
      @success="getList"
    />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils'
import { deleteManagerChannelMessage, getManagerChannelMessagePage } from '@/api/im/manager/channel/message'
import ChannelSelect from '../list/components/ChannelSelect.vue'
import ChannelMessageSendForm from './ChannelMessageSendForm.vue'

export default {
  name: 'ImChannelMessage',
  components: { ChannelMessageSendForm, ChannelSelect },
  data() {
    return {
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, channelId: undefined, sendTime: [] }
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
        const response = await getManagerChannelMessagePage(this.queryParams)
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
    openSendForm() {
      this.$refs.sendForm.open()
    },
    async handleDelete(id) {
      try {
        await this.$modal.confirm('是否删除所选中数据？')
        await deleteManagerChannelMessage(id)
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
