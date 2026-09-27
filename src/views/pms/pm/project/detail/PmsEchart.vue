<template>
  <div
    ref="chart"
    :style="chartStyle"
  />
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'PmsEchart',
  props: {
    options: { type: Object, required: true },
    width: { type: String, default: '100%' },
    height: { type: [Number, String], default: 300 }
  },
  data() {
    return {
      chart: undefined
    }
  },
  computed: {
    chartStyle() {
      return {
        width: this.width,
        height: typeof this.height === 'number' ? `${this.height}px` : this.height
      }
    }
  },
  watch: {
    options: {
      deep: true,
      handler() {
        this.renderChart()
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) this.chart.dispose()
  },
  methods: {
    renderChart() {
      if (this.chart) this.chart.setOption(this.options, true)
    },
    resizeChart() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>
