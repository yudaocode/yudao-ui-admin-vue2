<template>
  <div
    v-loading="loading"
    class="qrcode-wrap"
    :style="wrapStyle"
    @click="handleClick"
  >
    <qrcode-vue
      v-if="renderText"
      ref="qrcode"
      :background="background"
      :foreground="foreground"
      :level="level"
      :render-as="renderAs"
      :size="width"
      :value="renderText"
    />
    <img v-if="logoSource" class="qrcode-logo" :src="logoSource" alt="" />
    <div v-if="disabled" class="qrcode-disabled" @click.stop="$emit('disabled-click')">
      <i class="el-icon-refresh-right" />
      <div>{{ disabledText }}</div>
    </div>
  </div>
</template>

<script>
import QrcodeVue from 'qrcode.vue'

export default {
  // 与 Vue3 公共组件名及现有导入契约保持一致。
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Qrcode',
  components: { QrcodeVue },
  props: {
    tag: {
      type: String,
      default: 'canvas',
      validator: value => ['canvas', 'img', 'svg'].includes(value)
    },
    text: { type: [String, Array, Object], default: '' },
    options: { type: Object, default: () => ({}) },
    width: { type: Number, default: 200 },
    logo: { type: [String, Object], default: '' },
    disabled: { type: Boolean, default: false },
    disabledText: { type: String, default: '' }
  },
  data() {
    return { loading: true }
  },
  computed: {
    renderText() {
      return typeof this.text === 'string' ? this.text : JSON.stringify(this.text)
    },
    renderAs() {
      return this.tag === 'svg' ? 'svg' : 'canvas'
    },
    level() {
      const level = this.options.errorCorrectionLevel
      if (level) return level
      if (this.renderText.length > 36) return 'M'
      if (this.renderText.length > 16) return 'Q'
      return 'H'
    },
    background() {
      return this.options.color && this.options.color.light
        ? this.options.color.light
        : '#ffffff'
    },
    foreground() {
      return this.options.color && this.options.color.dark
        ? this.options.color.dark
        : '#000000'
    },
    logoSource() {
      return typeof this.logo === 'string' ? this.logo : (this.logo && this.logo.src) || ''
    },
    wrapStyle() {
      return { width: this.width + 'px', height: this.width + 'px' }
    }
  },
  watch: {
    renderText: 'scheduleDone',
    options: { deep: true, handler: 'scheduleDone' },
    width: 'scheduleDone'
  },
  mounted() {
    this.scheduleDone()
  },
  methods: {
    scheduleDone() {
      this.loading = true
      this.$nextTick(() => {
        this.$nextTick(() => this.emitDone())
      })
    },
    emitDone() {
      const root = this.$refs.qrcode && this.$refs.qrcode.$el
      if (!root) return
      let dataUrl = ''
      const canvas = root.tagName === 'CANVAS' ? root : root.querySelector('canvas')
      if (canvas && canvas.toDataURL) {
        dataUrl = canvas.toDataURL('image/png')
      } else {
        const svg = root.tagName === 'SVG' ? root : root.querySelector('svg')
        if (svg) {
          dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML)
        }
      }
      if (!dataUrl) return
      this.loading = false
      this.$emit('done', dataUrl)
    },
    handleClick() {
      if (this.disabled) {
        this.$emit('disabled-click')
        return
      }
      this.$emit('click')
    }
  }
}
</script>

<style scoped>
.qrcode-wrap {
  position: relative;
  display: inline-block;
}

.qrcode-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18%;
  height: 18%;
  padding: 2%;
  object-fit: contain;
  background: #fff;
  border-radius: 6px;
  transform: translate(-50%, -50%);
}

.qrcode-disabled {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #409eff;
  background: rgb(255 255 255 / 88%);
  cursor: pointer;
}

.qrcode-disabled i {
  font-size: 30px;
}
</style>
