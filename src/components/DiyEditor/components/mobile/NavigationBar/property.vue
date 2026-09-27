<template>
  <el-form label-width="80px" :model="formData" :rules="rules">
    <el-form-item label="样式" prop="styleType">
      <el-radio-group v-model="formData.styleType">
        <el-radio label="normal">标准</el-radio>
        <el-tooltip
          content="沉侵式头部仅支持微信小程序、APP，建议页面第一个组件为图片展示类组件"
          placement="top"
        >
          <el-radio label="inner">沉浸式</el-radio>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="formData.styleType === 'inner'" label="显示方式" prop="showType">
      <el-radio-group v-model="formData.showType">
        <el-tooltip content="头部导航栏固定显示" placement="top">
          <el-radio label="always">常驻显示</el-radio>
        </el-tooltip>
        <el-tooltip content="头部导航栏将在页面滑动时淡入" placement="top">
          <el-radio label="scroll">滚动显示</el-radio>
        </el-tooltip>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="背景类型" prop="bgType">
      <el-radio-group v-model="formData.bgType">
        <el-radio label="color">纯色</el-radio>
        <el-radio label="img">图片</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="formData.bgType === 'color'" label="背景颜色" prop="bgColor">
      <ColorInput v-model="formData.bgColor" />
    </el-form-item>
    <el-form-item v-else label="背景图片" prop="bgImg">
      <div class="background-upload">
        <UploadImg v-model="formData.bgImg" :limit="1" width="56px" height="56px" />
        <span class="upload-tip">建议宽度：750</span>
      </div>
    </el-form-item>
    <el-card class="property-group" shadow="never">
      <div slot="header" class="card-header">
        <span>内容（小程序）</span>
        <el-form-item prop="_local.previewMp" class="preview-checkbox">
          <el-checkbox v-model="formData._local.previewMp" @change="togglePreview('mp')">
            预览
          </el-checkbox>
        </el-form-item>
      </div>
      <NavigationBarCellProperty v-model="formData.mpCells" form-path="mpCells" is-mp />
    </el-card>
    <el-card class="property-group" shadow="never">
      <div slot="header" class="card-header">
        <span>内容（非小程序）</span>
        <el-form-item prop="_local.previewOther" class="preview-checkbox">
          <el-checkbox v-model="formData._local.previewOther" @change="togglePreview('other')">
            预览
          </el-checkbox>
        </el-form-item>
      </div>
      <NavigationBarCellProperty
        v-model="formData.otherCells"
        form-path="otherCells"
        :is-mp="false"
      />
    </el-card>
  </el-form>
</template>

<script>
import ColorInput from '@/components/ColorInput/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'
import NavigationBarCellProperty from './components/CellProperty.vue'
import { isNavigationBarAlwaysShow, isNavigationBarShowType } from './config'

export default {
  name: 'NavigationBarProperty',
  components: { ColorInput, NavigationBarCellProperty, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  data() {
    return {
      rules: {
        name: [{ required: true, message: '请输入页面名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    formData() {
      return this.value
    }
  },
  watch: {
    'value.showType': {
      handler(showType) {
        this.$set(this.value, 'alwaysShow', showType === 'always')
      }
    }
  },
  created() {
    if (!isNavigationBarShowType(this.formData.showType)) {
      this.$set(
        this.formData,
        'showType',
        isNavigationBarAlwaysShow(this.formData) ? 'always' : 'scroll'
      )
    }
    this.$set(this.formData, 'alwaysShow', this.formData.showType === 'always')
    if (!this.formData._local) {
      this.$set(this.formData, '_local', { previewMp: true, previewOther: false })
    }
  },
  methods: {
    togglePreview(type) {
      if (type === 'mp') {
        this.formData._local.previewOther = !this.formData._local.previewMp
      } else {
        this.formData._local.previewMp = !this.formData._local.previewOther
      }
    }
  }
}
</script>

<style scoped lang="scss">
.background-upload,
.card-header {
  display: flex;
  align-items: center;
}

.card-header {
  justify-content: space-between;
}

.upload-tip {
  margin: 0 0 8px 8px;
  color: #909399;
  font-size: 12px;
}

.preview-checkbox {
  margin-bottom: 0;
}
</style>
