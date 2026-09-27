<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
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
        label="秒杀时段名称"
        prop="name"
      >
        <el-input
          v-model="formData.name"
          placeholder="请输入秒杀时段名称"
        />
      </el-form-item>
      <el-form-item
        label="开始时间点"
        prop="startTime"
      >
        <el-time-picker
          v-model="formData.startTime"
          value-format="HH:mm:ss"
          placeholder="选择开始时间点"
        />
      </el-form-item>
      <el-form-item
        label="结束时间点"
        prop="endTime"
      >
        <el-time-picker
          v-model="formData.endTime"
          value-format="HH:mm:ss"
          placeholder="选择结束时间点"
        />
      </el-form-item>
      <el-form-item
        label="秒杀轮播图"
        prop="sliderPicUrls"
      >
        <ImageUpload
          v-model="sliderPicUrlsModel"
          :limit="5"
          :is-show-tip="false"
        />
      </el-form-item>
      <el-form-item
        label="活动状态"
        prop="status"
      >
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusDictDatas"
            :key="parseInt(dict.value)"
            :label="parseInt(dict.value)"
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
import ImageUpload from '@/components/ImageUpload'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { SeckillConfigApi } from '@/api/mall/promotion/seckill/seckillConfig'

export default {
  name: 'SeckillConfigForm',
  components: { ImageUpload },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.defaultFormData(),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formRules: {
        name: [{ required: true, message: '秒杀时段名称不能为空', trigger: 'blur' }],
        startTime: [{ required: true, message: '开始时间点不能为空', trigger: 'blur' }],
        endTime: [{ required: true, message: '结束时间点不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '活动状态不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    sliderPicUrlsModel: {
      get() {
        return this.formData.sliderPicUrls || []
      },
      set(value) {
        this.formData.sliderPicUrls = this.toArray(value)
      }
    }
  },
  methods: {
    defaultFormData() {
      return {
        id: undefined,
        name: undefined,
        startTime: undefined,
        endTime: undefined,
        sliderPicUrls: [],
        status: CommonStatusEnum.ENABLE
      }
    },
    toArray(value) {
      if (Array.isArray(value)) {
        return value.map(item => typeof item === 'object' && item ? item.url : item).filter(Boolean)
      }
      if (!value) return []
      return String(value).split(',').map(item => item.trim()).filter(Boolean)
    },
    open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增' : '编辑'
      this.formType = type
      this.resetForm()
      if (!id) return Promise.resolve()
      this.formLoading = true
      return SeckillConfigApi.getSeckillConfig(id).then(response => {
        const data = response.data
        this.formData = Object.assign(this.defaultFormData(), data, {
          sliderPicUrls: this.toArray(data.sliderPicUrls)
        })
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (!valid) {
            resolve(false)
            return
          }
          this.formLoading = true
          const request = this.formType === 'create'
            ? SeckillConfigApi.createSeckillConfig(this.formData)
            : SeckillConfigApi.updateSeckillConfig(this.formData)
          request.then(() => {
            this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
            this.dialogVisible = false
            this.$emit('success')
            resolve(true)
          }).catch(reject).finally(() => {
            this.formLoading = false
          })
        })
      })
    },
    resetForm() {
      this.formData = this.defaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.resetFields()
      })
    }
  }
}
</script>
