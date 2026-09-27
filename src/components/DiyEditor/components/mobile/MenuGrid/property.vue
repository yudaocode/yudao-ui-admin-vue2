<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData" class="property-form">
      <el-form-item label="每行数量" prop="column">
        <el-radio-group v-model="formData.column">
          <el-radio :label="3">3个</el-radio>
          <el-radio :label="4">4个</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-card header="菜单设置" class="property-group" shadow="never">
        <Draggable v-model="formData.list" :empty-item="emptyItem">
          <template slot-scope="{ element }">
            <el-form-item label="图标" prop="iconUrl">
              <UploadImg v-model="element.iconUrl" height="80px" width="80px">
                <template slot="tip">建议尺寸：44 * 44</template>
              </UploadImg>
            </el-form-item>
            <el-form-item label="标题" prop="title">
              <InputWithColor v-model="element.title" :color.sync="element.titleColor" />
            </el-form-item>
            <el-form-item label="副标题" prop="subtitle">
              <InputWithColor v-model="element.subtitle" :color.sync="element.subtitleColor" />
            </el-form-item>
            <el-form-item label="链接" prop="url">
              <AppLinkInput v-model="element.url" />
            </el-form-item>
            <el-form-item label="显示角标" prop="badge.show">
              <el-switch v-model="element.badge.show" />
            </el-form-item>
            <template v-if="element.badge.show">
              <el-form-item label="角标内容" prop="badge.text">
                <InputWithColor v-model="element.badge.text" :color.sync="element.badge.textColor" />
              </el-form-item>
              <el-form-item label="背景颜色" prop="badge.bgColor">
                <ColorInput v-model="element.badge.bgColor" />
              </el-form-item>
            </template>
          </template>
        </Draggable>
      </el-card>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ColorInput from '@/components/ColorInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import Draggable from '@/components/Draggable/index.vue'
import InputWithColor from '@/components/InputWithColor/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import { EMPTY_MENU_GRID_ITEM_PROPERTY } from './config'

export default {
  name: 'MenuGridProperty',
  components: { AppLinkInput, ColorInput, ComponentContainerProperty, Draggable, InputWithColor, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      emptyItem: {
        ...EMPTY_MENU_GRID_ITEM_PROPERTY,
        badge: { ...EMPTY_MENU_GRID_ITEM_PROPERTY.badge }
      }
    }
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>

<style scoped lang="scss">
.property-form {
  margin-top: 8px;
}
</style>
