<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="isDetail"
  >
    <el-form-item
      label="商品详情"
      prop="description"
    >
      <Editor
        v-model="formData.description"
        :min-height="380"
        :read-only="isDetail"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import Editor from '@/components/Editor'
import { copyValueToTarget } from '@/utils'

export default {
  name: 'ProductDescriptionForm',
  components: { Editor },
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
      formData: { description: '' },
      rules: {
        description: [{ required: true, message: '商品详情不能为空', trigger: 'blur' }]
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
    },
    'formData.description'(value) {
      if (value === '<p><br></p>') this.formData.description = ''
    }
  },
  methods: {
    async validate() {
      try {
        await new Promise((resolve, reject) => {
          this.$refs.form.validate(valid => valid ? resolve(true) : reject(new Error('商品详情不完整')))
        })
        Object.assign(this.propFormData, this.formData)
      } catch (error) {
        this.$message.error('【商品详情】不完善，请填写相关信息')
        this.$emit('update:activeName', 'description')
        throw error
      }
    }
  }
}
</script>
