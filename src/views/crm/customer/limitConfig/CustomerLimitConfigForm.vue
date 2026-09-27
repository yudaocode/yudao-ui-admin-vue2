<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="640px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="200px"
    >
      <el-form-item
        label="规则适用人群"
        prop="userIds"
      >
        <el-select
          v-model="formData.userIds"
          multiple
          filterable
          clearable
          collapse-tags
          placeholder="请选择规则适用人群"
          class="form-control"
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
        label="规则适用部门"
        prop="deptIds"
      >
        <el-cascader
          v-model="formData.deptIds"
          :options="deptTree"
          :props="deptCascaderProps"
          filterable
          clearable
          collapse-tags
          placeholder="请选择规则适用部门"
          class="form-control"
        />
      </el-form-item>
      <el-form-item
        :label="limitCountLabel"
        prop="maxCount"
      >
        <el-input-number
          v-model="formData.maxCount"
          controls-position="right"
          placeholder="请输入数量上限"
          class="form-control"
        />
      </el-form-item>
      <el-form-item
        v-if="formData.type === LimitConfType.CUSTOMER_QUANTITY_LIMIT"
        label="成交客户是否占用拥有客户数"
        prop="dealCountEnabled"
      >
        <el-switch v-model="formData.dealCountEnabled" />
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
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as CustomerLimitConfigApi from '@/api/crm/customer/limitConfig'
import { getSimpleDeptList } from '@/api/system/dept'
import { getSimpleUserList } from '@/api/system/user'
import { handleTree } from '@/utils/ruoyi'

function createDefaultFormData() {
  return {
    id: undefined,
    type: CustomerLimitConfigApi.LimitConfType.CUSTOMER_LOCK_LIMIT,
    userIds: [],
    deptIds: [],
    maxCount: undefined,
    dealCountEnabled: false
  }
}

function normalizeIds(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return []
  return String(value).split(',').map(id => {
    const numberId = Number(id)
    return Number.isNaN(numberId) ? id : numberId
  })
}

export default {
  name: 'CustomerLimitConfigForm',
  data() {
    return {
      LimitConfType: CustomerLimitConfigApi.LimitConfType,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '规则类型不能为空', trigger: 'change' }],
        maxCount: [{ required: true, message: '数量上限不能为空', trigger: 'blur' }]
      },
      deptTree: [],
      deptCascaderProps: {
        multiple: true,
        checkStrictly: true,
        emitPath: false,
        value: 'id',
        label: 'name',
        children: 'children'
      },
      userOptions: []
    }
  },
  computed: {
    limitCountLabel() {
      return this.formData.type === this.LimitConfType.CUSTOMER_QUANTITY_LIMIT
        ? '拥有客户数上限'
        : '锁定客户数上限'
    }
  },
  methods: {
    /** 打开弹窗 */
    open(type, limitConfType, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改客户限制配置' : '新增客户限制配置'
      this.resetForm()
      this.formData.type = limitConfType
      this.formLoading = true

      const detailRequest = id !== undefined && id !== null
        ? CustomerLimitConfigApi.getCustomerLimitConfig(id).then(response => response.data)
        : Promise.resolve(null)
      const deptRequest = getSimpleDeptList().then(response => response.data)
      const userRequest = getSimpleUserList().then(response => response.data)

      return Promise.all([detailRequest, deptRequest, userRequest]).then(([detail, depts, users]) => {
        this.deptTree = handleTree(depts, 'id', 'parentId')
        this.userOptions = users
        if (detail) {
          this.formData = Object.assign(createDefaultFormData(), detail, {
            userIds: normalizeIds(detail.userIds),
            deptIds: normalizeIds(detail.deptIds)
          })
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? CustomerLimitConfigApi.createCustomerLimitConfig(this.formData)
          : CustomerLimitConfigApi.updateCustomerLimitConfig(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    /** 重置表单 */
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.form-control {
  width: 100%;
}
</style>
