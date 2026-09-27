<template>
  <div class="oa-vehicle-select">
    <!-- 已选车辆 -->
    <el-input
      :value="(selectedItem && selectedItem.no) || ''"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly
      @click="openSelect"
      @keydown.enter.native.prevent="openSelect"
    >
      <i
        v-if="clearable && !disabled && value != null"
        slot="suffix"
        class="el-input__icon el-icon-circle-close clear-icon"
        aria-label="清空车辆"
        @click.stop="handleClear"
      />
      <i v-else slot="suffix" class="el-input__icon el-icon-search" />
    </el-input>
    <!-- 车辆选择弹窗 -->
    <oa-vehicle-select-dialog ref="selectDialog" @selected="handleSelected" />
  </div>
</template>

<script>
import OaVehicleSelectDialog from './OaVehicleSelectDialog.vue'

export default {
  name: 'OaVehicleSelect',
  components: { OaVehicleSelectDialog },
  props: {
    value: {
      type: Number,
      default: undefined
    },
    selectedVehicle: {
      type: Object,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请选择车辆'
    }
  },
  data() {
    return {
      currentVehicle: undefined
    }
  },
  computed: {
    selectedItem() {
      if (this.currentVehicle && this.currentVehicle.id === this.value) {
        return this.currentVehicle
      }
      if (this.selectedVehicle && this.selectedVehicle.id === this.value) {
        return this.selectedVehicle
      }
      return undefined
    }
  },
  methods: {
    // 打开选择弹窗
    openSelect() {
      if (this.disabled) {
        return
      }
      this.$refs.selectDialog.open(this.selectedItem)
    },
    // 确认选择
    handleSelected(item) {
      this.currentVehicle = item
      this.$emit('input', item.id)
      this.$emit('change', item)
      this.validateFormItem()
    },
    // 清空选择
    handleClear() {
      this.currentVehicle = undefined
      this.$emit('input', undefined)
      this.$emit('change', undefined)
      this.validateFormItem()
    },
    // 选择或清空后触发表单校验
    validateFormItem() {
      let parent = this.$parent
      while (parent) {
        if (parent.$options.name === 'ElFormItem') {
          try {
            const result = parent.validate('change', () => {})
            if (result && typeof result.catch === 'function') {
              result.catch(() => {})
            }
          } catch (e) {
            // 忽略校验异常，由提交时的整体校验兜底
          }
          return
        }
        parent = parent.$parent
      }
    }
  }
}
</script>

<style scoped>
.oa-vehicle-select {
  width: 100%;
}

.clear-icon {
  cursor: pointer;
}
</style>
