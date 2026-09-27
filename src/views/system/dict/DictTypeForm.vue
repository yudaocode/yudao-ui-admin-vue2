<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="type">
        <el-input v-model="formData.type" :disabled="formData.id !== undefined" placeholder="请输入字典类型" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in statusDictDatas" :key="dict.value" :label="parseInt(dict.value)">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
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
import { createDictType, getDictType, updateDictType } from '@/api/system/dict/type'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'SystemDictTypeForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      formLoading: false,
      formData: this.defaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        name: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: '',
        type: '',
        status: CommonStatusEnum.ENABLE,
        remark: ''
      }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '修改字典类型' : '添加字典类型'
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id !== undefined && id !== null) {
        this.formLoading = true
        getDictType(id)
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
          ? createDictType(this.formData)
          : updateDictType(this.formData)
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
