<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData">
      <el-form-item label="上传图片" prop="imgUrl">
        <UploadImg
          v-model="formData.imgUrl"
          :draggable="false"
          height="80px"
          width="100%"
          class="image-upload"
        >
          <template slot="tip">建议宽度750</template>
        </UploadImg>
      </el-form-item>
      <el-form-item label="链接" prop="url">
        <AppLinkInput v-model="formData.url" />
      </el-form-item>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'ImageBarProperty',
  components: { AppLinkInput, ComponentContainerProperty, UploadImg },
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

<style scoped lang="scss">
.image-upload {
  min-width: 80px;
}
</style>
