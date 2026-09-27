<!-- 数据统计 - 业绩目标完成情况 -->
<template>
  <div class="app-container crm-statistics-performance-target">
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
          label="选择年份"
          prop="year"
        >
          <el-date-picker
            v-model="queryParams.year"
            type="year"
            value-format="yyyy"
            placeholder="请选择年份"
            class="query-control"
            @change="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="目标类型"
          prop="bizType"
        >
          <el-select
            v-model="queryParams.bizType"
            placeholder="请选择目标类型"
            class="query-control"
            @change="handleQuery"
          >
            <el-option
              v-for="item in bizTypeOptions"
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

    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <div
        ref="chart"
        class="performance-chart"
      />
      <div
        v-if="!loading && list.length === 0"
        class="empty-chart"
      >暂无统计数据</div>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <el-table
        v-loading="loading"
        :data="list"
        border
        show-summary
        :summary-method="getSummaries"
      >
        <el-table-column
          label="月份"
          align="center"
          prop="month"
          min-width="120"
        >
          <template slot-scope="scope">
            {{ formatMonth(scope.row.month) }}
          </template>
        </el-table-column>
        <el-table-column
          label="目标金额（元）"
          align="right"
          prop="targetPrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="完成金额（元）"
          align="right"
          prop="currentPrice"
          min-width="160"
          :formatter="erpPriceTableColumnFormatter"
        />
        <el-table-column
          label="完成率"
          align="right"
          prop="completionRate"
          min-width="120"
        >
          <template slot-scope="scope">{{ scope.row.completionRate }}%</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { StatisticsPerformanceTargetApi } from '@/api/crm/statistics/performanceTarget'
import { BizTypeEnum } from '@/api/crm/permission'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import {
  erpPriceInputFormatter,
  erpPriceTableColumnFormatter
} from '@/utils'
import { handleTree } from '@/utils/ruoyi'

function createQueryParams(deptId) {
  return {
    deptId,
    userId: undefined,
    year: String(new Date().getFullYear()),
    bizType: BizTypeEnum.CRM_CONTRACT
  }
}

export default {
  name: 'CrmStatisticsPerformanceTarget',
  components: { Treeselect },
  data() {
    return {
      queryParams: createQueryParams(this.$store.getters.deptId),
      bizTypeOptions: [
        { label: '销售目标', value: BizTypeEnum.CRM_CONTRACT },
        { label: '回款目标', value: BizTypeEnum.CRM_RECEIVABLE }
      ],
      loading: false,
      list: [],
      deptList: [],
      userList: [],
      chart: null,
      requestSequence: 0
    }
  },
  computed: {
    userListByDeptId() {
      if (this.queryParams.deptId === undefined || this.queryParams.deptId === null) return []
      return this.userList.filter(user => String(user.deptId) === String(this.queryParams.deptId))
    }
  },
  created() {
    this.initialize()
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
    this.$nextTick(() => this.renderChart())
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    erpPriceTableColumnFormatter,
    async initialize() {
      await this.loadOptions()
      await this.loadData()
    },
    getApiParams() {
      return {
        deptId: this.queryParams.deptId,
        userId: this.queryParams.userId,
        year: this.queryParams.year ? Number(this.queryParams.year) : undefined,
        bizType: this.queryParams.bizType
      }
    },
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    formatMonth(month) {
      return this.queryParams.year + '-' + String(month).padStart(2, '0')
    },
    async loadOptions() {
      const responses = await Promise.all([
        getSimpleDeptList(),
        getSimpleUserList()
      ])
      const depts = (responses[0]).data
      const users = (responses[1]).data
      this.deptList = handleTree(depts, 'id', 'parentId')
      this.userList = users
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const data = (await StatisticsPerformanceTargetApi.getPerformanceTargetSummary(this.getApiParams())).data
        if (requestId !== this.requestSequence) return
        this.list = data
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.loadData()
    },
    handleDeptChange() {
      this.queryParams.userId = undefined
      this.handleQuery()
    },
    resetQuery() {
      if (this.$refs.queryForm) this.$refs.queryForm.resetFields()
      this.handleQuery()
    },
    getSummaries({ columns, data }) {
      const targetTotal = data.reduce((sum, item) => sum + Number(item.targetPrice || 0), 0)
      const currentTotal = data.reduce((sum, item) => sum + Number(item.currentPrice || 0), 0)
      const completionRate = targetTotal > 0
        ? ((currentTotal / targetTotal) * 100).toFixed(2)
        : '0.00'
      return columns.map((column, index) => {
        if (index === 0) return '合计'
        if (column.property === 'targetPrice') return erpPriceInputFormatter(targetTotal)
        if (column.property === 'currentPrice') return erpPriceInputFormatter(currentTotal)
        if (column.property === 'completionRate') return completionRate + '%'
        return ''
      })
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      const rows = Array.isArray(this.list) ? this.list : []
      this.chart.setOption({
        grid: {
          left: 20,
          right: 40,
          bottom: 72,
          containLabel: true
        },
        legend: {
          bottom: 8
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        toolbox: {
          feature: {
            dataZoom: {
              xAxisIndex: false
            },
            brush: {
              type: ['lineX', 'clear']
            },
            saveAsImage: {
              show: true,
              name: '业绩目标完成情况'
            }
          }
        },
        xAxis: {
          type: 'category',
          name: '月份',
          data: rows.map(item => this.formatMonth(item.month))
        },
        yAxis: [
          {
            type: 'value',
            name: '金额（元）'
          },
          {
            type: 'value',
            name: '完成率',
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '目标金额（元）',
            type: 'bar',
            data: rows.map(item => Number(item.targetPrice || 0))
          },
          {
            name: '完成金额（元）',
            type: 'bar',
            data: rows.map(item => Number(item.currentPrice || 0))
          },
          {
            name: '完成率（%）',
            type: 'line',
            yAxisIndex: 1,
            data: rows.map(item => Number(item.completionRate || 0))
          }
        ]
      }, true)
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

.chart-card {
  position: relative;
}

.performance-chart {
  height: 500px;
}

.empty-chart {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  color: #909399;
  text-align: center;
  pointer-events: none;
}

.table-card {
  margin-top: 16px;
}
</style>
