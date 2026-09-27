<template>
  <el-dialog
    title="选择活动"
    :visible.sync="dialogVisible"
    width="70%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
    >
      <el-form-item
        label="活动状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择活动状态"
        >
          <el-option
            v-for="dict in getStatusOptions()"
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
      v-loading="loading"
      :data="list"
    >
      <el-table-column
        v-if="multiple"
        width="55"
      >
        <template slot="header">
          <el-checkbox
            v-model="isCheckAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAll"
          />
        </template>
        <template v-slot="scope">
          <el-checkbox
            v-model="checkedStatus[scope.row.id]"
            @change="handleCheckOne($event, scope.row, true)"
          />
        </template>
      </el-table-column>
      <el-table-column
        v-else
        label="#"
        width="55"
      >
        <template v-slot="scope">
          <el-radio
            v-model="selectedActivityId"
            :label="scope.row.id"
            @change="handleSingleSelected(scope.row)"
          >
            &nbsp;
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="活动编号"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="商品图片"
        prop="spuName"
        min-width="80"
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="[scope.row.picUrl]"
            class="product-image"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="商品标题"
        prop="spuName"
        min-width="300"
        show-overflow-tooltip
      />
      <el-table-column
        label="原价"
        prop="marketPrice"
        min-width="100"
      >
        <template v-slot="scope">￥{{ fenToYuan(scope.row.marketPrice) }}</template>
      </el-table-column>
      <el-table-column
        label="活动状态"
        prop="status"
        align="center"
        min-width="100"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="库存"
        prop="stock"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="总库存"
        prop="totalStock"
        align="center"
        min-width="80"
      />
      <el-table-column
        label="已兑换数量"
        prop="redeemedQuantity"
        align="center"
        min-width="100"
      >
        <template v-slot="scope">{{ getRedeemedQuantity(scope.row) }}</template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        align="center"
        width="180"
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
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
      v-if="multiple"
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="handleEmitChange"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { PointActivityApi } from '@/api/mall/promotion/point'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'

export default {
  name: 'PointTableSelect',
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      total: 0,
      list: [],
      loading: false,
      dialogVisible: false,
      queryParams: this.getDefaultQueryParams(),
      isCheckAll: false,
      isIndeterminate: false,
      checkedActivities: [],
      checkedStatus: {},
      selectedActivityId: undefined,
      requestSequence: 0,
      DICT_TYPE
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    getDefaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        name: null,
        status: undefined
      }
    },
    open(pointList) {
      this.checkedActivities = Array.isArray(pointList) ? pointList.slice() : []
      this.checkedStatus = {}
      this.checkedActivities.forEach((activity) => {
        this.$set(this.checkedStatus, activity.id, true)
      })
      this.selectedActivityId = this.checkedActivities.length === 1
        ? this.checkedActivities[0].id
        : undefined
      this.isCheckAll = false
      this.isIndeterminate = false
      this.dialogVisible = true
      return this.resetQuery()
    },
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await PointActivityApi.getPointActivityPage(this.queryParams)
        if (requestId !== this.requestSequence) return false
        const data = response.data
        this.list = data.list
        this.total = data.total
        this.list.forEach((activity) => {
          if (!Object.prototype.hasOwnProperty.call(this.checkedStatus, activity.id)) {
            this.$set(this.checkedStatus, activity.id, false)
          }
        })
        this.calculateIsCheckAll()
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.queryParams = this.getDefaultQueryParams()
      return this.getList()
    },
    getStatusOptions() {
      return getDictDatas(DICT_TYPE.COMMON_STATUS)
    },
    handleSingleSelected(activity) {
      this.$emit('change', activity)
      this.dialogVisible = false
      this.selectedActivityId = activity.id
    },
    handleEmitChange() {
      this.dialogVisible = false
      this.$emit('change', this.checkedActivities.slice())
    },
    handleCheckAll(checked) {
      this.isCheckAll = checked
      this.isIndeterminate = false
      this.list.forEach((activity) => this.handleCheckOne(checked, activity, false))
    },
    handleCheckOne(checked, activity, isCalcCheckAll) {
      const index = this.findCheckedIndex(activity)
      if (checked && index === -1) {
        this.checkedActivities.push(activity)
      } else if (!checked && index > -1) {
        this.checkedActivities.splice(index, 1)
      }
      this.$set(this.checkedStatus, activity.id, checked)
      if (isCalcCheckAll) this.calculateIsCheckAll()
    },
    findCheckedIndex(activity) {
      return this.checkedActivities.findIndex((item) => item.id === activity.id)
    },
    calculateIsCheckAll() {
      this.isCheckAll = this.list.length > 0 &&
        this.list.every((activity) => this.checkedStatus[activity.id])
      this.isIndeterminate = !this.isCheckAll &&
        this.list.some((activity) => this.checkedStatus[activity.id])
    },
    getRedeemedQuantity(row) {
      return Number(row.totalStock || 0) - Number(row.stock || 0)
    },
    fenToYuan(value) {
      const price = Number(value)
      return Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'
    },
    parseTime
  }
}
</script>

<style lang="scss" scoped>
.product-image {
  width: 40px;
  height: 40px;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .product-image {
    width: 32px;
    height: 32px;
  }
}
</style>
