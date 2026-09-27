<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="900px"
    append-to-body
    @close="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item
            label="文章标题"
            prop="title"
          >
            <el-input
              v-model="formData.title"
              placeholder="请输入文章标题"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="文章分类"
            prop="categoryId"
          >
            <el-select
              v-model="formData.categoryId"
              placeholder="请选择文章分类"
              clearable
              filterable
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="文章作者"
            prop="author"
          >
            <el-input
              v-model="formData.author"
              placeholder="请输入文章作者"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="文章简介"
            prop="introduction"
          >
            <el-input
              v-model="formData.introduction"
              placeholder="请输入文章简介"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="文章封面"
            prop="picUrl"
          >
            <ImageUpload
              v-model="formData.picUrl"
              :limit="1"
              :is-show-tip="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        </el-col>
        <el-col :span="12">
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
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否热门"
            prop="recommendHot"
          >
            <el-radio-group v-model="formData.recommendHot">
              <el-radio
                v-for="dict in boolDictDatas"
                :key="dict.value"
                :label="dict.value === 'true'"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="是否轮播图"
            prop="recommendBanner"
          >
            <el-radio-group v-model="formData.recommendBanner">
              <el-radio
                v-for="dict in boolDictDatas"
                :key="dict.value"
                :label="dict.value === 'true'"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="关联商品"
            prop="spuId"
          >
            <el-select
              v-model="formData.spuId"
              placeholder="请选择关联商品"
              clearable
              filterable
            >
              <el-option
                v-for="item in spuList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="文章内容"
            prop="content"
          >
            <Editor
              v-model="formData.content"
              :min-height="240"
            />
          </el-form-item>
        </el-col>
      </el-row>
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
import Editor from '@/components/Editor'
import ImageUpload from '@/components/ImageUpload'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {
  createArticle,
  getArticle,
  updateArticle
} from '@/api/mall/promotion/article'

export default {
  name: 'PromotionArticleForm',
  components: { Editor, ImageUpload },
  props: {
    categoryList: { type: Array, default: () => [] },
    spuList: { type: Array, default: () => [] }
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      DICT_TYPE,
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      boolDictDatas: getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING),
      formData: this.getDefaultFormData(),
      formRules: {
        categoryId: [{ required: true, message: '文章分类不能为空', trigger: 'change' }],
        title: [{ required: true, message: '文章标题不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '文章封面图片地址不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
        spuId: [{ required: true, message: '关联商品不能为空', trigger: 'change' }],
        recommendHot: [{ required: true, message: '是否热门不能为空', trigger: 'change' }],
        recommendBanner: [{ required: true, message: '是否轮播图不能为空', trigger: 'change' }],
        content: [{ required: true, message: '文章内容不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        categoryId: undefined,
        title: undefined,
        author: undefined,
        picUrl: undefined,
        introduction: undefined,
        sort: 0,
        status: 0,
        spuId: undefined,
        recommendHot: false,
        recommendBanner: false,
        content: ''
      }
    },
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'update' ? '编辑文章' : '新增文章'
      this.resetForm()
      if (!id) return
      this.formLoading = true
      getArticle(id)
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
        const action = this.formType === 'update' ? updateArticle : createArticle
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
