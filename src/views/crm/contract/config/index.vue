<template>
  <div class="app-container crm-contract-config">
    <doc-alert
      title="【合同】合同管理、合同提醒"
      url="https://doc.iocoder.cn/crm/contract/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />

    <el-card
      shadow="never"
      class="config-card"
    >
      <div
        slot="header"
        class="config-header"
      >
        <span>合同配置设置</span>
        <el-button
          type="primary"
          size="small"
          :loading="loading"
          @click="submitForm"
        >保存</el-button>
      </div>

      <el-form
        ref="form"
        v-loading="loading"
        :model="formData"
        :rules="rules"
        label-width="140px"
      >
        <el-form-item
          label="提前提醒设置"
          prop="notifyEnabled"
        >
          <el-radio-group
            v-model="formData.notifyEnabled"
            @change="handleNotifyEnabledChange"
          >
            <el-radio :label="false">不提醒</el-radio>
            <el-radio :label="true">提醒</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="formData.notifyEnabled"
          label="提前提醒天数"
          prop="notifyDays"
        >
          <el-input-number
            v-model="formData.notifyDays"
            :min="1"
            controls-position="right"
          />
          <span class="config-suffix">天</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import * as ContractConfigApi from '@/api/crm/contract/config'

export default {
  name: 'CrmContractConfig',
  data() {
    return {
      loading: false,
      formData: {
        notifyEnabled: false,
        notifyDays: undefined
      },
      rules: {}
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    async getConfig() {
      this.loading = true
      try {
        const data = (await ContractConfigApi.getContractConfig()).data
        if (data) {
          this.formData = Object.assign({ notifyEnabled: false, notifyDays: undefined }, data)
        }
      } finally {
        this.loading = false
      }
    },
    handleNotifyEnabledChange(val) {
      if (!val) {
        this.formData.notifyDays = undefined
      } else if (!this.formData.notifyDays) {
        this.formData.notifyDays = 1
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.loading = true
        ContractConfigApi.saveContractConfig(this.formData).then(() => {
          this.$modal.msgSuccess('修改成功')
          this.getConfig()
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>

<style scoped>
.config-card {
  max-width: 880px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-suffix {
  margin-left: 8px;
  color: #606266;
}
</style>
