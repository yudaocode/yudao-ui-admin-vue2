import * as echarts from 'echarts'
import { erpPriceInputFormatter } from '@/utils'

/**
 * 创建排行榜组件的公共行为。各排行榜只配置接口、标题和坐标轴文案，
 * 请求参数、竞态保护及 ECharts 生命周期保持完全一致。
 */
export function createRankMixin(config) {
  return {
    props: {
      queryParams: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        loading: false,
        list: [],
        chart: null,
        requestSequence: 0
      }
    },
    mounted() {
      window.addEventListener('resize', this.resizeChart)
    },
    beforeDestroy() {
      this.requestSequence += 1
      window.removeEventListener('resize', this.resizeChart)
      if (this.chart) this.chart.dispose()
      this.chart = null
    },
    methods: {
      getApiParams() {
        return {
          deptId: this.queryParams.deptId,
          times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
        }
      },
      async loadData() {
        const requestId = ++this.requestSequence
        this.loading = true
        try {
          const data = (await config.request(this.getApiParams())).data
          if (requestId !== this.requestSequence) return
          this.list = data
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
        const rows = this.list.slice().reverse().map(item => ({
          nickname: item.nickname || '未知',
          count: Number(item.count || 0)
        }))
        const valueAxis = {
          type: 'value',
          name: config.xAxisName,
          min: 0
        }
        if (config.money) {
          valueAxis.axisLabel = {
            formatter: value => erpPriceInputFormatter(value)
          }
        } else {
          valueAxis.minInterval = 1
        }
        const tooltip = {
          trigger: 'axis',
          axisPointer: { type: 'shadow' }
        }
        if (config.money) {
          tooltip.valueFormatter = value => erpPriceInputFormatter(value) + ' 元'
        }
        this.chart.setOption({
          dataset: {
            dimensions: ['nickname', 'count'],
            source: rows
          },
          grid: { left: 20, right: 40, bottom: 20, containLabel: true },
          legend: { top: 10 },
          toolbox: {
            feature: {
              dataZoom: { yAxisIndex: false },
              brush: { type: ['lineX', 'clear'] },
              saveAsImage: { show: true, name: config.seriesName }
            }
          },
          tooltip,
          xAxis: valueAxis,
          yAxis: {
            type: 'category',
            name: config.yAxisName,
            nameGap: config.yAxisNameGap || 15
          },
          series: [{
            name: config.seriesName,
            type: 'bar',
            encode: { x: 'count', y: 'nickname' }
          }]
        }, true)
        this.resizeChart()
      }
    }
  }
}
