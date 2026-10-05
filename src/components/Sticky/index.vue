<template>
  <div
    ref="refSticky"
    :style="{ height: height, zIndex: zIndex }"
  >
    <div
      :class="className"
      :style="{
        top: position === 'top' ? offset + 'px' : '',
        bottom: position !== 'top' ? offset + 'px' : '',
        zIndex: zIndex,
        position: isSticky ? 'fixed' : 'static',
        width: width,
        height: height
      }"
    >
      <slot>
        <div>sticky</div>
      </slot>
    </div>
  </div>
</template>

<script>
/**
 * Sticky 吸顶容器（Vue3 版逻辑移植，position: fixed 方案，兼容 Element UI 2.x 布局）
 */
export default {
  name: 'Sticky',
  props: {
    // 距离顶部或者底部的距离(单位px)
    offset: {
      type: Number,
      default: 0
    },
    // 设置元素的堆叠顺序
    zIndex: {
      type: Number,
      default: 999
    },
    // 设置指定的class
    className: {
      type: String,
      default: ''
    },
    // 定位方式，默认为(top)，表示距离顶部位置，可以设置为top或者bottom
    position: {
      type: String,
      validator: function(value) {
        return ['top', 'bottom'].indexOf(value) !== -1
      },
      default: 'top'
    }
  },
  data() {
    return {
      width: 'auto',
      height: 'auto',
      isSticky: false,
      scrollContainer: null
    }
  },
  mounted() {
    this.height = this.$refs.refSticky.getBoundingClientRect().height + 'px'
    this.scrollContainer = this.getScrollContainer(this.$refs.refSticky, true)
    this.handleScroll()
    this.scrollContainer.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
  },
  activated() {
    this.handleScroll()
  },
  beforeDestroy() {
    if (this.scrollContainer) {
      this.scrollContainer.removeEventListener('scroll', this.handleScroll)
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    camelize(str) {
      return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
    },
    getStyle(element, styleName) {
      if (!element || !styleName) return ''
      let key = this.camelize(styleName)
      if (key === 'float') key = 'cssFloat'
      try {
        const style = element.style[styleName]
        if (style) return style
        const computed = document.defaultView.getComputedStyle(element, '')
        return computed ? computed[styleName] : ''
      } catch (e) {
        return element.style[styleName]
      }
    },
    isScroll(el, isVertical) {
      const key = {
        undefined: 'overflow',
        true: 'overflow-y',
        false: 'overflow-x'
      }[String(isVertical)]
      const overflow = this.getStyle(el, key)
      return ['scroll', 'auto', 'overlay'].some((s) => overflow.includes(s))
    },
    getScrollContainer(el, isVertical) {
      let parent = el
      while (parent) {
        if ([window, document, document.documentElement].includes(parent)) return window
        if (this.isScroll(parent, isVertical)) return parent
        parent = parent.parentNode
      }
      return parent
    },
    handleScroll() {
      this.width = this.$refs.refSticky.getBoundingClientRect().width + 'px'
      if (this.position === 'top') {
        const offsetTop = this.$refs.refSticky.getBoundingClientRect().top
        if (offsetTop !== undefined && offsetTop < this.offset) {
          this.sticky()
          return
        }
        this.reset()
      } else {
        const offsetBottom = this.$refs.refSticky.getBoundingClientRect().bottom
        if (offsetBottom !== undefined && offsetBottom > window.innerHeight - this.offset) {
          this.sticky()
          return
        }
        this.reset()
      }
    },
    handleResize() {
      if (this.isSticky && this.$refs.refSticky) {
        this.width = this.$refs.refSticky.getBoundingClientRect().width + 'px'
      }
    },
    sticky() {
      if (this.isSticky) {
        return
      }
      this.isSticky = true
    },
    reset() {
      if (!this.isSticky) {
        return
      }
      this.width = 'auto'
      this.isSticky = false
    }
  }
}
</script>
