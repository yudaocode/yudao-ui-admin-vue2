<!-- 数据统计 - 排行榜 -->
<template>
  <div class="app-container crm-statistics-rank">
    <el-card
      shadow="never"
      class="query-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="queryParams"
        label-width="76px"
      >
        <el-form-item
          label="时间范围"
          prop="times"
        >
          <el-date-picker
            v-model="queryParams.times"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            :clearable="false"
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="datePickerOptions"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="query-control date-control"
          />
        </el-form-item>
        <el-form-item
          label="归属部门"
          prop="deptId"
        >
          <treeselect
            v-model="queryParams.deptId"
            :options="deptList"
            :normalizer="normalizer"
            :clearable="false"
            :show-count="true"
            placeholder="请选择归属部门"
            class="query-control"
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
    </el-card>

    <el-tabs
      v-model="activeTab"
      class="analysis-tabs"
    >
      <el-tab-pane
        label="合同金额排行"
        name="contractPriceRank"
        lazy
      >
        <contract-price-rank
          ref="contractPriceRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="回款金额排行"
        name="receivablePriceRank"
        lazy
      >
        <receivable-price-rank
          ref="receivablePriceRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="签约合同排行"
        name="contractCountRank"
        lazy
      >
        <contract-count-rank
          ref="contractCountRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="产品销量排行"
        name="productSalesRank"
        lazy
      >
        <product-sales-rank
          ref="productSalesRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="新增客户数排行"
        name="customerCountRank"
        lazy
      >
        <customer-count-rank
          ref="customerCountRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="新增联系人数排行"
        name="contactCountRank"
        lazy
      >
        <contact-count-rank
          ref="contactCountRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="跟进次数排行"
        name="followCountRank"
        lazy
      >
        <follow-count-rank
          ref="followCountRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="跟进客户数排行"
        name="followCustomerCountRank"
        lazy
      >
        <follow-customer-count-rank
          ref="followCustomerCountRankRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getSimpleDeptList } from '@/api/system/dept'
import { formatDate } from '@/utils'
import { beginOfDay, endOfDay } from '@/utils/dateUtils'
import { handleTree } from '@/utils/ruoyi'
import ContactCountRank from './components/ContactCountRank.vue'
import ContractCountRank from './components/ContractCountRank.vue'
import ContractPriceRank from './components/ContractPriceRank.vue'
import CustomerCountRank from './components/CustomerCountRank.vue'
import FollowCountRank from './components/FollowCountRank.vue'
import FollowCustomerCountRank from './components/FollowCustomerCountRank.vue'
import ProductSalesRank from './components/ProductSalesRank.vue'
import ReceivablePriceRank from './components/ReceivablePriceRank.vue'

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

function getDefaultTimes() {
  const now = Date.now()
  return [
    formatDate(beginOfDay(new Date(now - DAY_MILLISECONDS * 7))),
    formatDate(endOfDay(new Date(now - DAY_MILLISECONDS)))
  ]
}

function createQueryParams(deptId) {
  return {
    deptId,
    times: getDefaultTimes()
  }
}

function createShortcut(text, rangeFactory) {
  return {
    text,
    onClick(picker) {
      picker.$emit('pick', rangeFactory())
    }
  }
}

function createDatePickerOptions() {
  return {
    shortcuts: [
      createShortcut('今天', () => {
        const now = new Date()
        return [beginOfDay(now), endOfDay(now)]
      }),
      createShortcut('昨天', () => {
        const yesterday = new Date(Date.now() - DAY_MILLISECONDS)
        return [beginOfDay(yesterday), endOfDay(yesterday)]
      }),
      createShortcut('最近七天', () => {
        const now = new Date()
        return [beginOfDay(new Date(Date.now() - DAY_MILLISECONDS * 6)), endOfDay(now)]
      }),
      createShortcut('最近 30 天', () => {
        const now = new Date()
        return [beginOfDay(new Date(Date.now() - DAY_MILLISECONDS * 29)), endOfDay(now)]
      }),
      createShortcut('本月', () => {
        const now = new Date()
        return [new Date(now.getFullYear(), now.getMonth(), 1), endOfDay(now)]
      }),
      createShortcut('今年', () => {
        const now = new Date()
        return [new Date(now.getFullYear(), 0, 1), endOfDay(now)]
      })
    ]
  }
}

export default {
  name: 'CrmStatisticsRank',
  components: {
    Treeselect,
    ContactCountRank,
    ContractCountRank,
    ContractPriceRank,
    CustomerCountRank,
    FollowCountRank,
    FollowCustomerCountRank,
    ProductSalesRank,
    ReceivablePriceRank
  },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      datePickerOptions: createDatePickerOptions(),
      deptList: [],
      activeTab: 'contractPriceRank'
    }
  },
  watch: {
    activeTab: 'handleQuery'
  },
  created() {
    this.initialize()
  },
  methods: {
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    async initialize() {
      const response = await getSimpleDeptList()
      const depts = (response).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.loadActiveTab()
    },
    loadActiveTab() {
      this.$nextTick(() => {
        const component = this.$refs[this.activeTab + 'Ref']
        if (component && typeof component.loadData === 'function') component.loadData()
      })
    },
    handleQuery() {
      this.loadActiveTab()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    }
  }
}
</script>

<style lang="scss" scoped>
.query-card {
  margin-bottom: 16px;

  ::v-deep .el-form-item {
    margin-bottom: 12px;
  }
}

.query-control {
  width: 240px;
}

.date-control {
  width: 360px;
}

.analysis-tabs {
  min-width: 0;
}

::v-deep .rank-analysis {
  min-width: 0;

  .chart-card {
    position: relative;
  }

  .rank-chart {
    width: 100%;
    height: 500px;
  }

  .table-card {
    margin-top: 16px;
  }

  .empty-chart {
    position: absolute;
    top: 245px;
    left: 0;
    width: 100%;
    color: #909399;
    text-align: center;
    pointer-events: none;
  }
}

@media (max-width: 768px) {
  .query-card {
    ::v-deep .el-form-item {
      display: flex;
      margin-right: 0;
    }

    ::v-deep .el-form-item__content {
      flex: 1;
      min-width: 0;
    }
  }

  .query-control,
  .date-control {
    width: 100%;
  }

  ::v-deep .rank-analysis .rank-chart {
    height: 420px;
  }
}
</style>
