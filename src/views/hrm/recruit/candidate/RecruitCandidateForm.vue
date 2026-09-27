<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="920px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="96px"
    >
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="候选人姓名"
          prop="name"
        ><el-input
          v-model="formData.name"
          maxlength="255"
          placeholder="请输入候选人姓名"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="手机号码"
          prop="mobile"
        ><el-input
          v-model="formData.mobile"
          maxlength="18"
          placeholder="请输入手机号码"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="性别"
          prop="sex"
        ><el-radio-group v-model="formData.sex"><el-radio
          v-for="dict in sexOptions"
          :key="dict.value"
          :label="dict.value"
        >{{ dict.label }}</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="年龄"
          prop="age"
        ><el-input-number
          v-model="formData.age"
          :controls="false"
          :max="99"
          :min="0"
          class="full-width"
          placeholder="请输入年龄"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="邮箱"
          prop="email"
        ><el-input
          v-model="formData.email"
          maxlength="255"
          placeholder="请输入邮箱"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="应聘职位"
          prop="postId"
        ><recruit-post-select
          v-model="formData.postId"
          :clearable="false"
          class="full-width"
          placeholder="请选择应聘职位"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="工作年限"
          prop="workTime"
        ><el-input-number
          v-model="formData.workTime"
          :controls="false"
          :max="60"
          :min="0"
          class="full-width"
          placeholder="请输入工作年限"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="学历"
          prop="education"
        ><el-select
          v-model="formData.education"
          class="full-width"
          placeholder="请选择学历"
        ><el-option
          v-for="dict in getIntDictOptions(DICT_TYPE.HRM_RECRUIT_CANDIDATE_EDUCATION)"
          :key="dict.value"
          :label="dict.label"
          :value="dict.value"
        /></el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item
          label="毕业院校"
          prop="graduateSchool"
        ><el-input
          v-model="formData.graduateSchool"
          maxlength="255"
          placeholder="请输入毕业院校"
        /></el-form-item></el-col>
        <el-col :span="12"><el-form-item
          label="最近工作单位"
          prop="latestWorkPlace"
        ><el-input
          v-model="formData.latestWorkPlace"
          maxlength="255"
          placeholder="请输入最近工作单位"
        /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20"><el-col :span="12"><el-form-item
        label="招聘渠道"
        prop="channelId"
      ><recruit-channel-select
        v-model="formData.channelId"
        class="full-width"
        placeholder="请选择招聘渠道"
      /></el-form-item></el-col></el-row>
      <el-form-item
        label="简历附件"
        prop="resumeUrls"
      ><recruit-file-upload
        v-model="formData.resumeUrls"
        :file-size="20"
        :file-type="['doc', 'docx', 'pdf']"
        :limit="5"
        directory="hrm/recruit/candidate/resume"
      /></el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      ><el-input
        v-model="formData.remark"
        :rows="3"
        maxlength="255"
        placeholder="请输入备注"
        show-word-limit
        type="textarea"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      :disabled="formLoading"
      type="primary"
      @click="submitForm"
    >保存</el-button><el-button @click="dialogVisible = false">取消</el-button></span>
  </el-dialog>
</template>

<script>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { SystemUserSexEnum } from '@/utils/constants'
import { createRecruitCandidate, getRecruitCandidate, updateRecruitCandidate } from '@/api/hrm/recruit/candidate'
import RecruitFileUpload from '@/views/hrm/recruit/components/RecruitFileUpload.vue'
import RecruitChannelSelect from '@/views/hrm/recruit/channel/components/RecruitChannelSelect.vue'
import RecruitPostSelect from '@/views/hrm/recruit/post/components/RecruitPostSelect.vue'

export default {
  name: 'HrmRecruitCandidateForm',
  components: { RecruitFileUpload, RecruitChannelSelect, RecruitPostSelect },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: this.createDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '候选人姓名不能为空', trigger: 'blur' }],
        mobile: [{ required: true, message: '手机号码不能为空', trigger: 'blur' }, { pattern: /^(\+?0?\d{2,4}-?)?\d{6,11}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
        sex: [{ required: true, message: '性别不能为空', trigger: 'change' }],
        postId: [{ required: true, message: '应聘职位不能为空', trigger: 'change' }],
        education: [{ required: true, message: '学历不能为空', trigger: 'change' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      }
    }
  },
  computed: {
    sexOptions() {
      return getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX).filter(item => item.value !== SystemUserSexEnum.UNKNOWN)
    }
  },
  methods: {
    getIntDictOptions,
    createDefaultFormData() {
      return { id: undefined, name: '', mobile: '', sex: SystemUserSexEnum.MALE, age: undefined, email: '', postId: undefined, workTime: undefined, education: undefined, graduateSchool: '', latestWorkPlace: '', channelId: undefined, remark: '', resumeUrls: [] }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新建候选人' : '编辑候选人'
      this.formType = type
      this.resetForm()
      if (!id) return
      this.formLoading = true
      try {
        const response = await getRecruitCandidate(id)
        this.formData = response.data
        if (!this.formData.resumeUrls) this.$set(this.formData, 'resumeUrls', [])
      } finally {
        this.formLoading = false
      }
    },
    async submitForm() {
      const valid = await this.$refs.form.validate().catch(() => false)
      if (!valid) return
      this.formLoading = true
      try {
        if (this.formType === 'create') {
          await createRecruitCandidate(this.formData)
          this.$modal.msgSuccess(this.$t('common.createSuccess'))
        } else {
          await updateRecruitCandidate(this.formData)
          this.$modal.msgSuccess(this.$t('common.updateSuccess'))
        }
        this.dialogVisible = false
        this.$emit('success')
      } finally {
        this.formLoading = false
      }
    },
    resetForm() {
      this.formData = this.createDefaultFormData()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>
<style scoped>.full-width { width: 100%; }</style>
