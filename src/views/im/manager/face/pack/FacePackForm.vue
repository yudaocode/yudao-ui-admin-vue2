<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="500px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item
        label="封面"
        prop="icon"
      >
        <UploadImg
          v-model="formData.icon"
          :limit="1"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入表情包名称"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      >
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.value"
          >{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import UploadImg from '@/components/UploadImg'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { createManagerFacePack, getManagerFacePack, updateManagerFacePack } from '@/api/im/manager/face/pack'

export default {
  name: 'ImManagerFacePackForm',
  components: { UploadImg },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { id: undefined, name: '', icon: '', sort: 0, status: CommonStatusEnum.ENABLE }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增表情包' : '修改表情包'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getManagerFacePack(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    async submitForm() {
      await this.$refs.form.validate()
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createManagerFacePack(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateManagerFacePack(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
