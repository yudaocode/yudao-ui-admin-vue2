<template>
  <transition-group
    name="fade-transform"
    mode="out-in"
  >
    <inner-link
      v-for="(item, index) in iframeViews"
      v-show="$route.path === item.path"
      :key="item.path"
      :iframe-id="'iframe' + index"
      :src="item.meta.link"
    />
  </transition-group>
</template>

<script>
import InnerLink from '../InnerLink/index.vue'

export default {
  name: 'IframeToggle',
  components: { InnerLink },
  computed: {
    iframeViews() {
      return this.$store.state.tagsView.iframeViews
    }
  }
}
</script>
