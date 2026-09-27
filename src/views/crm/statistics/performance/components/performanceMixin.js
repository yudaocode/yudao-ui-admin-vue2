import * as echarts from 'echarts'

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function growthRate(current, previous) {
  const previousValue = toNumber(previous)
  if (previousValue === 0) return 'NULL'
  return (((toNumber(current) - previousValue) / previousValue) * 100).toFixed(2)
}

export function createPerformanceMixin(options) {
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
        columnsData: [],
        tableData: options.rowTitles.map(title => ({ title })),
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
          userId: this.queryParams.userId,
          times: Array.isArray(this.queryParams.times) ? this.queryParams.times.slice() : undefined
        }
      },
      async loadData() {
        const requestId = ++this.requestSequence
        this.loading = true
        try {
          const data = (await options.request(this.getApiParams())).data
          if (requestId !== this.requestSequence) return
          this.list = data
          this.convertListData()
          this.$nextTick(() => this.renderChart())
        } finally {
          if (requestId === this.requestSequence) this.loading = false
        }
      },
      convertListData() {
        const columns = [{ label: '日期', prop: 'title', minWidth: 200 }]
        const rows = options.rowTitles.map(title => ({ title }))
        this.list.forEach((item, index) => {
          const prop = 'prop' + index
          columns.push({ label: item.time, prop, minWidth: 140 })
          rows[0][prop] = item.currentMonthCount
          rows[1][prop] = item.lastMonthCount
          rows[2][prop] = item.lastYearCount
          rows[3][prop] = growthRate(item.currentMonthCount, item.lastMonthCount)
          rows[4][prop] = growthRate(item.currentMonthCount, item.lastYearCount)
        })
        this.columnsData = columns
        this.tableData = rows
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
                name: options.saveAsImageName
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          xAxis: {
            type: 'category',
            name: '日期',
            data: rows.map(item => item.time)
          },
          yAxis: [
            {
              type: 'value',
              name: options.valueAxisName,
              axisTick: {
                show: false
              },
              axisLabel: {
                color: '#BDBDBD',
                formatter: '{value}'
              },
              axisLine: {
                lineStyle: {
                  color: '#BDBDBD'
                }
              },
              splitLine: {
                show: true,
                lineStyle: {
                  color: '#e6e6e6'
                }
              }
            },
            {
              type: 'value',
              axisTick: {
                show: false
              },
              axisLabel: {
                color: '#BDBDBD',
                formatter: '{value}%'
              },
              axisLine: {
                lineStyle: {
                  color: '#BDBDBD'
                }
              },
              splitLine: {
                show: true,
                lineStyle: {
                  color: '#e6e6e6'
                }
              }
            }
          ],
          series: [
            {
              name: options.seriesNames[0],
              type: 'line',
              data: rows.map(item => toNumber(item.currentMonthCount))
            },
            {
              name: options.seriesNames[1],
              type: 'line',
              data: rows.map(item => toNumber(item.lastMonthCount))
            },
            {
              name: options.seriesNames[2],
              type: 'line',
              data: rows.map(item => toNumber(item.lastYearCount))
            },
            {
              name: '环比增长率（%）',
              type: 'line',
              yAxisIndex: 1,
              data: rows.map(item => growthRate(item.currentMonthCount, item.lastMonthCount))
            },
            {
              name: '同比增长率（%）',
              type: 'line',
              yAxisIndex: 1,
              data: rows.map(item => growthRate(item.currentMonthCount, item.lastYearCount))
            }
          ]
        }, true)
        this.resizeChart()
      }
    }
  }
}
