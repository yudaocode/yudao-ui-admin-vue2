<template>
  <div>
    <el-dialog
      title="设置热区"
      :visible.sync="dialogVisible"
      width="780px"
      append-to-body
      @close="handleClose"
    >
      <div ref="container" class="hot-zone-container">
        <el-image :src="imgUrl" class="hot-zone-image" />
        <div
          v-for="(item, hotZoneIndex) in formData"
          :key="hotZoneIndex"
          class="hot-zone"
          :style="{
            width: item.width + 'px',
            height: item.height + 'px',
            top: item.top + 'px',
            left: item.left + 'px'
          }"
          @mousedown="handleMove(item, $event)"
          @dblclick="handleShowAppLinkDialog(item)"
        >
          <span class="hot-zone-name">{{ item.name || '双击选择链接' }}</span>
          <svg-icon
            icon-class="ep:close"
            class-name="delete"
            :size="14"
            @click.stop="handleRemove(item)"
          />
          <span
            v-for="(dot, dotIndex) in controlDotList"
            :key="dotIndex"
            class="ctrl-dot"
            :style="dot.style"
            @mousedown="handleResize(item, dot, $event)"
          />
        </div>
      </div>
      <div slot="footer">
        <el-button type="primary" plain @click="handleAdd">
          <svg-icon icon-class="ep:plus" class-name="button-icon" />
          添加热区
        </el-button>
        <el-button type="primary" plain @click="handleSubmit">
          <svg-icon icon-class="ep:check" class-name="button-icon" />
          确定
        </el-button>
      </div>
    </el-dialog>
    <AppLinkSelectDialog ref="appLinkDialog" @appLinkChange="handleAppLinkChange" />
  </div>
</template>

<script>
import remove from 'lodash/remove'
import AppLinkSelectDialog from '@/components/AppLinkInput/AppLinkSelectDialog.vue'
import {
  CONTROL_DOT_LIST,
  CONTROL_TYPE_ENUM,
  HOT_ZONE_MIN_SIZE,
  useDraggable,
  zoomIn,
  zoomOut
} from './controller'

export default {
  name: 'HotZoneEditDialog',
  components: { AppLinkSelectDialog },
  props: {
    value: { type: Array, default: () => [] },
    imgUrl: { type: String, default: '' }
  },
  data() {
    return {
      controlDotList: CONTROL_DOT_LIST,
      formData: [],
      dialogVisible: false,
      activeHotZone: undefined
    }
  },
  methods: {
    open() {
      this.formData = zoomIn(this.value)
      this.dialogVisible = true
    },
    handleAdd() {
      this.formData.push({
        width: HOT_ZONE_MIN_SIZE,
        height: HOT_ZONE_MIN_SIZE,
        top: 0,
        left: 0
      })
    },
    handleRemove(hotZone) {
      remove(this.formData, hotZone)
    },
    handleMove(item, event) {
      useDraggable(item, event, (left, top, _, __, moveWidth, moveHeight) => {
        this.setLeft(item, left + moveWidth)
        this.setTop(item, top + moveHeight)
      })
    },
    handleResize(item, ctrlDot, event) {
      useDraggable(item, event, (left, top, width, height, moveWidth, moveHeight) => {
        ctrlDot.types.forEach(type => {
          switch (type) {
            case CONTROL_TYPE_ENUM.LEFT:
              this.setLeft(item, left + moveWidth)
              break
            case CONTROL_TYPE_ENUM.TOP:
              this.setTop(item, top + moveHeight)
              break
            case CONTROL_TYPE_ENUM.WIDTH: {
              const direction = ctrlDot.types.includes(CONTROL_TYPE_ENUM.LEFT) ? -1 : 1
              this.setWidth(item, width + moveWidth * direction)
              break
            }
            case CONTROL_TYPE_ENUM.HEIGHT: {
              const direction = ctrlDot.types.includes(CONTROL_TYPE_ENUM.TOP) ? -1 : 1
              this.setHeight(item, height + moveHeight * direction)
              break
            }
            default:
              break
          }
        })
      })
    },
    setLeft(item, left) {
      if (left >= 0 && left <= this.$refs.container.offsetWidth - item.width) item.left = left
    },
    setTop(item, top) {
      if (top >= 0 && top <= this.$refs.container.offsetHeight - item.height) item.top = top
    },
    setWidth(item, width) {
      if (width >= HOT_ZONE_MIN_SIZE && item.left + width <= this.$refs.container.offsetWidth) {
        item.width = width
      }
    },
    setHeight(item, height) {
      if (height >= HOT_ZONE_MIN_SIZE && item.top + height <= this.$refs.container.offsetHeight) {
        item.height = height
      }
    },
    handleSubmit() {
      this.dialogVisible = false
    },
    handleClose() {
      this.$emit('input', zoomOut(this.formData))
    },
    handleShowAppLinkDialog(hotZone) {
      this.activeHotZone = hotZone
      this.$refs.appLinkDialog.open(hotZone.url)
    },
    handleAppLinkChange(appLink) {
      if (!appLink || !this.activeHotZone) return
      this.activeHotZone.name = appLink.name
      this.activeHotZone.url = appLink.path
    }
  }
}
</script>

<style scoped lang="scss">
.hot-zone-container {
  position: relative;
  width: 750px;
  height: 100%;
}

.hot-zone-image {
  width: 750px;
  height: 100%;
  pointer-events: none;
  user-select: none;
}

.hot-zone {
  position: absolute;
  z-index: 10;
  display: flex;
  font-size: 16px;
  color: #409eff;
  cursor: move;
  background: #c6e2ff;
  border: 1px solid #409eff;
  opacity: 0.8;
  align-items: center;
  justify-content: center;
}

.hot-zone-name {
  pointer-events: none;
  user-select: none;
}

.ctrl-dot {
  position: absolute;
  z-index: 11;
  width: 8px;
  height: 8px;
  background-color: #fff;
  border: inherit;
  border-radius: 50%;
}

::v-deep .delete {
  position: absolute;
  top: 0;
  right: 0;
  display: none;
  padding: 2px 2px 6px 6px;
  color: #fff;
  text-align: right;
  cursor: pointer;
  background-color: #409eff;
  border-radius: 0 0 0 80%;
}

.hot-zone:hover ::v-deep .delete {
  display: block;
}

::v-deep .button-icon {
  margin-right: 5px;
}
</style>
