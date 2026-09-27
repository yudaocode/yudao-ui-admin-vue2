<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="isDetail"
  >
    <el-form-item
      label="商品排序"
      prop="sort"
    >
      <el-input-number
        v-model="formData.sort"
        :min="0"
        :precision="0"
        controls-position="right"
        class="field-width"
      />
    </el-form-item>
    <el-form-item
      label="赠送积分"
      prop="giveIntegral"
    >
      <el-input-number
        v-model="formData.giveIntegral"
        :min="0"
        :precision="0"
        controls-position="right"
        class="field-width"
      />
    </el-form-item>
    <el-form-item
      label="虚拟销量"
      prop="virtualSalesCount"
    >
      <el-input-number
        v-model="formData.virtualSalesCount"
        :min="0"
        :precision="0"
        controls-position="right"
        class="field-width"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import { copyValueToTarget } from '@/utils'

export default {
  name: 'ProductOtherForm',
  props: {
    propFormData: {
      type: Object,
      default: () => ({})
    },
    isDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: { sort: 0, giveIntegral: 0, virtualSalesCount: 0 },
      rules: {
        sort: [{ required: true, message: '商品排序不能为空', trigger: 'change' }],
        giveIntegral: [{ required: true, message: '赠送积分不能为空', trigger: 'change' }],
        virtualSalesCount: [{ required: true, message: '虚拟销量不能为空', trigger: 'change' }]
      }
    }
  },
  watch: {
    propFormData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (value) copyValueToTarget(this.formData, value)
      }
    }
  },
  methods: {
    async validate() {
      try {
        await new Promise((resolve, reject) => {
          this.$refs.form.validate(valid => valid ? resolve(true) : reject(new Error('其它设置不完整')))
        })
        Object.assign(this.propFormData, this.formData)
      } catch (error) {
        this.$message.error('【其它设置】不完善，请填写相关信息')
        this.$emit('update:activeName', 'other')
        throw error
      }
    }
  }
}
</script>

<style scoped>
.field-width { width: 360px; }
</style>
