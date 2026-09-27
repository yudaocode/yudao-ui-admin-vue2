<template>
  <div class="app-container mp-draft-page">
    <doc-alert
      title="公众号图文"
      url="https://doc.iocoder.cn/mp/article/"
    />

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
        <wx-account-select @change="onAccountChanged" />
      </el-form-item>
      <el-form-item>
        <el-button
          v-hasPermi="['mp:draft:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          :disabled="!hasAccount"
          @click="handleAdd"
        >新增</el-button>
      </el-form-item>
    </el-form>

    <draft-table
      :loading="loading"
      :list="list"
      @update="onUpdate"
      @delete="onDelete"
      @publish="onPublish"
    />
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      :title="isCreating ? '新建图文' : '修改图文'"
      :visible.sync="showDialog"
      :before-close="onBeforeDialogClose"
      width="80%"
      top="20px"
      append-to-body
      destroy-on-close
    >
      <news-form
        v-if="showDialog"
        v-loading="isSubmitting"
        :value="newsList"
        :is-creating="isCreating"
        @input="newsList = $event"
      />
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="showDialog = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="isSubmitting"
          @click="onSubmitNewsItem"
        >提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import WxAccountSelect from '@/views/mp/components/wx-account-select'
import * as MpDraftApi from '@/api/mp/draft'
import * as MpFreePublishApi from '@/api/mp/freePublish'
import { DraftTable, NewsForm, createEmptyNewsItem } from './components'

export default {
  name: 'MpDraft',
  components: {
    DraftTable,
    NewsForm,
    WxAccountSelect
  },
  provide() {
    return {
      mpAccountContext: this.accountContext
    }
  },
  data() {
    return {
      accountId: -1,
      accountContext: { value: -1 },
      loading: false,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        accountId: -1
      },
      showDialog: false,
      newsList: [],
      mediaId: '',
      isCreating: true,
      isSubmitting: false,
      requestSequence: 0
    }
  },
  computed: {
    hasAccount() {
      return Number(this.accountId) > 0
    }
  },
  methods: {
    onAccountChanged(id) {
      this.accountId = Number(id)
      this.accountContext.value = this.accountId
      this.queryParams.accountId = this.accountId
      this.queryParams.pageNo = 1
      return this.getList()
    },
    async onBeforeDialogClose(done) {
      try {
        await this.$modal.confirm('修改内容可能还未保存，确定关闭吗?')
        done()
      } catch (error) {
        // 用户继续编辑
      }
    },
    async getList() {
      const requestId = ++this.requestSequence
      if (!this.hasAccount) {
        this.list = []
        this.total = 0
        this.loading = false
        return
      }
      this.loading = true
      try {
        const response = await MpDraftApi.getDraftPage({ ...this.queryParams })
        const data = response.data
        data.list.forEach(draft => {
          const articles = draft.content.newsItem
          articles.forEach(item => {
            item.picUrl = item.thumbUrl
          })
        })
        if (requestId === this.requestSequence) {
          this.list = data.list
          this.total = data.total
        }
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleAdd() {
      this.isCreating = true
      this.mediaId = ''
      this.newsList = [createEmptyNewsItem()]
      this.showDialog = true
    },
    onUpdate(item) {
      this.mediaId = item.mediaId
      this.newsList = JSON.parse(JSON.stringify(item.content.newsItem))
      this.isCreating = false
      this.showDialog = true
    },
    async onSubmitNewsItem() {
      if (!this.newsList.length || !this.newsList.every(item => item.title && item.content)) {
        this.$message.warning('请填写每篇图文的标题和内容')
        return
      }
      this.isSubmitting = true
      try {
        if (this.isCreating) {
          await MpDraftApi.createDraft(this.accountId, this.newsList)
          this.$modal.msgSuccess('新增成功')
        } else {
          await MpDraftApi.updateDraft(this.accountId, this.mediaId, this.newsList)
          this.$modal.msgSuccess('更新成功')
        }
        this.showDialog = false
        await this.getList()
      } finally {
        this.isSubmitting = false
      }
    },
    async onPublish(item) {
      const content =
        '你正在通过发布的方式发表内容。 发布不占用群发次数，一天可多次发布。' +
        '已发布内容不会推送给用户，也不会展示在公众号主页中。 ' +
        '发布后，你可以前往发表记录获取链接，也可以将发布内容添加到自定义菜单、自动回复、话题和页面模板中。'
      try {
        await this.$modal.confirm(content)
        await MpFreePublishApi.submitFreePublish(this.accountId, item.mediaId)
        this.$modal.msgSuccess('发布成功')
        await this.getList()
      } catch (error) {
        // 用户取消发布
      }
    },
    async onDelete(item) {
      try {
        await this.$modal.confirm('此操作将永久删除该草稿, 是否继续?')
        await MpDraftApi.deleteDraft(this.accountId, item.mediaId)
        this.$modal.msgSuccess('删除成功')
        await this.getList()
      } catch (error) {
        // 用户取消删除
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mp-draft-page::after {
  display: table;
  clear: both;
  content: '';
}
</style>
