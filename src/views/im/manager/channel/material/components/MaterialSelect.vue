<template>
  <el-select
    v-model="materialId"
    :disabled="!channelId"
    style="width: 100%"
    v-bind="$attrs"
  >
    <el-option
      v-for="material in materialList"
      :key="material.id"
      :label="material.title"
      :value="material.id"
    />
  </el-select>
</template>

<script>
import { getSimpleManagerChannelMaterialList } from '@/api/im/manager/channel/material'

export default {
  name: 'ImMaterialSelect',
  inheritAttrs: false,
  props: {
    value: { type: Number, default: undefined },
    channelId: { type: Number, default: undefined }
  },
  data() {
    return { materialList: [] }
  },
  computed: {
    materialId: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    channelId: {
      immediate: true,
      async handler(id) {
        this.$emit('input', undefined)
        if (!id) {
          this.materialList = []
          return
        }
        const response = await getSimpleManagerChannelMaterialList(id)
        this.materialList = response.data
      }
    }
  }
}
</script>
