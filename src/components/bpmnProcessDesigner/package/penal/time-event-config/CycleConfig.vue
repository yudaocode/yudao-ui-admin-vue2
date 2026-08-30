<template>
  <el-tabs v-model="tab" class="cycle-config">
    <el-tab-pane label="CRON表达式" name="cron">
      <div class="cycle-config__row">
        <el-input v-model="cronStr" readonly style="width: 100%; font-weight: bold" />
      </div>
      <div class="cycle-config__fields">
        <el-input v-model="fields.second" placeholder="秒" />
        <el-input v-model="fields.minute" placeholder="分" />
        <el-input v-model="fields.hour" placeholder="时" />
        <el-input v-model="fields.day" placeholder="天" />
        <el-input v-model="fields.month" placeholder="月" />
        <el-input v-model="fields.week" placeholder="周" />
        <el-input v-model="fields.year" placeholder="年" />
      </div>
      <el-tabs v-model="activeField" type="card" class="cycle-config__field-tabs">
        <el-tab-pane
          v-for="field in cronFieldList"
          :key="field.key"
          :label="field.label"
          :name="field.key"
        >
          <el-radio-group v-model="cronMode[field.key]" class="cycle-config__modes">
            <el-radio label="every">每{{ field.label }}</el-radio>
            <el-radio label="range">
              从
              <el-input-number
                v-model="cronRange[field.key][0]"
                :min="field.min"
                :max="field.max"
                size="small"
              />
              到
              <el-input-number
                v-model="cronRange[field.key][1]"
                :min="field.min"
                :max="field.max"
                size="small"
              />
              之间每{{ field.label }}
            </el-radio>
            <el-radio label="step">
              从第
              <el-input-number
                v-model="cronStep[field.key][0]"
                :min="field.min"
                :max="field.max"
                size="small"
              />
              开始每
              <el-input-number
                v-model="cronStep[field.key][1]"
                :min="1"
                :max="field.max"
                size="small"
              />
              {{ field.label }}
            </el-radio>
            <el-radio label="appoint">指定</el-radio>
          </el-radio-group>
          <el-checkbox-group
            v-if="cronMode[field.key] === 'appoint'"
            v-model="cronAppoint[field.key]"
            class="cycle-config__appoint"
          >
            <el-checkbox
              v-for="value in appointValues(field)"
              :key="`${field.key}-${value}`"
              :label="pad(value)"
            >
              {{ pad(value) }}
            </el-checkbox>
          </el-checkbox-group>
        </el-tab-pane>
      </el-tabs>
    </el-tab-pane>

    <el-tab-pane label="标准格式" name="iso">
      <div class="cycle-config__row">
        <el-input
          v-model="isoStr"
          placeholder="如 R1/2025-05-21T21:59:54/P3DT30M30S"
          style="width: 100%; font-weight: bold"
          @input="emitIsoString"
        />
      </div>
      <div class="cycle-config__row">
        循环次数：
        <el-input-number v-model="repeat" :min="1" style="width: 120px" />
      </div>
      <div class="cycle-config__row">
        日期时间：
        <el-date-picker
          v-model="isoDate"
          type="datetime"
          placeholder="选择日期时间"
          style="width: 240px"
        />
      </div>
      <div class="cycle-config__row">
        当前时长：
        <el-input v-model="isoDuration" placeholder="如 P3DT30M30S" style="width: 240px" />
      </div>
      <div class="cycle-config__presets">
        <div>
          秒：<el-button
            v-for="second in [5, 10, 30, 50]"
            :key="`second-${second}`"
            size="small"
            @click="setDuration('S', second, true)"
          >{{ second }}</el-button>
        </div>
        <div>
          分：<el-button
            v-for="minute in [5, 10, 30, 50]"
            :key="`minute-${minute}`"
            size="small"
            @click="setDuration('M', minute, true)"
          >{{ minute }}</el-button>
        </div>
        <div>
          小时：<el-button
            v-for="hour in [4, 8, 12, 24]"
            :key="`hour-${hour}`"
            size="small"
            @click="setDuration('H', hour, true)"
          >{{ hour }}</el-button>
        </div>
        <div>
          天：<el-button
            v-for="day in [1, 2, 3, 4]"
            :key="`day-${day}`"
            size="small"
            @click="setDuration('D', day, false)"
          >{{ day }}</el-button>
        </div>
        <div>
          月：<el-button
            v-for="month in [1, 2, 3, 4]"
            :key="`month-${month}`"
            size="small"
            @click="setDuration('M', month, false)"
          >{{ month }}</el-button>
        </div>
        <div>
          年：<el-button
            v-for="year in [1, 2, 3, 4]"
            :key="`year-${year}`"
            size="small"
            @click="setDuration('Y', year, false)"
          >{{ year }}</el-button>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
const CRON_FIELD_LIST = [
  { key: "second", label: "秒", min: 0, max: 59 },
  { key: "minute", label: "分", min: 0, max: 59 },
  { key: "hour", label: "时", min: 0, max: 23 },
  { key: "day", label: "天", min: 1, max: 31 },
  { key: "month", label: "月", min: 1, max: 12 },
  { key: "week", label: "周", min: 1, max: 7 },
  { key: "year", label: "年", min: 1970, max: 2099 }
];

const createFields = () => ({
  second: "*",
  minute: "*",
  hour: "*",
  day: "*",
  month: "*",
  week: "?",
  year: ""
});

const createModes = () => ({
  second: "every",
  minute: "every",
  hour: "every",
  day: "every",
  month: "every",
  week: "every",
  year: "every"
});

const createAppoints = () => ({
  second: [],
  minute: [],
  hour: [],
  day: [],
  month: [],
  week: [],
  year: []
});

const createRanges = () => ({
  second: [0, 1],
  minute: [0, 1],
  hour: [0, 1],
  day: [1, 2],
  month: [1, 2],
  week: [1, 2],
  year: [1970, 1971]
});

const createSteps = () => ({
  second: [0, 1],
  minute: [0, 1],
  hour: [0, 1],
  day: [1, 1],
  month: [1, 1],
  week: [1, 1],
  year: [1970, 1]
});

export default {
  name: "CycleConfig",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      tab: "cron",
      cronStr: "* * * * * ?",
      fields: createFields(),
      cronFieldList: CRON_FIELD_LIST,
      activeField: "second",
      cronMode: createModes(),
      cronAppoint: createAppoints(),
      cronRange: createRanges(),
      cronStep: createSteps(),
      isoStr: "",
      repeat: 1,
      isoDate: "",
      isoDuration: "",
      syncingValue: false
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.syncFromValue(value);
      }
    },
    fields: {
      deep: true,
      handler() {
        this.buildCron();
      }
    },
    cronMode: {
      deep: true,
      handler() {
        this.buildCron();
      }
    },
    cronAppoint: {
      deep: true,
      handler() {
        this.buildCron();
      }
    },
    cronRange: {
      deep: true,
      handler() {
        this.buildCron();
      }
    },
    cronStep: {
      deep: true,
      handler() {
        this.buildCron();
      }
    },
    repeat() {
      this.updateIsoStr();
    },
    isoDate() {
      this.updateIsoStr();
    },
    isoDuration() {
      this.updateIsoStr();
    },
    tab(value) {
      if (this.syncingValue) return;
      this.$emit("change", value === "cron" ? this.cronStr : this.isoStr);
    }
  },
  methods: {
    pad(value) {
      return Number(value) < 10 ? `0${Number(value)}` : String(value);
    },
    appointValues(field) {
      const result = [];
      for (let value = field.min; value <= field.max; value += 1) {
        result.push(value);
      }
      return result;
    },
    tokenForField(field) {
      const key = field.key;
      const mode = this.cronMode[key];
      if (mode === "appoint") return this.cronAppoint[key].join(",") || "*";
      if (mode === "range") return `${this.cronRange[key][0]}-${this.cronRange[key][1]}`;
      if (mode === "step") return `${this.cronStep[key][0]}/${this.cronStep[key][1]}`;
      if (key === "week") return this.fields.week === "*" ? "*" : "?";
      if (key === "year") return this.fields.year || "";
      return "*";
    },
    buildCron() {
      if (this.syncingValue) return;
      const tokens = this.cronFieldList.map(field => this.tokenForField(field));
      if (!tokens[6]) tokens.pop();
      this.cronStr = tokens.join(" ");
      if (this.tab === "cron") this.$emit("change", this.cronStr);
    },
    parseCron(value) {
      const tokens = String(value).trim().split(/\s+/);
      if (tokens.length < 6 || tokens.length > 7) return;
      this.fields = createFields();
      this.cronMode = createModes();
      this.cronAppoint = createAppoints();
      this.cronRange = createRanges();
      this.cronStep = createSteps();
      this.cronFieldList.forEach((field, index) => {
        if (index >= tokens.length) return;
        const token = tokens[index];
        this.$set(this.fields, field.key, token);
        if (token === "*" || token === "?" || token === "") {
          this.$set(this.cronMode, field.key, "every");
        } else if (token.includes("/")) {
          this.$set(this.cronMode, field.key, "step");
          this.$set(this.cronStep, field.key, token.split("/").map(item => Number(item)));
        } else if (token.includes("-") && !token.startsWith("-")) {
          this.$set(this.cronMode, field.key, "range");
          this.$set(this.cronRange, field.key, token.split("-").map(item => Number(item)));
        } else {
          this.$set(this.cronMode, field.key, "appoint");
          this.$set(this.cronAppoint, field.key, token.split(","));
        }
      });
    },
    syncFromValue(value) {
      this.syncingValue = true;
      if (!value) {
        this.tab = "cron";
        this.cronStr = "* * * * * ?";
        this.isoStr = "";
      } else if (/^R\d*(?:\/|$)/.test(value)) {
        this.tab = "iso";
        this.isoStr = value;
        this.parseIso(value);
      } else {
        this.tab = "cron";
        this.cronStr = value;
        this.parseCron(value);
      }
      this.$nextTick(() => {
        this.syncingValue = false;
      });
    },
    parseIso(value) {
      const parts = String(value).split("/");
      const repeatMatch = (parts[0] || "").match(/^R(\d*)$/);
      this.repeat = repeatMatch && repeatMatch[1] ? Number(repeatMatch[1]) : 1;
      this.isoDate = "";
      this.isoDuration = "";
      if (parts.length === 2 && /^P/.test(parts[1])) {
        this.isoDuration = parts[1];
      } else {
        this.isoDate = parts[1] || "";
        this.isoDuration = parts[2] || "";
      }
    },
    setDuration(type, value, timePart) {
      let duration = this.isoDuration || "P";
      const sections = duration.split("T");
      let dateSection = sections[0] || "P";
      let timeSection = sections[1] || "";
      // Keep the two-argument API used by the Vue3 component intuitive for
      // callers that add minutes to an existing time portion. The template
      // passes the explicit flag because ISO uses M for both month and minute.
      if (timePart === undefined) timePart = duration.indexOf("T") !== -1;
      const expression = new RegExp(`\\d+${type}`);
      if (timePart) {
        timeSection = expression.test(timeSection)
          ? timeSection.replace(expression, `${value}${type}`)
          : `${timeSection}${value}${type}`;
      } else {
        dateSection = expression.test(dateSection)
          ? dateSection.replace(expression, `${value}${type}`)
          : `${dateSection}${value}${type}`;
      }
      this.isoDuration = `${dateSection}${timeSection ? `T${timeSection}` : ""}`;
      this.updateIsoStr();
    },
    updateIsoStr() {
      if (this.syncingValue) return;
      let value = `R${this.repeat}`;
      if (this.isoDate) {
        const date = typeof this.isoDate === "string" ? this.isoDate : new Date(this.isoDate).toISOString();
        value += `/${date}`;
      }
      if (this.isoDuration) value += `/${this.isoDuration}`;
      this.isoStr = value;
      if (this.tab === "iso") this.$emit("change", value);
    },
    emitIsoString(value) {
      if (!this.syncingValue && this.tab === "iso") this.$emit("change", value);
    }
  }
};
</script>

<style scoped>
.cycle-config__row {
  margin-bottom: 10px;
}

.cycle-config__fields {
  display: grid;
  grid-template-columns: repeat(7, minmax(64px, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.cycle-config__field-tabs {
  margin-bottom: 8px;
}

.cycle-config__modes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.cycle-config__modes ::v-deep .el-radio {
  margin-right: 0;
}

.cycle-config__modes ::v-deep .el-input-number {
  width: 88px;
  margin: 0 4px;
}

.cycle-config__appoint {
  max-height: 180px;
  overflow: auto;
}

.cycle-config__appoint ::v-deep .el-checkbox {
  min-width: 58px;
  margin-right: 10px;
}

.cycle-config__presets > div {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
</style>
