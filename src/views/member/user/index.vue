<template>
  <div class="app-container member-user-page">
    <doc-alert title="会员用户、标签、分组" url="https://doc.iocoder.cn/member/user/" />

    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" v-show="showSearch" @submit.native.prevent>
      <el-form-item label="用户昵称" prop="nickname"><el-input v-model="queryParams.nickname" clearable placeholder="请输入用户昵称" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="手机号" prop="mobile"><el-input v-model="queryParams.mobile" clearable placeholder="请输入手机号" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="邮箱" prop="email"><el-input v-model="queryParams.email" clearable placeholder="请输入邮箱" @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item label="注册时间" prop="createTime"><el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item label="登录时间" prop="loginDate"><el-date-picker v-model="queryParams.loginDate" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item label="用户标签" prop="tagIds"><member-tag-select v-model="queryParams.tagIds" /></el-form-item>
      <el-form-item label="用户等级" prop="levelId"><member-level-select v-model="queryParams.levelId" /></el-form-item>
      <el-form-item label="用户分组" prop="groupId"><member-group-select v-model="queryParams.groupId" /></el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button v-hasPermi="['promotion:coupon:send']" @click="openCoupon">发送优惠券</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8"><right-toolbar :showSearch.sync="showSearch" @queryTable="getList" /></el-row>

    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户编号" align="center" prop="id" width="120" />
      <el-table-column label="头像" align="center" width="70"><template slot-scope="scope"><el-avatar v-if="scope.row.avatar" :src="scope.row.avatar" :size="36" /><span v-else>-</span></template></el-table-column>
      <el-table-column label="手机号" align="center" prop="mobile" width="120" />
      <el-table-column label="邮箱" align="center" prop="email" width="180" />
      <el-table-column label="昵称" align="center" prop="nickname" width="100" />
      <el-table-column label="等级" align="center" prop="levelName" width="100" />
      <el-table-column label="分组" align="center" prop="groupName" width="100" />
      <el-table-column label="用户标签" align="center" min-width="150"><template slot-scope="scope"><el-tag v-for="(tagName, index) in (scope.row.tagNames || [])" :key="index" size="mini" class="tag-item">{{ tagName }}</el-tag></template></el-table-column>
      <el-table-column label="积分" align="center" prop="point" width="90" />
      <el-table-column label="状态" align="center" prop="status" width="90"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="登录时间" align="center" prop="loginDate" width="180" :formatter="dateFormatter" />
      <el-table-column label="注册时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="操作" align="center" fixed="right" width="180"><template slot-scope="scope"><el-button type="text" size="mini" @click="openDetail(scope.row.id)">详情</el-button><el-dropdown v-hasPermi="['member:user:update', 'member:user:update-level', 'member:user:update-point', 'pay:wallet:update-balance']" @command="command => handleCommand(command, scope.row)"><el-button type="text" size="mini">更多<i class="el-icon-arrow-down el-icon--right" /></el-button><el-dropdown-menu slot="dropdown"><el-dropdown-item v-hasPermi="['member:user:update']" command="handleUpdate">编辑</el-dropdown-item><el-dropdown-item v-hasPermi="['member:user:update-level']" command="handleUpdateLevel">修改等级</el-dropdown-item><el-dropdown-item v-hasPermi="['member:user:update-point']" command="handleUpdatePoint">修改积分</el-dropdown-item><el-dropdown-item v-hasPermi="['pay:wallet:update-balance']" command="handleUpdateBlance">修改余额</el-dropdown-item></el-dropdown-menu></el-dropdown></template></el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <user-form ref="userForm" @success="getList" />
    <user-level-update-form ref="levelForm" @success="getList" />
    <user-point-update-form ref="pointForm" @success="getList" />
    <user-balance-update-form ref="balanceForm" @success="getList" />
    <coupon-send-form ref="couponSendForm" />
  </div>
</template>

<script>
import { getUserPage } from '@/api/member/user'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
import MemberTagSelect from '@/views/member/tag/components/MemberTagSelect.vue'
import MemberLevelSelect from '@/views/member/level/components/MemberLevelSelect.vue'
import MemberGroupSelect from '@/views/member/group/components/MemberGroupSelect.vue'
import UserForm from './UserForm.vue'
import UserLevelUpdateForm from './components/UserLevelUpdateForm.vue'
import UserPointUpdateForm from './components/UserPointUpdateForm.vue'
import UserBalanceUpdateForm from './components/UserBalanceUpdateForm.vue'
import { CouponSendForm } from '@/views/mall/promotion/coupon/components'

export default {
  name: 'MemberUser',
  components: { MemberTagSelect, MemberLevelSelect, MemberGroupSelect, UserForm, UserLevelUpdateForm, UserPointUpdateForm, UserBalanceUpdateForm, CouponSendForm },
  data() {
    return {
      DICT_TYPE,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      selectedIds: [],
      queryParams: { pageNo: 1, pageSize: 10, nickname: undefined, mobile: undefined, email: undefined, loginDate: [], createTime: [], tagIds: [], levelId: undefined, groupId: undefined }
    }
  },
  created() { this.getList() },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      return getUserPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.handleQuery() },
    handleSelectionChange(rows) { this.selectedIds = rows.map(row => row.id) },
    openCoupon() {
      if (!this.selectedIds.length) {
        this.$modal.msgWarning('请选择要发送优惠券的用户')
        return
      }
      this.$refs.couponSendForm.open(this.selectedIds)
    },
    openDetail(id) { this.$router.push({ name: 'MemberUserDetail', params: { id: id }}) },
    openForm(type, id) { this.$refs.userForm.open(type, id) },
    handleCommand(command, row) {
      if (command === 'handleUpdate') this.openForm('update', row.id)
      if (command === 'handleUpdateLevel') this.$refs.levelForm.open(row.id)
      if (command === 'handleUpdatePoint') this.$refs.pointForm.open(row.id)
      if (command === 'handleUpdateBlance') this.$refs.balanceForm.open(row.id)
    }
  }
}
</script>

<style scoped>
.tag-item { margin: 2px; }
.member-user-page .member-select { width: 240px; }
</style>
