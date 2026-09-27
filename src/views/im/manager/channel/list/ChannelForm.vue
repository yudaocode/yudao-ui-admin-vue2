<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item
        label="频道编码"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          placeholder="如 system_notice"
          :disabled="formType === 'update'"
        />
      </el-form-item>
      <el-form-item
        label="频道名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="如 系统公告"
        />
      </el-form-item>
      <el-form-item
        label="频道头像"
        prop="avatar"
      >
        <UploadImg
          v-model="formData.avatar"
          :limit="1"
        />
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          :min="0"
          controls-position="right"
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
          >
            {{ dict.label }}
          </el-radio>
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
import {
  createManagerChannel,
  getManagerChannel,
  updateManagerChannel
} from '@/api/im/manager/channel'

export default {
  name: 'ImChannelForm',
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
        code: [
          { required: true, message: '频道编码不能为空', trigger: 'blur' },
          {
            pattern: /^[a-z][a-z0-9_]*$/,
            message: '只能由小写字母 / 数字 / 下划线组成，且以字母开头',
            trigger: 'blur'
          }
        ],
        name: [{ required: true, message: '频道名称不能为空', trigger: 'blur' }],
        avatar: [{ required: true, message: '频道头像不能为空', trigger: 'change' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { id: undefined, code: '', name: '', avatar: '', sort: 0, status: CommonStatusEnum.ENABLE }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '修改'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getManagerChannel(id)
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
          await createManagerChannel(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateManagerChannel(this.formData)
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
