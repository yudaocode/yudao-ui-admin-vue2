<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    :width="width"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="form"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="分类名" prop="name">
        <el-input v-model="form.name" placeholder="请输入分类名" />
      </el-form-item>
      <template v-if="!compact">
        <el-form-item label="分类标志" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类标志" />
        </el-form-item>
        <el-form-item label="分类描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入分类描述" />
        </el-form-item>
        <el-form-item label="分类状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in getDictDatas(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="Number(dict.value)"
            >
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类排序" prop="sort">
          <el-input-number
            v-model="form.sort"
            placeholder="请输入分类排序"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" :disabled="formLoading" @click="submitForm">
        确 定
      </el-button>
      <el-button :disabled="formLoading" @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  createCategory,
  getCategory,
  updateCategory
} from '@/api/bpm/category'
import { CommonStatusEnum } from '@/utils/constants'

function createDefaultForm() {
  return {
    id: undefined,
    name: undefined,
    code: undefined,
    description: undefined,
    status: CommonStatusEnum.ENABLE,
    // 后端 DTO 要求排序非空；新增时从 0 开始，用户仍可调整。
    sort: 0
  }
}

/** 可复用的 BPM 流程分类表单。 */
export default {
  name: 'CategoryForm',
  props: {
    width: {
      type: String,
      default: '500px'
    }
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      compact: false,
      formLoading: false,
      form: createDefaultForm()
    }
  },
  computed: {
    // 重命名场景只编辑名称，避免隐藏字段的校验阻塞提交。
    formRules() {
      const rules = {
        name: [{ required: true, message: '分类名不能为空', trigger: 'blur' }]
      }
      if (!this.compact) {
        rules.code = [{ required: true, message: '分类标志不能为空', trigger: 'blur' }]
        rules.status = [{ required: true, message: '分类状态不能为空', trigger: 'change' }]
        rules.sort = [{ required: true, message: '分类排序不能为空', trigger: 'change' }]
      }
      return rules
    }
  },
  methods: {
    /**
     * 打开表单。
     *
     * options.compact 可用于模型页的“重命名分类”场景，只展示名称字段；
     * 其它页面直接调用 open('create'|'update', id) 即可。
     */
    async open(type, id, options = {}) {
      if (this.formLoading) {
        return
      }
      this.formType = type || 'create'
      this.compact = Boolean(options.compact)
      this.dialogTitle = options.title || (this.formType === 'create' ? '添加流程分类' : '修改流程分类')
      this.resetForm()
      this.dialogVisible = true
      if (id !== undefined && id !== null) {
        this.formLoading = true
        try {
          const response = await getCategory(id)
          this.form = {
            ...createDefaultForm(),
            ...((response && response.data) || {})
          }
          if (this.form.status !== undefined && this.form.status !== null) {
            this.form.status = Number(this.form.status)
          }
          if (this.form.sort !== undefined && this.form.sort !== null) {
            this.form.sort = Number(this.form.sort)
          }
        } catch (e) {
          // request 拦截器已提示后端错误，保留弹窗便于用户重试或取消。
        } finally {
          this.formLoading = false
          this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        }
      } else {
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    async submitForm() {
      if (this.formLoading) {
        return
      }
      const form = this.$refs.form
      if (!form) {
        return
      }
      const valid = await new Promise(resolve => form.validate(resolve))
      if (!valid) {
        return
      }
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createCategory(this.form)
          this.showSuccess('新增成功')
        } else {
          await updateCategory(this.form)
          this.showSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } catch (e) {
        // request 拦截器已统一展示错误信息。
      } finally {
        this.formLoading = false
      }
    },
    showSuccess(message) {
      if (this.$modal && this.$modal.msgSuccess) {
        this.$modal.msgSuccess(message)
      } else if (this.$message) {
        this.$message.success(message)
      }
    },
    resetForm() {
      this.form = createDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    },
    handleClosed() {
      this.formLoading = false
      this.resetForm()
    }
  }
}
</script>
