<template>
  <div>
    <div class="task-tabs-head">
      <el-tabs
        v-model="activeTabProxy"
        class="performance-tabs"
        @tab-click="$emit('main-change')"
      >
        <el-tab-pane
          v-for="item in mainTabs"
          :key="item.name"
          :name="item.name"
        >
          <span slot="label">{{ item.label }}<i
            v-if="item.count"
            class="task-count"
          >{{ item.count }}</i></span>
        </el-tab-pane>
      </el-tabs>
      <el-input
        v-model="keywordProxy"
        class="task-search"
        clearable
        prefix-icon="el-icon-search"
        placeholder="请输入姓名/工号/考核名称"
        @clear="$emit('query')"
        @keyup.enter.native="$emit('query')"
      />
    </div>
    <el-tabs
      v-model="activeStatusProxy"
      class="sub-tabs"
      @tab-click="$emit('status-change')"
    >
      <el-tab-pane
        v-for="item in statusTabs"
        :key="item.name"
        :name="item.name"
      >
        <span slot="label">{{ item.label }}<span
          v-if="item.count > 0"
          class="status-count"
        >{{ item.count }}</span></span>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { HrmPerformanceStageType } from '@/views/hrm/utils/constants'

export default {
  name: 'HrmPortalPerformanceTaskTabs',
  props: {
    activeTab: { type: Number, required: true },
    activeStatus: { type: Number, required: true },
    keyword: { type: String, required: true },
    taskCount: { type: Object, required: true },
    statusTabs: { type: Array, required: true }
  },
  computed: {
    activeTabProxy: {
      get() { return this.activeTab },
      set(value) { this.$emit('update:activeTab', value) }
    },
    activeStatusProxy: {
      get() { return this.activeStatus },
      set(value) { this.$emit('update:activeStatus', value) }
    },
    keywordProxy: {
      get() { return this.keyword },
      set(value) { this.$emit('update:keyword', value) }
    },
    mainTabs() {
      return [
        { label: '指标填写', name: HrmPerformanceStageType.FILL_QUOTA, count: this.taskCount.fillPendingCount },
        { label: '指标确认', name: HrmPerformanceStageType.TARGET_CONFIRM, count: this.taskCount.targetPendingCount },
        { label: '指标评分', name: HrmPerformanceStageType.OTHER_SCORE, count: this.taskCount.reviewPendingCount },
        { label: '结果审核', name: HrmPerformanceStageType.RESULT_AUDIT, count: this.taskCount.resultAuditPendingCount },
        { label: '结果确认', name: HrmPerformanceStageType.RESULT_CONFIRM, count: this.taskCount.resultConfirmationPendingCount },
        { label: '申诉确认', name: HrmPerformanceStageType.APPEAL_CONFIRM, count: this.taskCount.appealPendingCount }
      ]
    }
  }
}
</script>

<style scoped>
.task-tabs-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.performance-tabs { flex: 1; }
.task-search { width: 280px; }
.task-count { display: inline-flex; min-width: 18px; height: 18px; align-items: center; justify-content: center; box-sizing: border-box; margin-left: 6px; padding: 0 5px; border-radius: 9px; background: #409eff; color: white; font-size: 11px; font-style: normal; }
.status-count { margin-left: 5px; color: #409eff; }
.performance-tabs /deep/ .el-tabs__header { margin-bottom: 12px; }
.sub-tabs /deep/ .el-tabs__header { margin: 0 0 12px; }
.sub-tabs /deep/ .el-tabs__nav-wrap::after { height: 1px; }
</style>
