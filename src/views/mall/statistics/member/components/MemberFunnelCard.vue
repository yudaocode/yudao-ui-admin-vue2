<template>
  <el-card
    shadow="never"
    class="member-funnel-card"
  >
    <div
      slot="header"
      class="member-funnel-card__header"
    >
      <span class="member-card-title">会员概览</span>
      <MemberDateRangePicker @change="handleTimeRangeChange" />
    </div>

    <div
      v-loading="loading"
      class="member-funnel"
    >
      <div class="member-funnel__row member-funnel__row--register">
        <div class="member-funnel__statistics">
          <strong>注册用户数量：{{ comparisonValue('registerUserCount') }}</strong>
          <span>环比增长率：{{ relativeRate('registerUserCount') }}%</span>
        </div>
        <div class="member-funnel__step member-funnel__step--visit">
          <strong>{{ analyseData.visitUserCount || 0 }}</strong>
          <span>访客</span>
        </div>
      </div>

      <div class="member-funnel__row member-funnel__row--active">
        <div class="member-funnel__statistics">
          <strong>活跃用户数量：{{ comparisonValue('visitUserCount') }}</strong>
          <span>环比增长率：{{ relativeRate('visitUserCount') }}%</span>
        </div>
        <div class="member-funnel__step member-funnel__step--order">
          <strong>{{ analyseData.orderUserCount || 0 }}</strong>
          <span>下单</span>
        </div>
      </div>

      <div class="member-funnel__row member-funnel__row--recharge">
        <div class="member-funnel__statistics member-funnel__statistics--split">
          <div>
            <strong>充值用户数量：{{ comparisonValue('rechargeUserCount') }}</strong>
            <span>环比增长率：{{ relativeRate('rechargeUserCount') }}%</span>
          </div>
          <strong>客单价：￥{{ fenToYuan(analyseData.atv) }}</strong>
        </div>
        <div class="member-funnel__step member-funnel__step--pay">
          <strong>{{ analyseData.payUserCount || 0 }}</strong>
          <span>成交用户</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { getMemberAnalyse } from '@/api/mall/statistics/member'
import MemberDateRangePicker from './MemberDateRangePicker.vue'

function emptyAnalyseData() {
  return {
    visitUserCount: 0,
    orderUserCount: 0,
    payUserCount: 0,
    atv: 0,
    comparison: { value: {}, reference: {}}
  }
}

export default {
  name: 'MemberFunnelCard',
  components: { MemberDateRangePicker },
  data() {
    return {
      loading: true,
      analyseData: emptyAnalyseData(),
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    comparisonValue(field) {
      const comparison = this.analyseData.comparison || {}
      const value = comparison.value || {}
      return Number(value[field] || 0)
    },
    relativeRate(field) {
      const comparison = this.analyseData.comparison || {}
      const value = Number((comparison.value || {})[field] || 0)
      const reference = Number((comparison.reference || {})[field] || 0)
      if (!reference) return 0
      return ((100 * (value - reference)) / reference).toFixed(0)
    },
    fenToYuan(value) {
      const amount = Number(value)
      return Number.isFinite(amount) ? (amount / 100).toFixed(2) : '0.00'
    },
    async handleTimeRangeChange(times) {
      const requestId = ++this.requestSequence
      if (!Array.isArray(times) || !times[0] || !times[1]) {
        this.analyseData = emptyAnalyseData()
        this.loading = false
        return
      }
      this.loading = true
      try {
        const response = await getMemberAnalyse({ times: times.slice(0, 2) })
        if (requestId !== this.requestSequence) return
        this.analyseData = response.data
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.member-funnel-card__header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.member-card-title {
  flex: none;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.member-funnel {
  min-width: 720px;
  min-height: 300px;
  padding: 7px 0;
}

.member-funnel__row {
  position: relative;
  display: flex;
  align-items: stretch;
  height: 96px;
}

.member-funnel__statistics {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  min-width: 0;
  padding: 0 330px 0 60px;
  font-size: 14px;
}

.member-funnel__statistics--split {
  flex-direction: row;
  gap: 52px;
  align-items: center;
  justify-content: flex-start;
  padding-right: 185px;
}

.member-funnel__statistics--split > div {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-funnel__row--register .member-funnel__statistics {
  background: #eff6ff;
}

.member-funnel__row--active .member-funnel__statistics {
  background: #ecfeff;
}

.member-funnel__row--recharge .member-funnel__statistics {
  background: #f8fafc;
}

.member-funnel__step {
  position: absolute;
  right: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 92px;
  color: #fff;
  clip-path: polygon(0 0, 100% 0, 88% 100%, 12% 100%);
}

.member-funnel__step strong {
  margin-bottom: 5px;
  font-size: 24px;
}

.member-funnel__step--visit {
  top: 4px;
  width: 310px;
  background: #3b82f6;
}

.member-funnel__step--order {
  top: 3px;
  right: 77px;
  width: 224px;
  background: #06b6d4;
}

.member-funnel__step--pay {
  top: 3px;
  right: 120px;
  width: 138px;
  background: #64748b;
}

@media (max-width: 1200px) {
  .member-funnel-card {
    overflow-x: auto;
  }
}

@media (max-width: 900px) {
  .member-funnel-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
