<template>
  <div class="app-container">
    <doc-alert
      title="【交易】分销返佣"
      url="https://doc.iocoder.cn/mall/trade-brokerage/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      size="small"
      label-width="68px"
    >
      <el-form-item
        label="用户编号"
        prop="userId"
      >
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="业务类型"
        prop="bizType"
      >
        <el-select
          v-model="queryParams.bizType"
          placeholder="请选择业务类型"
          clearable
        >
          <el-option
            v-for="dict in bizTypeDictDatas"
            :key="dict.value"
            :label="dict.label"
            :value="toNumber(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
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
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      :show-overflow-tooltip="true"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        min-width="60"
      />
      <el-table-column
        label="用户编号"
        align="center"
        prop="userId"
        min-width="80"
      />
      <el-table-column
        label="头像"
        align="center"
        prop="userAvatar"
        width="70"
      >
        <template v-slot="scope">
          <el-avatar :src="scope.row.userAvatar" />
        </template>
      </el-table-column>
      <el-table-column
        label="昵称"
        align="center"
        prop="userNickname"
        min-width="80"
      />
      <el-table-column
        label="业务类型"
        align="center"
        prop="bizType"
        min-width="85"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.BROKERAGE_RECORD_BIZ_TYPE"
            :value="scope.row.bizType"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="业务编号"
        align="center"
        prop="bizId"
        min-width="80"
      />
      <el-table-column
        label="标题"
        align="center"
        prop="title"
        min-width="110"
      />
      <el-table-column
        label="金额"
        align="center"
        prop="price"
        min-width="60"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="说明"
        align="center"
        prop="description"
        min-width="120"
      />
      <el-table-column
        label="状态"
        align="center"
        prop="status"
        min-width="85"
      >
        <template v-slot="scope">
          <dict-tag
            :type="DICT_TYPE.BROKERAGE_RECORD_STATUS"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="解冻时间"
        align="center"
        prop="unfreezeTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
    </el-table>

    <!-- 分页 -->
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
import * as BrokerageRecordApi from '@/api/mall/trade/brokerage/record'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { dateFormatter } from '@/utils'

const BROKERAGE_RECORD_BIZ_TYPE = 'brokerage_record_biz_type'
const BROKERAGE_RECORD_STATUS = 'brokerage_record_status'

export default {
  name: 'TradeBrokerageRecord',
  data() {
    return {
      DICT_TYPE: Object.assign({}, DICT_TYPE, {
        BROKERAGE_RECORD_BIZ_TYPE,
        BROKERAGE_RECORD_STATUS
      }),
      bizTypeDictDatas: getDictDatas(BROKERAGE_RECORD_BIZ_TYPE),
      statusDictDatas: getDictDatas(BROKERAGE_RECORD_STATUS),
      loading: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: null,
        bizType: null,
        price: null,
        status: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    /** 查询列表 */
    getList() {
      this.loading = true
      return BrokerageRecordApi.getBrokerageRecordPage(this.queryParams)
        .then((response) => {
          const page = response.data
          this.list = page.list
          this.total = page.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    /** 将字典值转换为数值，和 Vue3 getIntDictOptions 保持一致。 */
    toNumber(value) {
      if (value === '' || value === null || value === undefined) return value
      const number = Number(value)
      return Number.isNaN(number) ? value : number
    },
    /** 金额格式化：后端以分存储，列表以人民币元展示。 */
    fenToYuanFormat(row, column, cellValue) {
      const price = Number(cellValue)
      return `￥${Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'}`
    }
  }
}
</script>
