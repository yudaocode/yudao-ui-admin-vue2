<template>
  <el-row
    :gutter="16"
    class="mes-kpi"
  >
    <el-col
      :xl="6"
      :lg="6"
      :md="12"
      :sm="12"
      :xs="24"
    >
      <el-card
        shadow="hover"
        class="mes-kpi__card"
        @click.native="handleNavigate('MesProWorkOrder')"
      >
        <div class="mes-kpi__content">
          <div class="mes-kpi__icon mes-kpi__icon--production"><i class="el-icon-document" /></div>
          <div class="mes-kpi__main">
            <div class="mes-kpi__title">生产工单</div>
            <div class="mes-kpi__value mes-kpi__value--production">
              <count-to
                :start-val="0"
                :end-val="summary.workOrderActiveCount"
                :duration="1500"
              />
              <span>进行中</span>
            </div>
            <div class="mes-kpi__meta">
              <span>待排产 {{ summary.workOrderPrepareCount }}</span>
              <el-divider direction="vertical" />
              <span>已完成 {{ summary.workOrderFinishedCount }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col
      :xl="6"
      :lg="6"
      :md="12"
      :sm="12"
      :xs="24"
    >
      <el-card
        shadow="hover"
        class="mes-kpi__card"
        @click.native="handleNavigate('MesProFeedback')"
      >
        <div class="mes-kpi__content">
          <div class="mes-kpi__icon mes-kpi__icon--output"><i class="el-icon-data-analysis" /></div>
          <div class="mes-kpi__main">
            <div class="mes-kpi__title">今日产量</div>
            <div class="mes-kpi__value mes-kpi__value--output">
              <count-to
                :start-val="0"
                :end-val="summary.todayOutput"
                :duration="1500"
              />
              <span>件</span>
            </div>
            <div class="mes-kpi__meta">昨日 {{ summary.yesterdayOutput }} 件</div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col
      :xl="6"
      :lg="6"
      :md="12"
      :sm="12"
      :xs="24"
    >
      <el-card
        shadow="hover"
        class="mes-kpi__card"
        @click.native="handleNavigate('MesProFeedback')"
      >
        <div class="mes-kpi__content">
          <div class="mes-kpi__icon mes-kpi__icon--quality"><i class="el-icon-circle-check" /></div>
          <div class="mes-kpi__main">
            <div class="mes-kpi__title">质量合格率</div>
            <div class="mes-kpi__value mes-kpi__value--quality">
              <count-to
                :start-val="0"
                :end-val="qualityRate"
                :decimals="1"
                :duration="1500"
              />
              <span>%</span>
            </div>
            <div class="mes-kpi__meta">
              <template v-if="hasQualityData">
                <span>合格 {{ summary.todayQualifiedQuantity }}</span>
                <el-divider direction="vertical" />
                <span>不良 {{ summary.todayUnqualifiedQuantity }}</span>
              </template>
              <span v-else>暂无数据</span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>

    <el-col
      :xl="6"
      :lg="6"
      :md="12"
      :sm="12"
      :xs="24"
    >
      <el-card
        shadow="hover"
        class="mes-kpi__card"
        @click.native="handleNavigate('MesDvMachinery')"
      >
        <div class="mes-kpi__content">
          <div class="mes-kpi__icon mes-kpi__icon--equipment"><i class="el-icon-cpu" /></div>
          <div class="mes-kpi__main">
            <div class="mes-kpi__title">设备状态</div>
            <div class="mes-kpi__value mes-kpi__value--equipment">
              <count-to
                :start-val="0"
                :end-val="summary.machineryProducing"
                :duration="1500"
              />
              <span>/ {{ summary.machineryTotal }} 运行中</span>
            </div>
            <div class="mes-kpi__meta">
              <span class="mes-kpi__danger">停机 {{ summary.machineryStop }}</span>
              <el-divider direction="vertical" />
              <span class="mes-kpi__warning">维护 {{ summary.machineryMaintenance }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
  name: 'HomeKpiCards',
  components: { CountTo },
  props: {
    summary: { type: Object, required: true }
  },
  computed: {
    hasQualityData() {
      return this.summary.todayQualifiedQuantity + this.summary.todayUnqualifiedQuantity > 0
    },
    qualityRate() {
      const total = this.summary.todayQualifiedQuantity + this.summary.todayUnqualifiedQuantity
      if (total === 0) return 0
      return this.summary.todayQualifiedQuantity / total * 100
    }
  },
  methods: {
    handleNavigate(name) {
      this.$emit('navigate', name)
    }
  }
}
</script>

<style scoped>
.mes-kpi > .el-col { margin-bottom: 16px; }
.mes-kpi__card { cursor: pointer; border: 1px solid #dcdfe6; transition: all 0.3s ease; }
.mes-kpi__card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgb(0 0 0 / 12%); }
.mes-kpi__content { display: flex; gap: 16px; align-items: center; min-height: 72px; }
.mes-kpi__icon { display: flex; flex: 0 0 56px; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 12px; color: #fff; font-size: 28px; }
.mes-kpi__icon--production { background: linear-gradient(135deg, #409eff, #66b1ff); }
.mes-kpi__icon--output { background: linear-gradient(135deg, #67c23a, #85ce61); }
.mes-kpi__icon--quality { background: linear-gradient(135deg, #e6a23c, #ebb563); }
.mes-kpi__icon--equipment { background: linear-gradient(135deg, #7c3aed, #9461f5); }
.mes-kpi__main { min-width: 0; }
.mes-kpi__title { margin-bottom: 4px; color: #606266; font-size: 14px; }
.mes-kpi__value { display: flex; gap: 4px; align-items: baseline; font-size: 28px; font-weight: 700; line-height: 1.2; }
.mes-kpi__value span { color: #606266; font-size: 13px; font-weight: 400; white-space: nowrap; }
.mes-kpi__value--production { color: #409eff; }
.mes-kpi__value--output { color: #67c23a; }
.mes-kpi__value--quality { color: #e6a23c; }
.mes-kpi__value--equipment { color: #7c3aed; }
.mes-kpi__meta { margin-top: 4px; color: #909399; font-size: 12px; white-space: nowrap; }
.mes-kpi__danger { color: #f56c6c; }
.mes-kpi__warning { color: #e6a23c; }
</style>
