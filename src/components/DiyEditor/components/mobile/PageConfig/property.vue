<template>
  <el-form label-width="80px" :model="formData" :rules="rules">
    <el-form-item label="页面描述" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        placeholder="用户通过微信分享给朋友时，会自动显示页面描述"
      />
    </el-form-item>
    <el-form-item label="背景颜色" prop="backgroundColor">
      <ColorInput v-model="formData.backgroundColor" />
    </el-form-item>
    <el-form-item label="背景图片" prop="backgroundImage">
      <UploadImg v-model="formData.backgroundImage" :limit="1">
        <template slot="tip">建议宽度 750px</template>
      </UploadImg>
    </el-form-item>
  </el-form>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'PageConfigProperty',
  components: { ColorInput, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return { rules: {}}
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>
