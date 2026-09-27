<template>
  <el-dialog
    title="新建首月社保表"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="104px"
    >
      <el-form-item
        label="社保月份"
        prop="yearMonth"
      >
        <el-date-picker
          v-model="formData.yearMonth"
          class="full-width"
          placeholder="请选择社保月份"
          type="month"
          value-format="yyyy-MM"
        />
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button
        :disabled="formLoading"
        type="primary"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { createFirstInsuranceMonthRecord } from '@/api/hrm/insurance/month-record'

export default {
  name: 'HrmInsuranceFirstMonthForm',
  data() {
    return {
      dialogVisible: false,
      formLoading: false,
      formData: { yearMonth: '' },
      formRules: {
        yearMonth: [{ required: true, message: '社保月份不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    open() {
      this.formData.yearMonth = ''
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        const [year, month] = this.formData.yearMonth.split('-').map(Number)
        await createFirstInsuranceMonthRecord({ year, month })
        this.$modal.msgSuccess('创建成功')
        this.dialogVisible = false
        this.$emit('success', year)
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>.full-width { width: 100%; }</style>
