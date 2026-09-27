<template>
  <el-container class="member-info">
    <el-header class="member-info-header">
      <div
        v-for="tab in tabs"
        :key="tab"
        :class="{ 'member-info-header-item-activation': tabActivation(tab) }"
        class="member-info-header-item"
        @click="handleClick(tab)"
      >
        {{ tab }}
      </div>
    </el-header>
    <el-main class="member-info-content">
      <div
        v-if="!isEmpty(conversation)"
        v-loading="loading"
      >
        <template v-if="activeTab === '会员信息'">
          <el-card shadow="never">
            <div
              slot="header"
              class="card-title"
            >基本信息</div>
            <div class="member-avatar">
              <el-avatar
                :size="140"
                :src="user.avatar || undefined"
                shape="square"
              />
            </div>
            <el-descriptions
              :column="1"
              class="member-descriptions"
            >
              <el-descriptions-item label="用户名">{{ user.name || '空' }}</el-descriptions-item>
              <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ user.mobile }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ user.email || '空' }}</el-descriptions-item>
              <el-descriptions-item label="性别">
                <dict-tag
                  :type="DICT_TYPE.SYSTEM_USER_SEX"
                  :value="user.sex == null ? 0 : user.sex"
                />
              </el-descriptions-item>
              <el-descriptions-item label="所在地">{{ user.areaName }}</el-descriptions-item>
              <el-descriptions-item label="注册 IP">{{ user.registerIp }}</el-descriptions-item>
              <el-descriptions-item label="生日">
                {{ user.birthday ? formatDate(user.birthday) : '空' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ user.createTime ? formatDate(user.createTime) : '空' }}
              </el-descriptions-item>
              <el-descriptions-item label="最后登录时间">
                {{ user.loginDate ? formatDate(user.loginDate) : '空' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-card
            class="account-card"
            shadow="never"
          >
            <div
              slot="header"
              class="card-title"
            >账户信息</div>
            <el-descriptions
              :column="1"
              class="member-descriptions"
            >
              <el-descriptions-item label="等级">{{ user.levelName || '无' }}</el-descriptions-item>
              <el-descriptions-item label="成长值">{{ user.experience || 0 }}</el-descriptions-item>
              <el-descriptions-item label="当前积分">{{ user.point || 0 }}</el-descriptions-item>
              <el-descriptions-item label="总积分">{{ user.totalPoint || 0 }}</el-descriptions-item>
              <el-descriptions-item label="当前余额">{{ fenToYuan(wallet.balance || 0) }}</el-descriptions-item>
              <el-descriptions-item label="支出金额">{{ fenToYuan(wallet.totalExpense || 0) }}</el-descriptions-item>
              <el-descriptions-item label="充值金额">{{ fenToYuan(wallet.totalRecharge || 0) }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </template>
      </div>
      <div
        v-show="!isEmpty(conversation)"
        class="history-scroll-container"
      >
        <el-scrollbar ref="scrollbar">
          <ProductBrowsingHistory
            v-if="activeTab === '最近浏览'"
            ref="productBrowsingHistory"
          />
          <OrderBrowsingHistory
            v-if="activeTab === '交易订单'"
            ref="orderBrowsingHistory"
          />
        </el-scrollbar>
      </div>
      <el-empty
        v-show="isEmpty(conversation)"
        description="请选择左侧的一个会话后开始"
      />
    </el-main>
  </el-container>
</template>

<script>
import ProductBrowsingHistory from './ProductBrowsingHistory.vue'
import OrderBrowsingHistory from './OrderBrowsingHistory.vue'
import * as UserApi from '@/api/member/user'
import * as WalletApi from '@/api/pay/wallet/balance'
import { DICT_TYPE } from '@/utils/dict'
import { debounce, fenToYuan, isEmpty } from '@/utils'
import { formatDate } from '@/utils/formatTime'

const WALLET_INIT_DATA = {
  balance: 0,
  totalExpense: 0,
  totalRecharge: 0
}

export default {
  name: 'MemberBrowsingHistory',
  components: { ProductBrowsingHistory, OrderBrowsingHistory },
  data() {
    return {
      DICT_TYPE,
      tabs: ['会员信息', '最近浏览', '交易订单'],
      activeTab: '会员信息',
      conversation: {},
      wallet: WALLET_INIT_DATA,
      user: {},
      loading: true,
      scrollWrap: undefined
    }
  },
  created() {
    this.handleScroll = debounce(this.handleScroll, 200)
  },
  mounted() {
    this.scrollWrap = this.$refs.scrollbar.wrap
    this.scrollWrap.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    if (this.scrollWrap) this.scrollWrap.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    tabActivation(tab) {
      return this.activeTab === tab
    },
    async handleClick(tab) {
      if (isEmpty(this.conversation)) return
      this.activeTab = tab
      await this.$nextTick()
      await this.getHistoryList()
    },
    async getHistoryList() {
      switch (this.activeTab) {
        case '会员信息':
          await this.getUserData()
          await this.getUserWallet()
          break
        case '最近浏览':
          if (this.$refs.productBrowsingHistory) {
            await this.$refs.productBrowsingHistory.getHistoryList(this.conversation)
          }
          break
        case '交易订单':
          if (this.$refs.orderBrowsingHistory) {
            await this.$refs.orderBrowsingHistory.getHistoryList(this.conversation)
          }
          break
        default:
          break
      }
    },
    async loadMore() {
      switch (this.activeTab) {
        case '会员信息':
          break
        case '最近浏览':
          if (this.$refs.productBrowsingHistory) {
            await this.$refs.productBrowsingHistory.loadMore()
          }
          break
        case '交易订单':
          if (this.$refs.orderBrowsingHistory) {
            await this.$refs.orderBrowsingHistory.loadMore()
          }
          break
        default:
          break
      }
    },
    async initHistory(conversation) {
      this.activeTab = '会员信息'
      this.conversation = conversation
      await this.$nextTick()
      await this.getHistoryList()
    },
    handleScroll() {
      const wrap = this.$refs.scrollbar.wrap
      if (Math.abs(wrap.scrollHeight - wrap.clientHeight - wrap.scrollTop) < 1) {
        this.loadMore()
      }
    },
    async getUserWallet() {
      if (!this.conversation.userId) {
        this.wallet = WALLET_INIT_DATA
        return
      }
      const response = await WalletApi.getWallet({ userId: this.conversation.userId })
      this.wallet = response.data
    },
    async getUserData() {
      this.loading = true
      try {
        const response = await UserApi.getUser(this.conversation.userId)
        this.user = response.data
      } finally {
        this.loading = false
      }
    },
    isEmpty,
    fenToYuan,
    formatDate
  }
}
</script>

<style lang="scss" scoped>
.member-info {
  position: relative;
  width: 300px !important;
  background-color: #fff;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background-color: #dcdfe6;
    content: '';
    transform: scaleX(0.3);
  }
}

.member-info-header {
  position: relative;
  display: flex;
  padding: 0;
  background-color: #fff;
  align-items: center;
  justify-content: space-around;

  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #dcdfe6;
    content: '';
    transform: scaleY(0.3);
  }

  &-item {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    cursor: pointer;
    align-items: center;
    justify-content: center;

    &-activation::before,
    &:hover::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-bottom: 2px solid rgb(128 128 128 / 50%);
      content: '';
    }
  }
}

.member-info-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 10px;
  margin: 0;
}

.member-avatar {
  display: flex;
  justify-content: center;
}

.account-card {
  margin-top: 10px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

::v-deep .member-descriptions .el-descriptions-item__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

::v-deep .member-descriptions .el-descriptions-item__label {
  display: block;
  width: 120px;
  text-align: left;
}

::v-deep .member-descriptions .el-descriptions-item__content {
  flex: 1;
  text-align: right;
}

.history-scroll-container,
.history-scroll-container ::v-deep .el-scrollbar {
  height: 100%;
}

.history-scroll-container ::v-deep .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
