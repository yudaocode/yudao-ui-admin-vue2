<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import { createGroup, getGroup, updateGroup } from '@/api/member/group'
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import Dialog from '@/components/Dialog'

export default {
  name: 'MemberGroupForm',
  components: { Dialog },
  data() {
    return {
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.defaultForm(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  methods: {
    defaultForm() {
      return {
        id: undefined,
        name: undefined,
        remark: undefined,
        status: CommonStatusEnum.ENABLE
      }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = this.$t('action.' + type)
      this.reset()
      if (id) {
        this.formLoading = true
        try {
          const response = await getGroup(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.formData = this.defaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.formLoading = true
      try {
        await (this.formType === 'create'
          ? createGroup(this.formData)
          : updateGroup(this.formData))
        this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
