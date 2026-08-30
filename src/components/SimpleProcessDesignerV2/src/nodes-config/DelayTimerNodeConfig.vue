<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    :append-to-body="true"
    size="550px"
    :before-close="handleBeforeClose"
  >
    <div class="delay-config">
      <el-form ref="form" :model="draft" :rules="rules" label-position="top" size="small">
        <el-form-item label="节点名称" prop="name">
          <el-input v-model="draft.name" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="延迟时间" prop="delayType">
          <el-radio-group v-model="draft.delayType" @change="changeDelayType">
            <el-radio-button v-for="item in delayTypes" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="Number(draft.delayType) === DelayTypeEnum.FIXED_TIME_DURATION">
          <el-form-item label="延迟时长" prop="timeDuration">
            <el-input-number v-model="draft.timeDuration" :min="1" :precision="0" controls-position="right" />
            <el-select v-model="draft.timeUnit" class="unit-select">
              <el-option v-for="item in timeUnitTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <span class="suffix">后进入下一节点</span>
          </el-form-item>
        </template>
        <el-form-item v-else label="目标日期时间" prop="dateTime">
          <el-date-picker
            v-model="draft.dateTime"
            type="datetime"
            value-format="yyyy-MM-dd'T'HH:mm:ss"
            placeholder="请选择日期和时间"
            style="width: 100%"
          />
          <span class="suffix">后进入下一节点</span>
        </el-form-item>
      </el-form>
      <el-alert
        title="延迟配置会写入 delaySetting.delayType/delayTime，兼容后端仿真模型契约。"
        type="info"
        :closable="false"
        show-icon
      />
    </div>
    <div class="drawer-footer">
      <el-button @click="cancelConfig">取 消</el-button>
      <el-button type="primary" @click="saveConfig">确 定</el-button>
    </div>
  </el-drawer>
</template>

<script>
import { DELAY_TYPE, DelayTypeEnum, TIME_UNIT_TYPES, TimeUnitType, NodeType, NODE_DEFAULT_NAME } from '../consts'
import { durationToIso, normalizeDateTime, parseIsoDuration, clone } from './components/node-config-utils'
import { normalizeDelaySetting } from './node-config-schema'

export default {
  name: 'DelayTimerNodeConfig',
  props: {
    flowNode: { type: Object, required: true }
  },
  data() {
    return {
      visible: false,
      draft: this.createDraft(this.flowNode),
      delayTypes: DELAY_TYPE,
      timeUnitTypes: TIME_UNIT_TYPES,
      DelayTypeEnum,
      TimeUnitType,
      rules: {
        delayType: [{ required: true, message: '延迟类型不能为空', trigger: 'change' }],
        timeDuration: [{ required: true, type: 'number', min: 1, message: '延迟时长必须大于 0', trigger: 'change' }],
        dateTime: [{ required: true, message: '目标日期时间不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    drawerTitle() { return `${this.draft.name || NODE_DEFAULT_NAME.get(NodeType.DELAY_TIMER_NODE)}配置` }
  },
  watch: {
    flowNode: {
      deep: true,
      handler(value) { if (!this.visible && value) this.draft = this.createDraft(value) }
    }
  },
  methods: {
    createDraft(node) {
      // Imported models may still carry the pre-Vue3 flat names
      // (timeDuration/timeUnit/dateTime). Normalize a cloned value before
      // reading it so merely opening the drawer cannot silently reset the
      // legacy delay to the default one-hour duration.
      const rawSetting = node && node.delaySetting ? clone(node.delaySetting) : {}
      const setting = normalizeDelaySetting(rawSetting) || {}
      const type = Number(setting.delayType) || DelayTypeEnum.FIXED_TIME_DURATION
      const parsed = parseIsoDuration(setting.delayTime)
      return {
        name: node && node.name ? node.name : NODE_DEFAULT_NAME.get(NodeType.DELAY_TIMER_NODE),
        delayType: type,
        timeDuration: parsed.duration,
        timeUnit: parsed.unit,
        dateTime: type === DelayTypeEnum.FIXED_DATE_TIME ? normalizeDateTime(setting.delayTime) : ''
      }
    },
    showDelayTimerNodeConfig(node) {
      this.draft = this.createDraft(node || this.flowNode)
      this.visible = false
    },
    openDrawer() { this.visible = true },
    changeDelayType(type) {
      if (Number(type) === DelayTypeEnum.FIXED_TIME_DURATION && !this.draft.timeDuration) this.draft.timeDuration = 1
      if (Number(type) === DelayTypeEnum.FIXED_DATE_TIME && !this.draft.dateTime) this.draft.dateTime = ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    validateDraft() {
      if (!this.draft.name || !String(this.draft.name).trim()) return '节点名称不能为空'
      if (!this.draft.delayType) return '延迟类型不能为空'
      if (Number(this.draft.delayType) === DelayTypeEnum.FIXED_TIME_DURATION) {
        if (Number(this.draft.timeDuration) <= 0) return '延迟时长必须大于 0'
      } else if (!String(this.draft.dateTime || '').trim()) {
        return '目标日期时间不能为空'
      }
      return ''
    },
    saveConfig() {
      const error = this.validateDraft()
      if (error) {
        this.$message.warning(error)
        return false
      }
      const type = Number(this.draft.delayType)
      const delayTime = type === DelayTypeEnum.FIXED_TIME_DURATION
        ? durationToIso(this.draft.timeDuration, this.draft.timeUnit)
        : normalizeDateTime(this.draft.dateTime)
      this.$set(this.flowNode, 'name', String(this.draft.name).trim())
      this.$set(this.flowNode, 'delaySetting', { delayType: type, delayTime })
      const unit = this.timeUnitTypes.find((item) => Number(item.value) === Number(this.draft.timeUnit))
      this.$set(this.flowNode, 'showText', type === DelayTypeEnum.FIXED_TIME_DURATION
        ? `延迟${this.draft.timeDuration}${unit ? unit.label : ''}`
        : `延迟至${delayTime.replace('T', ' ')}`)
      this.visible = false
      return true
    },
    cancelConfig() { this.visible = false },
    async handleBeforeClose(done) {
      if (this.saveConfig()) done()
    },
    // Exposed for static/unit checks and callers that need a detached DTO.
    getDraftSetting() {
      const type = Number(this.draft.delayType)
      return clone({ delayType: type, delayTime: type === DelayTypeEnum.FIXED_TIME_DURATION
        ? durationToIso(this.draft.timeDuration, this.draft.timeUnit) : normalizeDateTime(this.draft.dateTime) })
    }
  }
}
</script>

<style scoped>
.delay-config { padding: 0 20px 70px; }
.unit-select { width: 110px; margin-left: 8px; }
.suffix { margin-left: 8px; color: #606266; }
.drawer-footer { position: absolute; right: 0; bottom: 0; left: 0; padding: 12px 20px; text-align: right; background: #fff; border-top: 1px solid #ebeef5; }
</style>
