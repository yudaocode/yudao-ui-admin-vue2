<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="600px"
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
        label="标题"
        prop="title"
      >
        <el-input
          v-model="formData.title"
          placeholder="请输入 Banner 标题"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="图片"
        prop="picUrl"
      >
        <ImageUpload
          v-model="formData.picUrl"
          :limit="1"
          :is-show-tip="false"
        />
      </el-form-item>
      <el-form-item
        label="跳转地址"
        prop="url"
      >
        <el-input
          v-model="formData.url"
          placeholder="请输入跳转地址"
          clearable
        />
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
        label="位置"
        prop="position"
      >
        <el-radio-group v-model="formData.position">
          <el-radio
            v-for="dict in positionDictDatas"
            :key="parseInt(dict.value)"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="描述"
        prop="memo"
      >
        <el-input
          v-model="formData.memo"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
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
import { createBanner, getBanner, updateBanner } from '@/api/mall/promotion/banner'

export default {
  name: 'PromotionBannerForm',
  components: { ImageUpload },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      positionDictDatas: getDictDatas(DICT_TYPE.PROMOTION_BANNER_POSITION),
      formData: this.getDefaultFormData(),
      formRules: {
        title: [{ required: true, message: 'Banner 标题不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '图片 URL 不能为空', trigger: 'change' }],
        status: [{ required: true, message: '活动状态不能为空', trigger: 'change' }],
        position: [{ required: true, message: '位置不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }],
        url: [{ required: true, message: '跳转地址不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        title: undefined,
        picUrl: undefined,
        status: 0,
        position: 1,
        url: undefined,
        sort: 0,
        memo: undefined
      }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '编辑 Banner' : '新增 Banner'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      getBanner(id)
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
        const action = this.formType === 'update' ? updateBanner : createBanner
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
