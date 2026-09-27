<template>
  <el-card
    v-loading="loading"
    shadow="never"
    class="member-terminal-card"
  >
    <div
      slot="header"
      class="member-card-title"
    >会员终端</div>
    <div class="member-terminal-chart-wrapper">
      <div
        ref="chart"
        class="member-terminal-chart"
      />
      <div
        v-if="!loading && !hasChartData"
        class="member-chart-empty"
      >
        暂无统计数据
      </div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { getMemberTerminalStatisticsList } from '@/api/mall/statistics/member'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

function sameValue(left, right) {
  if (left === null || left === undefined) return right === null || right === undefined
  return Number(left) === Number(right)
}

export default {
  name: 'MemberTerminalCard',
  data() {
    return {
      loading: true,
      chartData: [],
      chart: null,
      requestSequence: 0
    }
  },
  computed: {
    hasChartData() {
      return this.chartData.some(item => Number(item.value || 0) > 0)
    }
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart)
    this.loadData()
  },
  beforeDestroy() {
    this.requestSequence += 1
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
    this.chart = null
  },
  methods: {
    buildChartData(rows) {
      const dictionaries = getDictDatas(DICT_TYPE.TERMINAL)
      const result = dictionaries.map(dict => {
        const matched = rows.find(item => sameValue(item.terminal, dict.value))
        return {
          name: dict.label,
          value: matched ? Number(matched.userCount || 0) : 0
        }
      })
      rows.forEach(item => {
        const exists = dictionaries.some(dict => sameValue(item.terminal, dict.value))
        if (exists) return
        result.push({
          name: item.terminal === null || item.terminal === undefined ? '未知' : '终端 ' + item.terminal,
          value: Number(item.userCount || 0)
        })
      })
      return result
    },
    async loadData() {
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await getMemberTerminalStatisticsList()
        if (requestId !== this.requestSequence) return
        const list = response.data
        this.chartData = this.buildChartData(list)
        this.$nextTick(() => this.renderChart())
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    },
    renderChart() {
      if (!this.$refs.chart) return
      if (!this.chart) this.chart = echarts.init(this.$refs.chart)
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: { orient: 'vertical', left: 'right' },
        series: [{
          name: '会员终端',
          type: 'pie',
          label: { show: false },
          labelLine: { show: false },
          data: this.chartData
        }]
      }, true)
      this.chart.resize()
    }
  }
}
</script>

<style scoped>
.member-terminal-card {
  position: relative;
}

.member-card-title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.member-terminal-chart-wrapper {
  position: relative;
}

.member-terminal-chart {
  width: 100%;
  height: 300px;
}

.member-chart-empty {
  position: absolute;
  top: 48%;
  left: 0;
  width: 100%;
  color: #909399;
  font-size: 13px;
  text-align: center;
  pointer-events: none;
}
</style>
