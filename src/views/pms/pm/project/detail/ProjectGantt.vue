<template>
  <div
    v-loading="loading"
    class="project-gantt"
  >
    <div class="gantt-toolbar">
      <el-input
        v-model="keyword"
        clearable
        placeholder="搜索工作项"
        prefix-icon="el-icon-search"
        style="width: 240px"
      />
      <div class="toolbar-controls">
        <el-date-picker
          v-model="dateRange"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          style="width: 280px"
          type="daterange"
        />
        <el-select
          v-model="viewMode"
          style="width: 110px"
        >
          <el-option
            v-for="option in viewModeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button @click="resetRange">重置时间轴</el-button>
      </div>
    </div>
    <el-empty
      v-if="datedRows.length === 0"
      description="暂无符合条件且已设置时间范围的工作项"
    />

    <div
      v-else
      class="gantt-table"
    >
      <div
        class="gantt-grid gantt-header"
        :style="timelineGridStyle"
      >
        <div class="gantt-fixed gantt-fixed-header">
          <span>名称</span>
          <span>开始日期</span>
          <span>结束日期</span>
        </div>
        <div class="timeline-cell timeline-header">
          <span
            v-for="tick in timelineTicks"
            :key="tick.time"
            class="timeline-tick"
            :style="{ left: `${tick.left}%` }"
          >
            {{ tick.label }}
          </span>
        </div>
      </div>

      <div
        v-for="row in datedRows"
        :key="row.key"
        class="gantt-grid gantt-row"
        :class="{ 'group-row': row.group }"
        :style="timelineGridStyle"
      >
        <div class="gantt-fixed gantt-fixed-row">
          <div
            class="gantt-name"
            :style="{ paddingLeft: `${12 + row.depth * 18}px` }"
            :title="row.name"
          >
            <el-button
              v-if="hasChildren(row.key)"
              circle
              :icon="isCollapsed(row.key) ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"
              size="mini"
              type="text"
              @click="toggleRow(row.key)"
            />
            <i
              v-else-if="row.group"
              class="el-icon-date group-icon"
            />
            <el-button
              v-if="row.item"
              type="text"
              @click="openWorkItem(row.item)"
            >
              #{{ row.item.serialNumber }} {{ row.name }}
            </el-button>
            <span
              v-else
              class="group-name"
            >{{ row.name }}</span>
          </div>
          <span>{{ formatDate(row.startTime, 'YYYY-MM-DD') }}</span>
          <span>{{ formatDate(row.endTime, 'YYYY-MM-DD') }}</span>
        </div>

        <div class="timeline-cell timeline-body">
          <div
            class="today-line"
            :style="{ left: `${todayPosition}%` }"
          />
          <el-popover
            placement="top"
            trigger="hover"
            width="260"
          >
            <div
              slot="reference"
              class="gantt-bar"
              :class="{ 'group-bar': row.group }"
              :style="{ left: `${getBarLeft(row)}%`, width: `${getBarWidth(row)}%` }"
            >
              <span>{{ row.group ? row.name : `${row.progress}%` }}</span>
            </div>
            <div class="popover-title">{{ row.name }}</div>
            <div class="popover-line">
              {{ formatDate(row.startTime, 'YYYY-MM-DD') }} 至
              {{ formatDate(row.endTime, 'YYYY-MM-DD') }}
            </div>
            <template v-if="row.item">
              <div class="popover-line">状态：{{ row.item.statusName }}</div>
              <div class="popover-line">
                负责人：{{ row.item.assigneeUserName || '未分配' }}
              </div>
              <div class="popover-line">进度：{{ row.progress }}%</div>
            </template>
          </el-popover>
        </div>
      </div>
    </div>

    <WorkItemDetail
      ref="workItemDetailRef"
      @success="getGanttData"
    />
  </div>
</template>

<script>
import * as IterationApi from '@/api/pms/pm/iteration'
import * as WorkItemApi from '@/api/pms/pm/workitem'
import { formatDate } from '@/utils/formatTime'
import { PmsProjectType } from '@/views/pms/pm/utils/constants'
import { getAllPageItems } from '@/utils/page'
import WorkItemDetail from '@/views/pms/pm/workitem/detail/WorkItemDetail.vue'

const DAY_MILLIS = 24 * 60 * 60 * 1000

function startOfDay(value) {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function endOfDay(value) {
  const date = new Date(value)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime()
}

function startOfUnit(value, viewMode) {
  const date = new Date(value)
  if (viewMode === 'Year') return new Date(date.getFullYear(), 0, 1).getTime()
  if (viewMode === 'Month') return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
  if (viewMode === 'Week') {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - date.getDay()
    ).getTime()
  }
  return startOfDay(date)
}

function addUnit(value, viewMode) {
  const date = new Date(value)
  if (viewMode === 'Year') date.setFullYear(date.getFullYear() + 1)
  else if (viewMode === 'Month') date.setMonth(date.getMonth() + 1)
  else if (viewMode === 'Week') date.setDate(date.getDate() + 7)
  else date.setDate(date.getDate() + 1)
  return date.getTime()
}

function diffUnits(begin, end, viewMode) {
  const beginDate = new Date(begin)
  const endDate = new Date(end)
  if (viewMode === 'Year') return endDate.getFullYear() - beginDate.getFullYear()
  if (viewMode === 'Month') {
    return (endDate.getFullYear() - beginDate.getFullYear()) * 12 +
      endDate.getMonth() - beginDate.getMonth()
  }
  const divisor = viewMode === 'Week' ? DAY_MILLIS * 7 : DAY_MILLIS
  return Math.floor((end - begin) / divisor)
}

export default {
  name: 'PmsProjectGantt',
  components: { WorkItemDetail },
  props: {
    projectId: { type: Number, required: true },
    projectType: { type: Number, required: true },
    editable: { type: Boolean, required: true }
  },
  data() {
    return {
      loading: false,
      items: [],
      iterationList: [],
      keyword: '',
      dateRange: undefined,
      viewMode: 'Day',
      viewModeOptions: [
        { label: '日视图', value: 'Day' },
        { label: '周视图', value: 'Week' },
        { label: '月视图', value: 'Month' },
        { label: '年视图', value: 'Year' }
      ],
      collapsedKeys: []
    }
  },
  computed: {
    allDatedItems() {
      return this.items.filter(item => item.startTime && item.endTime)
    },
    rows() {
      return this.buildRows()
    },
    visibleRows() {
      const rowMap = new Map(this.rows.map(row => [row.key, row]))
      return this.rows.filter(row => {
        let parentKey = row.parentKey
        while (parentKey) {
          if (this.collapsedKeys.includes(parentKey)) return false
          const parent = rowMap.get(parentKey)
          parentKey = parent && parent.parentKey
        }
        return true
      })
    },
    beginTime() {
      if (this.dateRange) return startOfDay(this.dateRange[0])
      if (this.rows.length) return Math.min(...this.rows.map(row => row.startTime))
      return startOfDay(Date.now())
    },
    endTime() {
      if (this.dateRange) return endOfDay(this.dateRange[1])
      if (this.rows.length) return Math.max(...this.rows.map(row => row.endTime))
      return endOfDay(Date.now())
    },
    totalDuration() {
      return Math.max(1, this.endTime - this.beginTime)
    },
    datedRows() {
      return this.visibleRows.filter(
        row => row.endTime >= this.beginTime && row.startTime <= this.endTime
      )
    },
    timelineWidth() {
      const unitCount = Math.max(1, diffUnits(this.beginTime, this.endTime, this.viewMode) + 1)
      const unitWidth = { Day: 44, Week: 76, Month: 96, Year: 128 }[this.viewMode]
      return Math.max(620, Math.min(12000, unitCount * unitWidth))
    },
    timelineGridStyle() {
      return { gridTemplateColumns: `480px ${this.timelineWidth}px` }
    },
    timelineTicks() {
      const ticks = []
      let currentTime = startOfUnit(this.beginTime, this.viewMode)
      let guard = 0
      while (currentTime <= this.endTime && guard < 160) {
        ticks.push({
          time: currentTime,
          label: this.formatTick(currentTime),
          left: ((currentTime - this.beginTime) / this.totalDuration) * 100
        })
        currentTime = addUnit(currentTime, this.viewMode)
        guard += 1
      }
      return ticks
    },
    todayPosition() {
      return Math.min(
        100,
        Math.max(0, ((Date.now() - this.beginTime) / this.totalDuration) * 100)
      )
    }
  },
  mounted() {
    this.getGanttData()
  },
  methods: {
    formatDate,
    async getGanttData() {
      this.loading = true
      try {
        const iterationPromise = this.projectType === PmsProjectType.AGILE
          ? getAllPageItems((pageNo, pageSize) => IterationApi.getIterationPage({
            pageNo,
            pageSize,
            projectId: this.projectId
          }))
          : Promise.resolve([])
        const [workItems, projectIterations] = await Promise.all([
          getAllPageItems((pageNo, pageSize) => WorkItemApi.getWorkItemPage({
            pageNo,
            pageSize,
            projectId: this.projectId
          })),
          iterationPromise
        ])
        this.items = workItems
        this.iterationList = projectIterations
        this.resetRange()
      } finally {
        this.loading = false
      }
    },
    buildRows() {
      const searchKeyword = this.keyword.trim()
      if (this.projectType !== PmsProjectType.AGILE) {
        return this.buildItemRows(
          this.allDatedItems.filter(
            item => !searchKeyword || item.name.includes(searchKeyword)
          ),
          0
        )
      }
      const result = []
      this.iterationList.forEach(iteration => {
        const iterationMatched = !searchKeyword || iteration.name.includes(searchKeyword)
        const iterationItems = this.allDatedItems.filter(item => (
          item.iterationId === iteration.id &&
          (iterationMatched || item.name.includes(searchKeyword))
        ))
        if (iterationItems.length === 0) return
        const iterationStartTime = iteration.startTime
          ? Number(iteration.startTime)
          : Math.min(...iterationItems.map(item => Number(item.startTime)))
        const iterationEndTime = iteration.endTime
          ? Number(iteration.endTime)
          : Math.max(...iterationItems.map(item => Number(item.endTime)))
        const groupKey = `iteration-${iteration.id}`
        result.push({
          key: groupKey,
          name: iteration.name,
          startTime: iterationStartTime,
          endTime: iterationEndTime,
          progress: 0,
          depth: 0,
          group: true
        })
        result.push(...this.buildItemRows(iterationItems, 1, groupKey))
      })
      const unplannedItems = this.allDatedItems.filter(item => (
        !item.iterationId && (!searchKeyword || item.name.includes(searchKeyword))
      ))
      if (unplannedItems.length) {
        result.push({
          key: 'iteration-unplanned',
          name: '未规划事项',
          startTime: Math.min(...unplannedItems.map(item => Number(item.startTime))),
          endTime: Math.max(...unplannedItems.map(item => Number(item.endTime))),
          progress: 0,
          depth: 0,
          group: true
        })
        result.push(...this.buildItemRows(unplannedItems, 1, 'iteration-unplanned'))
      }
      return result
    },
    buildItemRows(source, baseDepth, parentGroupKey) {
      const result = []
      const idSet = new Set(source.map(item => item.id))
      const appendChildren = (parentId, depth, parentKey) => {
        source
          .filter(item => (
            parentId
              ? item.parentId === parentId
              : !item.parentId || !idSet.has(item.parentId)
          ))
          .forEach(item => {
            const key = `item-${item.id}`
            result.push({
              key,
              name: item.name,
              startTime: Number(item.startTime),
              endTime: Number(item.endTime),
              progress: item.progress == null ? 0 : item.progress,
              depth,
              group: false,
              parentKey,
              item
            })
            appendChildren(item.id, depth + 1, key)
          })
      }
      appendChildren(undefined, baseDepth, parentGroupKey)
      return result
    },
    hasChildren(key) {
      return this.rows.some(row => row.parentKey === key)
    },
    isCollapsed(key) {
      return this.collapsedKeys.includes(key)
    },
    toggleRow(key) {
      const index = this.collapsedKeys.indexOf(key)
      if (index >= 0) this.collapsedKeys.splice(index, 1)
      else this.collapsedKeys.push(key)
    },
    resetRange() {
      if (this.allDatedItems.length === 0) {
        this.dateRange = undefined
        return
      }
      this.dateRange = [
        new Date(Math.min(...this.allDatedItems.map(item => Number(item.startTime)))),
        new Date(Math.max(...this.allDatedItems.map(item => Number(item.endTime))))
      ]
    },
    formatTick(time) {
      const format = {
        Day: 'MM-DD',
        Week: 'MM-DD',
        Month: 'YYYY-MM',
        Year: 'YYYY'
      }[this.viewMode]
      return formatDate(time, format)
    },
    getBarLeft(row) {
      return Math.max(0, ((row.startTime - this.beginTime) / this.totalDuration) * 100)
    },
    getBarWidth(row) {
      const visibleStart = Math.max(row.startTime, this.beginTime)
      const visibleEnd = Math.min(row.endTime, this.endTime)
      return Math.max(1.5, ((visibleEnd - visibleStart) / this.totalDuration) * 100)
    },
    openWorkItem(item) {
      this.$refs.workItemDetailRef.open(item.id)
    },
    refresh() {
      return this.getGanttData()
    }
  }
}
</script>

<style scoped>
.gantt-toolbar,
.toolbar-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.gantt-toolbar { margin-bottom: 12px; }
.gantt-table {
  max-height: 680px;
  min-width: 920px;
  overflow: auto;
  border: 1px solid #ebeef5;
}
.gantt-grid { display: grid; min-height: 48px; border-bottom: 1px solid #ebeef5; }
.gantt-header { position: sticky; top: 0; z-index: 4; background: #fff; }
.gantt-fixed {
  position: sticky;
  left: 0;
  z-index: 2;
  display: grid;
  grid-template-columns: 280px 100px 100px;
  min-width: 0;
  overflow: hidden;
  border-right: 1px solid #ebeef5;
  background: inherit;
}
.gantt-fixed-header { z-index: 5; }
.gantt-fixed > span { display: flex; align-items: center; padding: 0 10px; border-left: 1px solid #ebeef5; }
.gantt-fixed > span:first-child { padding-left: 12px; border-left: 0; }
.gantt-fixed-row > span { font-size: 12px; }
.gantt-name { display: flex; min-width: 0; align-items: center; overflow: hidden; }
.gantt-name ::v-deep .el-button--text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.group-name { overflow: hidden; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.group-icon { margin-right: 6px; }
.group-row { background: #f5f7fa; }
.timeline-cell { position: relative; display: flex; align-items: center; padding: 0 10px; color: #909399; font-size: 12px; }
.timeline-header { justify-content: space-between; }
.timeline-tick { position: absolute; padding-left: 4px; border-left: 1px solid #ebeef5; transform: translateX(-1px); }
.timeline-body {
  justify-content: space-between;
  background-image: linear-gradient(to right, #f2f6fc 1px, transparent 1px);
  background-size: 10% 100%;
}
.today-line { position: absolute; z-index: 1; width: 1px; height: 100%; background: #f56c6c; }
.gantt-bar {
  position: absolute;
  z-index: 1;
  display: flex;
  min-width: 18px;
  height: 24px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}
.group-bar { height: 18px; background: #67c23a; }
.popover-title { font-weight: 600; }
.popover-line { margin-top: 6px; font-size: 13px; }
</style>
