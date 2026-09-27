<template>
  <el-dialog
    title="分配客户"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-alert
      v-if="formData.ids.length > 0"
      class="selection-alert"
      type="info"
      :closable="false"
      show-icon
      :title="'将分配 ' + formData.ids.length + ' 个公海客户'"
    />
    <el-form
      ref="form"
      v-loading="optionsLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <el-form-item
        label="负责人"
        prop="ownerUserId"
      >
        <el-select
          v-model="formData.ownerUserId"
          filterable
          placeholder="请选择负责人"
          style="width: 100%"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname || item.username"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="optionsLoading || formData.ids.length === 0"
        @click="submitForm"
      >确 定</el-button>
      <el-button
        :disabled="submitLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as CustomerApi from '@/api/crm/customer'
import { getSimpleUserList } from '@/api/system/user'

const createFormData = () => ({ ids: [], ownerUserId: undefined })

export default {
  name: 'CrmCustomerDistributeForm',
  data() {
    return {
      dialogVisible: false,
      optionsLoading: false,
      submitLoading: false,
      userOptions: [],
      formData: createFormData(),
      formRules: {
        ownerUserId: [{ required: true, message: '负责人不能为空', trigger: 'change' }]
      },
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async open(ids) {
      const normalizedIds = (Array.isArray(ids) ? ids : [ids])
        .filter(id => id !== undefined && id !== null)
      if (normalizedIds.length === 0) return
      const requestId = ++this.requestSequence
      this.dialogVisible = true
      this.formData = createFormData()
      this.formData.ids = normalizedIds
      this.userOptions = []
      this.optionsLoading = true
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      try {
        const users = (await getSimpleUserList()).data
        if (requestId !== this.requestSequence) return
        this.userOptions = users
      } finally {
        if (requestId === this.requestSequence) this.optionsLoading = false
      }
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid || this.submitLoading || this.formData.ids.length === 0) return
        this.submitLoading = true
        try {
          await CustomerApi.distributeCustomer(this.formData.ids, this.formData.ownerUserId)
          this.$modal.msgSuccess('分配客户成功')
          this.dialogVisible = false
          this.$emit('success')
        } finally {
          this.submitLoading = false
        }
      })
    },
    handleClosed() {
      this.requestSequence += 1
      this.optionsLoading = false
      this.submitLoading = false
      this.userOptions = []
      this.formData = createFormData()
      if (this.$refs.form) this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
.selection-alert {
  margin-bottom: 18px;
}
</style>
