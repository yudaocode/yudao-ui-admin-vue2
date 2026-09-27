<template>
  <ComponentContainerProperty v-model="formData.style">
    <el-form label-width="80px" :model="formData">
      <el-card header="样式设置" class="property-group" shadow="never">
        <el-form-item label="样式" prop="type">
          <el-radio-group v-model="formData.type">
            <el-tooltip class="item" content="默认" placement="bottom">
              <el-radio-button label="default">
                <svg-icon icon-class="system-uicons:carousel" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip class="item" content="卡片" placement="bottom">
              <el-radio-button label="card">
                <svg-icon icon-class="ic:round-view-carousel" />
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="高度" prop="height">
          <el-input-number
            v-model="formData.height"
            class="height-input"
            controls-position="right"
          />
          px
        </el-form-item>
        <el-form-item label="指示器" prop="indicator">
          <el-radio-group v-model="formData.indicator">
            <el-radio label="dot">小圆点</el-radio>
            <el-radio label="number">数字</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否轮播" prop="autoplay">
          <el-switch v-model="formData.autoplay" />
        </el-form-item>
        <el-form-item v-if="formData.autoplay" label="播放间隔" prop="interval">
          <el-slider
            v-model="formData.interval"
            :max="10"
            :min="0.5"
            :step="0.5"
            show-input
            input-size="small"
            :show-input-controls="false"
          />
          <span class="form-tip">单位：秒</span>
        </el-form-item>
      </el-card>
      <el-card header="内容设置" class="property-group" shadow="never">
        <Draggable v-model="formData.items" :empty-item="{ type: 'img' }">
          <template slot-scope="{ element }">
            <el-form-item label="类型" prop="type" class="compact-item" label-width="40px">
              <el-radio-group v-model="element.type">
                <el-radio label="img">图片</el-radio>
                <el-radio label="video">视频</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="element.type === 'img'"
              label="图片"
              class="compact-item"
              label-width="40px"
            >
              <UploadImg
                v-model="element.imgUrl"
                :draggable="false"
                height="80px"
                width="100%"
                class="media-upload"
              />
            </el-form-item>
            <template v-else>
              <el-form-item label="封面" class="compact-item" label-width="40px">
                <UploadImg
                  v-model="element.imgUrl"
                  :draggable="false"
                  height="80px"
                  width="100%"
                  class="media-upload"
                />
              </el-form-item>
              <el-form-item label="视频" class="compact-item" label-width="40px">
                <UploadFile
                  v-model="element.videoUrl"
                  :file-type="['mp4']"
                  :limit="1"
                  :file-size="100"
                  class="media-upload"
                />
              </el-form-item>
            </template>
            <el-form-item label="链接" class="compact-item" label-width="40px">
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
import ComponentContainerProperty from '@/components/DiyEditor/components/ComponentContainerProperty.vue'
import Draggable from '@/components/Draggable/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'CarouselProperty',
  components: { AppLinkInput, ComponentContainerProperty, Draggable, UploadImg },
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
.height-input {
  width: 50%;
  margin-right: 10px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
}

.compact-item {
  margin-bottom: 8px;
}

.media-upload {
  min-width: 80px;
}
</style>
