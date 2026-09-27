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
        label="发起方"
        prop="fromUserId"
      >
        <UserSelectV2
          v-model="queryParams.fromUserId"
          placeholder="请选择发起方"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="接收方"
        prop="toUserId"
      >
        <UserSelectV2
          v-model="queryParams.toUserId"
          placeholder="请选择接收方"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="处理结果"
        prop="handleResult"
      >
        <el-select
          v-model="queryParams.handleResult"
          placeholder="请选择处理结果"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in handleResultOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="添加来源"
        prop="addSource"
      >
        <el-select
          v-model="queryParams.addSource"
          placeholder="请选择添加来源"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in addSourceOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
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
        label="发起方"
        align="center"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.fromNickname || '-' }}</span><span class="id-text">({{ scope.row.fromUserId }})</span></template>
      </el-table-column>
      <el-table-column
        label="接收方"
        align="center"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.toNickname || '-' }}</span><span class="id-text">({{ scope.row.toUserId }})</span></template>
      </el-table-column>
      <el-table-column
        label="申请理由"
        align="center"
        prop="applyContent"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="备注"
        align="center"
        prop="displayName"
        width="120"
      />
      <el-table-column
        label="添加来源"
        align="center"
        prop="addSource"
        width="120"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_FRIEND_ADD_SOURCE"
          :value="scope.row.addSource"
        /></template>
      </el-table-column>
      <el-table-column
        label="处理结果"
        align="center"
        prop="handleResult"
        width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_FRIEND_REQUEST_HANDLE_RESULT"
          :value="scope.row.handleResult"
        /></template>
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
import { getManagerFriendRequestPage } from '@/api/im/manager/friend/request'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

export default {
  name: 'ImFriendRequest',
  components: { UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      handleResultOptions: getIntDictOptions(DICT_TYPE.IM_FRIEND_REQUEST_HANDLE_RESULT),
      addSourceOptions: getIntDictOptions(DICT_TYPE.IM_FRIEND_ADD_SOURCE),
      queryParams: { pageNo: 1, pageSize: 10, fromUserId: undefined, toUserId: undefined, handleResult: undefined, addSource: undefined, createTime: [] }
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
        const response = await getManagerFriendRequestPage(this.queryParams)
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
</style>
