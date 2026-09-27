<template>
  <div>
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" size="small">
      <el-form-item label="用户编号" prop="userId">
        <el-select v-model="queryParams.userId" clearable placeholder="请输入用户编号" style="width:240px">
          <el-option v-for="item in userList" :key="item.id" :label="item.nickname" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="聊天编号" prop="title">
        <el-input v-model="queryParams.title" clearable placeholder="请输入聊天编号" style="width:240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="对话编号" align="center" prop="id" width="180" fixed="left" />
      <el-table-column label="对话标题" align="center" prop="title" width="180" fixed="left" />
      <el-table-column label="用户" align="center" prop="userId" width="180">
        <template v-slot="scope">{{ userName(scope.row.userId) }}</template>
      </el-table-column>
      <el-table-column label="角色" align="center" prop="roleName" width="180" />
      <el-table-column label="模型标识" align="center" prop="model" width="180" />
      <el-table-column label="消息数" align="center" prop="messageCount" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"><template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template></el-table-column>
      <el-table-column label="温度参数" align="center" prop="temperature" />
      <el-table-column label="回复 Token 数" align="center" prop="maxTokens" width="120" />
      <el-table-column label="上下文数量" align="center" prop="maxContexts" width="120" />
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template v-slot="scope"><el-button v-hasPermi="['ai:chat-conversation:delete']" type="text" size="mini" @click="handleDelete(scope.row.id)">删除</el-button></template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { ChatConversationApi } from '@/api/ai/chat/conversation'
import { getSimpleUserList } from '@/api/system/user'

export default {
  name: 'AiChatConversationList',
  data() {
    return {
      loading: true,
      list: [],
      total: 0,
      userList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        title: undefined,
        createTime: []
      }
    }
  },
  async created() {
    this.getList()
    this.userList = (await getSimpleUserList()).data
  },
  methods: {
    userName(id) {
      const item = this.userList.find(user => user.id === id)
      return item && item.nickname
    },
    getList() {
      this.loading = true
      return ChatConversationApi.getChatConversationPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleDelete(id) {
      this.$modal.confirm('是否删除所选中数据？').then(() => ChatConversationApi.deleteChatConversationByAdmin(id)).then(() => {
        this.$modal.msgSuccess('删除成功')
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
