<template>
  <oa-home-panel title="公告通知" v-loading="loading">
    <template slot="actions">
      <el-button type="text" @click="$router.push('/oa/announcement/my')">更多</el-button>
    </template>
    <div v-if="loadError" class="load-error">
      加载失败，
      <el-button type="text" @click="getList">重新加载</el-button>
    </div>
    <el-table :data="list" :show-overflow-tooltip="true" size="small">
      <el-table-column label="发布部门" min-width="130" prop="publisherDeptName" />
      <el-table-column align="center" label="优先级" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="240">
        <template slot-scope="scope">
          <el-button type="text" @click="$refs.detailRef.open(scope.row.id, true)">
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.readStatus ? 'info' : 'danger'">
            {{ scope.row.readStatus ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        width="170"
      />
    </el-table>
    <oa-announcement-detail ref="detailRef" @read="handleRead" />
  </oa-home-panel>
</template>

<script>
import OaHomePanel from './OaHomePanel.vue'
import OaAnnouncementDetail from '@/views/oa/announcement/list/components/OaAnnouncementDetail.vue'
import * as AnnouncementApi from '@/api/oa/announcement'
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'OaHomeAnnouncement',
  components: { OaHomePanel, OaAnnouncementDetail },
  data() {
    return {
      DICT_TYPE,
      loading: false,
      loadError: false,
      list: []
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 详情读取成功后同步当前列表的阅读状态 */
    handleRead(id) {
      const announcement = this.list.find(item => item.id === id)
      if (announcement) {
        this.$set(announcement, 'readStatus', true)
      }
    },
    /** 查询当前区块数据 */
    getList() {
      if (this.loading) return Promise.resolve()
      this.loading = true
      this.loadError = false
      return AnnouncementApi.getReceivedAnnouncementPage({ pageNo: 1, pageSize: 5 }).then(response => {
        this.list = response.data.list
      }).catch(() => {
        this.loadError = true
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.load-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: #f56c6c;
}
</style>
