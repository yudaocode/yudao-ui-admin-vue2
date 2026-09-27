<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="isDetail"
  >
    <el-form-item
      label="配送方式"
      prop="deliveryTypes"
    >
      <el-checkbox-group v-model="formData.deliveryTypes">
        <el-checkbox
          v-for="item in deliveryTypeDictDatas"
          :key="item.value"
          :label="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item
      v-if="formData.deliveryTypes.indexOf(1) > -1"
      label="运费模板"
      prop="deliveryTemplateId"
    >
      <el-select
        v-model="formData.deliveryTemplateId"
        filterable
        clearable
        class="field-width"
        placeholder="请选择运费模板"
      >
        <el-option
          v-for="item in templateList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { getSimpleTemplateList } from '@/api/mall/trade/delivery/expressTemplate'
import { copyValueToTarget } from '@/utils'

export default {
  name: 'ProductDeliveryForm',
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
      formData: { deliveryTypes: [], deliveryTemplateId: undefined },
      templateList: [],
      rules: {
        deliveryTypes: [{ required: true, type: 'array', min: 1, message: '配送方式不能为空', trigger: 'change' }],
        deliveryTemplateId: [{ required: true, message: '运费模板不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    deliveryTypeDictDatas() {
      return getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE)
    }
  },
  watch: {
    propFormData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (!value) return
        copyValueToTarget(this.formData, value)
      }
    }
  },
  async mounted() {
    await this.loadTemplates()
  },
  methods: {
    async loadTemplates() {
      const response = await getSimpleTemplateList()
      this.templateList = response.data
    },
    async validate() {
      try {
        await new Promise((resolve, reject) => {
          this.$refs.form.validate(valid => valid ? resolve(true) : reject(new Error('物流设置不完整')))
        })
        Object.assign(this.propFormData, this.formData)
      } catch (error) {
        this.$message.error('【物流设置】不完善，请填写相关信息')
        this.$emit('update:activeName', 'delivery')
        throw error
      }
    }
  }
}
</script>

<style scoped>
.field-width { width: 360px; }
</style>
