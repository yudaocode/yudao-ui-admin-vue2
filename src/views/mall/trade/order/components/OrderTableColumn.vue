<template>
  <el-table-column class-name="order-table-col">
    <template slot="header">
      <div class="order-table-head">
        <div
          v-for="(title, index) in orderTableHeadList"
          :key="title"
          :style="{ width: orderTableHeadWidthList[index] + 'px' }"
          class="order-table-head-item"
        >
          {{ title }}
        </div>
      </div>
    </template>
    <template v-slot="scope">
      <el-table
        ref="orderTables"
        :border="true"
        :data="scope.row.items"
        :header-cell-style="headerStyle"
        :span-method="spanMethod"
        class="nested-order-table"
      >
        <el-table-column
          min-width="300"
          prop="spuName"
        >
          <template slot="header">
            <div class="order-summary">
              <span class="summary-item">订单号：{{ scope.row.no }} </span>
              <span class="summary-item">下单时间：{{ formatDate(scope.row.createTime) }}</span>
              <span>订单来源：</span>
              <dict-tag
                :type="DICT_TYPE.TERMINAL"
                :value="scope.row.terminal"
                class="summary-item"
              />
              <span>支付方式：</span>
              <dict-tag
                v-if="scope.row.payChannelCode"
                :type="DICT_TYPE.PAY_CHANNEL_CODE"
                :value="scope.row.payChannelCode"
                class="summary-item"
              />
              <span
                v-else
                class="summary-item"
              >未支付</span>
              <span
                v-if="scope.row.payTime"
                class="summary-item"
              >
                支付时间：{{ formatDate(scope.row.payTime) }}
              </span>
              <span>订单类型：</span>
              <dict-tag
                :type="DICT_TYPE.TRADE_ORDER_TYPE"
                :value="scope.row.type"
              />
            </div>
          </template>
          <template v-slot="{ row }">
            <div class="product-info">
              <div class="product-main">
                <el-image
                  :preview-src-list="row.picUrl ? [row.picUrl] : []"
                  :src="row.picUrl"
                  class="product-image"
                  fit="contain"
                >
                  <div
                    slot="error"
                    class="image-slot"
                  >
                    <i class="el-icon-picture-outline" />
                  </div>
                </el-image>
                <el-tooltip
                  :content="row.spuName"
                  placement="top"
                >
                  <span class="product-name">{{ row.spuName }}</span>
                </el-tooltip>
              </div>
              <el-tag
                v-for="property in row.properties"
                :key="property.propertyId"
                class="property-tag"
              >
                {{ property.propertyName }}: {{ property.valueName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="商品原价*数量"
          prop="price"
          width="150"
        >
          <template v-slot="{ row }">
            {{ floatToFixed2(row.price) }} 元 / {{ row.count }}
          </template>
        </el-table-column>
        <el-table-column
          label="售后状态"
          prop="afterSaleStatus"
          width="120"
        >
          <template v-slot="{ row }">
            <dict-tag
              :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS"
              :value="row.afterSaleStatus"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="实际支付"
          min-width="120"
          prop="payPrice"
        >
          <template>
            {{ floatToFixed2(scope.row.payPrice) + '元' }}
          </template>
        </el-table-column>
        <el-table-column
          label="买家/收货人"
          min-width="160"
        >
          <template>
            <div
              v-if="scope.row.deliveryType === DeliveryTypeEnum.EXPRESS.type"
              class="delivery-info"
            >
              <span>买家：{{ scope.row.user && scope.row.user.nickname }}</span>
              <span>
                收货人：{{ scope.row.receiverName }} {{ scope.row.receiverMobile }}
                {{ scope.row.receiverAreaName }} {{ scope.row.receiverDetailAddress }}
              </span>
            </div>
            <div
              v-if="scope.row.deliveryType === DeliveryTypeEnum.PICK_UP.type"
              class="delivery-info"
            >
              <span>门店名称：{{ getPickUpStoreValue(scope.row.pickUpStoreId, 'name') }}</span>
              <span>门店手机：{{ getPickUpStoreValue(scope.row.pickUpStoreId, 'phone') }}</span>
              <span>
                自提门店: {{ getPickUpStoreValue(scope.row.pickUpStoreId, 'detailAddress') }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="配送方式"
          width="120"
        >
          <template>
            <dict-tag
              :type="DICT_TYPE.TRADE_DELIVERY_TYPE"
              :value="scope.row.deliveryType"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="订单状态"
          width="120"
        >
          <template>
            <dict-tag
              :type="DICT_TYPE.TRADE_ORDER_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          width="160"
        >
          <template>
            <slot :row="scope.row" />
          </template>
        </el-table-column>
      </el-table>
    </template>
  </el-table-column>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'
import { DeliveryTypeEnum } from '@/utils/constants'
import { formatDate } from '@/utils/formatTime'
import { floatToFixed2 } from '@/utils'

export default {
  name: 'OrderTableColumn',
  props: {
    list: { type: Array, required: true },
    pickUpStoreList: { type: Array, required: true }
  },
  data() {
    return {
      DICT_TYPE,
      DeliveryTypeEnum,
      orderTableHeadList: [
        '商品信息',
        '单价(元)/数量',
        '售后状态',
        '实付金额(元)',
        '买家/收货人',
        '配送方式',
        '订单状态',
        '操作'
      ],
      orderTableHeadWidthList: [300, 150, 120, 120, 160, 120, 120, 160],
      firstTableInstance: null
    }
  },
  watch: {
    list: {
      deep: true,
      async handler() {
        await this.$nextTick()
        this.captureFirstTable()
        if (!this.firstTableInstance) return
        await new Promise(resolve => setTimeout(resolve, 100))
        this.tableHeadWidthAuto(this.firstTableInstance)
      }
    }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.$nextTick(this.captureFirstTable)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    headerStyle({ row, columnIndex }) {
      if (columnIndex === 0) {
        row[columnIndex].colSpan = 8
      } else {
        row[columnIndex].colSpan = 0
        return { display: 'none' }
      }
      return {}
    },
    spanMethod({ row, rowIndex, columnIndex }) {
      const order = this.list.find(item => (
        item.items && item.items.findIndex(orderItem => orderItem.id === row.id) !== -1
      ))
      const length = order && order.items && order.items.length
      if ([3, 4, 5, 6, 7].includes(columnIndex)) {
        if (rowIndex !== 0) return { rowspan: 0, colspan: 0 }
        return { rowspan: length, colspan: 1 }
      }
    },
    captureFirstTable() {
      if (this.firstTableInstance) return
      const refs = this.$refs.orderTables
      this.firstTableInstance = Array.isArray(refs) ? refs[0] : refs
      if (this.firstTableInstance) this.tableHeadWidthAuto(this.firstTableInstance)
    },
    tableHeadWidthAuto(table) {
      if (!table) return
      const columns = table.store.states.columns
      if (!columns || columns.length === 0) return
      columns.forEach((column, index) => {
        if (column.realWidth) this.$set(this.orderTableHeadWidthList, index, column.realWidth)
      })
    },
    async handleResize() {
      if (!this.firstTableInstance) return
      await this.$nextTick()
      this.tableHeadWidthAuto(this.firstTableInstance)
    },
    getPickUpStoreValue(storeId, field) {
      const store = this.pickUpStoreList.find(item => item.id === storeId)
      return store && store[field]
    },
    formatDate,
    floatToFixed2
  }
}
</script>

<style lang="scss" scoped>
::v-deep .order-table-col > .cell {
  padding: 0;
}

.order-table-head {
  display: flex;
  width: 100%;
  align-items: center;
}

.order-table-head-item {
  display: flex;
  flex: none;
  justify-content: center;
}

.nested-order-table {
  width: 100%;
}

.order-summary {
  display: flex;
  height: 35px;
  padding: 0 20px;
  margin: 0 -10px;
  background-color: #fff;
  align-items: center;
  white-space: nowrap;
}

.summary-item {
  margin-right: 20px;
}

.product-info {
  display: flex;
  flex-wrap: wrap;
}

.product-main {
  display: flex;
  margin-right: 10px;
  margin-bottom: 10px;
  align-items: flex-start;
}

.product-image {
  width: 45px;
  height: 45px;
  margin-right: 10px;
  flex: none;
}

.image-slot {
  display: flex;
  width: 100%;
  height: 100%;
  color: #909399;
  background-color: #f5f7fa;
  align-items: center;
  justify-content: center;
}

.product-name {
  display: -webkit-box;
  max-height: 45px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.property-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.delivery-info {
  display: flex;
  flex-direction: column;
}
</style>
