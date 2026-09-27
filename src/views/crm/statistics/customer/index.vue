<!-- 数据统计 - 员工客户分析 -->
<template>
  <div class="app-container crm-statistics-customer">
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
            :default-time="['00:00:00', '23:59:59']"
            :picker-options="datePickerOptions"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="query-control date-control"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="时间间隔"
          prop="interval"
        >
          <el-select
            v-model="queryParams.interval"
            placeholder="请选择时间间隔"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="item in intervalOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
            @input="handleDeptChange"
          />
        </el-form-item>
        <el-form-item
          label="员工"
          prop="userId"
        >
          <el-select
            v-model="queryParams.userId"
            clearable
            filterable
            placeholder="请选择员工"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="user in userListByDeptId"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleQuery"
          >查询</el-button>
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
        label="客户总量分析"
        name="customerSummary"
        lazy
      >
        <customer-summary
          ref="customerSummary"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户跟进次数分析"
        name="followUpSummary"
        lazy
      >
        <customer-follow-up-summary
          ref="followUpSummary"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户跟进方式分析"
        name="followUpType"
        lazy
      >
        <customer-follow-up-type
          ref="followUpType"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户转化率分析"
        name="conversionStat"
        lazy
      >
        <customer-conversion-stat
          ref="conversionStat"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="公海客户分析"
        name="poolSummary"
        lazy
      >
        <customer-pool-summary
          ref="poolSummary"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="员工客户成交周期分析"
        name="dealCycleByUser"
        lazy
      >
        <customer-deal-cycle-by-user
          ref="dealCycleByUser"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="地区客户成交周期分析"
        name="dealCycleByArea"
        lazy
      >
        <customer-deal-cycle-by-area
          ref="dealCycleByArea"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="产品客户成交周期分析"
        name="dealCycleByProduct"
        lazy
      >
        <customer-deal-cycle-by-product
          ref="dealCycleByProduct"
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
import { getSimpleUserList } from '@/api/system/user'
import { getDictDatas } from '@/utils/dict'
import { formatDate } from '@/utils'
import { beginOfDay, endOfDay } from '@/utils/dateUtils'
import { handleTree } from '@/utils/ruoyi'
import CustomerConversionStat from './components/CustomerConversionStat.vue'
import CustomerDealCycleByArea from './components/CustomerDealCycleByArea.vue'
import CustomerDealCycleByProduct from './components/CustomerDealCycleByProduct.vue'
import CustomerDealCycleByUser from './components/CustomerDealCycleByUser.vue'
import CustomerFollowUpSummary from './components/CustomerFollowUpSummary.vue'
import CustomerFollowUpType from './components/CustomerFollowUpType.vue'
import CustomerPoolSummary from './components/CustomerPoolSummary.vue'
import CustomerSummary from './components/CustomerSummary.vue'

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000
const DATE_INTERVAL_DICT_TYPE = 'date_interval'

function getDefaultTimes() {
  const now = Date.now()
  return [
    formatDate(beginOfDay(new Date(now - DAY_MILLISECONDS * 7))),
    formatDate(endOfDay(new Date(now - DAY_MILLISECONDS)))
  ]
}

function createQueryParams(deptId) {
  return {
    interval: 2,
    deptId,
    userId: undefined,
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
  name: 'CrmStatisticsCustomer',
  components: {
    Treeselect,
    CustomerConversionStat,
    CustomerDealCycleByArea,
    CustomerDealCycleByProduct,
    CustomerDealCycleByUser,
    CustomerFollowUpSummary,
    CustomerFollowUpType,
    CustomerPoolSummary,
    CustomerSummary
  },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      datePickerOptions: createDatePickerOptions(),
      deptList: [],
      userList: [],
      activeTab: 'customerSummary'
    }
  },
  computed: {
    intervalOptions() {
      const options = getDictDatas(DATE_INTERVAL_DICT_TYPE)
      return options.map(item => ({
        label: item.label,
        value: Number(item.value)
      }))
    },
    userListByDeptId() {
      if (this.queryParams.deptId === undefined || this.queryParams.deptId === null) return []
      return this.userList.filter(user => String(user.deptId) === String(this.queryParams.deptId))
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
      const responses = await Promise.all([
        getSimpleDeptList(),
        getSimpleUserList()
      ])
      const depts = (responses[0]).data
      const users = (responses[1]).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.userList = users
      this.loadActiveTab()
    },
    loadActiveTab() {
      this.$nextTick(() => {
        const component = this.$refs[this.activeTab]
        if (component && typeof component.loadData === 'function') component.loadData()
      })
    },
    handleQuery() {
      this.loadActiveTab()
    },
    handleDeptChange() {
      this.queryParams.userId = undefined
      this.handleQuery()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.query-card {
  margin-bottom: 16px;
}

.query-card .el-form-item {
  margin-bottom: 12px;
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
</style>
