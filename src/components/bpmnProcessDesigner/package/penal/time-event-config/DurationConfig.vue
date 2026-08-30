<template>
  <div class="duration-config">
    <div class="duration-config__current">
      当前选择：<el-input v-model="isoString" readonly style="width: 300px" />
    </div>
    <div v-for="unit in units" :key="unit.key" class="duration-config__unit">
      <span>{{ unit.label }}：</span>
      <el-button-group>
        <el-button
          v-for="preset in unit.presets"
          :key="preset"
          size="small"
          @click="setUnit(unit.key, preset)"
        >
          {{ preset }}
        </el-button>
        <el-input
          v-model.number="custom[unit.key]"
          size="small"
          style="width: 70px; margin-left: 8px"
          placeholder="自定义"
          @change="setUnit(unit.key, custom[unit.key])"
        />
      </el-button-group>
    </div>
  </div>
</template>

<script>
const createEmptyDuration = () => ({ Y: "", M: "", D: "", H: "", m: "", S: "" });

export default {
  name: "DurationConfig",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      units: [
        { key: "Y", label: "年", presets: [1, 2, 3, 4] },
        { key: "M", label: "月", presets: [1, 2, 3, 4] },
        { key: "D", label: "天", presets: [1, 2, 3, 4] },
        { key: "H", label: "时", presets: [4, 8, 12, 24] },
        { key: "m", label: "分", presets: [5, 10, 30, 50] },
        { key: "S", label: "秒", presets: [5, 10, 30, 50] }
      ],
      custom: createEmptyDuration(),
      isoString: "",
      syncingValue: false
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.syncFromValue(value);
      }
    }
  },
  methods: {
    setUnit(key, value) {
      const numericValue = Number(value);
      if (!numericValue || Number.isNaN(numericValue)) {
        this.$set(this.custom, key, "");
      } else {
        this.$set(this.custom, key, numericValue);
      }
      this.updateIsoString();
    },
    syncFromValue(value) {
      this.syncingValue = true;
      this.custom = createEmptyDuration();
      this.isoString = value || "";
      if (value) {
        const match = value.match(
          /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
        );
        if (match) {
          this.custom = {
            Y: match[1] || "",
            M: match[2] || "",
            D: match[3] || "",
            H: match[4] || "",
            m: match[5] || "",
            S: match[6] || ""
          };
          this.isoString = this.buildIsoString();
        }
      }
      this.$nextTick(() => {
        this.syncingValue = false;
      });
    },
    buildIsoString() {
      let value = "P";
      if (this.custom.Y) value += `${this.custom.Y}Y`;
      if (this.custom.M) value += `${this.custom.M}M`;
      if (this.custom.D) value += `${this.custom.D}D`;
      if (this.custom.H || this.custom.m || this.custom.S) value += "T";
      if (this.custom.H) value += `${this.custom.H}H`;
      if (this.custom.m) value += `${this.custom.m}M`;
      if (this.custom.S) value += `${this.custom.S}S`;
      return value === "P" ? "" : value;
    },
    updateIsoString() {
      this.isoString = this.buildIsoString();
      if (!this.syncingValue) {
        this.$emit("change", this.isoString);
      }
    }
  }
};
</script>

<style scoped>
.duration-config__current {
  margin-bottom: 10px;
}

.duration-config__unit {
  margin-bottom: 8px;
}
</style>
