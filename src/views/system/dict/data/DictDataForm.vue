<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="90px">
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="formData.dictType" disabled />
      </el-form-item>
      <el-form-item label="数据标签" prop="label">
        <el-input v-model="formData.label" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="value">
        <el-input v-model="formData.value" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" controls-position="right" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in statusDictDatas" :key="dict.value" :label="parseInt(dict.value)">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="颜色类型" prop="colorType">
        <el-select v-model="formData.colorType">
          <el-option
            v-for="item in colorTypeOptions"
            :key="item.value"
            :label="item.label + '(' + item.value + ')'"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="CSS Class" prop="cssClass">
        <el-input v-model="formData.cssClass" placeholder="请输入 CSS Class" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createDictData, getDictData, updateDictData } from '@/api/system/dict/data'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'SystemDictDataForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      colorTypeOptions: [
        { value: 'default', label: '默认' },
        { value: 'primary', label: '主要' },
        { value: 'success', label: '成功' },
        { value: 'info', label: '信息' },
        { value: 'warning', label: '警告' },
        { value: 'danger', label: '危险' }
      ],
      formRules: {
        label: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        sort: 0,
        label: '',
        value: '',
        dictType: '',
        status: CommonStatusEnum.ENABLE,
        colorType: 'default',
        cssClass: '',
        remark: ''
      }
    },
    open(type, id, dictType) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改字典数据' : '添加字典数据'
      this.formData = this.defaultForm()
      if (dictType) this.formData.dictType = dictType
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getDictData(id)
          .then(response => {
            this.formData = response.data
          })
          .finally(() => {
            this.formLoading = false
          })
      }
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const saveRequest = this.formType === 'create'
          ? createDictData(this.formData)
          : updateDictData(this.formData)
        saveRequest
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
</style>
