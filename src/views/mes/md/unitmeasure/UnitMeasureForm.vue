<!-- MES 计量单位表单 -->
<template>
  <el-dialog :title="title" :visible.sync="visible" width="600px" append-to-body>
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="130px"
    >
      <el-form-item label="单位编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入单位编码" />
      </el-form-item>
      <el-form-item label="单位名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入单位名称" />
      </el-form-item>
      <el-form-item label="是否主单位" prop="primaryFlag">
        <el-radio-group v-model="formData.primaryFlag">
          <el-radio v-for="dict in boolOptions" :key="String(dict.value)" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.primaryFlag === false" label="主单位" prop="primaryId">
        <el-select v-model="formData.primaryId" placeholder="请选择主单位" class="full-width">
          <el-option
            v-for="item in primaryUnitList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.primaryFlag === false"
        label="与主单位换算比例"
        prop="changeRate"
      >
        <el-input-number
          v-model="formData.changeRate"
          :step="1"
          :precision="4"
          :min="0"
          class="full-width"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { MdUnitMeasureApi } from '@/api/mes/md/unitmeasure'
import { DICT_TYPE, getBoolDictOptions, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'UnitMeasureForm',
  data() {
    return {
      visible: false,
      title: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultForm(),
      primaryUnitList: [],
      boolOptions: getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING),
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formRules: {
        code: [{ required: true, message: '单位编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '单位名称不能为空', trigger: 'blur' }],
        primaryFlag: [{ required: true, message: '是否主单位不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        primaryFlag: true,
        primaryId: undefined,
        changeRate: undefined,
        status: CommonStatusEnum.ENABLE,
        remark: undefined
      }
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    async open(type, id) {
      this.visible = true
      this.formType = type
      this.title = type === 'create' ? '新增计量单位' : '修改计量单位'
      this.resetFormData()
      const response = await MdUnitMeasureApi.getUnitMeasureSimpleList()
      this.primaryUnitList = response.data.filter(item => item.primaryFlag === true)
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await MdUnitMeasureApi.getUnitMeasure(id)).data
        } finally {
          this.formLoading = false
        }
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        if (this.formData.primaryFlag) {
          this.formData.primaryId = undefined
          this.formData.changeRate = undefined
        }
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            await MdUnitMeasureApi.createUnitMeasure(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await MdUnitMeasureApi.updateUnitMeasure(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.visible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
