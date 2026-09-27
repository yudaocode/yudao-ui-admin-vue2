<template>
  <div
    ref="chart"
    :style="{ width, height }"
  />
</template>

<script>
import '@/views/iot/styles/vue2.css';
import * as echarts from 'echarts'

export default {
  name: 'IotEchart',
  props: {
    options: { type: Object, required: true },
    width: { type: String, default: '100%' },
    height: { type: String, default: '300px' }
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
