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
      label-width="82px"
    >
      <el-form-item
        label="优惠券名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          placeholder="请输入优惠劵名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="优惠类型"
        prop="discountType"
      >
        <el-select
          v-model="queryParams.discountType"
          placeholder="请选择优惠券类型"
          clearable
        >
          <el-option
            v-for="dict in discountTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="优惠券状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择优惠券状态"
          clearable
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="parseInt(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
        />
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
        <el-button
          v-hasPermi="['promotion:coupon-template:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          @click="openForm('create')"
        >新增</el-button>
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

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        label="优惠券名称"
        align="center"
        min-width="140"
        prop="name"
      />
      <el-table-column
        label="类型"
        align="center"
        min-width="130"
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
        min-width="110"
        prop="discount"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.PROMOTION_DISCOUNT_TYPE"
            :value="scope.row.discountType"
          />
          <div>{{ discountFormat(scope.row) }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="领取方式"
        align="center"
        min-width="100"
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
        label="使用时间"
        align="center"
        prop="validityType"
        width="185"
        :formatter="validityTypeFormat"
      />
      <el-table-column
        label="发放数量"
        align="center"
        prop="totalCount"
        :formatter="totalCountFormat"
      />
      <el-table-column
        label="剩余数量"
        align="center"
        prop="totalCount"
        :formatter="remainedCountFormat"
      />
      <el-table-column
        label="领取上限"
        align="center"
        prop="takeLimitCount"
        :formatter="takeLimitCountFormat"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
      >
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="CommonStatusEnum.ENABLE"
            :inactive-value="CommonStatusEnum.DISABLE"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
        width="120"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['promotion:coupon-template:update']"
            size="mini"
            type="text"
            @click="openForm('update', scope.row.id)"
          >修改</el-button>
          <el-button
            v-hasPermi="['promotion:coupon-template:delete']"
            size="mini"
            type="text"
            @click="handleDelete(scope.row.id)"
          >删除</el-button>
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

    <coupon-template-form
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import * as CouponTemplateApi from '@/api/mall/promotion/coupon/couponTemplate'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import CouponTemplateForm from './CouponTemplateForm.vue'
import {
  discountFormat,
  remainedCountFormat,
  takeLimitCountFormat,
  totalCountFormat,
  validityTypeFormat
} from '@/views/mall/promotion/coupon/formatter'

export default {
  name: 'PromotionCouponTemplate',
  components: { CouponTemplateForm },
  data() {
    return {
      DICT_TYPE,
      CommonStatusEnum,
      parseTime,
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      discountTypeDictDatas: getDictDatas(DICT_TYPE.PROMOTION_DISCOUNT_TYPE),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        status: null,
        discountType: null,
        type: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    discountFormat,
    remainedCountFormat,
    takeLimitCountFormat,
    totalCountFormat,
    validityTypeFormat,
    getList() {
      this.loading = true
      return CouponTemplateApi.getCouponTemplatePage(this.queryParams)
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
    openForm(type, id) {
      if (this.$refs.formRef) this.$refs.formRef.open(type, id)
    },
    handleStatusChange(row) {
      const status = row.status
      const text = status === CommonStatusEnum.ENABLE ? '启用' : '停用'
      this.$modal.confirm('确认要"' + text + '""' + row.name + '"优惠劵吗?')
        .then(() => CouponTemplateApi.updateCouponTemplateStatus(row.id, status))
        .then(() => {
          this.$modal.msgSuccess(text + '成功')
        })
        .catch(() => {
          row.status = status === CommonStatusEnum.ENABLE
            ? CommonStatusEnum.DISABLE
            : CommonStatusEnum.ENABLE
        })
    },
    handleDelete(id) {
      this.$modal.confirm('是否确认删除优惠劵编号为"' + id + '"的数据项?')
        .then(() => CouponTemplateApi.deleteCouponTemplate(id))
        .then(() => {
          this.$modal.msgSuccess('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>
