<template>
  <div v-if="isObject(getMessageContent)">
    <div
      :key="getMessageContent.id"
      class="order-list-card-box"
    >
      <div class="order-card-header">
        <div class="order-no">
          订单号：
          <span @click="openDetail(getMessageContent.id)">{{ getMessageContent.no }}</span>
        </div>
        <div
          :class="formatOrderColor(getMessageContent)"
          class="order-state"
        >
          {{ formatOrderStatus(getMessageContent) }}
        </div>
      </div>
      <div
        v-for="item in getMessageContent.items"
        :key="item.id"
        class="border-bottom"
      >
        <ProductItem
          :num="item.count"
          :pic-url="item.picUrl"
          :price="item.price"
          :sku-text="item.properties.map(property => property.valueName).join(' ')"
          :spu-id="item.spuId"
          :title="item.spuName"
        />
      </div>
      <div class="pay-box">
        <div class="pay-content">
          <div class="discounts-title pay-color">
            共 {{ getMessageContent.productCount }} 件商品,总金额:
          </div>
          <div class="discounts-money pay-color">
            ￥{{ fenToYuan(getMessageContent.payPrice) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fenToYuan, isObject, jsonParse } from '@/utils'
import ProductItem from './ProductItem.vue'

export default {
  name: 'OrderItem',
  components: { ProductItem },
  props: {
    message: { type: Object, default: undefined },
    order: { type: Object, default: undefined }
  },
  computed: {
    getMessageContent() {
      return typeof this.message !== 'undefined' ? jsonParse(this.message.content) : this.order
    }
  },
  methods: {
    openDetail(id) {
      console.log(this.getMessageContent)
      return this.$router.push({ name: 'TradeOrderDetail', params: { id }})
    },
    formatOrderColor(order) {
      if (order.status === 0) return 'info-color'
      if (
        order.status === 10 ||
        order.status === 20 ||
        (order.status === 30 && !order.commentStatus)
      ) return 'warning-color'
      if (order.status === 30 && order.commentStatus) return 'success-color'
      return 'danger-color'
    },
    formatOrderStatus(order) {
      if (order.status === 0) return '待付款'
      if (order.status === 10 && order.deliveryType === 1) return '待发货'
      if (order.status === 10 && order.deliveryType === 2) return '待核销'
      if (order.status === 20) return '待收货'
      if (order.status === 30 && !order.commentStatus) return '待评价'
      if (order.status === 30 && order.commentStatus) return '已完成'
      return '已关闭'
    },
    fenToYuan,
    isObject
  }
}
</script>

<style lang="scss" scoped>
.order-list-card-box {
  padding: 10px;
  margin-top: 14px;
  background-color: rgb(128 128 128 / 30%);
  border: 1px #dcdfe6 solid;
  border-radius: 10px;

  .order-card-header {
    display: flex;
    height: 28px;
    padding: 0 5px;
    font-weight: bold;
    align-items: center;
    justify-content: space-between;

    .order-no {
      font-size: 13px;

      span {
        cursor: pointer;

        &:hover {
          color: #409eff;
          text-decoration: underline;
        }
      }
    }

    .order-state {
      font-size: 13px;
    }
  }

  .border-bottom {
    border-bottom: 1px solid #e4e7ed;
  }

  .pay-box {
    display: flex;
    padding-top: 10px;
    padding-right: 5px;
    font-weight: bold;
    justify-content: flex-end;

    .pay-content {
      display: flex;
      align-items: center;
    }

    .discounts-title,
    .discounts-money {
      font-size: 13px;
      line-height: normal;
    }

    .discounts-money {
      font-family: OPPOSANS;
    }
  }
}

.warning-color {
  font-size: 11px;
  font-weight: bold;
  color: #faad14;
}

.danger-color {
  font-size: 11px;
  font-weight: bold;
  color: #ff3000;
}

.success-color {
  font-size: 11px;
  font-weight: bold;
  color: #52c41a;
}

.info-color {
  font-size: 11px;
  font-weight: bold;
  color: #999;
}
</style>
