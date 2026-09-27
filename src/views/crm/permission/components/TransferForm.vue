<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="560px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="optionsLoading"
      :model="formData"
      :rules="formRules"
      label-width="150px"
    >
      <el-form-item
        label="选择新负责人"
        prop="newOwnerUserId"
      >
        <el-select
          v-model="formData.newOwnerUserId"
          filterable
          placeholder="请选择新负责人"
          style="width: 100%"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="老负责人">
        <el-radio-group
          v-model="oldOwnerHandler"
          @change="handleOwnerChange"
        >
          <el-radio :label="false">移除</el-radio>
          <el-radio :label="true">加入团队</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="oldOwnerHandler"
        label="老负责人权限级别"
        prop="oldOwnerPermissionLevel"
      >
        <el-radio-group v-model="formData.oldOwnerPermissionLevel">
          <el-radio
            v-for="item in permissionLevelOptions"
            :key="item.value"
            :label="item.value"
          >{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="bizType === BizTypeEnum.CRM_CUSTOMER"
        label="同时转移"
      >
        <el-checkbox-group v-model="formData.toBizTypes">
          <el-checkbox :label="BizTypeEnum.CRM_CONTACT">联系人</el-checkbox>
          <el-checkbox :label="BizTypeEnum.CRM_BUSINESS">商机</el-checkbox>
          <el-checkbox :label="BizTypeEnum.CRM_CONTRACT">合同</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        :disabled="submitLoading"
        @click="dialogVisible = false"
      >取 消</el-button>
      <el-button
        type="primary"
        :loading="submitLoading"
        :disabled="optionsLoading"
        @click="submitForm"
      >确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getSimpleUserList } from '@/api/system/user'
import * as BusinessApi from '@/api/crm/business'
import * as ClueApi from '@/api/crm/clue'
import * as ContactApi from '@/api/crm/contact'
import * as CustomerApi from '@/api/crm/customer'
import * as ContractApi from '@/api/crm/contract'
import { BizTypeEnum, PermissionLevelEnum } from '@/api/crm/permission'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

const createFormData = () => ({
  id: undefined,
  newOwnerUserId: undefined,
  oldOwnerPermissionLevel: undefined,
  toBizTypes: []
})

export default {
  name: 'CrmTransferForm',
  props: {
    bizType: { type: Number, required: true }
  },
  data() {
    return {
      BizTypeEnum,
      dialogVisible: false,
      optionsLoading: false,
      submitLoading: false,
      userOptions: [],
      oldOwnerHandler: false,
      formData: createFormData(),
      formRules: {
        newOwnerUserId: [{ required: true, message: '新负责人不能为空', trigger: 'change' }],
        oldOwnerPermissionLevel: [
          { required: true, message: '老负责人加入团队后的权限级别不能为空', trigger: 'change' }
        ]
      },
      requestSequence: 0
    }
  },
  computed: {
    dialogTitle() {
      const titles = {
        [BizTypeEnum.CRM_CLUE]: '线索转移',
        [BizTypeEnum.CRM_CUSTOMER]: '客户转移',
        [BizTypeEnum.CRM_CONTACT]: '联系人转移',
        [BizTypeEnum.CRM_BUSINESS]: '商机转移',
        [BizTypeEnum.CRM_CONTRACT]: '合同转移'
      }
      return titles[this.bizType] || '转移'
    },
    permissionLevelOptions() {
      return getIntDictOptions(DICT_TYPE.CRM_PERMISSION_LEVEL)
        .filter(item => item.value !== PermissionLevelEnum.OWNER)
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    async open(bizId) {
      const requestId = ++this.requestSequence
      this.formData = createFormData()
      this.formData.id = bizId
      this.oldOwnerHandler = false
      this.dialogVisible = true
      this.optionsLoading = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      try {
        const users = (await getSimpleUserList()).data
        if (requestId !== this.requestSequence) return
        this.userOptions = users
      } finally {
        if (requestId === this.requestSequence) this.optionsLoading = false
      }
    },
    handleOwnerChange(value) {
      if (!value) this.formData.oldOwnerPermissionLevel = undefined
    },
    transfer(data) {
      const actions = {
        [BizTypeEnum.CRM_CLUE]: ClueApi.transferClue,
        [BizTypeEnum.CRM_CUSTOMER]: CustomerApi.transferCustomer,
        [BizTypeEnum.CRM_CONTACT]: ContactApi.transferContact,
        [BizTypeEnum.CRM_BUSINESS]: BusinessApi.transferBusiness,
        [BizTypeEnum.CRM_CONTRACT]: ContractApi.transferContract
      }
      const action = actions[this.bizType]
      if (!action) return Promise.reject(new Error('【转移失败】没有转移接口'))
      return action(data)
    },
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid || this.submitLoading) return
        this.submitLoading = true
        try {
          await this.transfer(this.formData)
          this.$modal.msgSuccess(this.dialogTitle + '成功')
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
      this.oldOwnerHandler = false
      this.formData = createFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
