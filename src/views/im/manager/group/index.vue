<template>
  <div class="app-container">
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="群名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入群名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="群主"
        prop="ownerUserId"
      >
        <UserSelectV2
          v-model="queryParams.ownerUserId"
          placeholder="请选择群主"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item
        label="群状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择群状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupStatusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="是否封禁"
        prop="banned"
      >
        <el-select
          v-model="queryParams.banned"
          placeholder="请选择封禁状态"
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
        label="头像"
        align="center"
        width="80"
      >
        <template #default="scope"><el-avatar
          :src="scope.row.avatar"
          :size="40"
        >{{ firstCharacter(scope.row.name) }}</el-avatar></template>
      </el-table-column>
      <el-table-column
        label="群名称"
        align="center"
        prop="name"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column
        label="群主"
        align="center"
        min-width="160"
      >
        <template #default="scope"><span>{{ scope.row.ownerNickname || '-' }}</span><span class="id-text">({{ scope.row.ownerUserId }})</span></template>
      </el-table-column>
      <el-table-column
        label="成员数"
        align="center"
        prop="memberCount"
        width="90"
      />
      <el-table-column
        label="群状态"
        align="center"
        prop="status"
        width="100"
      >
        <template #default="scope"><dict-tag
          :type="DICT_TYPE.IM_GROUP_STATUS"
          :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column
        label="封禁状态"
        align="center"
        prop="banned"
        width="120"
      >
        <template #default="scope">
          <el-tooltip
            v-if="scope.row.banned"
            :content="scope.row.bannedReason"
            placement="top"
          ><dict-tag
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.banned"
          /></el-tooltip>
          <dict-tag
            v-else
            :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
            :value="scope.row.banned"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="全群禁言"
        align="center"
        prop="mutedAll"
        width="100"
      >
        <template #default="scope"><el-tag
          v-if="scope.row.mutedAll"
          type="danger"
        >已禁言</el-tag><el-tag
          v-else
          type="info"
        >未禁言</el-tag></template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        label="操作"
        align="center"
        width="340"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-hasPermi="['im:manager:group:query']"
            type="text"
            @click="openDetail(scope.row)"
          >详情</el-button>
          <el-button
            type="text"
            @click="goConversation(scope.row)"
          >查看对话</el-button>
          <el-button
            v-if="!scope.row.banned"
            v-hasPermi="['im:manager:group:ban']"
            type="text"
            class="danger-text"
            @click="openBanDialog(scope.row)"
          >封禁</el-button>
          <el-button
            v-else
            v-hasPermi="['im:manager:group:ban']"
            type="text"
            @click="handleUnban(scope.row)"
          >解封</el-button>
          <el-button
            v-if="scope.row.status === CommonStatusEnum.ENABLE"
            v-hasPermi="['im:manager:group:dissolve']"
            type="text"
            class="danger-text"
            @click="handleDissolve(scope.row)"
          >解散</el-button>
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
    <GroupDetail ref="detail" />
    <GroupBanForm
      ref="banForm"
      @success="getList"
    />
  </div>
</template>

<script>
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import { CommonStatusEnum } from '@/utils/constants'
import { dissolveManagerGroup, getManagerGroupPage, unbanManagerGroup } from '@/api/im/manager/group'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import GroupDetail from './GroupDetail.vue'
import GroupBanForm from './GroupBanForm.vue'

export default {
  name: 'ImGroup',
  components: { GroupBanForm, GroupDetail, UserSelectV2 },
  data() {
    return {
      DICT_TYPE,
      CommonStatusEnum,
      loading: true,
      total: 0,
      list: [],
      groupStatusOptions: getIntDictOptions(DICT_TYPE.IM_GROUP_STATUS),
      boolOptions: getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING),
      queryParams: { pageNo: 1, pageSize: 10, name: undefined, ownerUserId: undefined, status: undefined, banned: undefined, createTime: [] }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    firstCharacter(value) {
      return value ? value.charAt(0) : '?'
    },
    async getList() {
      this.loading = true
      try {
        const response = await getManagerGroupPage(this.queryParams)
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
    },
    openBanDialog(row) {
      this.$refs.banForm.open(row)
    },
    async handleUnban(row) {
      try {
        await this.$modal.confirm('确认解封群「' + row.name + '」吗？')
        await unbanManagerGroup(row.id)
        this.$modal.msgSuccess('解封成功')
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败均不追加提示
      }
    },
    async handleDissolve(row) {
      try {
        await this.$modal.confirm('确认解散群「' + row.name + '」吗？')
        await dissolveManagerGroup(row.id)
        this.$modal.msgSuccess('解散成功')
        await this.getList()
      } catch (error) {
        // 与 Vue3 一致：确认取消或接口失败均不追加提示
      }
    },
    goConversation(row) {
      this.$router.push({ name: 'ImGroupMessage', query: { groupId: row.id }})
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
.id-text { margin-left: 5px; color: #909399; }
</style>
