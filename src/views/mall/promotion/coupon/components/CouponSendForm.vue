<template>
  <el-dialog
    :visible.sync="dialogVisible"
    append-to-body
    title="发送优惠券"
    width="70%"
  >
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      label-width="82px"
    >
      <el-form-item
        label="优惠券名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入优惠劵名"
          @keyup.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      show-overflow-tooltip
    >
      <el-table-column
        label="优惠券名称"
        prop="name"
        min-width="60"
      />
      <el-table-column
        :formatter="discountFormat"
        align="center"
        label="优惠金额 / 折扣"
        min-width="60"
        prop="discount"
      />
      <el-table-column
        :formatter="usePriceFormat"
        align="center"
        label="最低消费"
        min-width="60"
        prop="usePrice"
      />
      <el-table-column
        :formatter="validityTypeFormat"
        align="center"
        label="有效期限"
        min-width="140"
        prop="validityType"
      />
      <el-table-column
        :formatter="remainedCountFormat"
        align="center"
        label="剩余数量"
        min-width="60"
      />
      <el-table-column
        align="center"
        fixed="right"
        label="操作"
        min-width="60px"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['promotion:coupon:send']"
            :disabled="sendLoading"
            :loading="sendLoading"
            type="text"
            @click="handleSendCoupon(scope.row.id)"
          >
            发送
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
    <div class="clear-both" />
  </el-dialog>
</template>

<script>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import * as CouponApi from '@/api/mall/promotion/coupon/coupon'
import {
  discountFormat,
  remainedCountFormat,
  usePriceFormat,
  validityTypeFormat
} from '@/views/mall/promotion/coupon/formatter'
import { CouponTemplateTakeTypeEnum } from '@/utils/constants'

export default {
  name: 'PromotionCouponSendForm',
  data() {
    return {
      total: 0,
      list: [],
      loading: false,
      sendLoading: false,
      dialogVisible: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        canTakeTypes: [CouponTemplateTakeTypeEnum.ADMIN.type]
      },
      userIds: []
    }
  },
  methods: {
    discountFormat,
    remainedCountFormat,
    usePriceFormat,
    validityTypeFormat,
    open(ids) {
      this.userIds = ids
      this.resetQuery()
      this.dialogVisible = true
    },
    async getList() {
      this.loading = true
      try {
        const response = await CouponTemplateApi.getCouponTemplatePage(this.queryParams)
        this.list = response.data.list
        this.total = response.data.total
      } finally {
        this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    async handleSendCoupon(templateId) {
      this.sendLoading = true
      try {
        await CouponApi.sendCoupon({ templateId, userIds: this.userIds })
        this.$modal.msgSuccess('发送成功')
        this.dialogVisible = false
      } finally {
        this.sendLoading = false
      }
    }
  }
}
</script>
