<template>
  <el-form label-width="80px" :model="formData">
    <el-form-item label="高度" prop="height">
      <el-slider v-model="formData.height" :min="1" :max="100" show-input input-size="small" />
    </el-form-item>
    <el-form-item label="选择样式" prop="borderType">
      <el-radio-group v-model="formData.borderType">
        <el-tooltip
          v-for="(item, index) in borderTypes"
          :key="index"
          placement="top"
          :content="item.text"
        >
          <el-radio-button :label="item.type"><svg-icon :icon-class="item.icon" /></el-radio-button>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <template v-if="formData.borderType !== 'none'">
      <el-form-item label="线宽" prop="lineWidth">
        <el-slider v-model="formData.lineWidth" :min="1" :max="30" show-input input-size="small" />
      </el-form-item>
      <el-form-item label="左右边距" prop="paddingType">
        <el-radio-group v-model="formData.paddingType">
          <el-tooltip content="无边距" placement="top">
            <el-radio-button label="none"><svg-icon icon-class="tabler:box-padding" /></el-radio-button>
          </el-tooltip>
          <el-tooltip content="左右留边" placement="top">
            <el-radio-button label="horizontal"><svg-icon icon-class="vaadin:padding" /></el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="颜色">
        <ColorInput v-model="formData.lineColor" />
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'

export default {
  name: 'DividerProperty',
  components: { ColorInput },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      borderTypes: [
        { icon: 'vaadin:line-h', text: '实线', type: 'solid' },
        { icon: 'tabler:line-dashed', text: '虚线', type: 'dashed' },
        { icon: 'tabler:line-dotted', text: '点线', type: 'dotted' },
        { icon: 'entypo:progress-empty', text: '无', type: 'none' }
      ]
    }
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>
