<!-- 数据统计 - 销售漏斗分析 -->
<template>
  <div class="app-container crm-statistics-funnel">
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
          label="商机组"
          prop="statusTypeId"
        >
          <el-select
            v-model="queryParams.statusTypeId"
            clearable
            filterable
            placeholder="请选择商机组"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="item in statusTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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
        label="销售漏斗分析"
        name="funnelRef"
        lazy
      >
        <funnel-business
          ref="funnelRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="新增商机分析"
        name="businessSummaryRef"
        lazy
      >
        <business-summary
          ref="businessSummaryRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="商机转化率分析"
        name="businessInversionRateSummaryRef"
        lazy
      >
        <business-inversion-rate-summary
          ref="businessInversionRateSummaryRef"
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
import { getBusinessStatusTypeSimpleList } from '@/api/crm/business/status'
import { getDictDatas } from '@/utils/dict'
import { formatDate } from '@/utils'
import { beginOfDay, endOfDay } from '@/utils/dateUtils'
import { handleTree } from '@/utils/ruoyi'
import FunnelBusiness from './components/FunnelBusiness.vue'
import BusinessSummary from './components/BusinessSummary.vue'
import BusinessInversionRateSummary from './components/BusinessInversionRateSummary.vue'

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
    statusTypeId: undefined,
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
  name: 'CrmStatisticsFunnel',
  components: {
    Treeselect,
    FunnelBusiness,
    BusinessSummary,
    BusinessInversionRateSummary
  },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      datePickerOptions: createDatePickerOptions(),
      deptList: [],
      userList: [],
      statusTypeList: [],
      activeTab: 'funnelRef'
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
    activeTab: 'loadActiveTab'
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
        getSimpleUserList(),
        getBusinessStatusTypeSimpleList()
      ])
      const depts = (responses[0]).data
      const users = (responses[1]).data
      const statusTypes = (responses[2]).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.userList = users
      this.statusTypeList = statusTypes
      this.queryParams.statusTypeId = this.statusTypeList.length
        ? this.statusTypeList[0].id
        : undefined
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
      this.queryParams.statusTypeId = this.statusTypeList.length
        ? this.statusTypeList[0].id
        : undefined
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
