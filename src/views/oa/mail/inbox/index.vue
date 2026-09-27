<template>
  <div class="app-container oa-mail-inbox">
    <div class="oa-mail-inbox__layout">
      <!-- 左栏：账号及文件夹 -->
      <mail-folder-list
        :account-id.sync="queryParams.accountId"
        :accounts="accounts"
        :folders="folders"
        :folder-key="queryParams.folderKey"
        :syncing="syncing"
        :composing="!!composeData"
        :operating="operating || detailLoading"
        @account-change="handleAccountChange"
        @folder-change="handleFolderChange"
        @compose="openForm(OA_MAIL_COMPOSE_MODE.NEW)"
        @sync="handleSync"
        @settings="$router.push('/oa/mail/account')"
      />
      <!-- 中栏：查询、邮件列表及分页 -->
      <mail-message-list
        :list="list"
        :loading="loading"
        :list-error="listError"
        :empty-text="emptyText"
        :selected-id="detail && detail.id"
        :disabled="!!composeData || operating || detailLoading"
        :total="total"
        :keyword.sync="queryParams.keyword"
        :filter.sync="filter"
        :page-no.sync="queryParams.pageNo"
        :page-size.sync="queryParams.pageSize"
        @query="handleQuery"
        @page-change="getList()"
        @select="handleDetail"
      />
      <!-- 右栏：详情操作及安全正文，写信在当前区域展开 -->
      <section v-loading="detailLoading" class="oa-mail-inbox__detail">
        <mail-message-form
          v-if="composeData"
          :key="composeKey"
          :data="composeData"
          @close="composeData = undefined"
          @success="handleComposeSuccess"
        />
        <mail-message-detail
          v-else
          :detail="detail"
          :detail-error="detailError"
          :folder-key="queryParams.folderKey"
          :operating="operating"
          @compose="openForm"
          @read="handleRead"
          @delete="handleDelete"
          @restore="handleRestore"
        />
      </section>
    </div>
  </div>
</template>

<script>
import * as AccountApi from '@/api/oa/mail/account'
import * as FolderApi from '@/api/oa/mail/folder'
import * as MessageApi from '@/api/oa/mail/message'
import MailFolderList from './components/MailFolderList.vue'
import MailMessageList from './MailMessageList.vue'
import MailMessageDetail from './MailMessageDetail.vue'
import MailMessageForm from './MailMessageForm.vue'
import { OA_MAIL_COMPOSE_MODE, OA_MAIL_FOLDER_KEY } from '@/views/oa/utils/constants'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'OaMailInbox',
  components: { MailFolderList, MailMessageList, MailMessageDetail, MailMessageForm },
  data() {
    return {
      OA_MAIL_COMPOSE_MODE,
      loading: false, // 列表加载中
      detailLoading: false, // 详情加载中
      syncing: false, // 同步中
      operating: false, // 远端操作中
      accounts: [], // 本人邮箱账号
      folders: [], // 已同步的文件夹
      list: [], // 当前页索引
      total: 0, // 邮件总数
      detail: undefined, // 当前邮件
      composeData: undefined, // 写信数据
      composeKey: 0, // 表单重新初始化标识
      listError: '', // 列表错误
      detailError: '', // 详情错误
      filter: 'all', // 当前筛选
      queryParams: {
        accountId: undefined,
        folderKey: OA_MAIL_FOLDER_KEY.INBOX,
        keyword: '',
        pageNo: 1,
        pageSize: 20
      }
    }
  },
  computed: {
    emptyText() {
      if (!this.accounts.length) {
        return '请先添加并启用邮箱账号'
      }
      if (!this.folders.length) {
        return '请点击同步，获取邮箱邮件'
      }
      return this.folders.some(folder => folder.key === this.queryParams.folderKey)
        ? '暂无邮件'
        : '未识别到此文件夹，请同步后重试'
    }
  },
  created() {
    this.init()
  },
  methods: {
    /** 初始化账号并选中默认账号 */
    init() {
      return AccountApi.getMailAccountList(CommonStatusEnum.ENABLE).then(response => {
        this.accounts = response.data
        const account = this.accounts.find(item => item.defaultStatus) || this.accounts[0]
        this.queryParams.accountId = account ? account.id : undefined
        return this.handleAccountChange()
      })
    },
    /** 查询本地索引分页 */
    getList(keepDetail = false) {
      if (!keepDetail) {
        this.detail = undefined
        this.detailLoading = false
        this.detailError = ''
      }
      this.listError = ''
      if (!this.queryParams.accountId) return Promise.resolve()
      this.loading = true
      return MessageApi.getMailMessagePage({
        ...this.queryParams,
        readStatus: this.filter === 'unread' ? false : undefined,
        hasAttach: this.filter === 'attach' ? true : undefined
      }).then(response => {
        this.total = response.data.total
        this.list = response.data.list
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listError = '邮件列表加载失败'
      }).finally(() => {
        this.loading = false
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 切换文件夹 */
    handleFolderChange(folder) {
      this.queryParams.folderKey = folder
      this.filter = 'all'
      return this.handleQuery()
    },
    /** 切换邮箱账号 */
    handleAccountChange() {
      this.detail = undefined
      this.list = []
      this.total = 0
      this.folders = []
      this.queryParams.folderKey = OA_MAIL_FOLDER_KEY.INBOX
      this.queryParams.keyword = ''
      this.filter = 'all'
      const accountId = this.queryParams.accountId
      return Promise.resolve()
        .then(() => {
          if (accountId) {
            return FolderApi.getMailFolderList(accountId).then(response => {
              this.folders = response.data
            })
          }
        })
        .then(() => this.handleQuery())
    },
    /** 手动全量同步索引，不受当前列表页码影响，不创建后台 Job */
    handleSync() {
      if (!this.queryParams.accountId) return Promise.resolve()
      this.syncing = true
      return MessageApi.syncMailMessageList(this.queryParams.accountId).then(response => {
        return FolderApi.getMailFolderList(this.queryParams.accountId).then(folders => {
          this.folders = folders.data
          this.$modal.msgSuccess('同步成功，共 ' + response.data + ' 封邮件')
          // 同步后保留当前页；只有搜索、筛选和切换文件夹时回到第一页
          return this.getList()
        })
      }).finally(() => {
        this.syncing = false
      })
    },
    /** 点击邮件读取正文，成功后同步已读状态 */
    handleDetail(row) {
      if (this.queryParams.folderKey === OA_MAIL_FOLDER_KEY.DRAFTS) {
        this.detail = row
        return this.openForm(OA_MAIL_COMPOSE_MODE.DRAFT)
      }
      this.detailLoading = true
      this.detailError = ''
      this.detail = undefined
      return MessageApi.getMailMessage(row.id).then(response => {
        const data = response.data
        this.detail = data
        // 正文读取成功才标记已读，远端更新失败时保留正文和原状态
        if (!data.readStatus) {
          return MessageApi.updateMailMessageRead(data.id, true).then(() => {
            data.readStatus = true
            row.readStatus = true
            return FolderApi.getMailFolderList(data.accountId).then(folders => {
              this.folders = folders.data
              // 未读列表移除已读邮件，但保留正在阅读的正文
              if (this.queryParams.folderKey === OA_MAIL_FOLDER_KEY.UNREAD || this.filter === 'unread') {
                return this.getList(true)
              }
            })
          }).catch(() => {
            this.$modal.msgError('正文已加载，已读状态更新失败，请重试')
          })
        }
      }).catch(() => {
        this.detailError = '邮件读取失败，请先同步后重试'
      }).finally(() => {
        this.detailLoading = false
      })
    },
    /** 打开写信、回复、转发或草稿 */
    openForm(mode) {
      if (!this.queryParams.accountId) return Promise.resolve()
      if (mode === OA_MAIL_COMPOSE_MODE.NEW) {
        this.composeData = {
          accountId: this.queryParams.accountId,
          recipients: [],
          ccs: [],
          subject: '',
          content: '',
          mode
        }
        this.composeKey++
        return Promise.resolve()
      }
      if (this.detail) {
        this.detailLoading = true
        return MessageApi.getMailMessageCompose(this.detail.id, mode).then(response => {
          this.composeData = response.data
          this.composeKey++
        }).finally(() => {
          this.detailLoading = false
        })
      }
      return Promise.resolve()
    },
    /** 修改已读或未读状态 */
    handleRead() {
      if (!this.detail) return Promise.resolve()
      const current = this.detail
      this.operating = true
      return MessageApi.updateMailMessageRead(current.id, !current.readStatus).then(() => {
        current.readStatus = !current.readStatus
        const row = this.list.find(mail => mail.id === current.id)
        if (row) row.readStatus = current.readStatus
        this.$modal.msgSuccess('修改成功')
        return FolderApi.getMailFolderList(current.accountId).then(folders => {
          this.folders = folders.data
          if (this.queryParams.folderKey === OA_MAIL_FOLDER_KEY.UNREAD || this.filter === 'unread') {
            return this.getList()
          }
        })
      }).finally(() => {
        this.operating = false
      })
    },
    /** 删除当前邮件，彻底删除需要明确确认 */
    handleDelete() {
      if (!this.detail) return Promise.resolve()
      const id = this.detail.id
      return this.$modal.confirm(
        this.queryParams.folderKey === OA_MAIL_FOLDER_KEY.TRASH
          ? '确认彻底删除这封邮件？此操作无法恢复。'
          : '确认将这封邮件移至已删除？'
      ).then(() => {
        this.operating = true
        return MessageApi.deleteMailMessage(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.handleSync()
      }).finally(() => {
        this.operating = false
      })
    },
    /** 将垃圾箱中的邮件恢复到收件箱 */
    handleRestore() {
      if (!this.detail) return Promise.resolve()
      this.operating = true
      return MessageApi.restoreMailMessage(this.detail.id).then(() => {
        this.$modal.msgSuccess('已恢复到收件箱')
        return this.handleSync()
      }).finally(() => {
        this.operating = false
      })
    },
    /** 写信成功后退出编辑 */
    handleComposeSuccess() {
      this.composeData = undefined
      return this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-mail-inbox {
  &__layout {
    display: flex;
    height: calc(100vh - 150px);
    min-height: 580px;
    overflow-x: auto;
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  &__detail {
    flex: 1;
    min-width: 0;
    min-height: 0;
  }
}
</style>
