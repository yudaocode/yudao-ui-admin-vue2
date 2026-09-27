<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="80px"
      size="small"
    >
      <el-form-item
        label="群"
        prop="groupId"
      ><GroupSelect
        v-model="queryParams.groupId"
        placeholder="请选择群"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        label="申请人"
        prop="userId"
      ><UserSelectV2
        v-model="queryParams.userId"
        placeholder="请选择申请人"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        label="邀请人"
        prop="inviterUserId"
      ><UserSelectV2
        v-model="queryParams.inviterUserId"
        placeholder="请选择邀请人"
        style="width: 240px"
      /></el-form-item>
      <el-form-item
        label="处理结果"
        prop="handleResult"
      >
        <el-select
          v-model="queryParams.handleResult"
          placeholder="请选择处理结果"
          clearable
          style="width: 240px"
        ><el-option
          v-for="dict in handleResultOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="加入来源"
        prop="addSource"
      >
        <el-select
          v-model="queryParams.addSource"
          placeholder="请选择加入来源"
          clearable
          style="width: 240px"
        ><el-option
          v-for="dict in addSourceOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
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
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.groupName || '-' }}</span><span class="id-text">({{ scope.row.groupId }})</span></template>
      </el-table-column>
      <el-table-column
        label="申请人 / 被邀请人"
        align="center"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.userNickname || '-' }}</span><span class="id-text">({{ scope.row.userId }})</span></template>
      </el-table-column>
      <el-table-column
        label="邀请人"
        align="center"
        min-width="180"
        show-overflow-tooltip
      >
        <template #default="scope"><template v-if="scope.row.inviterUserId"><span>{{ scope.row.inviterNickname || '-' }}</span><span class="id-text">({{ scope.row.inviterUserId }})</span></template><span
          v-else
          class="secondary-text"
        >主动申请</span></template>
      </el-table-column>
      <el-table-column
        label="申请理由"
        align="center"
        prop="applyContent"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="加入来源"
        align="center"
        prop="addSource"
        width="120"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_GROUP_ADD_SOURCE"
        :value="scope.row.addSource"
      /></template></el-table-column>
      <el-table-column
        label="处理结果"
        align="center"
        prop="handleResult"
        width="100"
      ><template #default="scope"><dict-tag
        :type="DICT_TYPE.IM_GROUP_REQUEST_HANDLE_RESULT"
        :value="scope.row.handleResult"
      /></template></el-table-column>
      <el-table-column
        label="处理人"
        align="center"
        min-width="160"
        show-overflow-tooltip
      >
        <template #default="scope"><template v-if="scope.row.handleUserId"><span>{{ scope.row.handleNickname || '-' }}</span><span class="id-text">({{ scope.row.handleUserId }})</span></template><span
          v-else
          class="secondary-text"
        >-</span></template>
      </el-table-column>
      <el-table-column
        label="处理理由"
        align="center"
        prop="handleContent"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="处理时间"
        align="center"
        prop="handleTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { dateFormatter } from '@/utils'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getManagerGroupRequestPage } from '@/api/im/manager/group/request'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import GroupSelect from '@/views/im/manager/group/components/GroupSelect.vue'

export default {
  name: 'ImGroupRequest',
  components: { GroupSelect, UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      handleResultOptions: getIntDictOptions(DICT_TYPE.IM_GROUP_REQUEST_HANDLE_RESULT),
      addSourceOptions: getIntDictOptions(DICT_TYPE.IM_GROUP_ADD_SOURCE),
      queryParams: { pageNo: 1, pageSize: 10, groupId: undefined, userId: undefined, inviterUserId: undefined, handleResult: undefined, addSource: undefined, createTime: [] }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    async getList() {
      this.loading = true
      try {
        const response = await getManagerGroupRequestPage(this.queryParams)
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
    }
  }
}
</script>

<style scoped>
.id-text { margin-left: 5px; color: #909399; }
.secondary-text { color: #909399; }
</style>
