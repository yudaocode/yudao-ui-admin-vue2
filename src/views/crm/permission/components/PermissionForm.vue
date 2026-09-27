<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="form"
      v-loading="optionsLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        v-if="formType === 'create'"
        label="选择人员"
        prop="userId"
      >
        <el-select
          v-model="formData.userId"
          filterable
          placeholder="请选择人员"
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
      <el-form-item
        label="权限级别"
        prop="level"
      >
        <el-radio-group v-model="formData.level">
          <el-radio
            v-for="item in permissionLevelOptions"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="formType === 'create' && Number(formData.bizType) === BizTypeEnum.CRM_CUSTOMER"
        label="同时添加至"
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
import * as PermissionApi from '@/api/crm/permission'
import { BizTypeEnum, PermissionLevelEnum } from '@/api/crm/permission'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

const createFormData = (bizType, bizId) => ({
  ids: undefined,
  userId: undefined,
  bizType,
  bizId,
  level: undefined,
  toBizTypes: []
})

export default {
  name: 'CrmPermissionForm',
  data() {
    return {
      BizTypeEnum,
      PermissionLevelEnum,
      dialogVisible: false,
      dialogTitle: '',
      formType: 'create',
      optionsLoading: false,
      submitLoading: false,
      userOptions: [],
      formData: createFormData(undefined, undefined),
      formRules: {
        userId: [{ required: true, message: '人员不能为空', trigger: 'change' }],
        level: [{ required: true, message: '权限级别不能为空', trigger: 'change' }]
      },
      requestSequence: 0
    }
  },
  computed: {
    permissionLevelOptions() {
      return getIntDictOptions(DICT_TYPE.CRM_PERMISSION_LEVEL)
        .filter(item => item.value !== PermissionLevelEnum.OWNER)
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    open(type, bizType, bizId, ids) {
      this.prepareOpen(type, bizType, bizId)
      if (Array.isArray(ids) && ids.length > 0) this.formData.ids = ids.slice()
    },
    open0(type, bizType, bizId, id, level) {
      this.prepareOpen(type, bizType, bizId)
      this.formData.ids = [id]
      this.formData.level = Number(level)
    },
    async prepareOpen(type, bizType, bizId) {
      const requestId = ++this.requestSequence
      this.formType = type || 'create'
      this.dialogTitle = (this.formType === 'create' ? '新增' : '编辑') + '团队成员'
      this.formData = createFormData(bizType, bizId)
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
    submitForm() {
      this.$refs.form.validate(async valid => {
        if (!valid || this.submitLoading) return
        this.submitLoading = true
        try {
          if (this.formType === 'create') {
            await PermissionApi.createPermission(this.formData)
            this.$modal.msgSuccess('新增团队成员成功')
          } else {
            await PermissionApi.updatePermission(this.formData)
            this.$modal.msgSuccess('编辑团队成员成功')
          }
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
      this.formData = createFormData(undefined, undefined)
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
