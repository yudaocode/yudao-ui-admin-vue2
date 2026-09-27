<template>
  <el-dialog
    title="推广订单列表"
    :visible.sync="dialogVisible"
    width="75%"
    append-to-body
  >
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="85px"
    >
      <el-form-item
        label="用户类型"
        prop="sourceUserLevel"
      >
        <el-radio-group
          v-model="queryParams.sourceUserLevel"
          @change="handleQuery"
        >
          <el-radio-button :label="0">全部</el-radio-button>
          <el-radio-button :label="1">一级推广人</el-radio-button>
          <el-radio-button :label="2">二级推广人</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          clearable
          placeholder="请选择状态"
        >
          <el-option
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="绑定时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
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
      </el-form-item>
    </el-form>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="订单编号"
        align="center"
        prop="bizId"
        min-width="80"
      />
      <el-table-column
        label="用户编号"
        align="center"
        prop="sourceUserId"
        min-width="80"
      />
      <el-table-column
        label="头像"
        align="center"
        prop="sourceUserAvatar"
        width="70"
      >
        <template v-slot="scope">
          <el-avatar :src="scope.row.sourceUserAvatar" />
        </template>
      </el-table-column>
      <el-table-column
        label="昵称"
        align="center"
        prop="sourceUserNickname"
        min-width="80"
      />
      <el-table-column
        label="佣金"
        align="center"
        prop="price"
        min-width="100"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        min-width="85"
      >
        <template v-slot="scope">
          <dict-tag
            :type="brokerageRecordStatusDictType"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </el-dialog>
</template>

<script>
import { getBrokerageRecordPage } from '@/api/mall/trade/brokerage/record'
import { dateFormatter } from '@/utils'
import { getDictDatas } from '@/utils/dict'

const BROKERAGE_RECORD_STATUS = 'brokerage_record_status'
const BROKERAGE_RECORD_BIZ_TYPE_ORDER = 1

export default {
  name: 'BrokerageOrderListDialog',
  data() {
    return {
      brokerageRecordStatusDictType: BROKERAGE_RECORD_STATUS,
      dialogVisible: false,
      loading: false,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        bizType: BROKERAGE_RECORD_BIZ_TYPE_ORDER,
        sourceUserLevel: 0,
        createTime: [],
        status: undefined
      }
    }
  },
  computed: {
    statusDictDatas() {
      return getDictDatas(BROKERAGE_RECORD_STATUS)
    }
  },
  methods: {
    dateFormatter,
    open(userId) {
      this.dialogVisible = true
      this.queryParams.userId = userId
      this.$nextTick(() => this.resetQuery())
    },
    getList() {
      this.loading = true
      const params = Object.assign({}, this.queryParams, {
        sourceUserLevel: this.queryParams.sourceUserLevel === 0
          ? undefined
          : this.queryParams.sourceUserLevel
      })
      return getBrokerageRecordPage(params)
        .then(response => {
          const page = response.data
          this.list = page.list
          this.total = page.total
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
    toNumber(value) {
      if (value === '' || value === null || value === undefined) return value
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    fenToYuanFormat(row, column, cellValue) {
      const price = Number(cellValue)
      return `￥${Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'}`
    }
  }
}
</script>
