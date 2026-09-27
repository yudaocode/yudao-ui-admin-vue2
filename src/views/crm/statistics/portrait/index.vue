<!-- 数据统计 - 客户画像 -->
<template>
  <div class="app-container crm-statistics-portrait">
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
        label="城市分布分析"
        name="areaRef"
        lazy
      >
        <portrait-customer-area
          ref="areaRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户级别分析"
        name="levelRef"
        lazy
      >
        <portrait-customer-level
          ref="levelRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户来源分析"
        name="sourceRef"
        lazy
      >
        <portrait-customer-source
          ref="sourceRef"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="客户行业分析"
        name="industryRef"
        lazy
      >
        <portrait-customer-industry
          ref="industryRef"
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
import { formatDate } from '@/utils'
import { beginOfDay, endOfDay } from '@/utils/dateUtils'
import { handleTree } from '@/utils/ruoyi'
import PortraitCustomerArea from './components/PortraitCustomerArea.vue'
import PortraitCustomerIndustry from './components/PortraitCustomerIndustry.vue'
import PortraitCustomerSource from './components/PortraitCustomerSource.vue'
import PortraitCustomerLevel from './components/PortraitCustomerLevel.vue'

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
  name: 'CrmStatisticsPortrait',
  components: {
    Treeselect,
    PortraitCustomerArea,
    PortraitCustomerIndustry,
    PortraitCustomerSource,
    PortraitCustomerLevel
  },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      datePickerOptions: createDatePickerOptions(),
      deptList: [],
      userList: [],
      activeTab: 'areaRef'
    }
  },
  computed: {
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
