<template>
  <el-select
    :value="value"
    :clearable="clearable"
    :disabled="disabled"
    :filterable="filterable"
    :loading="loading"
    :placeholder="placeholder"
    class="full-width"
    @input="$emit('input', $event)"
    @change="handleChange"
  >
    <el-option
      v-for="channel in channelOptions"
      :key="channel.id"
      :label="channel.name"
      :value="channel.id"
    />
  </el-select>
</template>

<script>
import { getRecruitChannel, getRecruitChannelSimpleList } from '@/api/hrm/recruit/channel'

export default {
  name: 'HrmRecruitChannelSelect',
  props: {
    value: { type: Number, default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    filterable: { type: Boolean, default: true },
    excludeIds: { type: Array, default: () => [] },
    placeholder: { type: String, default: '请选择招聘渠道' }
  },
  data() {
    return { channelList: [], selectedChannel: undefined, loading: false }
  },
  computed: {
    channelOptions() {
      const options = this.channelList.filter(channel => channel.id !== undefined && !this.excludeIds.includes(channel.id))
      const current = this.selectedChannel
      if (!current || current.id === undefined || this.excludeIds.includes(current.id) || options.some(item => item.id === current.id)) return options
      return [current, ...options]
    }
  },
  watch: {
    value() { this.ensureSelectedChannel() }
  },
  created() { this.getChannelList() },
  methods: {
    async ensureSelectedChannel() {
      const channelId = this.value
      this.selectedChannel = undefined
      if (channelId == null || this.channelList.some(channel => channel.id === channelId)) return
      const response = await getRecruitChannel(channelId)
      if (this.value === channelId && response.data && response.data.id === channelId) this.selectedChannel = response.data
    },
    handleChange(value) {
      this.$emit('change', this.channelOptions.find(channel => channel.id === value))
    },
    async getChannelList() {
      this.loading = true
      try {
        const response = await getRecruitChannelSimpleList()
        this.channelList = response.data
        await this.ensureSelectedChannel()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
