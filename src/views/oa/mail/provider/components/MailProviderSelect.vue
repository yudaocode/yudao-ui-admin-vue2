<template>
  <!-- 邮箱服务选择 -->
  <el-select
    :value="value"
    :disabled="disabled"
    :clearable="clearable"
    placeholder="请选择邮箱服务"
    filterable
    style="width: 100%"
    @change="handleChange"
  >
    <el-option v-for="item in list" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script>
import * as ProviderApi from '@/api/oa/mail/provider'

export default {
  name: 'OaMailProviderSelect',
  props: {
    value: {
      type: Number,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      list: [] // 启用的邮箱服务配置
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleChange(value) {
      this.$emit('input', value)
    },
    getList() {
      return ProviderApi.getSimpleMailProviderList().then(response => {
        this.list = response.data
      })
    }
  }
}
</script>
