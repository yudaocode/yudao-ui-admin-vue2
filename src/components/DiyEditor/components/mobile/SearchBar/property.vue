<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData" class="property-form">
      <el-card header="搜索热词" class="property-group" shadow="never">
        <Draggable v-model="formData.hotKeywords" :empty-item="''" :min="0">
          <template slot-scope="{ index }">
            <el-input v-model="formData.hotKeywords[index]" placeholder="请输入热词" />
          </template>
        </Draggable>
      </el-card>
      <el-card header="搜索样式" class="property-group" shadow="never">
        <el-form-item label="框体样式">
          <el-radio-group v-model="formData.borderRadius">
            <el-tooltip content="方形" placement="top">
              <el-radio-button :label="0"><svg-icon icon-class="tabler:input-search" /></el-radio-button>
            </el-tooltip>
            <el-tooltip content="圆形" placement="top">
              <el-radio-button :label="10"><svg-icon icon-class="iconoir:input-search" /></el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提示文字" prop="placeholder">
          <el-input v-model="formData.placeholder" />
        </el-form-item>
        <el-form-item label="文本位置" prop="placeholderPosition">
          <el-radio-group v-model="formData.placeholderPosition">
            <el-tooltip content="居左" placement="top">
              <el-radio-button label="left">
                <svg-icon icon-class="ant-design:align-left-outlined" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="居中" placement="top">
              <el-radio-button label="center">
                <svg-icon icon-class="ant-design:align-center-outlined" />
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="扫一扫" prop="showScan">
          <el-switch v-model="formData.showScan" />
        </el-form-item>
        <el-form-item label="框体高度" prop="height">
          <el-slider v-model="formData.height" :max="50" :min="28" show-input input-size="small" />
        </el-form-item>
        <el-form-item label="框体颜色" prop="backgroundColor">
          <ColorInput v-model="formData.backgroundColor" />
        </el-form-item>
        <el-form-item label="文本颜色" prop="textColor">
          <ColorInput v-model="formData.textColor" />
        </el-form-item>
      </el-card>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import Draggable from '@/components/Draggable/index.vue'
import { isString } from '@/utils/is'

export default {
  name: 'SearchProperty',
  components: { ColorInput, ComponentContainerProperty, Draggable },
  props: {
    value: { type: Object, required: true }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  watch: {
    'value.hotKeywords': {
      handler(newValue) {
        this.$nextTick(() => {
          const index = newValue.findIndex(item => !isString(item))
          if (index !== -1) this.$set(this.formData.hotKeywords, index, '')
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped lang="scss">
.property-form {
  margin-top: 8px;
}
</style>
