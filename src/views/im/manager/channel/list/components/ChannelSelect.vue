<template>
  <el-select
    v-model="channelId"
    style="width: 100%"
    v-bind="$attrs"
  >
    <el-option
      v-for="channel in channelList"
      :key="channel.id"
      :label="channel.name"
      :value="channel.id"
    />
  </el-select>
</template>

<script>
import { getSimpleChannelList } from '@/api/im/manager/channel'

export default {
  name: 'ImChannelSelect',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined }
  },
  data() {
    return { channelList: [] }
  },
  computed: {
    channelId: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const response = await getSimpleChannelList()
      this.channelList = response.data
    }
  }
}
</script>
