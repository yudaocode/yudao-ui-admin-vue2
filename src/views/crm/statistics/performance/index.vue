<!-- 数据统计 - 员工业绩分析 -->
<template>
  <div class="app-container crm-statistics-performance">
    <el-card
      shadow="never"
      class="query-card"
    >
      <el-form
        ref="queryForm"
        :inline="true"
        :model="filters"
        label-width="76px"
      >
        <el-form-item
          label="选择年份"
          prop="year"
        >
          <el-date-picker
            v-model="filters.year"
            type="year"
            value-format="yyyy"
            :clearable="false"
            placeholder="请选择年份"
            class="query-control"
          />
        </el-form-item>
        <el-form-item
          label="归属部门"
          prop="deptId"
        >
          <treeselect
            v-model="filters.deptId"
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
            v-model="filters.userId"
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
        label="员工合同数量统计"
        name="ContractCountPerformance"
        lazy
      >
        <contract-count-performance
          ref="ContractCountPerformance"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="员工合同金额统计"
        name="ContractPricePerformance"
        lazy
      >
        <contract-price-performance
          ref="ContractPricePerformance"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="员工回款金额统计"
        name="ReceivablePricePerformance"
        lazy
      >
        <receivable-price-performance
          ref="ReceivablePricePerformance"
          :query-params="queryParams"
        />
      </el-tab-pane>
      <el-tab-pane
        label="合同汇总表"
        name="ContractSummary"
        lazy
      >
        <contract-summary
          ref="ContractSummary"
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
import ContractCountPerformance from './components/ContractCountPerformance.vue'
import ContractPricePerformance from './components/ContractPricePerformance.vue'
import ReceivablePricePerformance from './components/ReceivablePricePerformance.vue'
import ContractSummary from './components/ContractSummary.vue'

function createFilters(deptId) {
  return {
    year: String(new Date().getFullYear()),
    deptId,
    userId: undefined
  }
}

function createQueryParams(filters) {
  const year = Number(filters.year)
  return {
    deptId: filters.deptId,
    userId: filters.userId,
    times: [
      formatDate(beginOfDay(new Date(year, 0, 1))),
      formatDate(endOfDay(new Date(year, 11, 31)))
    ]
  }
}

export default {
  name: 'CrmStatisticsPerformance',
  components: {
    Treeselect,
    ContractCountPerformance,
    ContractPricePerformance,
    ReceivablePricePerformance,
    ContractSummary
  },
  data() {
    const filters = createFilters(this.$store.getters.deptId)
    return {
      filters,
      defaultFilters: Object.assign({}, filters),
      queryParams: createQueryParams(filters),
      deptList: [],
      userList: [],
      activeTab: 'ContractCountPerformance'
    }
  },
  computed: {
    userListByDeptId() {
      if (this.filters.deptId === undefined || this.filters.deptId === null) return []
      return this.userList.filter(user => String(user.deptId) === String(this.filters.deptId))
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
      if (this.filters.deptId === undefined || this.filters.deptId === null) {
        const currentUser = this.userList.find(
          user => String(user.id) === String(this.$store.getters.userId)
        )
        if (currentUser) this.filters.deptId = currentUser.deptId
      }
      this.defaultFilters = Object.assign({}, this.filters)
      Object.assign(this.queryParams, createQueryParams(this.filters))
      this.loadActiveTab()
    },
    loadActiveTab() {
      if (this.queryParams.deptId === undefined || this.queryParams.deptId === null) return
      this.$nextTick(() => {
        const component = this.$refs[this.activeTab]
        if (component && typeof component.loadData === 'function') component.loadData()
      })
    },
    handleQuery() {
      Object.assign(this.queryParams, createQueryParams(this.filters))
      this.loadActiveTab()
    },
    handleDeptChange() {
      this.filters.userId = undefined
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      Object.assign(this.filters, this.defaultFilters)
      this.handleQuery()
    }
  }
}
</script>

<style scoped>
.query-card {
  margin-bottom: 16px;
}

.query-card ::v-deep .el-card__body {
  padding-bottom: 2px;
}

.query-control {
  width: 240px;
}

.analysis-tabs {
  min-width: 0;
}
</style>
