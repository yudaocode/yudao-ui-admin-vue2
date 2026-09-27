<template>
  <div class="app-container">
    <doc-alert
      title="【营销】优惠劵"
      url="https://doc.iocoder.cn/mall/promotion-coupon/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="会员昵称"
        prop="nickname"
      >
        <el-input
          v-model="queryParams.nickname"
          style="width: 240px"
          placeholder="请输入会员昵称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="领取时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="handleQuery"
        >
          <i class="el-icon-search" /> 搜索
        </el-button>
        <el-button @click="resetQuery"><i class="el-icon-refresh" /> 重置</el-button>
      </el-form-item>
    </el-form>

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-tabs
      v-model="activeTab"
      type="card"
      @tab-click="onTabChange"
    >
      <el-tab-pane
        v-for="tab in statusTabs"
        :key="tab.value"
        :label="tab.label"
        :name="tab.value"
      />
    </el-tabs>

    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="会员昵称"
        align="center"
        min-width="100"
        prop="nickname"
      />
      <el-table-column
        label="优惠券名称"
        align="center"
        min-width="140"
        prop="name"
      />
      <el-table-column
        label="类型"
        align="center"
        prop="productScope"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_PRODUCT_SCOPE"
            :value="scope.row.productScope"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="优惠"
        align="center"
        min-width="100"
        prop="discount"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_DISCOUNT_TYPE"
            :value="scope.row.discountType"
          />
          {{ discountFormat(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="领取方式"
        align="center"
        prop="takeType"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_COUPON_TAKE_TYPE"
            :value="scope.row.takeType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="status"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_COUPON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="领取时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope"><span>{{ parseTime(scope.row.createTime) }}</span></template>
      </el-table-column>
      <el-table-column
        label="使用时间"
        align="center"
        prop="useTime"
        width="180"
      >
        <template v-slot="scope"><span>{{ parseTime(scope.row.useTime) }}</span></template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:coupon:delete']"
            type="text"
            size="mini"
            @click="handleDelete(scope.row.id)"
          >回收</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { deleteCoupon, getCouponPage } from '@/api/mall/promotion/coupon/coupon'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import { discountFormat } from '@/views/mall/promotion/coupon/formatter'

export default {
  name: 'PromotionCoupon',
  data() {
    return {
      DICT_TYPE,
      parseTime,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        createTime: [],
        status: undefined,
        nickname: undefined
      },
      activeTab: 'all',
      statusTabs: [{ label: '全部', value: 'all' }]
    }
  },
  created() {
    this.getList()
    getDictDatas(DICT_TYPE.PROMOTION_COUPON_STATUS).forEach((dict) => {
      this.statusTabs.push({ label: dict.label, value: String(dict.value) })
    })
  },
  methods: {
    discountFormat,
    getList() {
      this.loading = true
      return getCouponPage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.list = data.list
          this.total = data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    handleDelete(id) {
      this.$modal.confirm('回收将会收回会员领取的待使用的优惠券，已使用的将无法回收，确定要回收所选优惠券吗？')
        .then(() => deleteCoupon(id))
        .then(() => {
          this.$modal.msgSuccess('回收成功')
          this.getList()
        })
        .catch(() => {})
    },
    onTabChange(tab) {
      this.queryParams.status = tab.name === 'all' ? undefined : tab.name
      this.getList()
    }
  }
}
</script>
