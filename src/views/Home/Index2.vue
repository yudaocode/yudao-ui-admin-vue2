<template>
  <div class="home2">
    <el-row :gutter="20" type="flex" justify="space-between">
      <el-col v-for="item in cardList" :key="item.key" :lg="6" :md="12" :sm="12" :xl="6" :xs="24">
        <el-card class="mb20" shadow="hover">
          <div class="panel-item">
            <div :class="['panel-item-icon', `panel-item-icon-${item.key}`]">
              <i :class="item.icon" />
            </div>
            <div class="panel-item-info">
              <div class="panel-item-text">{{ item.title }}</div>
              <div class="panel-item-count">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" type="flex" justify="space-between">
      <el-col :lg="10" :md="24" :sm="24" :xl="10" :xs="24">
        <el-card class="mb20" shadow="hover">
          <div ref="pieChart" class="chart" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :lg="14" :md="24" :sm="24" :xl="14" :xs="24">
        <el-card class="mb20" shadow="hover">
          <div ref="barChart" class="chart" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card class="mb20" shadow="hover">
          <div ref="lineChart" class="chart" style="height: 350px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { barOptions, lineOptions, pieOptions } from '@/views/Home/echarts-data'

export default {
  name: 'Home2',
  data() {
    return {
      loading: true,
      charts: [],
      cardList: [
        { key: 'peoples', icon: 'el-icon-user-solid', title: '新增用户', value: 102400 },
        { key: 'message', icon: 'el-icon-message-solid', title: '未读消息', value: 81212 },
        { key: 'money', icon: 'el-icon-money', title: '交易金额', value: 9280 },
        { key: 'shopping', icon: 'el-icon-shopping-cart-full', title: '购物总量', value: 13600 }
      ]
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    this.charts.forEach(chart => chart.dispose())
    this.charts = []
  },
  methods: {
    initCharts() {
      this.charts = [
        echarts.init(this.$refs.pieChart),
        echarts.init(this.$refs.barChart),
        echarts.init(this.$refs.lineChart)
      ]
      this.charts[0].setOption(pieOptions)
      this.charts[1].setOption(barOptions)
      this.charts[2].setOption(lineOptions)
      this.loading = false
    },
    resizeCharts() {
      this.charts.forEach(chart => chart.resize())
    }
  }
}
</script>

<style lang="scss" scoped>
.mb20 {
  margin-bottom: 20px;
}

.panel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .panel-item-icon {
    display: inline-block;
    padding: 16px;
    border-radius: 6px;
    font-size: 40px;

    &.panel-item-icon-peoples {
      color: #40c9c6;
    }

    &.panel-item-icon-message {
      color: #36a3f7;
    }

    &.panel-item-icon-money {
      color: #f4516c;
    }

    &.panel-item-icon-shopping {
      color: #34bfa3;
    }
  }

  .panel-item-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: right;
  }

  .panel-item-text {
    font-size: 16px;
    color: #909399;
  }

  .panel-item-count {
    font-size: 20px;
    font-weight: 700;
  }

  &:hover {
    .panel-item-icon {
      color: #fff !important;
      transition: all 0.38s ease-out;
    }

    .panel-item-icon-peoples {
      background: #40c9c6;
    }

    .panel-item-icon-message {
      background: #36a3f7;
    }

    .panel-item-icon-money {
      background: #f4516c;
    }

    .panel-item-icon-shopping {
      background: #34bfa3;
    }
  }
}
</style>
