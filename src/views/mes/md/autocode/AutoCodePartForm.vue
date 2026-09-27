<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="24"><el-form-item
          label="分段排序"
          prop="sort"
        ><el-input-number
          v-model="formData.sort"
          :min="1"
          class="full-width"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="分段长度"
          prop="length"
        ><el-input-number
          v-model="formData.length"
          :min="1"
          :max="50"
          class="full-width"
        /></el-form-item></el-col>
        <el-col :span="24"><el-form-item
          label="分段类型"
          prop="type"
        ><el-select
          v-model="formData.type"
          placeholder="请选择分段类型"
          class="full-width"
        ><el-option
          v-for="dict in partTypeOptions"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
        <el-col
          v-if="formData.type === MesAutoCodePartTypeEnum.DATE"
          :span="24"
        ><el-form-item
          label="日期格式"
          prop="dateFormat"
        ><el-select
          v-model="formData.dateFormat"
          placeholder="请选择日期格式"
          class="full-width"
        ><el-option
          v-for="format in dateFormats"
          :key="format"
          :label="format"
          :value="format"
        /></el-select></el-form-item></el-col>
        <el-col
          v-if="formData.type === MesAutoCodePartTypeEnum.FIX"
          :span="24"
        ><el-form-item
          label="固定字符"
          prop="fixCharacter"
        ><el-input
          v-model="formData.fixCharacter"
          placeholder="请输入固定字符"
        /></el-form-item></el-col>
        <template v-if="formData.type === MesAutoCodePartTypeEnum.SERIAL">
          <el-col :span="24"><el-form-item
            label="流水号起始值"
            prop="serialStartNo"
          ><el-input-number
            v-model="formData.serialStartNo"
            :min="1"
            class="full-width"
          /></el-form-item></el-col>
          <el-col :span="24"><el-form-item
            label="流水号步长"
            prop="serialStep"
          ><el-input-number
            v-model="formData.serialStep"
            :min="1"
            class="full-width"
          /></el-form-item></el-col>
          <el-col :span="24"><el-form-item
            label="是否循环"
            prop="cycleFlag"
          ><el-switch v-model="formData.cycleFlag" /></el-form-item></el-col>
          <el-col
            v-if="formData.cycleFlag"
            :span="24"
          ><el-form-item
            label="循环方式"
            prop="cycleMethod"
          ><el-select
            v-model="formData.cycleMethod"
            placeholder="请选择循环方式"
            class="full-width"
          ><el-option
            v-for="dict in cycleMethodOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          /></el-select></el-form-item></el-col>
        </template>
        <el-col :span="24"><el-form-item
          label="备注"
          prop="remark"
        ><el-input
          v-model="formData.remark"
          type="textarea"
          placeholder="请输入备注"
        /></el-form-item></el-col>
      </el-row>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :disabled="formLoading"
      @click="submitForm"
    >确 定</el-button><el-button @click="dialogVisible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { AutoCodePartApi } from '@/api/mes/md/autocode/part'
import { MesAutoCodePartTypeEnum } from '@/views/mes/utils/constants'

export default {
  name: 'AutoCodePartForm',
  data() {
    return {
      dialogVisible: false, dialogTitle: '', formLoading: false, formType: '',
      MesAutoCodePartTypeEnum,
      partTypeOptions: getIntDictOptions(DICT_TYPE.MES_MD_AUTO_CODE_PART_TYPE),
      cycleMethodOptions: getIntDictOptions(DICT_TYPE.MES_MD_AUTO_CODE_CYCLE_METHOD),
      dateFormats: ['yyyy', 'yyyyMM', 'yyyyMMdd', 'yyyyMMddHH', 'yyyyMMddHHmm'],
      formData: this.getDefaultForm(),
      formRules: {
        sort: [{ required: true, message: '分段排序不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '分段类型不能为空', trigger: 'change' }],
        length: [{ required: true, message: '分段长度不能为空', trigger: 'blur' }],
        dateFormat: [{ required: true, message: '日期格式不能为空', trigger: 'change' }],
        fixCharacter: [{ required: true, message: '固定字符不能为空', trigger: 'blur' }],
        serialStartNo: [{ required: true, message: '流水号起始值不能为空', trigger: 'blur' }],
        serialStep: [{ required: true, message: '流水号步长不能为空', trigger: 'blur' }],
        cycleMethod: [{ required: true, message: '循环方式不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    getDefaultForm() { return { id: undefined, ruleId: undefined, sort: 1, type: undefined, length: undefined, dateFormat: undefined, fixCharacter: undefined, serialStartNo: undefined, serialStep: undefined, cycleFlag: false, cycleMethod: undefined, remark: undefined } },
    resetFormData() { this.formData = this.getDefaultForm(); this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields()) },
    async open(type, id, ruleId, maxSort) {
      this.dialogVisible = true; this.dialogTitle = type === 'create' ? '新增编码规则分段' : '修改编码规则分段'; this.formType = type; this.resetFormData(); this.formData.ruleId = ruleId
      if (maxSort) this.formData.sort = maxSort + 1
      if (id) { this.formLoading = true; try { this.formData = (await AutoCodePartApi.getAutoCodePart(id)).data } finally { this.formLoading = false } }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        this.formLoading = true
        try {
          if (this.formType === 'create') { await AutoCodePartApi.createAutoCodePart(this.formData); this.$modal.msgSuccess('新增成功') } else { await AutoCodePartApi.updateAutoCodePart(this.formData); this.$modal.msgSuccess('修改成功') }
          this.dialogVisible = false; this.$emit('success')
        } finally { this.formLoading = false }
      })
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
