<template>
  <div>
    <el-form ref="queryForm" :inline="true" :model="queryParams" size="small" label-width="68px" @submit.native.prevent>
      <el-form-item label="创建时间" prop="createTime"><el-date-picker v-model="queryParams.createTime" type="daterange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-tabs v-model="activeTab" type="card" @tab-click="tabClick">
      <el-tab-pane v-for="item in statusTabs" :key="item.value" :label="item.label" :name="item.value" />
    </el-tabs>
    <el-table v-loading="loading" :data="list" stripe :show-overflow-tooltip="true">
      <el-table-column label="优惠券" align="center" prop="name" min-width="160" />
      <el-table-column label="优惠券类型" align="center" prop="discountType" width="120"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.PROMOTION_DISCOUNT_TYPE" :value="scope.row.discountType" /></template></el-table-column>
      <el-table-column label="领取方式" align="center" prop="takeType" width="120"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.PROMOTION_COUPON_TAKE_TYPE" :value="scope.row.takeType" /></template></el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="110"><template slot-scope="scope"><dict-tag :type="DICT_TYPE.PROMOTION_COUPON_STATUS" :value="scope.row.status" /></template></el-table-column>
      <el-table-column label="领取时间" align="center" prop="createTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="使用时间" align="center" prop="useTime" width="180" :formatter="dateFormatter" />
      <el-table-column label="操作" align="center" fixed="right" width="80"><template slot-scope="scope"><el-button v-hasPermi="['promotion:coupon:delete']" type="text" size="mini" class="danger-text" @click="handleDelete(scope.row.id)">回收</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { deleteCoupon, getCouponPage } from '@/api/mall/promotion/coupon/coupon'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'

export default {
  name: 'UserCouponList',
  props: { userId: { type: [Number, String], required: true }},
  data() {
    return { DICT_TYPE, loading: true, total: 0, list: [], activeTab: 'all', statusTabs: [{ label: '全部', value: 'all' }], queryParams: { pageNo: 1, pageSize: 10, userIds: undefined, status: undefined, createTime: [] }}
  },
  mounted() {
    this.statusTabs = this.statusTabs.concat(getDictDatas(DICT_TYPE.PROMOTION_COUPON_STATUS).map(item => ({ label: item.label, value: String(item.value) })))
    this.getList()
  },
  methods: {
    dateFormatter,
    getList() {
      this.loading = true
      this.queryParams.userIds = this.userId
      return getCouponPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => { this.loading = false })
    },
    handleQuery() { this.queryParams.pageNo = 1; this.getList() },
    resetQuery() { this.$refs.queryForm.resetFields(); this.activeTab = 'all'; this.queryParams.status = undefined; this.queryParams.userIds = this.userId; this.handleQuery() },
    tabClick(tab) { this.activeTab = tab.name; this.queryParams.status = tab.name === 'all' ? undefined : tab.name; this.handleQuery() },
    handleDelete(id) {
      this.$modal.confirm('回收将会收回会员领取的待使用的优惠券，已使用的将无法回收，确定要回收所选优惠券吗？').then(() => deleteCoupon(id)).then(() => { this.$modal.msgSuccess('回收成功'); this.getList() }).catch(() => {})
    }
  }
}
</script>

<style scoped>.danger-text { color: #f56c6c; }</style>
