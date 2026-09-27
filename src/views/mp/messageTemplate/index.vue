<template>
  <div class="app-container">
    <doc-alert
      title="模版消息"
      url="https://doc.iocoder.cn/mp/message-template/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="公众号"
        prop="accountId"
      >
        <el-select
          v-model="queryParams.accountId"
          placeholder="请选择公众号"
          @change="handleAccountChange"
        >
          <el-option
            v-for="item in accounts"
            :key="parseInt(item.id)"
            :label="item.name"
            :value="parseInt(item.id)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-hasPermi="['mp:message-template:sync']"
          type="success"
          plain
          icon="el-icon-refresh"
          :loading="syncLoading"
          :disabled="queryParams.accountId === undefined"
          @click="handleSync"
        >
          同步
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="公众号模板 ID"
        align="center"
        prop="templateId"
        width="200"
      />
      <el-table-column
        label="标题"
        align="center"
        prop="title"
        width="150"
      />
      <el-table-column
        label="模板内容"
        align="center"
        prop="content"
      />
      <el-table-column
        label="模板示例"
        align="center"
        prop="example"
        width="200"
      />
      <el-table-column
        label="一级行业"
        align="center"
        prop="primaryIndustry"
        width="120"
      />
      <el-table-column
        label="二级行业"
        align="center"
        prop="deputyIndustry"
        width="120"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['mp:message-template:send']"
            size="mini"
            type="text"
            icon="el-icon-s-promotion"
            @click="handleSend(scope.row)"
          >发送</el-button>
          <el-button
            v-hasPermi="['mp:message-template:delete']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <message-template-send-form ref="sendForm" />
  </div>
</template>

<script>
import MessageTemplateSendForm from './MessageTemplateSendForm.vue'
import { MessageTemplateApi } from '@/api/mp/messageTemplate'
import { getSimpleAccountList } from '@/api/mp/account'

export default {
  name: 'MpMessageTemplate',
  components: { MessageTemplateSendForm },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 同步模板加载中
      syncLoading: false,
      // 列表数据
      list: [],
      // 公众号账号列表
      accounts: [],
      // 查询参数
      queryParams: {
        accountId: undefined
      }
    }
  },
  created() {
    this.getAccounts()
  },
  methods: {
    /** 获取公众号账号列表 */
    getAccounts() {
      getSimpleAccountList().then(response => {
        this.accounts = response.data
        // 默认选中第一个
        if (this.accounts.length > 0) {
          this.queryParams.accountId = parseInt(this.accounts[0].id)
          this.getList()
        }
      })
    },
    /** 公众号选择变化 */
    handleAccountChange(accountId) {
      this.queryParams.accountId = accountId
      this.getList()
    },
    /** 查询列表 */
    async getList() {
      if (!this.queryParams.accountId) {
        return
      }
      this.loading = true
      try {
        const response = await MessageTemplateApi.getMessageTemplateList(this.queryParams)
        this.list = response.data || []
      } finally {
        this.loading = false
      }
    },
    /** 同步操作 */
    handleSync() {
      this.$modal.confirm('是否确认同步消息模板？').then(() => {
        this.syncLoading = true
        return MessageTemplateApi.syncMessageTemplate(this.queryParams.accountId)
      }).then(() => {
        this.$modal.msgSuccess('同步消息模板成功')
        this.getList()
      }).catch(() => {
        // 用户取消同步
      }).finally(() => {
        this.syncLoading = false
      })
    },
    /** 发送消息操作 */
    handleSend(row) {
      this.$refs.sendForm.open(row)
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id
      this.$modal.confirm('是否确认删除该消息模板？').then(() => {
        return MessageTemplateApi.deleteMessageTemplate(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>
