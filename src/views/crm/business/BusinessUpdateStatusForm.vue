<template>
  <el-dialog
    title="变更商机状态"
    :visible.sync="dialogVisible"
    width="400px"
    append-to-body
    :close-on-click-modal="false"
    @closed="resetForm"
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        label="商机阶段"
        prop="status"
      >
        <el-select
          v-model="formData.status"
          placeholder="请选择商机阶段"
          style="width: 100%"
        >
          <el-option
            v-for="item in statusList"
            :key="item.id"
            :label="item.name + '(赢单率：' + item.percent + '%)'"
            :value="item.id"
          />
          <el-option
            v-for="item in DEFAULT_STATUSES"
            :key="item.endStatus"
            :label="item.name + '(赢单率：' + item.percent + '%)'"
            :value="-item.endStatus"
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
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button
        :disabled="formLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateBusinessStatus } from '@/api/crm/business'
import { DEFAULT_STATUSES, getBusinessStatusSimpleList } from '@/api/crm/business/status'

const createDefaultForm = () => ({
  id: undefined,
  statusId: undefined,
  endStatus: undefined,
  status: undefined
})

export default {
  name: 'CrmBusinessUpdateStatusForm',
  data() {
    return {
      DEFAULT_STATUSES,
      dialogVisible: false,
      formLoading: false,
      formData: createDefaultForm(),
      formRules: {
        status: [{ required: true, message: '商机阶段不能为空', trigger: 'change' }]
      },
      statusList: [],
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async open(business) {
      const requestId = ++this.requestSequence
      this.dialogVisible = true
      this.formData = Object.assign(createDefaultForm(), {
        id: business && business.id,
        statusId: business && business.statusId,
        endStatus: business && business.endStatus,
        status: business && business.endStatus != null
          ? -business.endStatus
          : business && business.statusId
      })
      this.statusList = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      this.formLoading = true
      try {
        const data = (await getBusinessStatusSimpleList(business && business.statusTypeId)).data
        if (requestId === this.requestSequence) {
          this.statusList = data
        }
      } finally {
        if (requestId === this.requestSequence) {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      if (this.formLoading || !this.$refs.form) return
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        const status = Number(this.formData.status)
        await updateBusinessStatus({
          id: this.formData.id,
          statusId: status > 0 ? status : undefined,
          endStatus: status < 0 ? -status : undefined
        })
        this.$modal.msgSuccess('更新商机状态成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.requestSequence += 1
      this.formData = createDefaultForm()
      this.statusList = []
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
