<template>
  <el-tabs stretch>
    <el-tab-pane v-if="$slots.default" label="内容">
      <slot />
    </el-tab-pane>
    <el-tab-pane label="样式" lazy>
      <el-card header="组件样式" class="property-group">
        <el-form :model="formData" label-width="80px">
          <el-form-item label="组件背景" prop="bgType">
            <el-radio-group v-model="formData.bgType">
              <el-radio label="color">纯色</el-radio>
              <el-radio label="img">图片</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.bgType === 'color'" label="选择颜色" prop="bgColor">
            <ColorInput v-model="formData.bgColor" />
          </el-form-item>
          <el-form-item v-else label="上传图片" prop="bgImg">
            <UploadImg v-model="formData.bgImg" :limit="1" />
            <div class="upload-tip">建议宽度 750px</div>
          </el-form-item>
          <el-tree :data="treeData" :expand-on-click-node="false" default-expand-all>
            <div slot-scope="{ node, data }" class="tree-form-item">
              <el-form-item
                :label="data.label"
                :prop="data.prop"
                :label-width="node.level === 1 ? '80px' : '62px'"
              >
                <el-slider
                  v-model="formData[data.prop]"
                  :max="100"
                  :min="0"
                  show-input
                  input-size="small"
                  :show-input-controls="false"
                  @input="handleSliderChange(data.prop)"
                />
              </el-form-item>
            </div>
          </el-tree>
          <slot name="style" :style="formData" />
        </el-form>
      </el-card>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'ComponentContainerProperty',
  components: { ColorInput, UploadImg },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  computed: {
    formData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    treeData() {
      return [
        {
          label: '外部边距',
          prop: 'margin',
          children: [
            { label: '上', prop: 'marginTop' },
            { label: '右', prop: 'marginRight' },
            { label: '下', prop: 'marginBottom' },
            { label: '左', prop: 'marginLeft' }
          ]
        },
        {
          label: '内部边距',
          prop: 'padding',
          children: [
            { label: '上', prop: 'paddingTop' },
            { label: '右', prop: 'paddingRight' },
            { label: '下', prop: 'paddingBottom' },
            { label: '左', prop: 'paddingLeft' }
          ]
        },
        {
          label: '边框圆角',
          prop: 'borderRadius',
          children: [
            { label: '上左', prop: 'borderTopLeftRadius' },
            { label: '上右', prop: 'borderTopRightRadius' },
            { label: '下右', prop: 'borderBottomRightRadius' },
            { label: '下左', prop: 'borderBottomLeftRadius' }
          ]
        }
      ]
    }
  },
  methods: {
    handleSliderChange(prop) {
      const properties = {
        margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
        padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
        borderRadius: [
          'borderTopLeftRadius',
          'borderTopRightRadius',
          'borderBottomRightRadius',
          'borderBottomLeftRadius'
        ]
      }
      if (!properties[prop]) return
      properties[prop].forEach((name) => {
        this.$set(this.formData, name, this.formData[prop])
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-form-item {
  width: 100%;
}

.tree-form-item .el-form-item {
  width: 100%;
  margin-bottom: 0;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

::v-deep .el-slider__runway {
  margin-right: 16px;
}

::v-deep .el-input-number {
  width: 50px;
}
</style>
