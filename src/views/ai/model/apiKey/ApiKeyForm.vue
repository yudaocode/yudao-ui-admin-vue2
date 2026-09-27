<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="560px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item
        label="所属平台"
        prop="platform"
      ><el-select
        v-model="formData.platform"
        clearable
        placeholder="请输入平台"
      ><el-option
        v-for="item in platformDictDatas"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></el-form-item>
      <el-form-item
        label="名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入名称"
      /></el-form-item>
      <el-form-item
        label="密钥"
        prop="apiKey"
      ><el-input
        v-model="formData.apiKey"
        placeholder="请输入密钥"
      /></el-form-item>
      <el-form-item
        label="自定义 API URL"
        prop="url"
      ><el-input
        v-model="formData.url"
        placeholder="请输入自定义 API URL"
      /></el-form-item>
      <el-form-item
        label="状态"
        prop="status"
      ><el-radio-group v-model="formData.status"><el-radio
        v-for="item in statusDictDatas"
        :key="item.value"
        :label="Number(item.value)"
      >{{ item.label }}</el-radio></el-radio-group></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :disabled="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { ApiKeyApi } from '@/api/ai/model/apiKey'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'

export default {
  name: 'AiApiKeyForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      platformDictDatas: getDictDatas(DICT_TYPE.AI_PLATFORM),
      formData: this.getDefaultForm(),
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        apiKey: [{ required: true, message: '密钥不能为空', trigger: 'blur' }],
        platform: [{ required: true, message: '平台不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultForm() { return { id: undefined, name: undefined, apiKey: undefined, platform: undefined, url: undefined, status: CommonStatusEnum.ENABLE } },
    open(type, id) {
      this.visible = true; this.formType = type; this.title = type === 'create' ? '新增' : '编辑'; this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id) { this.loading = true; ApiKeyApi.getApiKey(id).then(response => { this.formData = response.data }).finally(() => { this.loading = false }) }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'create' ? ApiKeyApi.createApiKey : ApiKeyApi.updateApiKey
        action(this.formData).then(() => { this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false })
      })
    }
  }
}
</script>
