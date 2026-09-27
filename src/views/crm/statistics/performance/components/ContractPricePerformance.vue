<!-- 员工合同金额统计 -->
<template>
  <div class="performance-analysis contract-price-performance">
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
        :data="tableData"
        border
      >
        <el-table-column
          v-for="column in columnsData"
          :key="column.prop"
          :label="column.label"
          :prop="column.prop"
          :min-width="column.minWidth"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row[column.prop] }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { StatisticsPerformanceApi } from '@/api/crm/statistics/performance'
import { createPerformanceMixin } from './performanceMixin'

export default {
  name: 'ContractPricePerformance',
  mixins: [createPerformanceMixin({
    request: StatisticsPerformanceApi.getContractPricePerformance,
    valueAxisName: '金额（元）',
    saveAsImageName: '员工合同金额统计',
    seriesNames: [
      '当月合同金额（元）',
      '上月合同金额（元）',
      '去年同月合同金额（元）'
    ],
    rowTitles: [
      '当月合同金额统计（元）',
      '上月合同金额统计（元）',
      '去年当月合同金额统计（元）',
      '环比增长率（%）',
      '同比增长率（%）'
    ]
  })]
}
</script>

<style scoped>
.chart-card {
  position: relative;
}

.performance-chart {
  width: 100%;
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
