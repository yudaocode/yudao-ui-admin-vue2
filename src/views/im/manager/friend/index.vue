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
        label="用户"
        prop="userId"
      >
        <UserSelectV2
          v-model="queryParams.userId"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="好友"
        prop="friendUserId"
      >
        <UserSelectV2
          v-model="queryParams.friendUserId"
          placeholder="请选择好友"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="好友状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择好友状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in friendStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="免打扰"
        prop="silent"
      >
        <el-select
          v-model="queryParams.silent"
          placeholder="请选择免打扰状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in boolOptions"
            :key="String(dict.value)"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="添加时间"
        prop="addTime"
      >
        <el-date-picker
          v-model="queryParams.addTime"
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
        label="用户"
        align="center"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.userNickname || '-' }}</span><span class="id-text">({{ scope.row.userId }})</span></template>
      </el-table-column>
      <el-table-column
        label="好友"
        align="center"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="scope"><span>{{ scope.row.friendNickname || '-' }}</span><span class="id-text">({{ scope.row.friendUserId }})</span></template>
      </el-table-column>
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
        label="免打扰"
        align="center"
        prop="silent"
        width="80"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.silent"
        /></template>
      </el-table-column>
      <el-table-column
        label="置顶"
        align="center"
        prop="pinned"
        width="80"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.pinned"
        /></template>
      </el-table-column>
      <el-table-column
        label="拉黑"
        align="center"
        prop="blocked"
        width="80"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.blocked"
        /></template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_FRIEND_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column
        label="添加时间"
        align="center"
        prop="addTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="删除时间"
        align="center"
        prop="deleteTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="100"
        fixed="right"
      >
        <template #default="scope"><el-button
          type="text"
          @click="goConversation(scope.row)"
        >查看对话</el-button></template>
      </el-table-column>
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
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { getManagerFriendPage } from '@/api/im/manager/friend'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'

export default {
  name: 'ImFriend',
  components: { UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      total: 0,
      list: [],
      friendStatusOptions: getIntDictOptions(DICT_TYPE.IM_FRIEND_STATUS),
      boolOptions: getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING),
      queryParams: { pageNo: 1, pageSize: 10, userId: undefined, friendUserId: undefined, status: undefined, silent: undefined, addTime: [] }
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
        const response = await getManagerFriendPage(this.queryParams)
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
    goConversation(row) {
      this.$router.push({ name: 'ImPrivateMessage', query: { senderId: row.userId, receiverId: row.friendUserId }})
    }
  }
}
</script>

<style scoped>
.id-text { margin-left: 5px; color: #909399; }
</style>
