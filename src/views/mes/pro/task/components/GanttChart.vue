<!-- MES 生产排产甘特图：Vue 2 原生实现，支持预览、拖动和拉伸任务条 -->
<template>
  <div
    class="pro-gantt"
    :style="{ height: height + 'px' }"
  >
    <div
      v-if="rows.length"
      class="gantt-body"
    >
      <div class="gantt-header">
        <div class="gantt-grid-header">
          <span>任务名称</span><span>工作站</span><span>工序</span>
        </div>
        <div class="gantt-scale">
          <div
            v-for="day in days"
            :key="day.key"
            class="gantt-day"
            :class="{ weekend: day.weekend, today: day.today }"
          >
            {{ day.label }}
          </div>
        </div>
      </div>
      <div class="gantt-content">
        <div
          v-for="row in rows"
          :key="row.id"
          class="gantt-row"
          :class="{ 'is-project': row.type === 'project' }"
          @click="handleTaskClick(row)"
        >
          <div class="gantt-grid-row">
            <span
              class="task-name"
              :style="{ paddingLeft: row.type === 'project' ? '8px' : '24px' }"
            >
              {{ row.text || row.name || '-' }}
            </span>
            <span>{{ row.workstation || row.workstationName || '-' }}</span>
            <span>{{ row.process || row.processName || '-' }}</span>
          </div>
          <div class="gantt-timeline-row">
            <div
              v-for="day in days"
              :key="day.key"
              class="gantt-cell"
              :class="{ weekend: day.weekend, today: day.today }"
            />
            <div
              v-if="row.startDateValue && row.endDateValue"
              class="gantt-bar"
              :class="{ 'project-bar': row.type === 'project', editable: canEdit(row) }"
              :style="barStyle(row)"
              :title="taskTitle(row)"
              @mousedown.stop="startDrag($event, row, 'move')"
              @click.stop="handleTaskClick(row)"
              @dblclick.stop="openTaskEditor(row)"
            >
              <span class="bar-label">{{ barLabel(row) }}</span>
              <span
                v-if="canEdit(row)"
                class="resize-handle"
                @mousedown.stop="startDrag($event, row, 'resize')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="gantt-empty"
    >暂无排产数据</div>
    <el-dialog
      title="编辑任务时间"
      :visible.sync="editDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="editStartTime"
            type="datetime"
            value-format="timestamp"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="生产时长">
          <el-input-number
            v-model="editDuration"
            :min="1"
            :precision="0"
            class="full-width"
          />
          <span class="duration-tip">1 个工作日按 8 小时计算</span>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="saveTaskEditor">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'

const WORKING_DAY_MS = 8 * 60 * 60 * 1000
const CALENDAR_DAY_MS = 24 * 60 * 60 * 1000

export default {
  name: 'GanttChart',
  props: {
    tasks: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
    height: { type: Number, default: 350 }
  },
  data() {
    return {
      rows: [],
      dragState: undefined,
      editDialogVisible: false,
      editTask: undefined,
      editStartTime: undefined,
      editDuration: 1
    }
  },
  computed: {
    rangeStart() {
      const starts = this.rows.map(row => row.startDateValue).filter(Boolean)
      const start = starts.length ? Math.min(...starts) : Date.now()
      const date = new Date(start)
      date.setHours(0, 0, 0, 0)
      return date.getTime() - CALENDAR_DAY_MS
    },
    rangeEnd() {
      const ends = this.rows.map(row => row.endDateValue).filter(Boolean)
      const end = ends.length ? Math.max(...ends) : this.rangeStart + 7 * CALENDAR_DAY_MS
      const date = new Date(end)
      date.setHours(0, 0, 0, 0)
      return Math.max(date.getTime() + 2 * CALENDAR_DAY_MS, this.rangeStart + 7 * CALENDAR_DAY_MS)
    },
    rangeDuration() {
      return Math.max(this.rangeEnd - this.rangeStart, CALENDAR_DAY_MS)
    },
    days() {
      const result = []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      for (let time = this.rangeStart; time < this.rangeEnd; time += CALENDAR_DAY_MS) {
        const date = new Date(time)
        result.push({
          key: time,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          weekend: date.getDay() === 0 || date.getDay() === 6,
          today: time === today.getTime()
        })
      }
      return result
    }
  },
  watch: {
    tasks: {
      deep: true,
      immediate: true,
      handler(value) {
        this.loadData(value || [])
      }
    }
  },
  beforeDestroy() {
    this.removeDragListeners()
  },
  methods: {
    loadData(tasks) {
      const typeMap = {
        [BarcodeBizTypeEnum.WORKORDER]: 'project',
        [BarcodeBizTypeEnum.TASK]: 'task'
      }
      this.rows = tasks.map(item => ({
        ...item,
        type: typeMap[item.type] || item.type,
        startDateValue: item.startDate ? new Date(item.startDate).getTime() : undefined,
        endDateValue: item.endDate ? new Date(item.endDate).getTime() : undefined
      }))
    },
    canEdit(row) {
      return !this.readonly && row.type === 'task' && Boolean(row.originalId)
    },
    barStyle(row) {
      const left = ((row.startDateValue - this.rangeStart) / this.rangeDuration) * 100
      const width = ((row.endDateValue - row.startDateValue) / this.rangeDuration) * 100
      return {
        left: `${Math.max(0, Math.min(left, 100))}%`,
        width: `${Math.max(width, 0.8)}%`,
        backgroundColor: row.colorCode || undefined
      }
    },
    barLabel(row) {
      const percent = Math.round((row.progress || 0) * 100)
      const prefix = row.type === 'project' ? '生产工单' : '生产任务'
      return `${prefix}: ${row.process || row.processName || ''} ${row.text || row.name || ''} 完成比例：${percent}%`
    },
    taskTitle(row) {
      return `${this.barLabel(row)}\n${this.formatDate(row.startDateValue)} - ${this.formatDate(row.endDateValue)}`
    },
    formatDate(value) {
      if (!value) return '-'
      const date = new Date(value)
      const pad = number => String(number).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },
    handleTaskClick(row) {
      this.$emit('task-click', row.id)
    },
    openTaskEditor(row) {
      if (!this.canEdit(row)) return
      this.editTask = row
      this.editStartTime = row.startDateValue
      this.editDuration = row.duration || Math.max(
        1,
        Math.round((row.endDateValue - row.startDateValue) / WORKING_DAY_MS)
      )
      this.editDialogVisible = true
    },
    saveTaskEditor() {
      if (!this.editTask || !this.editStartTime || !this.editDuration) return
      this.editTask.startDateValue = this.editStartTime
      this.editTask.endDateValue = this.editStartTime + this.editDuration * WORKING_DAY_MS
      this.emitTaskUpdate(this.editTask)
      this.editDialogVisible = false
    },
    startDrag(event, row, mode) {
      if (!this.canEdit(row)) return
      this.dragState = {
        row,
        mode,
        startX: event.clientX,
        originalStart: row.startDateValue,
        originalEnd: row.endDateValue,
        timelineWidth: event.currentTarget.closest('.gantt-timeline-row').clientWidth
      }
      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.finishDrag)
    },
    handleDrag(event) {
      if (!this.dragState) return
      const rawDelta = ((event.clientX - this.dragState.startX) / this.dragState.timelineWidth) * this.rangeDuration
      const delta = Math.round(rawDelta / WORKING_DAY_MS) * WORKING_DAY_MS
      if (this.dragState.mode === 'move') {
        this.dragState.row.startDateValue = this.dragState.originalStart + delta
        this.dragState.row.endDateValue = this.dragState.originalEnd + delta
      } else {
        this.dragState.row.endDateValue = Math.max(
          this.dragState.originalStart + WORKING_DAY_MS,
          this.dragState.originalEnd + delta
        )
      }
    },
    finishDrag() {
      if (!this.dragState) return
      const row = this.dragState.row
      this.emitTaskUpdate(row)
      this.dragState = undefined
      this.removeDragListeners()
    },
    emitTaskUpdate(row) {
      this.$emit('task-update', {
        id: row.originalId,
        startTime: new Date(row.startDateValue),
        endTime: new Date(row.endDateValue),
        duration: Math.max(1, Math.round((row.endDateValue - row.startDateValue) / WORKING_DAY_MS))
      })
    },
    removeDragListeners() {
      document.removeEventListener('mousemove', this.handleDrag)
      document.removeEventListener('mouseup', this.finishDrag)
    }
  }
}
</script>

<style scoped>
.pro-gantt { width: 100%; overflow: auto; border: 1px solid #dcdfe6; background: #fff; }
.gantt-body { min-width: 980px; }
.gantt-header, .gantt-row { display: grid; grid-template-columns: 480px minmax(500px, 1fr); }
.gantt-header { position: sticky; top: 0; z-index: 3; height: 42px; background: #f5f7fa; border-bottom: 1px solid #dcdfe6; }
.gantt-grid-header, .gantt-grid-row { display: grid; grid-template-columns: 2fr 1fr 1fr; border-right: 1px solid #dcdfe6; }
.gantt-grid-header span, .gantt-grid-row span { display: flex; align-items: center; padding: 0 8px; border-right: 1px solid #ebeef5; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.gantt-scale, .gantt-timeline-row { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(48px, 1fr); }
.gantt-day { display: flex; align-items: center; justify-content: center; font-size: 12px; border-right: 1px solid #ebeef5; }
.gantt-row { min-height: 40px; border-bottom: 1px solid #ebeef5; }
.gantt-row:hover { background: #f3f1fe; }
.gantt-grid-row span { min-height: 40px; font-size: 13px; }
.gantt-row.is-project .task-name { font-weight: 700; }
.gantt-cell { border-right: 1px solid #ebeef5; }
.weekend { background: #f5f7fa; }
.today { background: #fef0f0; }
.gantt-bar { position: absolute; top: 8px; z-index: 2; height: 24px; min-width: 10px; padding: 0 8px; border-radius: 8px; color: #fff; background: #409eff; box-sizing: border-box; overflow: hidden; cursor: default; }
.gantt-bar.project-bar { background: #7b68ee; }
.gantt-bar.editable { cursor: move; }
.bar-label { display: block; line-height: 24px; font-size: 12px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.resize-handle { position: absolute; top: 0; right: 0; width: 8px; height: 100%; cursor: ew-resize; background: rgba(255, 255, 255, 0.35); }
.gantt-empty { display: flex; align-items: center; justify-content: center; height: 100%; min-height: 160px; color: #909399; }
.full-width { width: 100%; }
.duration-tip { margin-left: 8px; color: #909399; font-size: 12px; }
</style>
