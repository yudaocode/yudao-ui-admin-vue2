<template>
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="720px" append-to-body>
    <el-form ref="form" v-loading="formLoading" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" maxlength="50" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="item in statusDictDatas" :key="item.value" :label="toNumber(item.value)">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <image-upload v-model="formData.avatar" :limit="1" :is-show-tip="false" />
      </el-form-item>
      <el-form-item label="真实名字" prop="name">
        <el-input v-model="formData.name" placeholder="请输入真实名字" />
      </el-form-item>
      <el-form-item label="用户性别" prop="sex">
        <el-radio-group v-model="formData.sex">
          <el-radio v-for="item in sexDictDatas" :key="item.value" :label="toNumber(item.value)">{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-date-picker v-model="formData.birthday" type="date" value-format="timestamp" placeholder="选择出生日期" />
      </el-form-item>
      <el-form-item label="所在地" prop="areaId">
        <treeselect
          v-model="formData.areaId"
          :options="areaList"
          :normalizer="areaNormalizer"
          :clearable="true"
          :append-to-body="true"
          placeholder="请选择所在地"
        />
      </el-form-item>
      <el-form-item label="用户标签" prop="tagIds">
        <member-tag-select v-model="formData.tagIds" show-add />
      </el-form-item>
      <el-form-item label="用户分组" prop="groupId">
        <member-group-select v-model="formData.groupId" />
      </el-form-item>
      <el-form-item label="会员备注" prop="mark">
        <el-input v-model="formData.mark" type="textarea" :rows="3" placeholder="请输入会员备注" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import * as UserApi from '@/api/member/user'
import * as AreaApi from '@/api/system/area'
import { DICT_TYPE, getDictDatas } from '@/utils/dict'
import MemberTagSelect from '@/views/member/tag/components/MemberTagSelect.vue'
import MemberGroupSelect from '@/views/member/group/components/MemberGroupSelect.vue'

const blank = () => ({
  id: undefined,
  mobile: undefined,
  email: undefined,
  password: undefined,
  status: undefined,
  nickname: undefined,
  avatar: undefined,
  name: undefined,
  sex: undefined,
  areaId: undefined,
  birthday: undefined,
  mark: undefined,
  tagIds: [],
  groupId: undefined
})
export default {
  name: 'MemberUserForm',
  components: { Treeselect, MemberTagSelect, MemberGroupSelect },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: blank(),
      areaList: [],
      formRules: {
        mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }]
      }
    }
  },
  computed: {
    statusDictDatas() {
      return getDictDatas(DICT_TYPE.COMMON_STATUS)
    },
    sexDictDatas() {
      return getDictDatas(DICT_TYPE.SYSTEM_USER_SEX)
    }
  },
  methods: {
    toNumber(value) {
      return value === '' || value === null || value === undefined ? value : Number(value)
    },
    areaNormalizer(node) {
      return {
        id: node.id,
        label: node.name || node.label,
        children: node.children
      }
    },
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = this.$t('action.' + type)
      this.resetForm()
      if (id) {
        this.formLoading = true
        try {
          const response = await UserApi.getUser(id)
          this.formData = Object.assign({}, response.data, {
            password: undefined,
            tagIds: [],
            groupId: undefined
          })
        } finally {
          this.formLoading = false
        }
      }
      const areaResponse = await AreaApi.getAreaTree()
      this.areaList = areaResponse.data
    },
    cancel() {
      this.dialogVisible = false
      this.formData = blank()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? Promise.resolve()
          : UserApi.updateUser(this.formData)
        request
          .then(() => {
            this.$modal.msgSuccess(this.$t(this.formType === 'create' ? 'common.createSuccess' : 'common.updateSuccess'))
            this.dialogVisible = false
            this.$emit('success')
          })
          .finally(() => {
            this.formLoading = false
          })
      })
    },
    resetForm() {
      this.formData = blank()
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetFields())
    }
  }
}
</script>

<style scoped>
.dialog-footer { text-align: right; }
.member-tag-select, .member-group-select { width: 100%; }
</style>
