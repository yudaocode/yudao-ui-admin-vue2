<template>
  <el-form
    ref="form"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="isDetail"
  >
    <el-form-item
      label="商品名称"
      prop="name"
    >
      <el-input
        v-model="formData.name"
        maxlength="64"
        show-word-limit
        type="textarea"
        :rows="2"
        placeholder="请输入商品名称"
      />
    </el-form-item>
    <el-form-item
      label="商品分类"
      prop="categoryId"
    >
      <el-cascader
        v-model="formData.categoryId"
        :options="categoryList"
        :props="categoryProps"
        filterable
        clearable
        class="field-width"
        placeholder="请选择商品分类"
      />
      <el-button
        class="refresh-button"
        size="small"
        icon="el-icon-refresh"
        @click="refreshCategoryList"
      />
    </el-form-item>
    <el-form-item
      label="商品品牌"
      prop="brandId"
    >
      <el-select
        v-model="formData.brandId"
        filterable
        clearable
        class="field-width"
        placeholder="请选择商品品牌"
      >
        <el-option
          v-for="item in brandList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button
        class="refresh-button"
        size="small"
        icon="el-icon-refresh"
        @click="refreshBrandList"
      />
    </el-form-item>
    <el-form-item
      label="商品关键字"
      prop="keyword"
    >
      <el-input
        v-model="formData.keyword"
        class="field-width"
        maxlength="128"
        placeholder="请输入商品关键字"
      />
    </el-form-item>
    <el-form-item
      label="商品简介"
      prop="introduction"
    >
      <el-input
        v-model="formData.introduction"
        class="field-width"
        maxlength="128"
        show-word-limit
        type="textarea"
        :rows="2"
        placeholder="请输入商品简介"
      />
    </el-form-item>
    <el-form-item
      label="商品封面图"
      prop="picUrl"
    >
      <UploadImg
        v-model="formData.picUrl"
        :disabled="isDetail"
        height="80px"
      />
    </el-form-item>
    <el-form-item
      label="商品轮播图"
      prop="sliderPicUrls"
    >
      <UploadImgs
        v-model="formData.sliderPicUrls"
        :disabled="isDetail"
      />
    </el-form-item>
  </el-form>
</template>

<script>
import UploadImg from '@/components/UploadImg'
import UploadImgs from '@/components/UploadImgs'
import { getSimpleBrandList } from '@/api/mall/product/brand'
import { getCategoryList } from '@/api/mall/product/category'
import { copyValueToTarget } from '@/utils'
import { defaultProps, handleTree } from '@/utils/tree'

export default {
  name: 'ProductSpuInfoForm',
  components: { UploadImg, UploadImgs },
  props: {
    propFormData: {
      type: Object,
      default: () => ({})
    },
    isDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: this.defaultForm(),
      categoryList: [],
      brandList: [],
      categoryProps: defaultProps,
      rules: {
        name: [{ required: true, message: '商品名称不能为空', trigger: 'blur' }],
        categoryId: [{ required: true, message: '商品分类不能为空', trigger: 'change' }],
        brandId: [{ required: true, message: '商品品牌不能为空', trigger: 'change' }],
        keyword: [{ required: true, message: '商品关键字不能为空', trigger: 'blur' }],
        introduction: [{ required: true, message: '商品简介不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '商品封面图不能为空', trigger: 'change' }],
        sliderPicUrls: [{ required: true, message: '商品轮播图不能为空', trigger: 'change' }]
      }
    }
  },
  watch: {
    propFormData: {
      deep: true,
      immediate: true,
      handler(value) {
        if (!value) return
        copyValueToTarget(this.formData, value)
      }
    }
  },
  async mounted() {
    await this.refreshCategoryList()
    await this.refreshBrandList()
  },
  methods: {
    defaultForm() {
      return {
        name: '',
        categoryId: undefined,
        brandId: undefined,
        keyword: '',
        introduction: '',
        picUrl: '',
        sliderPicUrls: []
      }
    },
    async refreshCategoryList() {
      const response = await getCategoryList({})
      this.categoryList = handleTree(response.data, 'id')
    },
    async refreshBrandList() {
      const response = await getSimpleBrandList()
      this.brandList = response.data
    },
    async validate() {
      try {
        await new Promise((resolve, reject) => {
          this.$refs.form.validate(valid => valid ? resolve(true) : reject(new Error('商品基础信息不完整')))
        })
        Object.assign(this.propFormData, this.formData)
      } catch (error) {
        this.$message.error('【基础设置】不完善，请填写相关信息')
        this.$emit('update:activeName', 'info')
        throw error
      }
    }
  }
}
</script>

<style scoped>
.field-width { width: 360px; }
.refresh-button { margin-left: 8px; }
</style>
