<template>
  <span class="yudao-icon" :style="{ fontSize: `${size}px`, color }" aria-hidden="true">
    <svg v-if="isLocal" :class="['iconify', svgClass]">
      <use :xlink:href="`#icon-${icon.slice(9)}`" />
    </svg>
    <svg v-else-if="resolved" :class="['iconify', svgClass]"
      :viewBox="`0 0 ${resolved.width} ${resolved.height}`" v-html="resolved.body" />
  </span>
</template>

<script>
import { resolveIcon } from './icons'

export default {
  name: 'YudaoIcon',
  props: {
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    size: { type: Number, default: 16 },
    svgClass: { type: String, default: '' }
  },
  computed: {
    isLocal() { return this.icon.startsWith('svg-icon:') },
    resolved() { return resolveIcon(this.icon) }
  }
}
</script>

<style scoped>
.yudao-icon { display: inline-flex; align-items: center; justify-content: center; width: 1em; height: 1em; line-height: 1; vertical-align: middle; }
.iconify { width: 1em; height: 1em; fill: currentColor; }
</style>
