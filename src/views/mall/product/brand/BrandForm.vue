<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="品牌名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入品牌名称"
        />
      </el-form-item>
      <el-form-item
        label="品牌图片"
        prop="picUrl"
      >
        <ImageUpload
          v-model="form.picUrl"
          :limit="1"
          :is-show-tip="false"
        />
      </el-form-item>
      <el-form-item
        label="品牌排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <el-form-item
        label="品牌状态"
        prop="status"
      >
        <el-radio-group v-model="form.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="品牌描述">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入品牌描述"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="loading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { createBrand, getBrand, updateBrand } from '@/api/mall/product/brand'

export default {
  name: 'ProductBrandForm',
  components: {
    ImageUpload
  },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      form: this.getDefaultForm(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      rules: {
        name: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '品牌图片不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '品牌排序不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        name: '',
        picUrl: '',
        sort: 0,
        description: '',
        status: CommonStatusEnum.ENABLE
      }
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改品牌' : '新增品牌'
      this.form = this.getDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
      if (id !== undefined && id !== null) {
        this.loading = true
        getBrand(id).then((response) => {
          this.form = Object.assign(this.getDefaultForm(), response.data)
        }).finally(() => {
          this.loading = false
        })
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'update' ? updateBrand : createBrand
        action(this.form).then(() => {
          this.$modal.msgSuccess(this.formType === 'update' ? '修改成功' : '新增成功')
          this.visible = false
          this.$emit('success')
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>
