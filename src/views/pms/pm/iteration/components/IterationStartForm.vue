<template>
  <Dialog v-model="dialogVisible" title="开始迭代" width="520px">
    <!-- 迭代周期 -->
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="92px">
      <el-form-item label="迭代周期" prop="timeRange">
        <el-date-picker
          v-model="formData.timeRange"
          style="width: 100%"
          end-placeholder="结束时间"
          range-separator="至"
          start-placeholder="开始时间"
          type="datetimerange"
          value-format="timestamp"
        />
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as IterationApi from '@/api/pms/pm/iteration'

export default {
  name: 'PmsIterationStartForm',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, formLoading: false, iterationId: 0,
      formData: { timeRange: [] },
      formRules: { timeRange: [{ required: true, message: '迭代周期不能为空', trigger: 'change' }] }
    }
  },
  methods: {
    async open(iteration) {
      if (!iteration.id) return
      this.dialogVisible = true
      this.iterationId = iteration.id
      this.resetForm()
      this.formData.timeRange = iteration.startTime && iteration.endTime
        ? [Number(iteration.startTime), Number(iteration.endTime)] : []
      await this.$nextTick()
      if (this.$refs.formRef) this.$refs.formRef.clearValidate()
    },
    async submitForm() {
      if (!this.$refs.formRef || this.formLoading) return
      const valid = await new Promise(resolve => this.$refs.formRef.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await IterationApi.startIteration({
          id: this.iterationId,
          startTime: Number(this.formData.timeRange[0]),
          endTime: Number(this.formData.timeRange[1])
        })
        this.$message.success('迭代已开始')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = { timeRange: [] }
    }
  }
}
</script>
