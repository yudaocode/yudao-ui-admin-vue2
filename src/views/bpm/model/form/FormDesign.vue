<template>
  <div class="model-step-form">
    <el-form ref="form" :model="modelData" :rules="rules" label-width="120px">
      <el-form-item label="表单类型" prop="formType">
        <el-radio-group v-model="modelData.formType">
          <el-radio :label="BpmModelFormType.NORMAL">流程表单</el-radio>
          <el-radio :label="BpmModelFormType.CUSTOM">业务表单</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="modelData.formType === BpmModelFormType.NORMAL" label="流程表单" prop="formId">
        <el-select v-model="modelData.formId" filterable clearable placeholder="请选择流程表单" style="width: 100%">
          <el-option v-for="item in formList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <template v-if="modelData.formType === BpmModelFormType.CUSTOM">
        <el-form-item label="提交路由" prop="formCustomCreatePath">
          <el-input v-model="modelData.formCustomCreatePath" placeholder="例如：/bpm/oa/leave/create" />
        </el-form-item>
        <el-form-item label="查看组件" prop="formCustomViewPath">
          <el-input v-model="modelData.formCustomViewPath" placeholder="例如：/bpm/oa/leave/detail" />
        </el-form-item>
      </template>
    </el-form>

    <div v-if="modelData.formType === BpmModelFormType.NORMAL && formPreview.rule.length" class="form-preview">
      <div class="form-preview__title">表单预览</div>
      <form-create :rule="formPreview.rule" :option="formPreview.option" />
    </div>
  </div>
</template>

<script>
import { getForm } from '@/api/bpm/form'
import { setConfAndFields2 } from '@/utils/formCreate'
import { BpmModelFormType } from '@/utils/constants'

export default {
  name: 'BpmModelFormDesign',
  props: {
    value: {
      type: Object,
      required: true
    },
    formList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      BpmModelFormType,
      formPreview: {
        rule: [],
        option: {
          submitBtn: false,
          resetBtn: false
        }
      },
      rules: {
        formType: [{ required: true, message: '表单类型不能为空', trigger: 'change' }],
        formId: [{ required: true, message: '流程表单不能为空', trigger: 'change' }],
        formCustomCreatePath: [{ required: true, message: '提交路由不能为空', trigger: 'blur' }],
        formCustomViewPath: [{ required: true, message: '查看组件不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    modelData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    'modelData.formId': {
      immediate: true,
      handler(value) {
        this.loadPreview(value)
      }
    },
    'modelData.formType'() {
      this.loadPreview(this.modelData.formId)
    }
  },
  methods: {
    async loadPreview(formId) {
      this.formPreview.rule = []
      if (!formId || this.modelData.formType !== BpmModelFormType.NORMAL) {
        return
      }
      const response = await getForm(formId)
      const data = response.data
      setConfAndFields2(this.formPreview, data.conf, data.fields)
      this.formPreview.option.submitBtn = false
      this.formPreview.option.resetBtn = false
    },
    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate((valid) => {
          valid ? resolve() : reject(new Error('请完善表单设计'))
        })
      })
    }
  }
}
</script>

<style scoped>
.model-step-form {
  max-width: 760px;
  margin: 20px auto;
}

.form-preview {
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.form-preview__title {
  margin-bottom: 12px;
  font-weight: 600;
}
</style>
