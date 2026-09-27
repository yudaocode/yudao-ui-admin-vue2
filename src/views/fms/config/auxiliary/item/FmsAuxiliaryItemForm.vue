<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" append-to-body width="520px">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="88px"
    >
      <el-form-item label="编码" prop="code">
        <el-input v-model="formData.code" maxlength="64" placeholder="请输入编码" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" maxlength="255" placeholder="请输入名称" />
      </el-form-item>
      <template v-if="isInventory">
        <el-form-item label="规格" prop="specification">
          <el-input v-model="formData.specification" maxlength="255" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" maxlength="255" placeholder="请输入单位" />
        </el-form-item>
      </template>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          maxlength="500"
          placeholder="请输入备注"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button :loading="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { FmsAuxiliaryItemApi } from '@/api/fms/config/auxiliary/item'
import { FMS_AUXILIARY_TYPE } from '@/views/fms/utils/constants'
import { readFmsAccountSetId } from '@/views/fms/utils/context'

export default {
  name: 'FmsAuxiliaryItemForm',
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      currentAuxiliaryType: null,
      formData: this.defaultForm(),
      formRules: {
        code: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isInventory() {
      return Number(this.currentAuxiliaryType && this.currentAuxiliaryType.type) === FMS_AUXILIARY_TYPE.INVENTORY
    }
  },
  methods: {
    defaultForm(accountSetId, auxiliaryTypeId) {
      return {
        id: undefined,
        accountSetId: Number(accountSetId) || 0,
        auxiliaryTypeId: Number(auxiliaryTypeId) || 0,
        code: '',
        name: '',
        remark: '',
        specification: undefined,
        unit: undefined
      }
    },
    open(auxiliaryType, row, accountSetId) {
      if (!auxiliaryType) return
      const resolvedAccountSetId = Number(accountSetId || (row && row.accountSetId) || readFmsAccountSetId(this.$route))
      if (!resolvedAccountSetId) return
      this.currentAuxiliaryType = auxiliaryType
      this.dialogTitle = row ? '编辑辅助核算' : '新增' + auxiliaryType.name
      this.formData = Object.assign(this.defaultForm(resolvedAccountSetId, auxiliaryType.id), row || {})
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const payload = Object.assign({}, this.formData)
        if (!this.isInventory) {
          delete payload.specification
          delete payload.unit
        }
        this.formLoading = true
        const request = payload.id
          ? FmsAuxiliaryItemApi.updateAuxiliaryItem(payload)
          : FmsAuxiliaryItemApi.createAuxiliaryItem(payload)
        request.then(() => {
          this.$modal.msgSuccess(payload.id ? '修改成功' : '新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    }
  }
}
</script>
