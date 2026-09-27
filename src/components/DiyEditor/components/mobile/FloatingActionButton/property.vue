<template>
  <el-form label-width="80px" :model="formData">
    <el-card header="按钮配置" class="property-group" shadow="never">
      <el-form-item label="展开方向" prop="direction">
        <el-radio-group v-model="formData.direction">
          <el-radio label="vertical">垂直</el-radio>
          <el-radio label="horizontal">水平</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="显示文字" prop="showText">
        <el-switch v-model="formData.showText" />
      </el-form-item>
    </el-card>
    <el-card header="按钮列表" class="property-group" shadow="never">
      <Draggable v-model="formData.list" :empty-item="{ textColor: '#fff' }">
        <template slot-scope="{ element, index }">
          <el-form-item label="图标" :prop="`list[${index}].imgUrl`">
            <UploadImg v-model="element.imgUrl" height="56px" width="56px" />
          </el-form-item>
          <el-form-item label="文字" :prop="`list[${index}].text`">
            <InputWithColor v-model="element.text" :color.sync="element.textColor" />
          </el-form-item>
          <el-form-item label="跳转链接" :prop="`list[${index}].url`">
            <AppLinkInput v-model="element.url" />
          </el-form-item>
        </template>
      </Draggable>
    </el-card>
  </el-form>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import Draggable from '@/components/Draggable/index.vue'
import InputWithColor from '@/components/InputWithColor/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'FloatingActionButtonProperty',
  components: { AppLinkInput, Draggable, InputWithColor, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>
