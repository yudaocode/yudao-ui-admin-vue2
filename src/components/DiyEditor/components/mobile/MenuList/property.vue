<template>
  <ComponentContainerProperty v-model="formData.style">
    <p class="section-title">菜单设置</p>
    <p class="section-tip">拖动左侧的小圆点可以调整顺序</p>
    <el-form label-width="60px" :model="formData" class="property-form">
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
        </template>
      </Draggable>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import Draggable from '@/components/Draggable/index.vue'
import InputWithColor from '@/components/InputWithColor/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import { EMPTY_MENU_LIST_ITEM_PROPERTY } from './config'

export default {
  name: 'MenuListProperty',
  components: { AppLinkInput, ComponentContainerProperty, Draggable, InputWithColor, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return { emptyItem: { ...EMPTY_MENU_LIST_ITEM_PROPERTY }}
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>

<style scoped lang="scss">
.section-title {
  margin-bottom: 4px;
}

.section-tip {
  color: #909399;
  font-size: 12px;
}

.property-form {
  margin-top: 8px;
}
</style>
