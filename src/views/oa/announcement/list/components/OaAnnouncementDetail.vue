<template>
  <!-- 公告详情 -->
  <Dialog title="公告详情" v-model="dialogVisible" width="780px">
    <el-descriptions v-loading="loading" :column="1" border class="announcement-detail">
      <el-descriptions-item label="公告标题">{{ announcement ? announcement.title : '' }}</el-descriptions-item>
      <el-descriptions-item label="发布人">
        {{ announcement ? announcement.publisherUserName : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">
        {{ announcement ? formatDate(announcement.createTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="所属部门">
        {{ announcement ? announcement.publisherDeptName : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="公告类型">
        <dict-tag
          v-if="announcement"
          :type="DICT_TYPE.OA_ANNOUNCEMENT_TYPE"
          :value="announcement.type"
        />
      </el-descriptions-item>
      <el-descriptions-item label="优先级">
        <dict-tag
          v-if="announcement"
          :type="DICT_TYPE.OA_PRIORITY"
          :value="announcement.priority"
        />
      </el-descriptions-item>
      <el-descriptions-item label="公告内容">
        <div
          class="content-html"
          v-dompurify-html="(announcement && announcement.content) || ''"
        />
      </el-descriptions-item>
      <el-descriptions-item label="相关链接">
        <el-link
          v-if="announcement && announcement.url"
          :href="announcement.url"
          target="_blank"
          type="primary"
        >打开链接</el-link>
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script>
import * as AnnouncementApi from '@/api/oa/announcement'
import Dialog from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaAnnouncementDetail',
  components: { Dialog },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      loading: false,
      announcement: undefined
    }
  },
  methods: {
    formatDate,
    /** 打开公告详情 */
    open(id, markAsRead = false) {
      this.dialogVisible = true
      this.announcement = undefined
      this.loading = true
      // 查询公告详情
      AnnouncementApi.getAnnouncement(id).then(response => {
        const data = response.data
        this.announcement = data
        // 接收人阅读未读公告时，同步阅读状态
        if (markAsRead && !data.readStatus) {
          return AnnouncementApi.updateAnnouncementReadStatus(id).then(() => {
            data.readStatus = true
            this.$emit('read', id)
          })
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped lang="scss">
.announcement-detail {
  ::v-deep .el-descriptions__table {
    table-layout: fixed;
  }

  ::v-deep .el-descriptions__label {
    width: 100px;
    white-space: nowrap;
  }

  ::v-deep .el-descriptions__content {
    overflow-wrap: anywhere;
  }
}

.content-html {
  min-height: 120px;
}
</style>
