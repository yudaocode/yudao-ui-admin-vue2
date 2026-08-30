<template>
  <div class="boundary-event-timer-config">
    <el-alert
      v-if="!supportsFlowableExtensions"
      title="当前 BPMN 方言未声明 Flowable 超时扩展"
      type="info"
      :closable="false"
      show-icon
    />
    <template v-else>
    <el-divider content-position="left">审批人超时未处理时</el-divider>
    <el-form-item label="启用开关">
      <el-switch
        v-model="timeoutHandlerEnable"
        active-text="开启"
        inactive-text="关闭"
        @change="timeoutHandlerChange"
      />
    </el-form-item>

    <template v-if="timeoutHandlerEnable">
      <el-form-item label="执行动作">
        <el-radio-group v-model="timeoutHandlerType" @change="onTimeoutHandlerTypeChanged">
          <el-radio-button
            v-for="item in timeoutHandlerTypes"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="超时时间设置">
        <span class="time-prefix">当超过</span>
        <el-input-number
          v-model="timeDuration"
          :min="1"
          :max="999999"
          controls-position="right"
          class="time-number"
          @change="onTimeDurationChange"
        />
        <el-select v-model="timeUnit" class="time-unit" @change="onTimeUnitChange">
          <el-option
            v-for="item in timeUnitTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span>未处理</span>
      </el-form-item>
      <el-form-item v-if="Number(timeoutHandlerType) === timeoutReminderValue" label="最大提醒次数">
        <el-input-number
          v-model="maxRemindCount"
          :min="1"
          :max="10"
          controls-position="right"
          @change="updateTimer"
        />
      </el-form-item>
    </template>
    </template>
  </div>
</template>

<script>
import {
  TIMEOUT_HANDLER_TYPES,
  TIME_UNIT_TYPES,
  TimeUnitType
} from '@/components/SimpleProcessDesignerV2/src/consts'
import { convertTimeUnit } from '@/components/SimpleProcessDesignerV2/src/utils'

const MANAGED_TYPES = ['BoundaryEventType', 'TimeoutHandlerType']

function asNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function extensionValue(extension, fallback) {
  return extension && extension.value !== undefined ? extension.value : fallback
}

function parseDuration(body) {
  const value = String(body === undefined || body === null ? '' : body).trim()
  // Flowable accepts compound ISO-8601 durations (PT1H30M, P1DT2H, PT30S),
  // while this legacy drawer exposes one numeric value and a single unit.
  // Parse every component and collapse mixed values to minutes. The original
  // body is retained separately, so merely opening/saving the handler does
  // not rewrite a value that cannot be represented exactly by the controls.
  const match = value.match(/^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i)
  if (!match || !(match[1] || match[2] || match[3] || match[4])) return null
  const days = asNumber(match[1], 0)
  const hours = asNumber(match[2], 0)
  const minutes = asNumber(match[3], 0)
  const seconds = asNumber(match[4], 0)
  const componentCount = [days, hours, minutes, seconds].filter((part) => part > 0).length
  const unit = componentCount === 1
    ? (days ? 'D' : hours ? 'H' : minutes ? 'M' : 'S')
    : 'M'
  const rawDuration = unit === 'D' ? days : unit === 'H' ? hours : unit === 'M'
    ? days * 24 * 60 + hours * 60 + minutes + seconds / 60
    : seconds / 60
  return {
    duration: unit === 'S' || unit === 'M' ? Math.max(1, Math.ceil(rawDuration)) : rawDuration,
    unit: unit === 'S' ? TimeUnitType.MINUTE : convertTimeUnit(unit),
    unitLetter: unit
  }
}

export default {
  name: 'ElementCustomConfig4BoundaryEventTimer',
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: { default: 'flowable' }
  },
  data() {
    return {
      timeoutHandlerEnable: false,
      timeoutHandlerType: 1,
      timeoutReminderValue: 1,
      timeoutHandlerTypes: TIMEOUT_HANDLER_TYPES,
      timeUnitTypes: TIME_UNIT_TYPES,
      timeDuration: 6,
      timeUnit: TimeUnitType.HOUR,
      rawTimeDuration: null,
      timeDurationDirty: false,
      maxRemindCount: 1,
      element: null,
      eventDefinition: null,
      extensionElements: null,
      boundaryEventTypeEl: null,
      timeoutHandlerTypeEl: null,
      otherExtensions: []
    }
  },
  computed: {
    supportsFlowableExtensions() {
      return String(this.prefix || '').toLowerCase() === 'flowable'
    }
  },
  watch: {
    id: {
      immediate: true,
      handler(value) {
        if (value) this.$nextTick(this.resetElement)
      }
    }
  },
  methods: {
    bpmn() {
      return typeof window !== 'undefined' && window.bpmnInstances ? window.bpmnInstances : null
    },
    actualElement() {
      const instance = this.bpmn()
      if (!instance) return null
      if (instance.elementRegistry && this.id) {
        const found = instance.elementRegistry.get(this.id)
        if (found) return found
      }
      return instance.bpmnElement || null
    },
    findExtension(values, type) {
      const fullType = `${this.prefix}:${type}`
      return (values || []).find((item) => item && (item.$type === fullType || item.$type === type))
    },
    resetElement() {
      const instance = this.bpmn()
      const element = this.actualElement()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle || !element || !element.businessObject) return
      this.rawTimeDuration = null
      this.timeDurationDirty = false
      this.element = element
      const definitions = element.businessObject.eventDefinitions || []
      this.eventDefinition = definitions[0] || null
      if (!this.eventDefinition) return
      const existing = element.businessObject.extensionElements
      const values = existing && existing.values ? existing.values : []
      this.extensionElements = existing || instance.moddle.create('bpmn:ExtensionElements', { values: [] })
      this.boundaryEventTypeEl = this.findExtension(values, 'BoundaryEventType')
      this.timeoutHandlerTypeEl = this.findExtension(values, 'TimeoutHandlerType')
      this.timeoutHandlerEnable = Number(extensionValue(this.boundaryEventTypeEl, 0)) === 1
      this.timeoutHandlerType = asNumber(extensionValue(this.timeoutHandlerTypeEl, 1), 1)
      this.otherExtensions = values.filter((item) => {
        const type = item && item.$type ? String(item.$type).split(':').pop() : ''
        return MANAGED_TYPES.indexOf(type) === -1
      })

      const timer = this.eventDefinition.timeCycle || this.eventDefinition.timeDuration
      if (this.eventDefinition.timeCycle && timer && timer.body) {
        const parts = String(timer.body).split('/')
        const durationBody = parts.length > 1 ? parts[1] : parts[0]
        const parsed = parseDuration(durationBody)
        if (parts[0].charAt(0).toUpperCase() === 'R') {
          this.maxRemindCount = Math.max(1, asNumber(parts[0].slice(1), 1))
        }
        if (parsed) {
          this.timeDuration = parsed.duration
          this.timeUnit = parsed.unit
          this.rawTimeDuration = durationBody
          this.timeDurationDirty = false
        } else if (/^P/i.test(durationBody)) {
          // Keep valid ISO units that this legacy single-unit UI cannot
          // display (for example P1Y/P1M) intact until the user edits them.
          this.rawTimeDuration = durationBody
          this.timeDurationDirty = false
        }
      } else if (this.eventDefinition.timeDuration && this.eventDefinition.timeDuration.body) {
        const durationBody = this.eventDefinition.timeDuration.body
        const parsed = parseDuration(durationBody)
        if (parsed) {
          this.timeDuration = parsed.duration
          this.timeUnit = parsed.unit
          this.rawTimeDuration = durationBody
          this.timeDurationDirty = false
        } else if (/^P/i.test(durationBody)) {
          this.rawTimeDuration = durationBody
          this.timeDurationDirty = false
        }
        this.maxRemindCount = 1
      }
      if (this.timeoutHandlerEnable && !this.boundaryEventTypeEl) {
        this.boundaryEventTypeEl = instance.moddle.create(`${this.prefix}:BoundaryEventType`, { value: 1 })
      }
      if (this.timeoutHandlerEnable && !this.timeoutHandlerTypeEl) {
        this.timeoutHandlerTypeEl = instance.moddle.create(`${this.prefix}:TimeoutHandlerType`, {
          value: this.timeoutHandlerType
        })
      }
    },
    timeoutHandlerChange(enabled) {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle || !this.element || !this.eventDefinition) return
      this.timeoutHandlerEnable = !!enabled
      if (this.timeoutHandlerEnable) {
        this.boundaryEventTypeEl =
          this.boundaryEventTypeEl || instance.moddle.create(`${this.prefix}:BoundaryEventType`, { value: 1 })
        this.boundaryEventTypeEl.value = 1
        this.timeoutHandlerTypeEl =
          this.timeoutHandlerTypeEl || instance.moddle.create(`${this.prefix}:TimeoutHandlerType`, {
            value: this.timeoutHandlerType
          })
        this.timeoutHandlerTypeEl.value = this.timeoutHandlerType
        this.timeDuration = 6
        this.timeUnit = TimeUnitType.HOUR
        this.rawTimeDuration = null
        this.timeDurationDirty = true
        this.maxRemindCount = 1
        this.updateTimer()
      } else {
        this.boundaryEventTypeEl = null
        this.timeoutHandlerTypeEl = null
        this.rawTimeDuration = null
        this.timeDurationDirty = true
        delete this.eventDefinition.timeDuration
        delete this.eventDefinition.timeCycle
        this.updateElementExtensions()
        this.updateEventDefinition()
      }
    },
    onTimeoutHandlerTypeChanged(value) {
      this.timeoutHandlerType = asNumber(value, 1)
      if (this.timeoutHandlerTypeEl) this.timeoutHandlerTypeEl.value = this.timeoutHandlerType
      this.maxRemindCount = 1
      this.updateTimer()
    },
    onTimeUnitChange(value) {
      this.timeUnit = asNumber(value, TimeUnitType.HOUR)
      if (this.timeUnit === TimeUnitType.MINUTE) this.timeDuration = 60
      if (this.timeUnit === TimeUnitType.HOUR) this.timeDuration = 6
      if (this.timeUnit === TimeUnitType.DAY) this.timeDuration = 1
      this.rawTimeDuration = null
      this.timeDurationDirty = true
      this.updateTimer()
    },
    onTimeDurationChange() {
      this.rawTimeDuration = null
      this.timeDurationDirty = true
      this.updateTimer()
    },
    isoTimeDuration() {
      if (!this.timeDurationDirty && this.rawTimeDuration) return this.rawTimeDuration
      const amount = Math.max(1, Number(this.timeDuration) || 1)
      if (this.timeUnit === TimeUnitType.MINUTE) return `PT${amount}M`
      if (this.timeUnit === TimeUnitType.DAY) return `P${amount}D`
      return `PT${amount}H`
    },
    updateTimer() {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle || !this.element || !this.eventDefinition) return
      if (!this.timeoutHandlerEnable) return
      this.boundaryEventTypeEl =
        this.boundaryEventTypeEl || instance.moddle.create(`${this.prefix}:BoundaryEventType`, { value: 1 })
      this.boundaryEventTypeEl.value = 1
      this.timeoutHandlerTypeEl =
        this.timeoutHandlerTypeEl || instance.moddle.create(`${this.prefix}:TimeoutHandlerType`, { value: 1 })
      this.timeoutHandlerTypeEl.value = asNumber(this.timeoutHandlerType, 1)
      const body = this.isoTimeDuration()
      const expressionBody = this.maxRemindCount > 1 ? `R${this.maxRemindCount}/${body}` : body
      const expression = (instance.bpmnFactory || instance.moddle).create
        ? (instance.bpmnFactory || instance.moddle).create('bpmn:FormalExpression', { body: expressionBody })
        : null
      if (!expression) return
      if (this.maxRemindCount > 1) {
        delete this.eventDefinition.timeDuration
        this.eventDefinition.timeCycle = expression
      } else {
        delete this.eventDefinition.timeCycle
        this.eventDefinition.timeDuration = expression
      }
      this.updateEventDefinition()
      this.updateElementExtensions()
    },
    updateEventDefinition() {
      const instance = this.bpmn()
      if (!instance || !instance.modeling || !this.element || !this.eventDefinition) return
      instance.modeling.updateProperties(this.element, { eventDefinitions: [this.eventDefinition] })
    },
    updateElementExtensions() {
      const instance = this.bpmn()
      if (!this.supportsFlowableExtensions || !instance || !instance.moddle || !instance.modeling || !this.element) return
      const values = [...(this.otherExtensions || [])]
      if (this.timeoutHandlerEnable) {
        if (this.boundaryEventTypeEl) values.push(this.boundaryEventTypeEl)
        if (this.timeoutHandlerTypeEl) values.push(this.timeoutHandlerTypeEl)
      }
      const extensionElements = instance.moddle.create('bpmn:ExtensionElements', { values })
      instance.modeling.updateProperties(this.element, { extensionElements })
      this.extensionElements = extensionElements
    }
  }
}
</script>

<style scoped>
.time-prefix {
  margin-right: 6px;
}

.time-number,
.time-unit {
  width: 110px;
  margin-right: 6px;
}
</style>
