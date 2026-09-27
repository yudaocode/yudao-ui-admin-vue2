<template>
  <el-dialog
    :visible.sync="dialogVisible"
    append-to-body
    title="添加商品属性"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="80px"
      @keydown.enter.native.prevent="submitForm"
    >
      <el-form-item
        label="属性名称"
        prop="name"
      >
        <el-select
          v-model="formData.name"
          :reserve-keyword="false"
          allow-create
          class="property-select"
          default-first-option
          filterable
          placeholder="请选择属性名称。如果不存在，可手动输入选择"
        >
          <el-option
            v-for="item in attributeOptions"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createProperty, getPropertySimpleList } from '@/api/mall/product/property'

export default {
  name: 'ProductPropertyForm',
  props: {
    propertyList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: { name: '' },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      attributeList: [],
      attributeOptions: []
    }
  },
  watch: {
    propertyList: {
      deep: true,
      immediate: true,
      handler(data) {
        if (data) this.attributeList = data
      }
    }
  },
  methods: {
    async open() {
      this.dialogVisible = true
      this.resetForm()
      await this.getAttributeOptions()
    },
    async submitForm() {
      for (const item of this.attributeList) {
        if (item.name === this.formData.name) {
          this.$message.error('该属性已存在，请勿重复添加')
          return
        }
      }
      if (!this.$refs.form) return
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return

      const existProperty = this.attributeOptions.find(item => item.name === this.formData.name)
      if (existProperty) {
        this.attributeList.push({
          id: existProperty.id,
          ...this.formData,
          values: []
        })
        this.dialogVisible = false
        return
      }

      this.formLoading = true
      try {
        const response = await createProperty(this.formData)
        this.attributeList.push({
          id: response.data,
          ...this.formData,
          values: []
        })
        this.$message.success(this.$t('common.createSuccess'))
        this.dialogVisible = false
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { name: '' }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    async getAttributeOptions() {
      this.formLoading = true
      try {
        const response = await getPropertySimpleList()
        this.attributeOptions = response.data
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>
.property-select {
  width: 360px;
}
</style>
