<template>
  <div class="panel-tab__content time-event-config">
    <div class="time-event-config__type">
      <span>类型：</span>
      <el-button-group>
        <el-button size="small" :type="type === 'time' ? 'primary' : ''" @click="setType('time')">
          时间
        </el-button>
        <el-button
          size="small"
          :type="type === 'duration' ? 'primary' : ''"
          @click="setType('duration')"
        >
          持续
        </el-button>
        <el-button size="small" :type="type === 'cycle' ? 'primary' : ''" @click="setType('cycle')">
          循环
        </el-button>
      </el-button-group>
      <i v-if="valid" class="el-icon-success time-event-config__valid" />
    </div>

    <div class="time-event-config__condition">
      <span>条件：</span>
      <el-input
        v-model="condition"
        :placeholder="placeholder"
        :readonly="type === 'time'"
        @focus="handleInputFocus"
        @blur="updateNode"
      >
        <span slot="suffix" class="time-event-config__suffix">
          <el-tooltip v-if="!valid" content="格式错误" placement="top">
            <i class="el-icon-warning-outline time-event-config__warning" />
          </el-tooltip>
          <el-tooltip :content="helpText" placement="top">
            <i class="el-icon-question time-event-config__help" @click.stop="showHelp = true" />
          </el-tooltip>
          <el-button
            v-if="type === 'time'"
            type="text"
            icon="el-icon-date"
            @click.stop="showDatePicker = true"
          />
          <el-button
            v-if="type === 'duration'"
            type="text"
            icon="el-icon-timer"
            @click.stop="showDurationDialog = true"
          />
          <el-button
            v-if="type === 'cycle'"
            type="text"
            icon="el-icon-setting"
            @click.stop="showCycleDialog = true"
          />
        </span>
      </el-input>
    </div>

    <el-dialog
      title="选择时间"
      width="400px"
      append-to-body
      :visible.sync="showDatePicker"
    >
      <el-date-picker
        v-model="dateValue"
        type="datetime"
        placeholder="选择日期时间"
        style="width: 100%"
        @change="onDateChange"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDatePicker = false">取消</el-button>
        <el-button type="primary" @click="onDateConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="时间配置"
      width="600px"
      append-to-body
      :visible.sync="showDurationDialog"
    >
      <duration-config :value="condition" @change="onDurationChange" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDurationDialog = false">取消</el-button>
        <el-button type="primary" @click="onDurationConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="时间配置"
      width="800px"
      append-to-body
      :visible.sync="showCycleDialog"
    >
      <cycle-config :value="condition" @change="onCycleChange" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCycleDialog = false">取消</el-button>
        <el-button type="primary" @click="onCycleConfirm">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="格式说明" width="600px" append-to-body :visible.sync="showHelp">
      <div v-html="helpHtml" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="showHelp = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DurationConfig from "./DurationConfig.vue";
import CycleConfig from "./CycleConfig.vue";

const getBpmnInstances = () => {
  if (typeof window === "undefined") return null;
  return window.bpmnInstances || null;
};

export default {
  name: "TimeEventConfig",
  components: {
    DurationConfig,
    CycleConfig
  },
  props: {
    businessObject: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      type: "time",
      condition: "",
      showDatePicker: false,
      showDurationDialog: false,
      showCycleDialog: false,
      showHelp: false,
      dateValue: null
    };
  },
  computed: {
    placeholder() {
      if (this.type === "time") return "请选择时间";
      if (this.type === "duration") return "请输入持续时长";
      if (this.type === "cycle") return "请输入循环表达式";
      return "";
    },
    helpText() {
      if (this.type === "time") return "选择具体时间";
      if (this.type === "duration") return "ISO 8601 格式，如 PT1H";
      if (this.type === "cycle") return "CRON 表达式或 ISO 8601 周期";
      return "";
    },
    helpHtml() {
      if (this.type === "duration") {
        return "指定定时器触发前要等待多长时间。P 是开始标记，T 是日期与时间的分隔标记。<br>" +
          "例如，一年两个月三天四小时五分六秒可写为 P1Y2M3DT4H5M6S；一小时写为 PT1H。";
      }
      if (this.type === "cycle") {
        return "支持 CRON 表达式（如 0 0/30 * * * ?）或 ISO 8601 周期（如 R3/PT10M）。";
      }
      return "选择一个明确的日期和时间，保存时会转换为 ISO 8601 时间字符串。";
    },
    valid() {
      return this.validate();
    }
  },
  watch: {
    businessObject: {
      immediate: true,
      deep: true,
      handler(value) {
        if (!value) return;
        this.$nextTick(() => this.syncFromBusinessObject());
      }
    }
  },
  methods: {
    syncFromBusinessObject() {
      const businessObject = this.businessObject || {};
      const timerDefinition = (businessObject.eventDefinitions || [])[0];
      this.condition = "";
      this.dateValue = null;
      if (!timerDefinition) return;
      if (timerDefinition.timeDate) {
        this.type = "time";
        this.condition = timerDefinition.timeDate.body || "";
        const timestamp = Date.parse(this.condition);
        if (!Number.isNaN(timestamp)) this.dateValue = new Date(timestamp);
      } else if (timerDefinition.timeDuration) {
        this.type = "duration";
        this.condition = timerDefinition.timeDuration.body || "";
      } else if (timerDefinition.timeCycle) {
        this.type = "cycle";
        this.condition = timerDefinition.timeCycle.body || "";
      }
    },
    setType(type) {
      if (this.type === type) return;
      this.type = type;
      this.condition = "";
      this.dateValue = null;
      this.updateNode();
    },
    validate() {
      if (this.type === "time") {
        return Boolean(this.condition) && !Number.isNaN(Date.parse(this.condition));
      }
      if (this.type === "duration") {
        return /^P.+$/.test(this.condition);
      }
      if (this.type === "cycle") {
        return /^(?:[0-9A-Za-z*\/?,#LW\- ]+|R\d*\/P.*|R\d*\/[^/]+\/P.*)$/.test(this.condition);
      }
      return true;
    },
    onDateChange(value) {
      this.dateValue = value;
    },
    onDateConfirm() {
      if (!this.dateValue) return;
      const date = new Date(this.dateValue);
      if (Number.isNaN(date.getTime())) return;
      this.condition = date.toISOString();
      this.showDatePicker = false;
      this.updateNode();
    },
    onDurationChange(value) {
      this.condition = value;
    },
    onDurationConfirm() {
      this.showDurationDialog = false;
      this.updateNode();
    },
    onCycleChange(value) {
      this.condition = value;
    },
    onCycleConfirm() {
      this.showCycleDialog = false;
      this.updateNode();
    },
    handleInputFocus() {
      if (this.type === "time") this.showDatePicker = true;
      if (this.type === "duration") this.showDurationDialog = true;
      if (this.type === "cycle") this.showCycleDialog = true;
    },
    createBpmnObject(instances, type, properties) {
      if (instances.bpmnFactory && typeof instances.bpmnFactory.create === "function") {
        return instances.bpmnFactory.create(type, properties || {});
      }
      if (instances.moddle && typeof instances.moddle.create === "function") {
        return instances.moddle.create(type, properties || {});
      }
      return null;
    },
    updateNode() {
      const instances = getBpmnInstances();
      if (!instances || !instances.modeling || !instances.elementRegistry) return;
      if (!this.businessObject || !this.businessObject.id) return;

      const element = instances.elementRegistry.get(this.businessObject.id);
      if (!element || !element.businessObject) return;

      let timerDefinition = (element.businessObject.eventDefinitions || [])[0];
      if (!timerDefinition) {
        timerDefinition = this.createBpmnObject(instances, "bpmn:TimerEventDefinition", {});
      }
      if (!timerDefinition) return;

      delete timerDefinition.timeDate;
      delete timerDefinition.timeDuration;
      delete timerDefinition.timeCycle;

      if (this.condition) {
        const expression = this.createBpmnObject(instances, "bpmn:FormalExpression", {
          body: this.condition
        });
        if (!expression) return;
        if (this.type === "time") timerDefinition.timeDate = expression;
        if (this.type === "duration") timerDefinition.timeDuration = expression;
        if (this.type === "cycle") timerDefinition.timeCycle = expression;
      }

      instances.modeling.updateProperties(element, {
        eventDefinitions: [timerDefinition]
      });
    }
  }
};
</script>

<style scoped>
.time-event-config__type {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.time-event-config__valid {
  margin-left: 8px;
  color: #67c23a;
}

.time-event-config__condition {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.time-event-config__condition > .el-input {
  width: calc(100% - 52px);
}

.time-event-config__suffix {
  display: inline-flex;
  align-items: center;
  height: 100%;
  gap: 5px;
}

.time-event-config__warning {
  color: #e6a23c;
}

.time-event-config__help {
  color: #409eff;
  cursor: pointer;
}

.time-event-config__suffix ::v-deep .el-button {
  padding: 0;
}
</style>
