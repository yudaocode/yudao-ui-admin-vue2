<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData" :rules="rules">
      <el-form-item label="公告图标" prop="iconUrl">
        <UploadImg v-model="formData.iconUrl" height="48px">
          <template slot="tip">建议尺寸：24 * 24</template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="背景颜色" prop="backgroundColor">
        <ColorInput v-model="formData.backgroundColor" />
      </el-form-item>
      <el-form-item label="文字颜色" prop="文字颜色">
        <ColorInput v-model="formData.textColor" />
      </el-form-item>
      <el-card header="公告内容" class="property-group" shadow="never">
        <Draggable v-model="formData.contents">
          <template slot-scope="{ element }">
            <el-form-item label="公告" prop="text" label-width="40px">
              <el-input v-model="element.text" placeholder="请输入公告" />
            </el-form-item>
            <el-form-item label="链接" prop="url" label-width="40px">
              <AppLinkInput v-model="element.url" />
            </el-form-item>
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
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'NoticeBarProperty',
  components: { AppLinkInput, ColorInput, ComponentContainerProperty, Draggable, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      rules: {
        content: [{ required: true, message: '请输入公告', trigger: 'blur' }]
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
