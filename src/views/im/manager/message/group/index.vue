<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="88px"
      size="small"
    >
      <el-form-item
        label="群"
        prop="groupId"
      ><GroupSelect
        v-model="queryParams.groupId"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        label="发送人"
        prop="senderId"
      ><UserSelectV2
        v-model="queryParams.senderId"
        placeholder="请选择发送人"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        label="内容类型"
        prop="type"
      ><el-select
        v-model="queryParams.type"
        placeholder="请选择内容类型"
        clearable
        style="width: 240px"
      ><el-option
        v-for="dict in contentTypeOptions"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="消息内容"
        prop="content"
      ><el-input
        v-model="queryParams.content"
        placeholder="请输入消息内容"
        clearable
        style="width: 240px"
        @keyup.enter.native="handleQuery"
      /></el-form-item>
      <el-form-item
        label="发送时间"
        prop="sendTime"
      ><el-date-picker
        v-model="queryParams.sendTime"
        value-format="yyyy-MM-dd HH:mm:ss"
        type="daterange"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :default-time="['00:00:00', '23:59:59']"
        style="width: 240px"
      /></el-form-item>
      <el-form-item><el-button
        icon="el-icon-search"
        @click="handleQuery"
      >搜索</el-button><el-button
        icon="el-icon-refresh"
        @click="resetQuery"
      >重置</el-button></el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        width="100"
      />
      <el-table-column
        label="群"
        align="center"
        min-width="180"
      ><template #default="scope"><span>{{ scope.row.groupName || '-' }}</span><span class="secondary">({{ scope.row.groupId }})</span></template></el-table-column>
      <el-table-column
        label="发送人"
        align="center"
        min-width="160"
      ><template #default="scope"><span>{{ scope.row.senderNickname || '-' }}</span><span class="secondary">({{ scope.row.senderId }})</span></template></el-table-column>
      <el-table-column
        label="类型"
        align="center"
        prop="type"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_CONTENT_TYPE"
        :value="scope.row.type"
      /></template></el-table-column>
      <el-table-column
        label="发送时间"
        align="center"
        prop="sendTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="内容预览"
        align="left"
        min-width="240"
      ><template #default="scope"><MessageContentPreview
        :type="scope.row.type"
        :content="scope.row.content"
        :sender-nickname="scope.row.senderNickname"
      /></template></el-table-column>
      <el-table-column
        label="@用户"
        align="left"
        min-width="200"
        show-overflow-tooltip
      ><template #default="scope"><template v-if="scope.row.atUserIds && scope.row.atUserIds.length"><span
        v-for="(userId, index) in scope.row.atUserIds"
        :key="userId"
      ><span v-if="Number(index) > 0">、</span><template v-if="userId === IM_AT_ALL_USER_ID">@{{ IM_AT_ALL_NICKNAME }}</template><template v-else>@{{ atNickname(scope.row, index, userId) }} <span class="secondary">({{ userId }})</span></template></span></template><span v-else>-</span></template></el-table-column>
      <el-table-column
        v-if="MESSAGE_GROUP_READ_ENABLED"
        label="回执"
        align="center"
        prop="receiptStatus"
        width="110"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_RECEIPT_STATUS"
        :value="scope.row.receiptStatus"
      /></template></el-table-column>
      <el-table-column
        v-if="MESSAGE_GROUP_READ_ENABLED"
        label="状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_MESSAGE_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      ><template #default="scope"><el-button
        v-hasPermi="['im:manager:message:query']"
        type="text"
        @click="openDetail(scope.row)"
      >详情</el-button></template></el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <GroupMessageDetail ref="detail" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getManagerGroupMessagePage } from '@/api/im/manager/message/group'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import GroupSelect from '@/views/im/manager/group/components/GroupSelect.vue'
import MessageContentPreview from '../MessageContentPreview.vue'
import GroupMessageDetail from './GroupMessageDetail.vue'

const IM_AT_ALL_USER_ID = -1
const IM_AT_ALL_NICKNAME = '所有人'
const MESSAGE_GROUP_READ_ENABLED = true

export default {
  name: 'ImGroupMessage',
  components: { UserSelectV2, GroupSelect, MessageContentPreview, GroupMessageDetail },
  data() {
    return {
      DICT_TYPE,
      IM_AT_ALL_USER_ID,
      IM_AT_ALL_NICKNAME,
      MESSAGE_GROUP_READ_ENABLED,
      loading: true,
      total: 0,
      list: [],
      contentTypeOptions: getIntDictOptions(DICT_TYPE.IM_CONTENT_TYPE),
      queryParams: { pageNo: 1, pageSize: 10, groupId: undefined, senderId: undefined, type: undefined, content: undefined, sendTime: [] }
    }
  },
  created() {
    const query = this.$route.query
    if (query.groupId) this.queryParams.groupId = Number(query.groupId)
    this.getList()
  },
  methods: {
    dateFormatter,
    atNickname(row, index, userId) {
      return row.atUserNicknames && row.atUserNicknames[index] ? row.atUserNicknames[index] : userId
    },
    async getList() {
      this.loading = true
      try {
        const response = await getManagerGroupMessagePage(this.queryParams)
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
    openDetail(row) {
      this.$refs.detail.open(row)
    }
  }
}
</script>

<style scoped>
.secondary { margin-left: 5px; color: #909399; }
</style>
