<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <!-- 基础信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model.trim="formData.name" placeholder="请输入姓名" maxlength="50" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="分类名称">
            <oa-contact-category-select v-model="formData.categoryId" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 联系方式 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别">
            <el-radio-group v-model="formData.sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">未知</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model.trim="formData.mobile" placeholder="请输入手机号码" maxlength="20" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="formData.email" placeholder="请输入邮箱" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司电话">
            <el-input v-model.trim="formData.companyPhone" placeholder="请输入公司电话" maxlength="30" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 扩展信息 -->
      <el-form-item label="公司名称">
        <el-input v-model.trim="formData.companyName" placeholder="请输入公司名称" maxlength="100" />
      </el-form-item>
      <el-form-item label="联系地址">
        <el-input v-model.trim="formData.address" placeholder="请输入联系地址" maxlength="255" />
      </el-form-item>
      <el-form-item label="头像">
        <UploadImg v-model="formData.avatar" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model.trim="formData.remark"
          placeholder="请输入备注"
          type="textarea"
          :rows="3"
          maxlength="500"
        />
      </el-form-item>
    </el-form>
    <!-- 表单操作 -->
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import UploadImg from '@/components/UploadImg'
import * as ContactApi from '@/api/oa/contact'
import OaContactCategorySelect from './components/OaContactCategorySelect.vue'

function createDefaultFormData() {
  return {
    categoryId: undefined,
    name: '',
    sex: 0,
    mobile: '',
    email: '',
    address: '',
    companyName: '',
    companyPhone: '',
    avatar: '',
    remark: ''
  }
}

export default {
  name: 'OaContactForm',
  components: { Dialog, UploadImg, OaContactCategorySelect },
  data() {
    return {
      dialogVisible: false, // 弹窗的是否展示
      dialogTitle: '', // 弹窗的标题
      formLoading: false, // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
      formType: 'create', // 表单的类型：create - 新增；update - 修改
      formData: createDefaultFormData(), // 表单数据
      formRules: {
        name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        mobile: [{ required: true, message: '手机号码不能为空', trigger: 'blur' }],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增外部联系人' : '修改外部联系人'
      this.formType = type
      this.resetForm()
      this.formLoading = true
      return Promise.resolve()
        .then(() => {
          // 修改时，设置数据
          if (id) {
            return ContactApi.getContact(id).then(response => {
              this.formData = response.data
            })
          }
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? ContactApi.createContact(this.formData)
          : ContactApi.updateContact(this.formData)
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
