<template>
  <div>
    <div class="cell-editor">
      <MagicCubeEditor
        v-model="cellList"
        :cols="cellCount"
        :cube-size="38"
        :rows="1"
        class="cell-cube"
        @hotAreaSelected="handleHotAreaSelected"
      />
      <img v-if="isMp" alt="" class="mp-capsule" src="@/assets/imgs/diy/app-nav-bar-mp.svg" />
    </div>
    <template v-for="(cell, cellIndex) in cellList">
      <div v-if="selectedHotAreaIndex === cellIndex" :key="cellIndex">
        <el-form-item :prop="getCellProp(cellIndex, 'type')" label="类型">
          <el-radio-group v-model="cell.type" @change="handleHotAreaSelected(cell, cellIndex)">
            <el-radio label="text">文字</el-radio>
            <el-radio label="image">图片</el-radio>
            <el-radio label="search">搜索框</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="cell.type === 'text'">
          <el-form-item :prop="getCellProp(cellIndex, 'text')" label="内容">
            <el-input v-model="cell.text" maxlength="10" show-word-limit />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'textColor')" label="颜色">
            <ColorInput v-model="cell.textColor" />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'url')" label="链接">
            <AppLinkInput v-model="cell.url" />
          </el-form-item>
        </template>
        <template v-else-if="cell.type === 'image'">
          <el-form-item :prop="getCellProp(cellIndex, 'imgUrl')" label="图片">
            <UploadImg v-model="cell.imgUrl" :limit="1" height="56px" width="56px">
              <template slot="tip">建议尺寸 56*56</template>
            </UploadImg>
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'url')" label="链接">
            <AppLinkInput v-model="cell.url" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item :prop="getCellProp(cellIndex, 'backgroundColor')" label="框体颜色">
            <ColorInput v-model="cell.backgroundColor" />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'textColor')" label="文本颜色">
            <ColorInput v-model="cell.textColor" />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'placeholder')" label="提示文字">
            <el-input v-model="cell.placeholder" maxlength="10" show-word-limit />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'placeholderPosition')" label="文本位置">
            <el-radio-group v-model="cell.placeholderPosition">
              <el-tooltip content="居左" placement="top">
                <el-radio-button label="left">
                  <svg-icon icon-class="ant-design:align-left-outlined" />
                </el-radio-button>
              </el-tooltip>
              <el-tooltip content="居中" placement="top">
                <el-radio-button label="center">
                  <svg-icon icon-class="ant-design:align-center-outlined" />
                </el-radio-button>
              </el-tooltip>
            </el-radio-group>
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'showScan')" label="扫一扫">
            <el-switch v-model="cell.showScan" />
          </el-form-item>
          <el-form-item :prop="getCellProp(cellIndex, 'borderRadius')" label="圆角">
            <el-slider
              v-model="cell.borderRadius"
              :max="100"
              :min="0"
              :show-input-controls="false"
              input-size="small"
              show-input
            />
          </el-form-item>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import ColorInput from '@/components/ColorInput/index.vue'
import MagicCubeEditor from '@/components/MagicCubeEditor/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'NavigationBarCellProperty',
  components: { AppLinkInput, ColorInput, MagicCubeEditor, UploadImg },
  props: {
    value: { type: Array, default: () => [] },
    formPath: { type: String, required: true },
    isMp: { type: Boolean, default: true }
  },
  data() {
    return { selectedHotAreaIndex: 0 }
  },
  computed: {
    cellList: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    cellCount() {
      return this.isMp ? 6 : 8
    }
  },
  methods: {
    getCellProp(cellIndex, field) {
      return `${this.formPath}[${cellIndex}].${field}`
    },
    handleHotAreaSelected(cellValue, index) {
      this.selectedHotAreaIndex = index
      if (!cellValue.type) {
        this.$set(cellValue, 'type', 'text')
        this.$set(cellValue, 'textColor', '#111111')
      }
      if (cellValue.type === 'search') {
        this.$set(cellValue, 'placeholderPosition', 'left')
        this.$set(cellValue, 'backgroundColor', '#EEEEEE')
        this.$set(cellValue, 'textColor', '#969799')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.cell-editor {
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
}

.cell-cube {
  margin-bottom: 16px;
}

.mp-capsule {
  width: 76px;
  height: 30px;
}
</style>
