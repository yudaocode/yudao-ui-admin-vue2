<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="选择活动"
    width="70%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :inline="true"
      :model="queryParams"
      label-width="68px"
    >
      <el-form-item
        label="活动名称"
        prop="name"
      >
        <el-input
          v-model="queryParams.name"
          clearable
          placeholder="请输入活动名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
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
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="dict.label"
            :value="parseInt(dict.value)"
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
          >&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="活动编号"
        prop="id"
        min-width="80"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动名称"
        prop="name"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动时间"
        min-width="210"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          {{ formatDate(scope.row.startTime) }} ~ {{ formatDate(scope.row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="商品图片"
        prop="spuName"
        min-width="80"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <el-image
            :src="scope.row.picUrl"
            :preview-src-list="scope.row.picUrl ? [scope.row.picUrl] : []"
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
        :formatter="fenToYuanFormat"
        show-overflow-tooltip
      />
      <el-table-column
        label="拼团价"
        prop="seckillPrice"
        min-width="100"
        show-overflow-tooltip
      >
        <template v-slot="scope">{{ formatSeckillPrice(scope.row.products) }}</template>
      </el-table-column>
      <el-table-column
        label="开团组数"
        prop="groupCount"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="成团组数"
        prop="groupSuccessCount"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="购买次数"
        prop="recordCount"
        min-width="100"
        show-overflow-tooltip
      />
      <el-table-column
        label="活动状态"
        align="center"
        prop="status"
        min-width="100"
        show-overflow-tooltip
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.COMMON_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
        show-overflow-tooltip
      >
        <template v-slot="scope">{{ parseTime(scope.row.createTime) }}</template>
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
import * as ProductCategoryApi from '@/api/mall/product/category'
import * as SeckillActivityApi from '@/api/mall/promotion/seckill/seckillActivity'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { handleTree, parseTime } from '@/utils/ruoyi'

export default {
  name: 'SeckillTableSelect',
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      DICT_TYPE,
      total: 0,
      list: [],
      loading: false,
      dialogVisible: false,
      queryParams: this.defaultQueryParams(),
      isCheckAll: false,
      isIndeterminate: false,
      checkedActivitys: [],
      checkedStatus: {},
      selectedActivityId: undefined,
      categoryList: undefined,
      categoryTreeList: undefined,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    }
  },
  mounted() {
    this.getList().then(() => ProductCategoryApi.getCategoryList({})).then(response => {
      this.categoryList = response.data
      this.categoryTreeList = handleTree(this.categoryList, 'id', 'parentId')
    })
  },
  methods: {
    defaultQueryParams() {
      return {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
      }
    },
    open(seckillList) {
      this.checkedActivitys = []
      this.checkedStatus = {}
      this.isCheckAll = false
      this.isIndeterminate = false
      if (seckillList && seckillList.length > 0) {
        this.checkedActivitys = seckillList.slice()
        this.checkedStatus = seckillList.reduce((result, activity) => {
          result[activity.id] = true
          return result
        }, {})
      }
      this.dialogVisible = true
      return this.resetQuery()
    },
    getList() {
      this.loading = true
      return SeckillActivityApi.getSeckillActivityPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list
        this.total = data.total
        this.list.forEach(activity => {
          this.$set(this.checkedStatus, activity.id, this.checkedStatus[activity.id] || false)
        })
        this.calculateIsCheckAll()
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      this.queryParams = this.defaultQueryParams()
      return this.getList()
    },
    formatSeckillPrice(products) {
      const seckillPrice = Math.min(...products.map(item => item.seckillPrice))
      return '￥' + this.fenToYuan(seckillPrice)
    },
    handleSingleSelected(activity) {
      this.$emit('change', activity)
      this.dialogVisible = false
      this.selectedActivityId = activity.id
    },
    handleEmitChange() {
      this.dialogVisible = false
      this.$emit('change', this.checkedActivitys.slice())
    },
    handleCheckAll(checked) {
      this.isCheckAll = checked
      this.isIndeterminate = false
      this.list.forEach(activity => this.handleCheckOne(checked, activity, false))
    },
    handleCheckOne(checked, activity, shouldCalculate) {
      if (checked) {
        this.checkedActivitys.push(activity)
        this.$set(this.checkedStatus, activity.id, true)
      } else {
        const index = this.findCheckedIndex(activity)
        if (index > -1) {
          this.checkedActivitys.splice(index, 1)
          this.$set(this.checkedStatus, activity.id, false)
          this.isCheckAll = false
        }
      }
      if (shouldCalculate) this.calculateIsCheckAll()
    },
    findCheckedIndex(activity) {
      return this.checkedActivitys.findIndex(item => item.id === activity.id)
    },
    calculateIsCheckAll() {
      this.isCheckAll = this.list.every(activity => this.checkedStatus[activity.id])
      this.isIndeterminate = !this.isCheckAll && this.list.some(activity => this.checkedStatus[activity.id])
    },
    fenToYuan(value) {
      return (Number(value) / 100).toFixed(2)
    },
    fenToYuanFormat(row, column, cellValue) {
      return this.fenToYuan(cellValue)
    },
    formatDate(value) {
      return parseTime(value, '{y}-{m}-{d}')
    },
    parseTime
  }
}
</script>

<style scoped>
.product-image { width: 40px; height: 40px; }
</style>
