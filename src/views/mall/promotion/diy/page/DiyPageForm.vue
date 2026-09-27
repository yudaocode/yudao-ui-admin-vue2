<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    custom-class="diy-page-form-dialog"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="页面名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入页面名称"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
        />
      </el-form-item>
      <el-form-item
        label="预览图"
        prop="previewPicUrls"
      >
        <ImageUpload
          v-model="previewPicUrlsUploadValue"
          :limit="5"
          :is-show-tip="false"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as DiyPageApi from '@/api/mall/promotion/diy/page'

export default {
  name: 'DiyPageForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '页面名称不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    // ImageUpload is a Vue2 UI adapter whose v-model is comma-delimited. Keep
    // the page API model identical to Vue3: previewPicUrls is always string[].
    previewPicUrlsUploadValue: {
      get() {
        return this.formData.previewPicUrls.join(',')
      },
      set(value) {
        this.formData.previewPicUrls = value ? value.split(',').filter(Boolean) : []
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        remark: undefined,
        previewPicUrls: []
      }
    },
    /** 打开新增或修改弹窗。 */
    open(type, id) {
      this.resetForm()
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增装修页面' : '修改装修页面'
      this.dialogVisible = true
      if (id === undefined || id === null) return Promise.resolve()

      this.formLoading = true
      return DiyPageApi.getDiyPage(id)
        .then((response) => {
          this.formData = response.data
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 提交页面基础信息。 */
    submitForm() {
      if (!this.$refs.form) return Promise.resolve(false)
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          if (!valid) {
            resolve(false)
            return
          }
          this.formLoading = true
          const request = this.formType === 'create'
            ? DiyPageApi.createDiyPage(this.formData)
            : DiyPageApi.updateDiyPage(this.formData)
          request
            .then(() => {
              this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
              this.dialogVisible = false
              this.$emit('success')
              return true
            })
            .finally(() => {
              this.formLoading = false
            })
            .then(resolve, reject)
        })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}

::v-deep .diy-page-form-dialog {
  max-width: calc(100vw - 30px);
}

@media (max-width: 768px) {
  ::v-deep .diy-page-form-dialog {
    width: calc(100vw - 24px) !important;
    margin-top: 5vh !important;
  }
}
</style>
