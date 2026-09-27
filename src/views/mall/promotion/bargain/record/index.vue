<template>
  <div class="app-container bargain-record">
    <doc-alert
      title="【营销】砍价活动"
      url="https://doc.iocoder.cn/mall/promotion-bargain/"
    />

    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      size="small"
      class="bargain-record__filter"
    >
      <el-form-item
        label="砍价状态"
        prop="status"
      >
        <el-select
          v-model="queryParams.status"
          placeholder="请选择砍价状态"
          clearable
          class="bargain-record__query-control"
        >
          <el-option
            v-for="dict in getStatusOptions()"
            :key="dict.value"
            :label="dict.label"
            :value="Number(dict.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="创建时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          class="bargain-record__query-control"
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

    <el-row
      :gutter="10"
      class="mb8"
    >
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="编号"
        align="center"
        prop="id"
        min-width="70"
      />
      <el-table-column
        label="发起用户"
        prop="nickname"
        min-width="150"
      >
        <template slot-scope="scope">
          <div class="bargain-record__user">
            <el-image
              v-if="scope.row.avatar"
              :src="scope.row.avatar"
              :preview-src-list="[scope.row.avatar]"
              fit="cover"
              class="bargain-record__avatar"
            />
            <span>{{ scope.row.nickname || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="发起时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="砍价活动"
        prop="activity.name"
        min-width="180"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.activity && scope.row.activity.name ? scope.row.activity.name : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="最低价"
        prop="activity.bargainMinPrice"
        min-width="100"
      >
        <template slot-scope="scope">
          {{ fenToYuanFormat(null, null, getActivityValue(scope.row, 'bargainMinPrice')) }}
        </template>
      </el-table-column>
      <el-table-column
        label="当前价"
        prop="bargainPrice"
        min-width="100"
        :formatter="fenToYuanFormat"
      />
      <el-table-column
        label="总砍价次数"
        prop="activity.helpMaxCount"
        min-width="110"
      >
        <template slot-scope="scope">
          {{ getActivityValue(scope.row, 'helpMaxCount') }}
        </template>
      </el-table-column>
      <el-table-column
        label="剩余砍价次数"
        prop="helpCount"
        min-width="120"
      />
      <el-table-column
        label="砍价状态"
        align="center"
        prop="status"
        min-width="100"
      >
        <template slot-scope="scope">
          <dict-tag
            :type="recordStatusDictType"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="结束时间"
        align="center"
        prop="endTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column
        label="订单编号"
        align="center"
        prop="orderId"
        min-width="100"
      >
        <template slot-scope="scope">{{ scope.row.orderId || '-' }}</template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="90"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['promotion:bargain-help:query']"
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="openRecordListDialog(scope.row.id)"
          >助力</el-button>
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

    <BargainRecordListDialog ref="recordListDialog" />
  </div>
</template>

<script>
import * as BargainRecordApi from '@/api/mall/promotion/bargain/bargainRecord'
import { dateFormatter } from '@/utils'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import BargainRecordListDialog from './BargainRecordListDialog.vue'

const BARGAIN_RECORD_STATUS_DICT_TYPE = DICT_TYPE.PROMOTION_BARGAIN_RECORD_STATUS ||
  'promotion_bargain_record_status'

export default {
  name: 'PromotionBargainRecord',
  components: { BargainRecordListDialog },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      requestSequence: 0,
      recordStatusDictType: BARGAIN_RECORD_STATUS_DICT_TYPE,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        status: null,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    dateFormatter,
    async getList() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await BargainRecordApi.getBargainRecordPage({ ...this.queryParams })
        if (requestId !== this.requestSequence) return false
        const page = response.data
        this.list = page.list
        this.total = page.total
        return true
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    getStatusOptions() {
      return getDictDatas(BARGAIN_RECORD_STATUS_DICT_TYPE)
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      return this.handleQuery()
    },
    openRecordListDialog(id) {
      return this.$refs.recordListDialog.open(id)
    },
    getActivityValue(row, field) {
      const activity = row && row.activity ? row.activity : {}
      const value = activity[field]
      return value === undefined || value === null || value === '' ? '-' : value
    },
    fenToYuanFormat(row, column, cellValue) {
      if (cellValue === '-' || cellValue === undefined || cellValue === null || cellValue === '') {
        return '-'
      }
      const price = Number(cellValue)
      return `￥${Number.isFinite(price) ? (price / 100).toFixed(2) : '0.00'}`
    }
  }
}
</script>

<style lang="scss" scoped>
.bargain-record__query-control {
  width: 240px;
}

.bargain-record__user {
  display: flex;
  align-items: center;
  min-width: 0;
}

.bargain-record__avatar {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .bargain-record__filter {
    ::v-deep .el-form-item {
      display: block;
      margin-right: 0;
    }
  }

  .bargain-record__query-control {
    width: 100%;
  }
}
</style>
