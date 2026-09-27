<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="600px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      :disabled="isDetail"
      label-width="120px"
    >
      <el-form-item
        label="类型编码"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          placeholder="请输入类型编码"
        >
          <el-button
            slot="append"
            @click="generateCode"
          >生成</el-button>
        </el-input>
      </el-form-item>
      <el-form-item
        label="类型名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入类型名称"
        />
      </el-form-item>
      <el-form-item
        label="是否编码管理"
        prop="codeFlag"
      >
        <el-radio-group v-model="formData.codeFlag">
          <el-radio
            v-for="dict in getBoolDictOptions(DICT_TYPE.INFRA_BOOLEAN_STRING)"
            :key="String(dict.value)"
            :label="dict.value"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="formData.codeFlag"
        label="保养维护类型"
        prop="maintenType"
      >
        <el-select
          v-model="formData.maintenType"
          clearable
          placeholder="请选择保养维护类型"
          style="width: 100%"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.MES_TM_MAINTEN_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.codeFlag && formData.maintenType === MesMaintenTypeEnum.REGULAR"
        label="保养周期（天）"
        prop="maintenPeriod"
      >
        <el-input-number
          v-model="formData.maintenPeriod"
          :min="1"
          placeholder="请输入保养周期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        v-if="formData.codeFlag && formData.maintenType === MesMaintenTypeEnum.USAGE"
        label="保养周期（次）"
        prop="maintenPeriod"
      >
        <el-input-number
          v-model="formData.maintenPeriod"
          :min="1"
          placeholder="请输入保养周期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        v-if="!isDetail"
        type="primary"
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBoolDictOptions, getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { TmToolTypeApi } from '@/api/mes/tm/tool/type'
import { AutoCodeRecordApi } from '@/api/mes/md/autocode/record'
import { MesAutoCodeRuleCode, MesMaintenTypeEnum } from '@/views/mes/utils/constants'

const createFormData = () => ({
  id: undefined,
  code: undefined,
  name: undefined,
  codeFlag: true,
  maintenType: undefined,
  maintenPeriod: undefined,
  remark: undefined
})

export default {
  name: 'ToolTypeForm',
  data() {
    return {
      DICT_TYPE,
      MesMaintenTypeEnum,
      dialogVisible: false,
      formLoading: false,
      formType: '',
      formData: createFormData(),
      formRules: {
        code: [{ required: true, message: '类型编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
        codeFlag: [{ required: true, message: '是否编码管理不能为空', trigger: 'change' }],
        maintenType: [{ required: true, message: '保养维护类型不能为空', trigger: 'change' }],
        maintenPeriod: [{ required: true, message: '保养周期不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      const titles = { create: '新增工具类型', update: '修改工具类型', detail: '查看工具类型' }
      return titles[this.formType] || this.formType
    },
    isDetail() {
      return this.formType === 'detail'
    }
  },
  watch: {
    'formData.codeFlag'(value) {
      if (value) return
      this.formData.maintenType = undefined
      this.formData.maintenPeriod = undefined
    }
  },
  methods: {
    getBoolDictOptions,
    getIntDictOptions,
    open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.resetForm()
      if (id === undefined || id === null) return Promise.resolve()
      this.formLoading = true
      return TmToolTypeApi.getToolType(id).then((response) => {
        this.formData = response.data
      }).finally(() => {
        this.formLoading = false
      })
    },
    generateCode() {
      return AutoCodeRecordApi.generateAutoCode(MesAutoCodeRuleCode.TM_TOOL_TYPE_CODE)
        .then((response) => {
          this.formData.code = response.data
        })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? TmToolTypeApi.createToolType(this.formData)
          : TmToolTypeApi.updateToolType(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
