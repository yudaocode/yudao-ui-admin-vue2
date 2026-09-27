<template>
  <el-select
    :value="modelValue"
    :disabled="disabled"
    :clearable="clearable"
    :loading="loading"
    :placeholder="placeholder"
    filterable
    remote
    :remote-method="getList"
    @change="handleChange"
  >
    <el-option
      v-for="seal in options"
      :key="seal.id"
      :value="seal.id"
      :label="seal.no + ' / ' + seal.name"
    />
  </el-select>
</template>

<script>
import * as SealApplyApi from '@/api/oa/seal/apply'

export default {
  name: 'OaSealSelect',
  props: {
    modelValue: {
      type: Number,
      default: undefined
    },
    selectedSeal: {
      type: Object,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请输入印章名称搜索'
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      currentSeal: undefined
    }
  },
  computed: {
    options() {
      const selected = this.currentSeal
      if (
        selected && selected.id &&
        selected.id === this.modelValue &&
        !this.list.some(seal => seal.id === selected.id)
      ) {
        return [selected].concat(this.list)
      }
      return this.list
    }
  },
  watch: {
    selectedSeal: {
      handler(seal) {
        if (seal && seal.id && seal.name && (!this.currentSeal || this.currentSeal.id !== seal.id)) {
          this.currentSeal = seal
        }
      },
      immediate: true
    }
  },
  created() {
    this.getList('')
  },
  methods: {
    handleChange(value) {
      this.currentSeal = this.options.find(seal => seal.id === value)
      this.$emit('input', typeof value === 'number' ? value : undefined)
      this.$emit('update:modelValue', typeof value === 'number' ? value : undefined)
    },
    getList(name) {
      this.loading = true
      const params = { pageNo: 1, pageSize: 20, name: name }
      return SealApplyApi.getSealPage(params).then(response => {
        this.list = response.data.list
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
