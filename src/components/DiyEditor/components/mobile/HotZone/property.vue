<template>
  <div>
    <ComponentContainerProperty v-model="formData.style">
      <el-form label-width="80px" :model="formData" class="property-form">
        <el-form-item label="上传图片" prop="imgUrl">
          <UploadImg v-model="formData.imgUrl" height="50px" width="auto" class="image-upload">
            <template slot="tip"><span class="form-tip">推荐宽度 750</span></template>
          </UploadImg>
        </el-form-item>
      </el-form>
      <el-button type="primary" plain class="edit-button" @click="handleOpenEditDialog">
        设置热区
      </el-button>
    </ComponentContainerProperty>
    <HotZoneEditDialog ref="editDialog" v-model="formData.list" :img-url="formData.imgUrl" />
  </div>
</template>

<script>
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import HotZoneEditDialog from './components/HotZoneEditDialog/index.vue'

export default {
  name: 'HotZoneProperty',
  components: { ComponentContainerProperty, HotZoneEditDialog, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  methods: {
    handleOpenEditDialog() {
      this.$refs.editDialog.open()
    }
  }
}
</script>

<style scoped lang="scss">
.property-form {
  margin-top: 8px;
}

.image-upload {
  min-width: 80px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
}

.edit-button {
  width: 100%;
}
</style>
