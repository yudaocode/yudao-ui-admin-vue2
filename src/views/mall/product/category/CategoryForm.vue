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
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="上级分类"
        prop="parentId"
      >
        <Treeselect
          v-model="form.parentId"
          :options="parentCategoryOptions"
          :normalizer="normalizer"
          :show-count="true"
          :default-expand-level="1"
          placeholder="请选择上级分类"
        />
      </el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入分类名称"
        />
      </el-form-item>
      <el-form-item
        label="分类图片"
        prop="picUrl"
      >
        <ImageUpload
          v-model="form.picUrl"
          :limit="1"
          :is-show-tip="false"
        />
        <div
          v-if="form.parentId === 0"
          style="font-size: 10px"
        >推荐 200x100 图片分辨率</div>
        <div
          v-else
          style="font-size: 10px"
        >推荐 100x100 图片分辨率</div>
      </el-form-item>
      <el-form-item
        label="分类排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <el-form-item
        label="开启状态"
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
      <el-form-item label="分类描述">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="请输入分类描述"
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
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import ImageUpload from '@/components/ImageUpload'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { handleTree } from '@/utils/ruoyi'
import { createCategory, getCategory, getCategoryList, updateCategory } from '@/api/mall/product/category'

export default {
  name: 'ProductCategoryForm',
  components: {
    Treeselect,
    ImageUpload
  },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      form: this.getDefaultForm(),
      parentCategoryOptions: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      rules: {
        parentId: [{ required: true, message: '请选择上级分类', trigger: 'change' }],
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        picUrl: [{ required: true, message: '分类图片不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        parentId: 0,
        name: '',
        picUrl: '',
        sort: 0,
        description: '',
        status: CommonStatusEnum.ENABLE
      }
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    },
    loadParentCategoryOptions() {
      return getCategoryList({}).then((response) => {
        const tree = handleTree(response.data, 'id', 'parentId')
        const root = { id: 0, name: '顶级分类', children: tree }
        this.parentCategoryOptions = [root]
      })
    },
    open(type, id) {
      this.visible = true
      this.formType = type || 'create'
      this.title = this.formType === 'update' ? '修改商品分类' : '新增商品分类'
      this.form = this.getDefaultForm()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
      this.loading = true
      const tasks = [this.loadParentCategoryOptions()]
      if (id !== undefined && id !== null) {
        tasks.push(getCategory(id).then((response) => {
          this.form = Object.assign(this.getDefaultForm(), response.data)
        }))
      }
      Promise.all(tasks).finally(() => {
        this.loading = false
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'update' ? updateCategory : createCategory
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
