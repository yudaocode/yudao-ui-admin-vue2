<!--
MIT License

Copyright (c) 2020 www.joolun.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
  芋道源码：
  ① 移除 avue 框架，使用 element-ui 重写
  ② 重写代码，保持和现有项目保持一致
-->
<template>
  <div class="app-container">
    <doc-alert
      title="自动回复"
      url="https://doc.iocoder.cn/mp/auto-reply/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
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
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <!-- tab 切换 -->
    <el-tabs
      v-model="type"
      @tab-click="handleClick"
    >
      <!-- 操作工具栏 -->
      <el-row
        :gutter="10"
        class="mb8"
      >
        <el-col :span="1.5">
          <el-button
            v-if="type !== MsgType.Follow || list.length <= 0"
            v-hasPermi="['mp:auto-reply:create']"
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
          >新增
          </el-button>
        </el-col>
        <right-toolbar
          :show-search.sync="showSearch"
          @queryTable="getList"
        />
      </el-row>
      <!-- tab 项 -->
      <el-tab-pane :name="MsgType.Follow">
        <span slot="label"><i class="el-icon-star-off" /> 关注时回复</span>
      </el-tab-pane>
      <el-tab-pane :name="MsgType.Message">
        <span slot="label"><i class="el-icon-chat-line-round" /> 消息回复</span>
      </el-tab-pane>
      <el-tab-pane :name="MsgType.Keyword">
        <span slot="label"><i class="el-icon-news" /> 关键词回复</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 列表 -->
    <reply-table
      :loading="loading"
      :list="list"
      :msg-type="type"
      @update="handleUpdate"
      @delete="handleDelete"
    />

    <!-- 添加或修改自动回复的对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="800px"
      append-to-body
    >
      <reply-form
        v-if="open"
        ref="replyForm"
        :value="form"
        :reply="objData"
        :msg-type="type"
        @input="form = $event"
        @update:reply="objData = $event"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancel">取 消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ReplyForm from './components/ReplyForm.vue'
import ReplyTable from './components/ReplyTable.vue'
import { MsgType } from './components/types'
import { getSimpleAccountList } from '@/api/mp/account'
import { createAutoReply, deleteAutoReply, getAutoReply, getAutoReplyPage, updateAutoReply } from '@/api/mp/autoReply'

export default {
  name: 'MpAutoReply',
  components: {
    ReplyForm,
    ReplyTable
  },
  data() {
    return {
      MsgType,
      // tab 类型（1、关注时回复；2、消息回复；3、关键词回复）
      type: MsgType.Keyword,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 自动回复列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountId: undefined
      },

      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 表单参数
      form: {},
      // 回复消息
      objData: {
        type: 'text'
      },
      // 公众号账号列表
      accounts: []
    }
  },
  created() {
    getSimpleAccountList().then(response => {
      this.accounts = response.data
      // 默认选中第一个
      if (this.accounts.length > 0) {
        this.queryParams.accountId = this.accounts[0].id
      }
      // 加载数据
      this.getList()
    })
  },
  methods: {
    /** 查询列表 */
    async getList() {
      // 如果没有选中公众号账号，则进行提示。
      if (!this.queryParams.accountId) {
        this.$message.error('未选中公众号，无法查询自动回复')
        this.loading = false
        return false
      }

      this.loading = true
      // 处理查询参数
      const params = {
        ...this.queryParams,
        type: this.type
      }
      try {
        const response = await getAutoReplyPage(params)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      // 默认选中第一个
      if (this.accounts.length > 0) {
        this.queryParams.accountId = this.accounts[0].id
      }
      this.handleQuery()
    },
    handleClick(tab) {
      this.type = tab.name
      this.handleQuery()
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      // 打开表单，并设置初始化
      this.open = true
      this.title = '新增自动回复'
      this.objData = {
        type: 'text',
        accountId: this.queryParams.accountId
      }
    },
    /** 修改按钮操作 */
    handleUpdate(id) {
      this.reset()
      getAutoReply(id).then(response => {
        // 设置属性
        this.form = { ...response.data }
        this.$delete(this.form, 'responseMessageType')
        this.$delete(this.form, 'responseContent')
        this.$delete(this.form, 'responseMediaId')
        this.$delete(this.form, 'responseMediaUrl')
        this.$delete(this.form, 'responseDescription')
        this.$delete(this.form, 'responseArticles')
        this.objData = {
          type: response.data.responseMessageType,
          accountId: this.queryParams.accountId,
          content: response.data.responseContent,
          mediaId: response.data.responseMediaId,
          url: response.data.responseMediaUrl,
          title: response.data.responseTitle,
          description: response.data.responseDescription,
          thumbMediaId: response.data.responseThumbMediaId,
          thumbMediaUrl: response.data.responseThumbMediaUrl,
          articles: response.data.responseArticles,
          musicUrl: response.data.responseMusicUrl,
          hqMusicUrl: response.data.responseHqMusicUrl
        }

        // 打开表单
        this.open = true
        this.title = '修改自动回复'
      })
    },
    handleSubmit() {
      this.$refs.replyForm.validate(valid => {
        if (!valid) {
          return
        }
        // 处理回复消息
        const form = { ...this.form }
        form.responseMessageType = this.objData.type
        form.responseContent = this.objData.content
        form.responseMediaId = this.objData.mediaId
        form.responseMediaUrl = this.objData.url
        form.responseTitle = this.objData.title
        form.responseDescription = this.objData.description
        form.responseThumbMediaId = this.objData.thumbMediaId
        form.responseThumbMediaUrl = this.objData.thumbMediaUrl
        form.responseArticles = this.objData.articles
        form.responseMusicUrl = this.objData.musicUrl
        form.responseHqMusicUrl = this.objData.hqMusicUrl

        if (this.form.id !== undefined) {
          updateAutoReply(form).then(response => {
            this.$modal.msgSuccess('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          createAutoReply(form).then(response => {
            this.$modal.msgSuccess('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        accountId: this.queryParams.accountId,
        type: this.type,
        requestKeyword: undefined,
        requestMatch: this.type === MsgType.Keyword ? 1 : undefined,
        requestMessageType: undefined
      }
      this.$nextTick(() => {
        if (this.$refs.replyForm) this.$refs.replyForm.resetFields()
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    handleDelete(id) {
      this.$modal.confirm('是否确认删除此数据?').then(function() {
        return deleteAutoReply(id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>
