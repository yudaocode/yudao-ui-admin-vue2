<template>
  <el-card
    v-loading="loading"
    shadow="never"
    class="home-card operation-data-card"
  >
    <div
      slot="header"
      class="home-card__title"
    >运营数据</div>
    <div class="operation-data-card__grid">
      <button
        v-for="item in operationItems"
        :key="item.key"
        type="button"
        class="operation-data-card__item"
        @click="handleClick(item.routerName)"
      >
        <count-to
          :start-val="0"
          :end-val="item.value"
          :duration="1200"
          :decimals="item.decimals || 0"
          :prefix="item.prefix || ''"
          class="operation-data-card__value"
        />
        <span>{{ item.name }}</span>
      </button>
    </div>
  </el-card>
</template>

<script>
import CountTo from 'vue-count-to'
import * as ProductSpuApi from '@/api/mall/product/spu'
import * as TradeStatisticsApi from '@/api/mall/statistics/trade'
import * as PayStatisticsApi from '@/api/mall/statistics/pay'

function numericValue(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export default {
  name: 'OperationDataCard',
  components: { CountTo },
  data() {
    return {
      loading: true,
      activatedOnce: false,
      requestSequence: 0,
      dataValues: {
        orderUndelivered: 0,
        orderAfterSaleApply: 0,
        orderWaitePickUp: 0,
        productAlertStock: 0,
        productForSale: 0,
        productInWarehouse: 0,
        withdrawAuditing: 0,
        rechargePrice: 0
      }
    }
  },
  computed: {
    operationItems() {
      return [
        { key: 'orderUndelivered', name: '待发货订单', value: this.dataValues.orderUndelivered, routerName: 'TradeOrder' },
        { key: 'orderAfterSaleApply', name: '退款中订单', value: this.dataValues.orderAfterSaleApply, routerName: 'TradeAfterSale' },
        { key: 'orderWaitePickUp', name: '待核销订单', value: this.dataValues.orderWaitePickUp, routerName: 'TradeOrder' },
        { key: 'productAlertStock', name: '库存预警', value: this.dataValues.productAlertStock, routerName: 'ProductSpu' },
        { key: 'productForSale', name: '上架商品', value: this.dataValues.productForSale, routerName: 'ProductSpu' },
        { key: 'productInWarehouse', name: '仓库商品', value: this.dataValues.productInWarehouse, routerName: 'ProductSpu' },
        { key: 'withdrawAuditing', name: '提现待审核', value: this.dataValues.withdrawAuditing, routerName: 'TradeBrokerageWithdraw' },
        {
          key: 'rechargePrice',
          name: '账户充值',
          value: this.dataValues.rechargePrice,
          prefix: '￥',
          decimals: 2,
          routerName: 'PayWalletRecharge'
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  activated() {
    if (this.activatedOnce) this.loadData()
    this.activatedOnce = true
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const responses = await Promise.all([
          TradeStatisticsApi.getOrderCount(),
          ProductSpuApi.getTabsCount(),
          PayStatisticsApi.getWalletRechargePrice()
        ])
        if (requestId !== this.requestSequence) return false
        const orderCount = responses[0].data
        const productCount = responses[1].data
        const paySummary = responses[2].data
        this.dataValues = {
          orderUndelivered: numericValue(orderCount.undelivered),
          orderAfterSaleApply: numericValue(orderCount.afterSaleApply),
          orderWaitePickUp: numericValue(orderCount.pickUp),
          productAlertStock: numericValue(productCount['3']),
          productForSale: numericValue(productCount['0']),
          productInWarehouse: numericValue(productCount['1']),
          withdrawAuditing: numericValue(orderCount.auditingWithdraw),
          rechargePrice: Number((numericValue(paySummary.rechargePrice) / 100).toFixed(2))
        }
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleClick(routerName) {
      const result = this.$router.push({ name: routerName })
      if (result && typeof result.catch === 'function') result.catch(() => {})
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.home-card__title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.operation-data-card__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 12px;
  padding: 17px 4px;
}

.operation-data-card__item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  padding: 0;
  color: #606266;
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.operation-data-card__item:hover {
  color: #409eff;
}

.operation-data-card__value {
  max-width: 100%;
  overflow: hidden;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .operation-data-card__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
