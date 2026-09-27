<template>
  <div class="coupon-select">
    <el-button
      type="text"
      icon="el-icon-plus"
      @click="selectCoupon"
    >添加优惠劵</el-button>

    <div
      v-for="(item, index) in couponList"
      :key="item.id"
      class="coupon-list-item"
    >
      <div class="coupon-info">
        <span>优惠券名称：{{ item.name }}</span>
        <span>
          范围：
          <dict-tag
            :type="DICT_TYPE.PROMOTION_PRODUCT_SCOPE"
            :value="item.productScope"
          />
        </span>
        <span>
          优惠：
          <dict-tag
            :type="DICT_TYPE.PROMOTION_DISCOUNT_TYPE"
            :value="item.discountType"
          />
          {{ discountFormat(item) }}
        </span>
      </div>
      <div class="coupon-count">
        <span>送</span>
        <el-input-number
          v-model="item.giveCount"
          :min="1"
          :precision="0"
          :step="1"
          controls-position="right"
          size="mini"
        />
        <span>张</span>
        <el-button
          type="text"
          class="danger-button"
          @click="deleteCoupon(index)"
        >删除</el-button>
      </div>
    </div>

    <!-- 优惠券选择 -->
    <el-dialog
      title="选择优惠劵"
      :visible.sync="dialogVisible"
      width="70%"
      append-to-body
    >
      <el-form
        ref="queryForm"
        :model="queryParams"
        :inline="true"
        size="small"
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
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="优惠类型"
          prop="discountType"
        >
          <el-select
            v-model="queryParams.discountType"
            clearable
            placeholder="请选择优惠券类型"
          >
            <el-option
              v-for="dict in discountTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="Number(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
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
        ref="couponTable"
        v-loading="loading"
        :data="availableList"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          label="优惠券名称"
          prop="name"
          min-width="140"
        />
        <el-table-column
          label="类型"
          prop="productScope"
          min-width="90"
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
          min-width="120"
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
          prop="takeType"
          min-width="100"
        >
          <template v-slot="scope">
            <dict-tag
              :type="DICT_TYPE.PROMOTION_COUPON_TAKE_TYPE"
              :value="scope.row.takeType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="使用时间"
          prop="validityType"
          align="center"
          width="185"
          :formatter="validityTypeFormat"
        />
        <el-table-column
          label="发放数量"
          prop="totalCount"
          align="center"
          width="90"
        />
        <el-table-column
          label="剩余数量"
          prop="totalCount"
          align="center"
          width="90"
          :formatter="remainedCountFormat"
        />
        <el-table-column
          label="领取上限"
          prop="takeLimitCount"
          align="center"
          width="110"
          :formatter="takeLimitCountFormat"
        />
        <el-table-column
          label="状态"
          prop="status"
          align="center"
          width="90"
        >
          <template v-slot="scope">
            <dict-tag
              :type="DICT_TYPE.COMMON_STATUS"
              :value="scope.row.status"
            />
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

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="confirmCouponSelection"
        >确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import { CouponTemplateTakeTypeEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import {
  discountFormat,
  remainedCountFormat,
  takeLimitCountFormat,
  validityTypeFormat
} from '@/views/mall/promotion/coupon/formatter'

export default {
  name: 'RewardRuleCouponSelect',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      total: 0,
      availableList: [],
      selectedAvailableCoupons: [],
      couponList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        discountType: undefined,
        canTakeTypes: [CouponTemplateTakeTypeEnum.ADMIN.type]
      },
      discountTypeOptions: getDictDatas(DICT_TYPE.PROMOTION_DISCOUNT_TYPE),
      DICT_TYPE
    }
  },
  computed: {
    rewardRule() {
      return this.value
    }
  },
  mounted() {
    this.initGiveCouponList()
  },
  methods: {
    /** 打开可用于指定发放的优惠券选择器。 */
    selectCoupon() {
      this.dialogVisible = true
      this.selectedAvailableCoupons = []
      return this.resetQuery()
    },
    getList() {
      this.loading = true
      this.queryParams.canTakeTypes = [CouponTemplateTakeTypeEnum.ADMIN.type]
      return CouponTemplateApi.getCouponTemplatePage(this.queryParams)
        .then((response) => {
          const data = response.data
          this.availableList = data.list
          this.total = data.total
          this.$nextTick(() => {
            if (this.$refs.couponTable) this.$refs.couponTable.clearSelection()
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    handleSelectionChange(rows) {
      this.selectedAvailableCoupons = Array.isArray(rows) ? rows.slice() : []
    },
    /** 合并选择结果，避免同一优惠券重复赠送。 */
    confirmCouponSelection() {
      this.selectedAvailableCoupons.forEach((coupon) => {
        if (this.couponList.some((item) => item.id === coupon.id)) return
        this.couponList.push(Object.assign({}, coupon, { giveCount: undefined }))
      })
      this.dialogVisible = false
    },
    deleteCoupon(index) {
      this.couponList.splice(index, 1)
    },
    /** 根据详情接口的 Map 查询优惠券并恢复每张赠送数量。 */
    initGiveCouponList() {
      const counts = this.rewardRule && this.rewardRule.giveCouponTemplateCounts
      const templateIds = Object.keys(counts || {}).map(Number).filter(Number.isFinite)
      this.couponList = []
      if (templateIds.length === 0) return Promise.resolve()
      return CouponTemplateApi.getCouponTemplateList(templateIds).then((response) => {
        const data = response.data
        this.couponList = data.map((coupon) => Object.assign({}, coupon, {
          giveCount: Number(counts[coupon.id])
        }))
      })
    },
    /** 写回后端要求的 { templateId: giveCount } 结构，并清除已删除项。 */
    setGiveCouponList() {
      const counts = this.couponList.reduce((result, coupon) => {
        result[coupon.id] = Math.round(Number(coupon.giveCount || 0))
        return result
      }, {})
      this.$set(this.rewardRule, 'giveCouponTemplateCounts', counts)
      this.$emit('input', this.rewardRule)
      return counts
    },
    validateCoupons() {
      return this.couponList.every((coupon) => {
        const count = Number(coupon.giveCount)
        return Number.isInteger(count) && count > 0
      })
    },
    discountFormat,
    remainedCountFormat,
    takeLimitCountFormat,
    validityTypeFormat
  }
}
</script>

<style scoped>
.coupon-select {
  width: 100%;
}

.coupon-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  gap: 16px;
}

.coupon-info {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 12px;
}

.coupon-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-count .el-input-number {
  width: 120px;
}

.danger-button {
  color: #f56c6c;
}

@media (max-width: 992px) {
  .coupon-list-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
