<template>
  <div
    v-loading="loading"
    class="wms-home-summary"
  >
    <div
      v-for="item in summaryList"
      :key="item.orderType"
      class="wms-home-card"
      :style="{ borderTopColor: item.color }"
    >
      <div class="wms-home-card__header">
        <span class="wms-home-card__title">
          <i
            class="wms-home-dot"
            :style="{ backgroundColor: item.color }"
          />
          {{ item.title }}
        </span>
        <el-button
          type="text"
          size="mini"
          @click="handleNavigate(item.routeName)"
        >查看</el-button>
      </div>
      <div class="wms-home-card__total">
        <span>合计</span>
        <strong>{{ item.total === undefined ? '-' : item.total.toLocaleString() }}</strong>
        <span>单</span>
      </div>
      <div class="wms-home-status-bar">
        <span
          v-for="status in statusList"
          :key="status.value"
          :style="{ width: getStatusPercent(item, status.value), backgroundColor: status.color }"
        />
      </div>
      <div class="wms-home-status-list">
        <div
          v-for="status in statusList"
          :key="status.value"
        >
          <span>{{ status.label }}</span>
          <strong :style="{ color: status.color }">{{ item.statusCounts[status.value] || 0 }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WmsHomeStatisticsApi } from '@/api/wms/home'
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import { OrderStatusEnum, OrderTypeEnum } from '@/views/wms/utils/constants'

const fallbackLabel = (type, value, fallback) => getDictDataLabel(type, value) || fallback

export default {
  name: 'WmsHomeOrderSummaryCards',
  data() {
    const statusList = [
      { label: fallbackLabel(DICT_TYPE.WMS_ORDER_STATUS, OrderStatusEnum.PREPARE, '草稿'), value: OrderStatusEnum.PREPARE, color: '#409eff' },
      { label: fallbackLabel(DICT_TYPE.WMS_ORDER_STATUS, OrderStatusEnum.FINISHED, '已完成'), value: OrderStatusEnum.FINISHED, color: '#67c23a' },
      { label: fallbackLabel(DICT_TYPE.WMS_ORDER_STATUS, OrderStatusEnum.CANCELED, '已作废'), value: OrderStatusEnum.CANCELED, color: '#909399' }
    ]
    const orderDefinitions = [
      { orderType: OrderTypeEnum.RECEIPT, title: fallbackLabel(DICT_TYPE.WMS_ORDER_TYPE, OrderTypeEnum.RECEIPT, '入库').replace(/单$/, ''), color: '#2f7df6', routeName: 'WmsReceiptOrder' },
      { orderType: OrderTypeEnum.SHIPMENT, title: fallbackLabel(DICT_TYPE.WMS_ORDER_TYPE, OrderTypeEnum.SHIPMENT, '出库').replace(/单$/, ''), color: '#18a058', routeName: 'WmsShipmentOrder' },
      { orderType: OrderTypeEnum.MOVEMENT, title: fallbackLabel(DICT_TYPE.WMS_ORDER_TYPE, OrderTypeEnum.MOVEMENT, '移库').replace(/单$/, ''), color: '#f59e0b', routeName: 'WmsMovementOrder' },
      { orderType: OrderTypeEnum.CHECK, title: fallbackLabel(DICT_TYPE.WMS_ORDER_TYPE, OrderTypeEnum.CHECK, '盘库').replace(/单$/, ''), color: '#7c3aed', routeName: 'WmsCheckOrder' }
    ]
    return { loading: false, statusList, orderDefinitions, summaryList: orderDefinitions.map(item => Object.assign({}, item, { statusCounts: {}})) }
  },
  methods: {
    load(warehouseId) {
      this.loading = true
      return WmsHomeStatisticsApi.getOrderSummary(warehouseId ? { warehouseId } : {})
        .then(response => {
          const list = response.data
          this.summaryList = this.orderDefinitions.map(definition => {
            const summary = list.find(item => Number(item.type) === definition.orderType) || {}
            const statusCounts = (summary.statuses || []).reduce((result, item) => {
              result[item.status] = Number(item.count || 0)
              return result
            }, {})
            return Object.assign({}, definition, { total: summary.total === undefined ? undefined : Number(summary.total), statusCounts })
          })
        })
        .finally(() => { this.loading = false })
    },
    handleNavigate(routeName) {
      this.$router.push({ name: routeName }).catch(() => {
        this.$modal && this.$modal.msgWarning('当前菜单尚未加载，请从左侧菜单进入对应页面')
      })
    },
    getStatusPercent(item, status) {
      if (item.total === undefined || item.total === 0) return '0%'
      return ((Number(item.statusCounts[status] || 0) / item.total) * 100) + '%'
    }
  }
}
</script>

<style scoped>
.wms-home-summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.wms-home-card { min-height: 154px; padding: 16px 18px; border: 1px solid #ebeef5; border-top: 3px solid; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgba(15, 23, 42, .04); }
.wms-home-card__header, .wms-home-card__title { display: flex; align-items: center; justify-content: space-between; }
.wms-home-card__title { justify-content: flex-start; gap: 8px; font-size: 15px; font-weight: 600; color: #303133; }
.wms-home-dot { width: 8px; height: 8px; border-radius: 50%; }
.wms-home-card__total { display: flex; align-items: baseline; gap: 8px; margin-top: 18px; color: #909399; }
.wms-home-card__total strong { font-size: 32px; line-height: 38px; color: #303133; }
.wms-home-status-bar { display: flex; height: 8px; margin-top: 14px; overflow: hidden; border-radius: 4px; background: #f2f6fc; }
.wms-home-status-bar span { min-width: 0; }
.wms-home-status-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 14px; }
.wms-home-status-list span { display: block; overflow: hidden; color: #909399; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.wms-home-status-list strong { display: block; margin-top: 2px; font-size: 16px; }
@media (max-width: 1200px) { .wms-home-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .wms-home-summary { grid-template-columns: 1fr; } }
</style>
