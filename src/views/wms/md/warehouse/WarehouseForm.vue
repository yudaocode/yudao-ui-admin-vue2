<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="560px"
    append-to-body
  ><el-form
    ref="form"
    v-loading="loading"
    :model="formData"
    :rules="rules"
    label-width="110px"
  ><el-form-item
    label="仓库名称"
    prop="name"
  ><el-input
    v-model="formData.name"
    maxlength="50"
    placeholder="请输入仓库名称"
  /></el-form-item><el-form-item
    label="仓库编号"
    prop="code"
  ><el-input
    v-model="formData.code"
    maxlength="20"
    placeholder="请输入仓库编号"
  ><el-button
    slot="append"
    @click="formData.code = generateWmsCode('W')"
  >生成</el-button></el-input></el-form-item><el-form-item
    label="排序"
    prop="sort"
  ><el-input-number
    v-model="formData.sort"
    :min="0"
    controls-position="right"
  /></el-form-item><el-form-item label="备注"><el-input
    v-model="formData.remark"
    type="textarea"
    maxlength="255"
    placeholder="请输入备注"
  /></el-form-item></el-form><span slot="footer"><el-button
    type="primary"
    :loading="loading"
    @click="submitForm"
  >确 定</el-button><el-button @click="visible = false">取 消</el-button></span></el-dialog>
</template>
<script>
import { WarehouseApi } from '@/api/wms/md/warehouse'
import { generateWmsCode } from '@/views/wms/utils/constants'
export default {
  name: 'WmsWarehouseForm',
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: this.getDefaultForm(),
      rules: {
        code: [
          { required: true, message: '仓库编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '仓库名称不能为空', trigger: 'blur' }
        ],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    generateWmsCode,
    getDefaultForm() {
      return {
        id: undefined,
        code: undefined,
        name: undefined,
        sort: 0,
        remark: undefined
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type
      this.title = type === 'create' ? '新增仓库' : '修改仓库'
      this.formData = this.getDefaultForm()
      if (id) {
        this.loading = true
        WarehouseApi.getWarehouse(id)
          .then((response) => {
            this.formData = response.data
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action =
          this.formType === 'create'
            ? WarehouseApi.createWarehouse
            : WarehouseApi.updateWarehouse
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(
              this.formType === 'create' ? '新增成功' : '修改成功'
            )
            this.visible = false
            this.$emit('success')
          })
          .finally(() => {
            this.loading = false
          })
      })
    }
  }
}
</script>
