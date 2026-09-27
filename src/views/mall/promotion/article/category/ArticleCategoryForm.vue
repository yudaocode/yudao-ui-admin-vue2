<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="520px"
    append-to-body
    @close="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入分类名称"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="图标地址"
        prop="picUrl"
      >
        <ImageUpload
          v-model="formData.picUrl"
          :limit="1"
          :is-show-tip="false"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          :min="0"
          controls-position="right"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="formLoading"
        @click="dialogVisible = false"
      >取消</el-button>
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  createArticleCategory,
  getArticleCategory,
  updateArticleCategory
} from '@/api/mall/promotion/articleCategory'

export default {
  name: 'PromotionArticleCategoryForm',
  components: { ImageUpload },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { id: undefined, name: undefined, picUrl: undefined, status: 0, sort: 0 }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '编辑文章分类' : '新增文章分类'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      getArticleCategory(id)
        .then(response => {
          const data = response.data
          if (data) this.formData = Object.assign(this.getDefaultFormData(), data)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const action = this.formType === 'update' ? updateArticleCategory : createArticleCategory
        action(this.formData)
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
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
