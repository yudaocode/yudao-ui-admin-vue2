<template>
  <div class="app-container mall-home">
    <doc-alert
      title="商城手册（功能开启）"
      url="https://doc.iocoder.cn/mall/build/"
    />

    <el-row
      v-loading="loading"
      :gutter="16"
      class="mall-home__row mall-home__comparison-row"
    >
      <el-col
        v-for="card in comparisonCards"
        :key="card.title"
        :md="6"
        :sm="12"
        :xs="24"
      >
        <ComparisonCard
          tag="今日"
          :title="card.title"
          :prefix="card.prefix"
          :decimals="card.decimals"
          :value="card.value"
          :reference="card.reference"
        />
      </el-col>
    </el-row>

    <el-row
      :gutter="16"
      class="mall-home__row"
    >
      <el-col
        :md="12"
        :sm="24"
        :xs="24"
      >
        <ShortcutCard ref="shortcutCard" />
      </el-col>
      <el-col
        :md="12"
        :sm="24"
        :xs="24"
      >
        <OperationDataCard ref="operationDataCard" />
      </el-col>
    </el-row>

    <el-row
      :gutter="16"
      class="mall-home__row"
    >
      <el-col
        :md="18"
        :sm="24"
        :xs="24"
      >
        <MemberFunnelCard ref="memberFunnelCard" />
      </el-col>
      <el-col
        :md="6"
        :sm="24"
        :xs="24"
      >
        <MemberTerminalCard ref="memberTerminalCard" />
      </el-col>
    </el-row>

    <TradeTrendCard
      ref="tradeTrendCard"
      class="mall-home__block"
    />
    <MemberStatisticsCard ref="memberStatisticsCard" />
  </div>
</template>

<script>
import * as TradeStatisticsApi from '@/api/mall/statistics/trade'
import * as MemberStatisticsApi from '@/api/mall/statistics/member'
import ComparisonCard from './components/ComparisonCard.vue'
import MemberStatisticsCard from './components/MemberStatisticsCard.vue'
import OperationDataCard from './components/OperationDataCard.vue'
import ShortcutCard from './components/ShortcutCard.vue'
import TradeTrendCard from './components/TradeTrendCard.vue'
import MemberTerminalCard from '@/views/mall/statistics/member/components/MemberTerminalCard.vue'
import MemberFunnelCard from '@/views/mall/statistics/member/components/MemberFunnelCard.vue'

function emptyComparison() {
  return { value: {}, reference: {}}
}

function numericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default {
  name: 'MallHome',
  components: {
    ComparisonCard,
    MemberFunnelCard,
    MemberStatisticsCard,
    MemberTerminalCard,
    OperationDataCard,
    ShortcutCard,
    TradeTrendCard
  },
  data() {
    return {
      loading: true,
      orderComparison: emptyComparison(),
      userComparison: emptyComparison(),
      requestSequence: 0
    }
  },
  computed: {
    comparisonCards() {
      const orderValue = this.orderComparison.value || {}
      const orderReference = this.orderComparison.reference || {}
      const userValue = this.userComparison.value || {}
      const userReference = this.userComparison.reference || {}
      return [
        {
          title: '销售额',
          prefix: '￥',
          decimals: 2,
          value: this.fenToYuanNumber(orderValue.orderPayPrice),
          reference: this.fenToYuanNumber(orderReference.orderPayPrice)
        },
        {
          title: '用户访问量',
          prefix: '',
          decimals: 0,
          value: numericValue(userValue.visitUserCount),
          reference: numericValue(userReference.visitUserCount)
        },
        {
          title: '订单量',
          prefix: '',
          decimals: 0,
          value: numericValue(orderValue.orderPayCount),
          reference: numericValue(orderReference.orderPayCount)
        },
        {
          title: '新增用户',
          prefix: '',
          decimals: 0,
          value: numericValue(userValue.registerUserCount),
          reference: numericValue(userReference.registerUserCount)
        }
      ]
    }
  },
  created() {
    this.loadComparisons()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async loadComparisons() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const responses = await Promise.all([
          TradeStatisticsApi.getOrderComparison(),
          MemberStatisticsApi.getUserCountComparison()
        ])
        if (requestId !== this.requestSequence) return false
        this.orderComparison = responses[0].data
        this.userComparison = responses[1].data
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    fenToYuanNumber(value) {
      return Number((numericValue(value) / 100).toFixed(2))
    }
  }
}
</script>

<style lang="scss" scoped>
.mall-home {
  background: #f5f7fa;
}

.mall-home__row {
  margin-bottom: 0;
}

.mall-home__row > .el-col {
  margin-bottom: 16px;
}

.mall-home__block {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .mall-home {
    padding-right: 10px;
    padding-left: 10px;
  }
}
</style>
