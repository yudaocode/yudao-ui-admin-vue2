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
        label="发起人"
        prop="inviterUserId"
      ><UserSelectV2
        v-model="queryParams.inviterUserId"
        placeholder="请选择发起人"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        v-for="field in selectFields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
      ><el-select
        v-model="queryParams[field.prop]"
        :placeholder="field.placeholder"
        clearable
        style="width: 240px"
      ><el-option
        v-for="dict in field.options"
        :key="dict.value"
        :label="dict.label"
        :value="dict.value"
      /></el-select></el-form-item>
      <el-form-item
        label="发起时间"
        prop="startTime"
      ><el-date-picker
        v-model="queryParams.startTime"
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
        label="发起人"
        align="center"
        min-width="160"
      ><template #default="scope"><span>{{ scope.row.inviterNickname || '-' }}</span><span class="secondary">({{ scope.row.inviterUserId }})</span></template></el-table-column>
      <el-table-column
        label="会话类型"
        align="center"
        prop="conversationType"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE"
        :value="scope.row.conversationType"
      /></template></el-table-column>
      <el-table-column
        label="群"
        align="center"
        min-width="160"
      ><template #default="scope"><span v-if="scope.row.groupId">{{ scope.row.groupName || '-' }} <span class="secondary">({{ scope.row.groupId }})</span></span><span v-else>-</span></template></el-table-column>
      <el-table-column
        label="媒体类型"
        align="center"
        prop="mediaType"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_RTC_CALL_MEDIA_TYPE"
        :value="scope.row.mediaType"
      /></template></el-table-column>
      <el-table-column
        label="通话状态"
        align="center"
        prop="status"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_RTC_CALL_STATUS"
        :value="scope.row.status"
      /></template></el-table-column>
      <el-table-column
        label="结束原因"
        align="center"
        prop="endReason"
        width="120"
      ><template #default="scope"><dict-tag
        v-if="scope.row.endReason"
        :type="DICT_TYPE.IM_RTC_CALL_END_REASON"
        :value="scope.row.endReason"
      /><span v-else>-</span></template></el-table-column>
      <el-table-column
        label="通话时长"
        align="center"
        width="120"
      ><template #default="scope">{{ resolveCallDuration(scope.row.acceptTime, scope.row.endTime) }}</template></el-table-column>
      <el-table-column
        label="发起时间"
        align="center"
        prop="startTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      ><template #default="scope"><el-button
        v-hasPermi="['im:manager:rtc:query']"
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
    <RtcCallDetail ref="detail" />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getManagerRtcCallPage } from '@/api/im/manager/rtc'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import RtcCallDetail from './RtcCallDetail.vue'

function formatCallDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = total % 60
  const pad = value => String(value).padStart(2, '0')
  return hours > 0 ? hours + ':' + pad(minutes) + ':' + pad(rest) : pad(minutes) + ':' + pad(rest)
}

function resolveCallDuration(acceptTime, endTime) {
  if (!acceptTime || !endTime) return '-'
  const seconds = Math.floor((new Date(endTime).getTime() - new Date(acceptTime).getTime()) / 1000)
  return seconds > 0 ? formatCallDuration(seconds) : '-'
}

export default {
  name: 'ImRtcCall',
  components: { UserSelectV2, RtcCallDetail },
  data() {
    const options = type => getIntDictOptions(type)
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      queryParams: { pageNo: 1, pageSize: 10, inviterUserId: undefined, conversationType: undefined, mediaType: undefined, status: undefined, endReason: undefined, startTime: [] },
      selectFields: [
        { label: '会话类型', prop: 'conversationType', placeholder: '请选择会话类型', options: options(DICT_TYPE.IM_RTC_CALL_CONVERSATION_TYPE) },
        { label: '媒体类型', prop: 'mediaType', placeholder: '请选择媒体类型', options: options(DICT_TYPE.IM_RTC_CALL_MEDIA_TYPE) },
        { label: '通话状态', prop: 'status', placeholder: '请选择通话状态', options: options(DICT_TYPE.IM_RTC_CALL_STATUS) },
        { label: '结束原因', prop: 'endReason', placeholder: '请选择结束原因', options: options(DICT_TYPE.IM_RTC_CALL_END_REASON) }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    resolveCallDuration,
    async getList() {
      this.loading = true
      try {
        const response = await getManagerRtcCallPage(this.queryParams)
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
