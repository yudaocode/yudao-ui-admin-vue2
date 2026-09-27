<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="65%"
    append-to-body
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
          class="query-field"
          clearable
          placeholder="请输入优惠劵名"
          @keyup.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="优惠类型"
        prop="discountType"
      >
        <el-select
          v-model="queryParams.discountType"
          class="query-field"
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
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="优惠券名称"
        min-width="140"
        prop="name"
      />
      <el-table-column
        label="类型"
        min-width="80"
        prop="productScope"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_PRODUCT_SCOPE"
            :value="scope.row.productScope"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="优惠"
        min-width="100"
        prop="discount"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_DISCOUNT_TYPE"
            :value="scope.row.discountType"
          />
          {{ discountFormat(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="领取方式"
        min-width="100"
        prop="takeType"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_COUPON_TAKE_TYPE"
            :value="scope.row.takeType"
          />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="validityTypeFormat"
        align="center"
        label="使用时间"
        prop="validityType"
        width="185"
      />
      <el-table-column
        align="center"
        label="发放数量"
        prop="totalCount"
      />
      <el-table-column
        :formatter="remainedCountFormat"
        align="center"
        label="剩余数量"
        prop="totalCount"
      />
      <el-table-column
        :formatter="takeLimitCountFormat"
        align="center"
        label="领取上限"
        prop="takeLimitCount"
      />
      <el-table-column
        align="center"
        label="状态"
        prop="status"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :limit.sync="queryParams.pageSize"
      :page.sync="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
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
  name: 'CouponSelect',
  props: {
    multipleSelection: {
      type: Array,
      default: undefined
    },
    takeType: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '选择优惠劵',
      formLoading: false,
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        discountType: null,
        canTakeTypes: [CouponTemplateTakeTypeEnum.USER.type]
      },
      selectedCouponList: [],
      discountTypeOptions: getDictDatas(DICT_TYPE.PROMOTION_DISCOUNT_TYPE),
      DICT_TYPE
    }
  },
  methods: {
    discountFormat,
    remainedCountFormat,
    takeLimitCountFormat,
    validityTypeFormat,
    getList() {
      this.loading = true
      this.queryParams.canTakeTypes = [this.takeType]
      return CouponTemplateApi.getCouponTemplatePage(this.queryParams)
        .then(response => {
          this.list = response.data.list
          this.total = response.data.total
          return this.list
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
      if (this.$refs.queryForm) {
        this.$refs.queryForm.resetFields()
      }
      return this.handleQuery()
    },
    open() {
      this.dialogVisible = true
      return this.resetQuery()
    },
    handleSelectionChange(value) {
      if (this.multipleSelection) {
        this.$emit('update:multipleSelection', value)
        return
      }
      this.selectedCouponList = value
    },
    submitForm() {
      this.dialogVisible = false
      this.$emit('change', this.selectedCouponList)
    }
  }
}
</script>

<style scoped lang="scss">
.query-field {
  width: 240px;
}
</style>
