<template>
  <div class="app-link-input">
    <el-input v-model="appLink" placeholder="输入或选择链接">
      <el-button slot="append" @click="handleOpenDialog">选择</el-button>
    </el-input>
    <AppLinkSelectDialog ref="dialog" @change="handleLinkSelected" />
  </div>
</template>

<script>
import AppLinkSelectDialog from './AppLinkSelectDialog.vue'

export default {
  name: 'AppLinkInput',
  components: { AppLinkSelectDialog },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      appLink: ''
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.appLink = value
      }
    },
    appLink(value) {
      this.$emit('input', value)
    }
  },
  methods: {
    handleOpenDialog() {
      this.$refs.dialog.open(this.appLink)
    },
    handleLinkSelected(link) {
      this.appLink = link
    }
  }
}
</script>
