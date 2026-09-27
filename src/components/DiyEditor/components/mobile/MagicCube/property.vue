<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData" class="property-form">
      <p class="section-title">魔方设置</p>
      <p class="section-tip">每格尺寸187 * 187</p>
      <MagicCubeEditor
        v-model="formData.list"
        class="cube-editor"
        :rows="4"
        :cols="4"
        @hotAreaSelected="handleHotAreaSelected"
      />
      <template v-for="(hotArea, index) in formData.list">
        <div v-if="selectedHotAreaIndex === index" :key="index">
          <el-form-item label="上传图片" :prop="`list[${index}].imgUrl`">
            <UploadImg v-model="hotArea.imgUrl" height="80px" width="80px" />
          </el-form-item>
          <el-form-item label="链接" :prop="`list[${index}].url`">
            <AppLinkInput v-model="hotArea.url" />
          </el-form-item>
        </div>
      </template>
      <el-form-item label="上圆角" prop="borderRadiusTop">
        <el-slider
          v-model="formData.borderRadiusTop"
          :max="100"
          :min="0"
          show-input
          input-size="small"
          :show-input-controls="false"
        />
      </el-form-item>
      <el-form-item label="下圆角" prop="borderRadiusBottom">
        <el-slider
          v-model="formData.borderRadiusBottom"
          :max="100"
          :min="0"
          show-input
          input-size="small"
          :show-input-controls="false"
        />
      </el-form-item>
      <el-form-item label="间隔" prop="space">
        <el-slider
          v-model="formData.space"
          :max="100"
          :min="0"
          show-input
          input-size="small"
          :show-input-controls="false"
        />
      </el-form-item>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import MagicCubeEditor from '@/components/MagicCubeEditor/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'MagicCubeProperty',
  components: { AppLinkInput, ComponentContainerProperty, MagicCubeEditor, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return { selectedHotAreaIndex: -1 }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  methods: {
    handleHotAreaSelected(_, index) {
      this.selectedHotAreaIndex = index
    }
  }
}
</script>

<style scoped lang="scss">
.property-form {
  margin-top: 8px;
}

.section-title {
  margin-bottom: 4px;
}

.section-tip {
  color: #909399;
  font-size: 12px;
}

.cube-editor {
  margin: 16px 0;
}
</style>
