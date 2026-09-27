<template>
  <div v-loading="loading" class="app-container member-user-detail">
    <el-row :gutter="10">
      <el-col :span="14" class="detail-info-item">
        <user-basic-info :user="user">
          <template slot="header">
            <span>基本信息</span>
            <el-button v-hasPermi="['member:user:update']" type="text" size="small" @click="openForm('update')">编辑</el-button>
          </template>
        </user-basic-info>
      </el-col>
      <el-col :span="10" class="detail-info-item">
        <el-card shadow="never" class="account-card">
          <div slot="header">账户信息</div>
          <user-account-info :user="user" :wallet="wallet" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="detail-card">
      <div slot="header">账户明细</div>
      <el-tabs>
        <el-tab-pane label="积分"><user-point-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="签到" lazy><user-sign-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="成长值" lazy><user-experience-record-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="余额" lazy><user-balance-list :wallet-id="wallet.id" /></el-tab-pane>
        <el-tab-pane label="收货地址" lazy><user-address-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="订单管理" lazy><user-order-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="售后管理" lazy><user-after-sale-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="收藏记录" lazy><user-favorite-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="优惠劵" lazy><user-coupon-list :user-id="id" /></el-tab-pane>
        <el-tab-pane label="推广用户" lazy><user-brokerage-list :bind-user-id="id" /></el-tab-pane>
      </el-tabs>
    </el-card>

    <user-form ref="form" @success="getUserData(id)" />
  </div>
</template>

<script>
import * as UserApi from '@/api/member/user'
import * as WalletApi from '@/api/pay/wallet/balance'
import UserForm from '@/views/member/user/UserForm.vue'
import UserBasicInfo from './UserBasicInfo.vue'
import UserAccountInfo from './UserAccountInfo.vue'
import UserPointList from './UserPointList.vue'
import UserSignList from './UserSignList.vue'
import UserExperienceRecordList from './UserExperienceRecordList.vue'
import UserBalanceList from './UserBalanceList.vue'
import UserAddressList from './UserAddressList.vue'
import UserOrderList from './UserOrderList.vue'
import UserAfterSaleList from './UserAfterSaleList.vue'
import UserFavoriteList from './UserFavoriteList.vue'
import UserCouponList from './UserCouponList.vue'
import UserBrokerageList from './UserBrokerageList.vue'

const emptyWallet = () => ({ balance: 0, totalExpense: 0, totalRecharge: 0 })

export default {
  name: 'MemberDetail',
  components: {
    UserForm,
    UserBasicInfo,
    UserAccountInfo,
    UserPointList,
    UserSignList,
    UserExperienceRecordList,
    UserBalanceList,
    UserAddressList,
    UserOrderList,
    UserAfterSaleList,
    UserFavoriteList,
    UserCouponList,
    UserBrokerageList
  },
  data() {
    return { loading: true, id: undefined, user: {}, wallet: emptyWallet() }
  },
  created() {
    this.id = this.$route && this.$route.params ? Number(this.$route.params.id) : undefined
  },
  mounted() {
    if (!this.id) {
      this.$modal.msgWarning('参数错误，会员编号不能为空！')
      if (this.$store && this.$store.dispatch) this.$store.dispatch('tagsView/delView', this.$route)
      return
    }
    this.getUserData(this.id)
    this.getUserWallet()
  },
  methods: {
    getUserData(id) {
      this.loading = true
      return UserApi.getUser(id)
        .then(response => { this.user = response.data })
        .finally(() => { this.loading = false })
    },
    getUserWallet() {
      if (!this.id) {
        this.wallet = emptyWallet()
        return Promise.resolve()
      }
      return WalletApi.getWallet({ userId: this.id })
        .then(response => { this.wallet = response.data || emptyWallet() })
    },
    openForm(type) {
      this.$refs.form.open(type, this.id)
    }
  }
}
</script>

<style scoped>
.member-user-detail { min-height: calc(100vh - 84px); }
.detail-info-item:first-child { padding-left: 0 !important; }
.detail-info-item:nth-child(2) { padding-right: 0 !important; }
.account-card { height: 100%; }
.detail-card { width: 100%; margin-top: 20px; }
</style>
