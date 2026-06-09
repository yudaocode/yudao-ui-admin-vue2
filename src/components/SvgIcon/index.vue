<template>
  <i v-if="isElementIcon" :class="elementIconClass" :style="iconStyle" v-on="$listeners" />
  <div v-else-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners" />
  <svg v-else :class="svgClass" :style="iconStyle" aria-hidden="true" v-on="$listeners">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script>
import { isExternal } from '@/utils/validate'

const EP_ICON_MAP = {
  'ep:arrow-right-bold': 'el-icon-right',
  'ep:arrow-left-bold': 'el-icon-back',
  'ep:arrow-down-bold': 'el-icon-bottom',
  'ep:arrow-up-bold': 'el-icon-top',
  'ep:circle-close-filled': 'el-icon-error',
  'ep:circle-close': 'el-icon-circle-close',
  'ep:close': 'el-icon-close',
  'ep:plus': 'el-icon-plus',
  'ep:circle-plus': 'el-icon-circle-plus-outline',
  'ep:circle-plus-filled': 'el-icon-circle-plus',
  'ep:download': 'el-icon-download',
  'ep:upload': 'el-icon-upload2',
  'ep:zoom-in': 'el-icon-zoom-in',
  'ep:zoom-out': 'el-icon-zoom-out',
  'ep:search': 'el-icon-search',
  'ep:refresh': 'el-icon-refresh',
  'ep:setting': 'el-icon-setting',
  'ep:edit': 'el-icon-edit',
  'ep:delete': 'el-icon-delete',
  'ep:more': 'el-icon-more',
  'ep:warning': 'el-icon-warning',
  'ep:info-filled': 'el-icon-info',
  'ep:question-filled': 'el-icon-question',
  'ep:copy-document': 'el-icon-copy-document'
}

export default {
  name: 'SvgIcon',
  props: {
    iconClass: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: ''
    },
    size: {
      type: [Number, String],
      default: ''
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    normalizedIcon() {
      return this.icon || this.iconClass || ''
    },
    isExternal() {
      return isExternal(this.normalizedIcon)
    },
    isElementIcon() {
      return Boolean(this.resolveElementIcon(this.normalizedIcon))
    },
    elementIconClass() {
      const classNames = ['svg-icon', 'element-icon', this.resolveElementIcon(this.normalizedIcon)]
      if (this.className) {
        classNames.push(this.className)
      }
      return classNames.filter(Boolean).join(' ')
    },
    iconName() {
      return `#icon-${this.normalizedIcon}`
    },
    svgClass() {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    },
    styleExternalIcon() {
      return Object.assign({
        mask: `url(${this.normalizedIcon}) no-repeat 50% 50%`,
        '-webkit-mask': `url(${this.normalizedIcon}) no-repeat 50% 50%`
      }, this.iconStyle)
    },
    iconStyle() {
      const style = {}
      if (this.size) {
        const size = typeof this.size === 'number' ? `${this.size}px` : this.size
        style.fontSize = size
        style.width = size
        style.height = size
      }
      if (this.color) {
        style.color = this.color
      }
      return style
    }
  },
  methods: {
    resolveElementIcon(icon) {
      if (!icon) {
        return ''
      }
      if (EP_ICON_MAP[icon]) {
        return EP_ICON_MAP[icon]
      }
      if (icon.startsWith('el-icon-')) {
        return icon
      }
      if (icon.startsWith('ep:')) {
        return 'el-icon-' + icon.slice(3)
      }
      return ''
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}

.element-icon {
  display: inline-block;
  text-align: center;
}
</style>
