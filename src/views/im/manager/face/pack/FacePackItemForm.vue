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
        label="表情图"
        prop="url"
      >
        <UploadImg
          v-model="formData.url"
          :limit="1"
          @input="onUrlChange"
        />
      </el-form-item>
      <el-form-item
        label="表情名"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="可选；如「狗头」「捂脸」"
          maxlength="64"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        label="宽度"
        prop="width"
      >
        <el-input-number
          v-model="formData.width"
          :min="1"
          :max="2048"
          controls-position="right"
          style="width: 33.333%"
        />
        <span class="dimension-tip">上传后自动探测；可手动调整（1 ~ 2048 像素）</span>
      </el-form-item>
      <el-form-item
        label="高度"
        prop="height"
      >
        <el-input-number
          v-model="formData.height"
          :min="1"
          :max="2048"
          controls-position="right"
          style="width: 33.333%"
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
import {
  createManagerFacePackItem,
  getManagerFacePackItem,
  updateManagerFacePackItem
} from '@/api/im/manager/face/item'
import { probeImageSize } from '@/views/im/utils/image'

export default {
  name: 'ImManagerFacePackItemForm',
  components: { UploadImg },
  props: {
    packId: { type: Number, required: true }
  },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      statusOptions: getIntDictOptions(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultFormData(),
      formRules: {
        url: [{ required: true, message: '表情图不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        width: [
          { required: true, message: '宽度不能为空', trigger: 'change' },
          { type: 'integer', min: 1, max: 2048, message: '宽度需在 1 - 2048 像素之间', trigger: 'change', transform: value => value == null ? value : Number(value) }
        ],
        height: [
          { required: true, message: '高度不能为空', trigger: 'change' },
          { type: 'integer', min: 1, max: 2048, message: '高度需在 1 - 2048 像素之间', trigger: 'change', transform: value => value == null ? value : Number(value) }
        ]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { id: undefined, packId: this.packId, url: '', name: '', width: undefined, height: undefined, sort: 0, status: CommonStatusEnum.ENABLE }
    },
    async onUrlChange(url) {
      if (!url) {
        this.formData.width = undefined
        this.formData.height = undefined
        return
      }
      const size = await probeImageSize(url)
      this.formData.width = size.width
      this.formData.height = size.height
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增表情' : '修改表情'
      this.formType = type
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await getManagerFacePackItem(id)
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
          this.formData.packId = this.packId
          await createManagerFacePackItem(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await updateManagerFacePackItem(this.formData)
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

<style scoped>
.dimension-tip { margin-left: 8px; color: #909399; font-size: 12px; }
</style>
