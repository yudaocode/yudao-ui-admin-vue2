<template>
  <div>
    <ProductItem
      v-for="item in list"
      :key="item.id"
      :pic-url="item.picUrl"
      :price="item.price"
      :sales-count="item.salesCount"
      :spu-id="item.spuId"
      :stock="item.stock"
      :title="item.spuName"
      class="history-item"
    />
  </div>
</template>

<script>
import { getBrowseHistoryPage } from '@/api/mall/product/history'
import ProductItem from '../message/ProductItem.vue'

export default {
  name: 'ProductBrowsingHistory',
  components: { ProductItem },
  data() {
    return {
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: 0,
        userDeleted: false
      }
    }
  },
  computed: {
    skipGetMessageList() {
      return this.total > 0 &&
        Math.ceil(this.total / this.queryParams.pageSize) === this.queryParams.pageNo
    }
  },
  methods: {
    async getHistoryList(conversation) {
      this.queryParams.userId = conversation.userId
      const response = await getBrowseHistoryPage(this.queryParams)
      this.total = response.data.total
      this.list = response.data.list
    },
    async loadMore() {
      if (this.skipGetMessageList) return
      this.queryParams.pageNo += 1
      const response = await getBrowseHistoryPage(this.queryParams)
      this.total = response.data.total
      this.list.concat(response.data.list)
    }
  }
}
</script>

<style scoped>
.history-item {
  margin-bottom: 10px;
}
</style>
