<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="上级分类"
        prop="parentId"
      >
        <el-cascader
          v-model="formData.parentId"
          :options="categoryTree"
          :props="cascaderProps"
          clearable
          filterable
          class="width-full"
          placeholder="请选择上级分类"
        />
      </el-form-item>
      <el-form-item
        label="分类编号"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          maxlength="20"
          placeholder="请输入分类编号"
        ><el-button
          slot="append"
          @click="formData.code = generateWmsCode('C')"
        >生成</el-button></el-input>
      </el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        maxlength="60"
        placeholder="请输入分类名称"
      /></el-form-item>
      <el-form-item
        label="显示排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        :min="0"
        controls-position="right"
        class="width-full"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-select
          v-model="formData.status"
          clearable
          class="width-full"
          placeholder="请选择状态"
        ><el-option
          v-for="item in statusDictDatas"
          :key="item.value"
          :label="item.label"
          :value="Number(item.value)"
        /></el-select>
      </el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :loading="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { handleTree } from '@/utils/ruoyi'
import { ItemCategoryApi } from '@/api/wms/md/item/category'
import { generateWmsCode } from '@/views/wms/utils/constants'

export default {
  name: 'WmsItemCategoryForm',
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      formData: this.getDefaultForm(),
      categoryTree: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      cascaderProps: { value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false },
      rules: {
        parentId: [{ required: true, message: '上级分类不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '分类编号不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '显示排序不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    generateWmsCode,
    getDefaultForm() { return { id: undefined, parentId: undefined, code: undefined, name: undefined, sort: 0, status: CommonStatusEnum.ENABLE } },
    open(type, id, parentId) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改商品分类' : '新增商品分类'
      this.formData = this.getDefaultForm()
      this.formData.parentId = parentId
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      this.loading = true
      const requests = [ItemCategoryApi.getItemCategorySimpleList()]
      if (id !== undefined && id !== null) requests.push(ItemCategoryApi.getItemCategory(id))
      Promise.all(requests).then(results => {
        this.categoryTree = [{ id: 0, name: '顶级分类', children: handleTree(results[0].data, 'id', 'parentId') }]
        if (results[1]) {
          this.formData = results[1].data
        }
      }).finally(() => { this.loading = false })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'create' ? ItemCategoryApi.createItemCategory : ItemCategoryApi.updateItemCategory
        action(this.formData).then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.visible = false
          this.$emit('success')
        }).finally(() => { this.loading = false })
      })
    }
  }
}
</script>

<style scoped>
.width-full { width: 100%; }
</style>
