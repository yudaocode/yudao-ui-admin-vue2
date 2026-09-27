<template>
  <Dialog :title="title" v-model="visible" width="800px" append-to-body>
    <el-form ref="form" v-loading="loading" :model="formData" :rules="rules" label-width="110px">
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="等级名称" prop="name"><el-input v-model="formData.name" placeholder="请输入等级名称" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="等级" prop="level"><el-input-number v-model="formData.level" :min="0" :precision="0" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="升级经验" prop="experience"><el-input-number v-model="formData.experience" :min="0" :precision="0" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="享受折扣(%)" prop="discountPercent"><el-input-number v-model="formData.discountPercent" :min="0" :max="100" :precision="0" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="等级图标"><UploadImg v-model="formData.icon" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="背景图"><UploadImg v-model="formData.backgroundUrl" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="状态" prop="status"><el-radio-group v-model="formData.status"><el-radio v-for="item in statusDictDatas" :key="item.value" :label="item.value">{{ item.label }}</el-radio></el-radio-group></el-form-item></el-col>
      </el-row>
    </el-form>
    <div slot="footer"><el-button type="primary" :loading="loading" @click="submitForm">确 定</el-button><el-button @click="visible = false">取 消</el-button></div>
  </Dialog>
</template>

<script>
import * as LevelApi from '@/api/member/level'
import UploadImg from '@/components/UploadImg'
import Dialog from '@/components/Dialog'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
const blank = () => ({ id: undefined, name: undefined, experience: undefined, level: undefined, discountPercent: undefined, icon: undefined, backgroundUrl: undefined, status: CommonStatusEnum.ENABLE })

export default {
  name: 'MemberLevelForm',
  components: { Dialog, UploadImg },
  data() { return { visible: false, loading: false, title: '', formType: 'create', formData: blank(), rules: { name: [{ required: true, message: '等级名称不能为空', trigger: 'blur' }], experience: [{ required: true, message: '升级经验不能为空', trigger: 'blur' }], level: [{ required: true, message: '等级不能为空', trigger: 'blur' }], discountPercent: [{ required: true, message: '享受折扣不能为空', trigger: 'blur' }], status: [{ required: true, message: '状态不能为空', trigger: 'change' }] }, DICT_TYPE } },
  computed: { statusDictDatas() { return getIntDictOptions(DICT_TYPE.COMMON_STATUS) } },
  methods: {
    async open(type, id) {
      this.visible = true
      this.formType = type
      this.title = this.$t('action.' + type)
      this.resetForm()
      if (id) {
        this.loading = true
        try {
          const response = await LevelApi.getLevel(id)
          this.formData = response.data
        } finally {
          this.loading = false
        }
      }
    },
    async submitForm() {
      const valid = await new Promise(resolve => this.$refs.form.validate(resolve))
      if (!valid) return
      this.loading = true
      try {
        if (this.formType === 'create') {
          await LevelApi.createLevel(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await LevelApi.updateLevel(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.formData = blank()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
