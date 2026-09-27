<template>
  <div class="app-container oa-announcement-my">
    <!-- 搜索 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
      @submit.native.prevent
    >
      <el-form-item label="公告标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入公告标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="公告类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="请选择公告类型"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优先级" prop="priority">
        <el-select
          v-model="queryParams.priority"
          placeholder="请选择优先级"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in priorityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="阅读状态" prop="readStatus">
        <el-select
          v-model="queryParams.readStatus"
          placeholder="请选择阅读状态"
          clearable
          style="width: 240px"
        >
          <el-option label="未读" :value="false" />
          <el-option label="已读" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 公告列表 -->
    <el-table v-loading="loading" :data="list" border stripe>
      <el-table-column label="置顶" width="70" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.top" type="danger" effect="plain">置顶</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="公告标题" prop="title" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button
            type="text"
            :class="{ 'unread-title': !scope.row.readStatus }"
            @click="openDetail(scope.row)"
          >
            {{ scope.row.title }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type" align="center" width="90">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_ANNOUNCEMENT_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="优先级" prop="priority" align="center" width="100">
        <template slot-scope="scope">
          <dict-tag :type="DICT_TYPE.OA_PRIORITY" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="发布人" prop="publisherUserName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.publisherUserName || '-' }}
        </template>
      </el-table-column>
      <!-- 所属部门为发布人的部门 -->
      <el-table-column label="所属部门" prop="publisherDeptName" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.publisherDeptName || '-' }}</template>
      </el-table-column>
      <el-table-column label="阅读状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.readStatus ? 'success' : 'warning'">
            {{ scope.row.readStatus ? '已读' : '未读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="createTime"
        :formatter="dateFormatter"
        align="center"
        width="180"
      />
      <el-table-column label="操作" align="center" fixed="right" width="140">
        <template slot-scope="scope">
          <el-button v-if="scope.row.forwarded" type="text" size="mini" disabled>已转发</el-button>
          <el-button
            v-else
            type="text"
            size="mini"
            :loading="forwardingIds.indexOf(scope.row.id) !== -1"
            @click="handleForward(scope.row)"
          >转发</el-button>
          <el-button
            v-if="scope.row.readStatus"
            type="text"
            size="mini"
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

    <!-- 公告详情 -->
    <oa-announcement-detail ref="detailRef" @read="handleRead" />
  </div>
</template>

<script>
import * as AnnouncementApi from '@/api/oa/announcement'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import OaAnnouncementDetail from '../list/components/OaAnnouncementDetail.vue'

export default {
  name: 'OaAnnouncementMy',
  components: { OaAnnouncementDetail },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      forwardingIds: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        title: undefined,
        type: undefined,
        priority: undefined,
        readStatus: undefined,
        createTime: []
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_ANNOUNCEMENT_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY)
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return AnnouncementApi.getReceivedAnnouncementPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openDetail(announcement) {
      if (!announcement.id) return
      this.$refs.detailRef.open(announcement.id, true)
    },
    /** 标记列表中的公告为已读 */
    handleRead(id) {
      const announcement = this.list.find(item => item.id === id)
      if (announcement) {
        this.$set(announcement, 'readStatus', true)
      }
    },
    /** 转发公告 */
    handleForward(announcement) {
      if (!announcement.id || announcement.forwarded || this.forwardingIds.indexOf(announcement.id) !== -1) {
        return
      }
      this.forwardingIds.push(announcement.id)
      // 转发的二次确认
      this.$modal.confirm('确定将该公告转发给自己的下属吗？').then(() => {
        // 发起转发
        return AnnouncementApi.forwardAnnouncement(announcement.id)
      }).then(response => {
        const count = response.data
        // 更新当前公告的转发状态
        if (count > 0) {
          this.$modal.msgSuccess('已转发给 ' + count + ' 位下属')
          this.$set(announcement, 'forwarded', true)
        } else {
          this.$modal.msgWarning('暂无可转发的下属')
        }
      }).catch(() => {
        // 取消或请求失败后刷新，同步其他页面已完成的转发状态
        return this.getList()
      }).finally(() => {
        this.forwardingIds = this.forwardingIds.filter(id => id !== announcement.id)
      })
    },
    handleDelete(id) {
      if (!id) return
      return this.$modal.confirm('是否确认删除公告编号为“' + id + '”的数据项？').then(() => {
        // 仅移除自己的接收关系，不影响公告和其他接收人
        return AnnouncementApi.deleteReceivedAnnouncement(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text {
  color: #f56c6c;
}

.unread-title {
  font-weight: 700;
}
</style>
