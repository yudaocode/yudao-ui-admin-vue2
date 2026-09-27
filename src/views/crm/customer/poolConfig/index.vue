<template>
  <div class="app-container crm-customer-pool-config">
    <doc-alert
      title="【客户】客户管理、公海客户"
      url="https://doc.iocoder.cn/crm/customer/"
    />
    <doc-alert
      title="【通用】数据权限"
      url="https://doc.iocoder.cn/crm/permission/"
    />

    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="160px"
    >
      <el-card shadow="never">
        <div
          slot="header"
          class="config-header"
        >
          <span class="config-title">客户公海规则设置</span>
          <el-button
            v-hasPermi="['crm:customer-pool-config:update']"
            type="primary"
            :loading="formLoading"
            @click="onSubmit"
          >保存</el-button>
        </div>

        <el-form-item
          label="客户公海规则设置"
          prop="enabled"
        >
          <el-radio-group
            v-model="formData.enabled"
            @change="changeEnable"
          >
            <el-radio :label="false">不启用</el-radio>
            <el-radio :label="true">启用</el-radio>
          </el-radio-group>
        </el-form-item>
        <template v-if="formData.enabled">
          <el-form-item>
            <el-input-number
              v-model="formData.contactExpireDays"
              controls-position="right"
            />
            <span class="config-text">天不跟进或</span>
            <el-input-number
              v-model="formData.dealExpireDays"
              controls-position="right"
            />
            <span class="config-text">天未成交</span>
          </el-form-item>
          <el-form-item
            label="提前提醒设置"
            prop="notifyEnabled"
          >
            <el-radio-group
              v-model="formData.notifyEnabled"
              @change="changeNotifyEnable"
            >
              <el-radio :label="false">不提醒</el-radio>
              <el-radio :label="true">提醒</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="formData.notifyEnabled">
            <span class="config-text config-text-first">提前</span>
            <el-input-number
              v-model="formData.notifyDays"
              controls-position="right"
            />
            <span class="config-text">天提醒</span>
          </el-form-item>
        </template>
      </el-card>
    </el-form>
  </div>
</template>

<script>
import * as CustomerPoolConfigApi from '@/api/crm/customer/poolConfig'

function createDefaultFormData() {
  return {
    enabled: false,
    contactExpireDays: undefined,
    dealExpireDays: undefined,
    notifyEnabled: false,
    notifyDays: undefined
  }
}

export default {
  name: 'CrmCustomerPoolConfig',
  data() {
    return {
      formLoading: false,
      formData: createDefaultFormData(),
      formRules: {
        enabled: [{ required: true, message: '是否启用客户公海不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    /** 获取配置 */
    async getConfig() {
      this.formLoading = true
      try {
        const data = (await CustomerPoolConfigApi.getCustomerPoolConfig()).data
        if (data !== null && data !== undefined) {
          this.formData = Object.assign(createDefaultFormData(), data)
        }
      } finally {
        this.formLoading = false
      }
    },
    /** 提交配置 */
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        CustomerPoolConfigApi.saveCustomerPoolConfig(this.formData).then(() => {
          this.$modal.msgSuccess('修改成功')
          return this.getConfig()
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 更改客户公海规则设置 */
    changeEnable() {
      if (!this.formData.enabled) {
        this.formData.contactExpireDays = undefined
        this.formData.dealExpireDays = undefined
        this.formData.notifyEnabled = false
        this.formData.notifyDays = undefined
      }
    },
    /** 更改提前提醒设置 */
    changeNotifyEnable() {
      if (!this.formData.notifyEnabled) {
        this.formData.notifyDays = undefined
      }
    }
  }
}
</script>

<style scoped>
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
}

.config-text {
  margin: 0 8px;
}

.config-text-first {
  margin-left: 0;
}
</style>
