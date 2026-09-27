<template>
  <div>
    <OrderItem
      v-for="item in list"
      :key="item.id"
      :order="item"
      class="history-item"
    />
  </div>
</template>

<script>
import OrderItem from '../message/OrderItem.vue'
import { getOrderPage } from '@/api/mall/trade/order'

export default {
  name: 'OrderBrowsingHistory',
  components: { OrderItem },
  data() {
    return {
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: 0
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
      const response = await getOrderPage(this.queryParams)
      this.total = response.data.total
      this.list = response.data.list
    },
    async loadMore() {
      if (this.skipGetMessageList) return
      this.queryParams.pageNo += 1
      const response = await getOrderPage(this.queryParams)
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
