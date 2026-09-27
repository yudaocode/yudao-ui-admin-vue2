<template>
  <div class="app-container product-statistics">
    <doc-alert
      title="【统计】会员、商品、交易统计"
      url="https://doc.iocoder.cn/mall/statistics/"
    />

    <ProductSummary />
    <ProductRank class="product-statistics__rank" />
  </div>
</template>

<script>
import ProductRank from './components/ProductRank.vue'
import ProductSummary from './components/ProductSummary.vue'

export default {
  name: 'ProductStatistics',
  components: { ProductRank, ProductSummary }
}
</script>

<style lang="scss" scoped>
.product-statistics__rank {
  margin-top: 16px;
}
</style>
