<template>
  <div class="tab-bar-property">
    <el-form :model="formData" label-width="80px">
      <el-form-item label="主题" prop="theme">
        <el-select v-model="formData.theme" @change="handleThemeChange">
          <el-option
            v-for="(theme, index) in themeList"
            :key="index"
            :label="theme.name"
            :value="theme.id"
          >
            <div class="theme-option">
              <svg-icon :icon-class="theme.icon" :color="theme.color" />
              <span>{{ theme.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="默认颜色">
        <ColorInput v-model="formData.style.color" />
      </el-form-item>
      <el-form-item label="选中颜色">
        <ColorInput v-model="formData.style.activeColor" />
      </el-form-item>
      <el-form-item label="导航背景">
        <el-radio-group v-model="formData.style.bgType">
          <el-radio-button label="color">纯色</el-radio-button>
          <el-radio-button label="img">图片</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.style.bgType === 'color'" label="选择颜色">
        <ColorInput v-model="formData.style.bgColor" />
      </el-form-item>
      <el-form-item v-if="formData.style.bgType === 'img'" label="选择图片">
        <UploadImg v-model="formData.style.bgImg" width="100%" height="50px">
          <template slot="tip">建议尺寸 375 * 50</template>
        </UploadImg>
      </el-form-item>

      <p class="section-title">图标设置</p>
      <p class="section-tip">拖动左上角的小圆点可对其排序, 图标建议尺寸 44*44</p>
      <Draggable v-model="formData.items" :limit="5">
        <template slot-scope="{ element }">
          <div class="icon-setting">
            <div class="icon-upload">
              <UploadImg
                v-model="element.iconUrl"
                width="40px"
                height="40px"
                :show-delete="false"
                :show-btn-text="false"
              />
              <span class="caption">未选中</span>
            </div>
            <div class="icon-upload">
              <UploadImg
                v-model="element.activeIconUrl"
                width="40px"
                height="40px"
                :show-delete="false"
                :show-btn-text="false"
              />
              <span class="caption">已选中</span>
            </div>
          </div>
          <el-form-item prop="text" label="文字" label-width="48px" class="compact-item">
            <el-input v-model="element.text" placeholder="请输入文字" />
          </el-form-item>
          <el-form-item prop="url" label="链接" label-width="48px" class="last-item">
            <AppLinkInput v-model="element.url" />
          </el-form-item>
        </template>
      </Draggable>
    </el-form>
  </div>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ColorInput from '@/components/ColorInput/index.vue'
import Draggable from '@/components/Draggable/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import { component, THEME_LIST } from './config'

export default {
  name: 'TabBarProperty',
  components: { AppLinkInput, ColorInput, Draggable, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return { themeList: THEME_LIST }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  created() {
    component.property.items = this.formData.items
  },
  methods: {
    handleThemeChange() {
      const theme = THEME_LIST.find(item => item.id === this.formData.theme)
      if (theme && theme.color) this.formData.style.activeColor = theme.color
    }
  }
}
</script>

<style scoped lang="scss">
.theme-option,
.icon-setting,
.icon-upload {
  display: flex;
  align-items: center;
}

.theme-option,
.icon-setting {
  justify-content: space-between;
}

.section-title {
  margin-bottom: 4px;
}

.section-tip,
.caption {
  color: #909399;
  font-size: 12px;
}

.icon-setting {
  margin-bottom: 8px;
  justify-content: space-around;
}

.icon-upload {
  flex-direction: column;
}

.compact-item {
  margin-bottom: 8px;
}

.last-item {
  margin-bottom: 0;
}
</style>
