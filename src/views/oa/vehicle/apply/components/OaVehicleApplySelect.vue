<template>
  <div class="oa-vehicle-apply-select">
    <!-- 已选申请 -->
    <el-input
      :value="selectedItem ? selectedItem.no + ' / ' + selectedItem.vehicleNo : ''"
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
        aria-label="清空用车申请"
        @click.stop="handleClear"
      />
      <i v-else slot="suffix" class="el-input__icon el-icon-search" />
    </el-input>
    <!-- 用车申请选择弹窗 -->
    <oa-vehicle-apply-select-dialog
      ref="selectDialog"
      :status="status"
      :return-status="returnStatus"
      @selected="handleSelected"
    />
  </div>
</template>

<script>
import * as VehicleApplyApi from '@/api/oa/vehicle/apply'
import OaVehicleApplySelectDialog from './OaVehicleApplySelectDialog.vue'

export default {
  name: 'OaVehicleApplySelect',
  components: { OaVehicleApplySelectDialog },
  props: {
    value: {
      type: Number,
      default: undefined
    },
    status: {
      type: Number,
      default: undefined
    },
    returnStatus: {
      type: Number,
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
      default: '请选择用车申请单'
    }
  },
  data() {
    return {
      selectedItem: undefined
    }
  },
  watch: {
    // 根据申请编号回显，选择或清空后触发表单校验
    value: {
      handler(id, oldId) {
        if (id == null) {
          this.selectedItem = undefined
        } else if (!this.selectedItem || this.selectedItem.id !== id) {
          this.selectedItem = undefined
          VehicleApplyApi.getVehicleApply(id).then(response => {
            // 编辑对象切换时，不回填上一次请求的结果
            if (this.value === id) {
              this.selectedItem = response.data
            }
          })
        }
        if (id !== oldId) {
          this.validateFormItem()
        }
      },
      immediate: true
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
      this.selectedItem = item
      this.$emit('input', item.id)
      this.$emit('change', item)
      this.validateFormItem()
    },
    // 清空选择
    handleClear() {
      this.selectedItem = undefined
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
.oa-vehicle-apply-select {
  width: 100%;
}

.clear-icon {
  cursor: pointer;
}
</style>
