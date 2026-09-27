<!-- 新增客户数排行 -->
<template>
  <div class="rank-analysis customer-count-rank">
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
          label="创建人"
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
          label="新增客户数（个）"
          align="center"
          prop="count"
          min-width="180"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { StatisticsRankApi } from '@/api/crm/statistics/rank'
import { createRankMixin } from './rankMixin'

export default {
  name: 'CustomerCountRank',
  mixins: [createRankMixin({
    request: StatisticsRankApi.getCustomerCountRank,
    seriesName: '新增客户数排行',
    xAxisName: '新增客户数（个）',
    yAxisName: '创建人'
  })]
}
</script>
