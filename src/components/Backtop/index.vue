<template>
  <transition name="el-fade-in">
    <div
      v-show="visible"
      class="backtop"
      :style="{ right: right + 'px', bottom: bottom + 'px' }"
      @click="handleClick"
    >
      <slot>
        <i class="el-icon-caret-top backtop-icon" />
      </slot>
    </div>
  </transition>
</template>

<script>
/**
 * Backtop 回到顶部组件（Element UI 2.x 无 el-backtop，原生实现）
 * 对齐 Vue3 版本基于 ElBacktop 的契约：target / visibilityHeight / right / bottom
 */
export default {
  name: 'Backtop',
  props: {
    // 触发滚动的目标对象（CSS 选择器），默认为 window
    target: {
      type: String,
      default: ''
    },
    // 滚动高度达到此参数值才出现
    visibilityHeight: {
      type: Number,
      default: 200
    },
    // 控制其显示位置，距离页面右边距
    right: {
      type: Number,
      default: 40
    },
    // 控制其显示位置，距离页面底部距离
    bottom: {
      type: Number,
      default: 40
    }
  },
  data() {
    return {
      visible: false,
      container: null,
      scrollHandler: null
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if (this.container && this.scrollHandler) {
      this.container.removeEventListener('scroll', this.scrollHandler)
    }
    this.scrollHandler = null
    this.container = null
  },
  methods: {
    init() {
      this.container = this.resolveContainer()
      this.scrollHandler = this.throttle(this.onScroll, 200)
      this.container.addEventListener('scroll', this.scrollHandler)
      this.onScroll()
    },
    resolveContainer() {
      if (!this.target) {
        return window
      }
      const el = document.querySelector(this.target)
      if (!el) {
        // eslint-disable-next-line no-console
        console.warn(`[Backtop] target 选择器未命中元素: ${this.target}`)
        return window
      }
      return el
    },
    getScrollTop() {
      if (this.container === window) {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      }
      return this.container.scrollTop
    },
    onScroll() {
      this.visible = this.getScrollTop() >= this.visibilityHeight
    },
    handleClick() {
      this.scrollToTop()
      this.$emit('click')
    },
    scrollToTop() {
      if (this.container === window) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      // 部分旧内核不支持 behavior 选项，做能力检测
      try {
        this.container.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        this.container.scrollTop = 0
      }
    },
    throttle(fn, wait) {
      let timer = null
      return (...args) => {
        if (timer) return
        timer = setTimeout(() => {
          timer = null
          fn.apply(this, args)
        }, wait)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.backtop {
  position: fixed;
  z-index: 999;
  display: flex;
  width: 40px;
  height: 40px;
  font-size: 20px;
  color: #409eff;
  cursor: pointer;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  align-content: center;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f2f6fc;
  }
}

.backtop-icon {
  font-size: 20px;
}
</style>
