<!-- 合同金额排行 -->
<template>
  <div class="rank-analysis contract-price-rank">
    <el-card
      v-loading="loading"
      shadow="never"
      class="chart-card"
    >
      <div
        ref="chart"
        class="rank-chart"
      />
      <div
        v-if="!loading && list.length === 0"
        class="empty-chart"
      >暂无排行数据</div>
    </el-card>

    <el-card
      shadow="never"
      class="table-card"
    >
      <el-table
        v-loading="loading"
        :data="list"
        border
      >
        <el-table-column
          label="公司排名"
          align="center"
          type="index"
          width="100"
        />
        <el-table-column
          label="签订人"
          align="center"
          prop="nickname"
          min-width="180"
        />
        <el-table-column
          label="部门"
          align="center"
          prop="deptName"
          min-width="180"
        />
        <el-table-column
          label="合同金额（元）"
          align="right"
          prop="count"
          min-width="180"
          :formatter="erpPriceTableColumnFormatter"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { StatisticsRankApi } from '@/api/crm/statistics/rank'
import { erpPriceTableColumnFormatter } from '@/utils'
import { createRankMixin } from './rankMixin'

export default {
  name: 'ContractPriceRank',
  mixins: [createRankMixin({
    request: StatisticsRankApi.getContractPriceRank,
    seriesName: '合同金额排行',
    xAxisName: '合同金额（元）',
    yAxisName: '签订人',
    money: true
  })],
  methods: {
    erpPriceTableColumnFormatter
  }
}
</script>
