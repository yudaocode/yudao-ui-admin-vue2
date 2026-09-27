<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData">
      <el-card header="商品列表" class="property-group" shadow="never">
        <SpuShowcase v-model="formData.spuIds" />
      </el-card>
      <el-card header="商品样式" class="property-group" shadow="never">
        <el-form-item label="布局" prop="type">
          <el-radio-group v-model="formData.layoutType">
            <el-tooltip class="item" content="双列" placement="bottom">
              <el-radio-button label="twoCol">
                <svg-icon icon-class="fluent:text-column-two-24-filled" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip class="item" content="三列" placement="bottom">
              <el-radio-button label="threeCol">
                <svg-icon icon-class="fluent:text-column-three-24-filled" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip class="item" content="水平滑动" placement="bottom">
              <el-radio-button label="horizSwiper">
                <svg-icon icon-class="system-uicons:carousel" />
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品名称" prop="fields.name.show">
          <div class="field-row">
            <ColorInput v-model="formData.fields.name.color" />
            <el-checkbox v-model="formData.fields.name.show" />
          </div>
        </el-form-item>
        <el-form-item label="商品价格" prop="fields.price.show">
          <div class="field-row">
            <ColorInput v-model="formData.fields.price.color" />
            <el-checkbox v-model="formData.fields.price.show" />
          </div>
        </el-form-item>
      </el-card>
      <el-card header="角标" class="property-group" shadow="never">
        <el-form-item label="角标" prop="badge.show">
          <el-switch v-model="formData.badge.show" />
        </el-form-item>
        <el-form-item v-if="formData.badge.show" label="角标" prop="badge.imgUrl">
          <UploadImg v-model="formData.badge.imgUrl" height="44px" width="72px">
            <template slot="tip">建议尺寸：36 * 22</template>
          </UploadImg>
        </el-form-item>
      </el-card>
      <el-card header="商品样式" class="property-group" shadow="never">
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
      </el-card>
    </el-form>
  </ComponentContainerProperty>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import SpuShowcase from '@/views/mall/product/spu/components/SpuShowcase.vue'

export default {
  name: 'ProductListProperty',
  components: { ColorInput, ComponentContainerProperty, SpuShowcase, UploadImg },
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
.field-row {
  display: flex;
  gap: 8px;
}
</style>
