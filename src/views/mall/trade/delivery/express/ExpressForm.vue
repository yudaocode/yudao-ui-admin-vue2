<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="520px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item
        label="公司编码"
        prop="code"
      >
        <el-input
          v-model="formData.code"
          placeholder="请输入快递编码"
        />
      </el-form-item>
      <el-form-item
        label="公司名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入快递名称"
        />
      </el-form-item>
      <el-form-item
        label="公司 logo"
        prop="logo"
      >
        <ImageUpload
          v-model="formData.logo"
          :limit="1"
          :is-show-tip="false"
        />
        <div style="padding-left: 10px; font-size: 10px">推荐 180x180 图片分辨率</div>
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="formData.sort"
          controls-position="right"
          :min="0"
        />
      </el-form-item>
      <el-form-item
        label="开启状态"
        prop="status"
      >
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="dict.value"
            :label="parseInt(dict.value)"
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
        :loading="formLoading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'

export default {
  name: 'ExpressForm',
  components: { ImageUpload },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.getDefaultFormData(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        code: [{ required: true, message: '快递编码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
        logo: [{ required: true, message: '分类图片不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '开启状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        code: '',
        name: '',
        logo: '',
        sort: 0,
        status: CommonStatusEnum.ENABLE
      }
    },
    /** 打开弹窗 */
    open(type, id) {
      this.dialogVisible = true
      this.formType = type || 'create'
      this.dialogTitle = this.formType === 'update' ? '修改快递公司' : '新增快递公司'
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      if (id === undefined || id === null) return Promise.resolve()
      this.formLoading = true
      return DeliveryExpressApi.getDeliveryExpress(id)
        .then((response) => {
          this.formData = Object.assign(this.getDefaultFormData(), response.data)
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    /** 提交表单 */
    submitForm() {
      if (!this.$refs.form) return
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? DeliveryExpressApi.createDeliveryExpress(this.formData)
          : DeliveryExpressApi.updateDeliveryExpress(this.formData)
        request
          .then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    }
  }
}
</script>
