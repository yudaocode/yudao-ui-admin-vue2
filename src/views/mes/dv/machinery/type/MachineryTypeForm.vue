<!-- MES 设备类型表单 -->
<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="上级类型" prop="parentId">
        <el-cascader
          v-model="formData.parentId"
          :options="machineryTypeTree"
          :props="treeProps"
          clearable
          filterable
          class="full-width"
          placeholder="请选择上级类型"
        />
      </el-form-item>
      <el-form-item label="设备类型编码" prop="code">
        <el-input v-model="formData.code" placeholder="请输入设备类型编码，或点击生成">
          <el-button slot="append" @click="generateCode">生成</el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="设备类型名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入类型名称" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :precision="0" class="full-width" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getIntDictOptions } from '@/utils/dict'
import { DvMachineryTypeApi } from '@/api/mes/dv/machinery/type'
import { defaultProps, handleTree } from '@/utils/tree'
import { CommonStatusEnum } from '@/utils/constants'
import { MesAutoCodeRuleCode } from '@/views/mes/utils/constants'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'

export default {
  name: 'MachineryTypeForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultForm(),
      machineryTypeTree: [],
      treeProps: { ...defaultProps, checkStrictly: true },
      statusOptions: getIntDictOptions('common_status'),
      formRules: {
        code: [{ required: true, message: '设备类型编码不能为空', trigger: 'blur' }],
        parentId: [{ required: true, message: '上级类型不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return { id: undefined, parentId: undefined, code: undefined, name: undefined, sort: 0, status: CommonStatusEnum.ENABLE, remark: undefined }
    },
    async open(type, id, parentId) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增设备类型' : '修改设备类型'
      this.formType = type
      this.resetFormData()
      if (id) {
        this.formLoading = true
        try {
          this.formData = (await DvMachineryTypeApi.getMachineryType(id)).data
        } finally {
          this.formLoading = false
        }
      }
      if (parentId) this.formData.parentId = parentId
      await this.getMachineryTypeTree()
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') {
            await DvMachineryTypeApi.createMachineryType(this.formData)
            this.$modal.msgSuccess('新增成功')
          } else {
            await DvMachineryTypeApi.updateMachineryType(this.formData)
            this.$modal.msgSuccess('修改成功')
          }
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.formLoading = false
        }
      })
    },
    resetFormData() {
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    async generateCode() {
      this.formData.code = (await AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.DV_MACHINERY_TYPE_CODE)).data
    },
    async getMachineryTypeTree() {
      const response = await DvMachineryTypeApi.getMachineryTypeList()
      this.machineryTypeTree = [{ id: 0, name: '顶级类型', children: handleTree(response.data) }]
    }
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
