<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="480px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as ContactCategoryApi from '@/api/oa/contact/category'

function createDefaultFormData() {
  return {
    id: undefined,
    name: '',
    sort: 0
  }
}

export default {
  name: 'OaContactCategoryForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      dialogTitle: '', // 弹窗的标题
      formLoading: false, // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formType: '', // 表单的类型：create - 新增；update - 修改
      formData: createDefaultFormData(), // 分类表单数据
      formRules: {
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增分类' : '修改分类'
      this.formType = type
      this.resetForm()
      // 修改时，设置分类数据
      if (id !== undefined) {
        this.formLoading = true
        ContactCategoryApi.getContactCategory(id).then(response => {
          this.formData = response.data
        }).finally(() => {
          this.formLoading = false
        })
      }
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? ContactCategoryApi.createContactCategory(this.formData)
          : ContactCategoryApi.updateContactCategory(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
