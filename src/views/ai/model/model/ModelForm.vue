<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="620px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="130px"
    >
      <el-form-item
        label="所属平台"
        prop="platform"
      >
        <el-select
          v-model="formData.platform"
          clearable
          placeholder="请输入平台"
        >
          <el-option
            v-for="item in platformDictDatas"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="模型类型"
        prop="type"
      >
        <el-select
          v-model="formData.type"
          :disabled="!!formData.id"
          clearable
          placeholder="请输入模型类型"
        >
          <el-option
            v-for="item in modelTypeDictDatas"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="API 秘钥"
        prop="keyId"
      >
        <el-select
          v-model="formData.keyId"
          clearable
          placeholder="请选择 API 秘钥"
        >
          <el-option
            v-for="item in apiKeyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="模型名字"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入模型名字"
      /></el-form-item>
      <el-form-item
        label="模型标识"
        prop="model"
      ><el-input
        v-model="formData.model"
        placeholder="请输入模型标识"
      /></el-form-item>
      <el-form-item
        label="模型排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        placeholder="请输入模型排序"
        style="width:100%"
      /></el-form-item>
      <el-form-item
        label="开启状态"
        prop="status"
      >
        <el-radio-group v-model="formData.status"><el-radio
          v-for="item in statusDictDatas"
          :key="item.value"
          :label="Number(item.value)"
        >{{ item.label }}</el-radio></el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="isChat"
        label="温度参数"
        prop="temperature"
      ><el-input-number
        v-model="formData.temperature"
        placeholder="请输入温度参数"
        :min="0"
        :max="2"
        :precision="2"
        style="width:100%"
      /></el-form-item>
      <el-form-item
        v-if="isChat"
        label="回复数 Token 数"
        prop="maxTokens"
      ><el-input-number
        v-model="formData.maxTokens"
        placeholder="请输入回复数 Token 数"
        :min="0"
        :max="8192"
        style="width:100%"
      /></el-form-item>
      <el-form-item
        v-if="isChat"
        label="上下文数量"
        prop="maxContexts"
      ><el-input-number
        v-model="formData.maxContexts"
        placeholder="请输入上下文数量"
        :min="0"
        :max="20"
        style="width:100%"
      /></el-form-item>
    </el-form>
    <span slot="footer"><el-button
      type="primary"
      :disabled="loading"
      @click="submitForm"
    >确 定</el-button><el-button @click="visible = false">取 消</el-button></span>
  </el-dialog>
</template>

<script>
import { ModelApi } from '@/api/ai/model/model'
import { ApiKeyApi } from '@/api/ai/model/apiKey'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { AiModelTypeEnum } from '@/views/ai/utils/constants'

export default {
  name: 'AiModelForm',
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      apiKeyList: [],
      platformDictDatas: getDictDatas(DICT_TYPE.AI_PLATFORM),
      modelTypeDictDatas: getDictDatas(DICT_TYPE.AI_MODEL_TYPE),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultForm(),
      rules: {
        keyId: [{ required: true, message: 'API 秘钥不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '模型名字不能为空', trigger: 'blur' }],
        model: [{ required: true, message: '模型标识不能为空', trigger: 'blur' }],
        platform: [{ required: true, message: '所属平台不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '模型类型不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        temperature: [{ required: true, message: '温度参数不能为空', trigger: 'blur' }],
        maxTokens: [{ required: true, message: '回复数 Token 数不能为空', trigger: 'blur' }],
        maxContexts: [{ required: true, message: '上下文数量不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isChat() {
      return Number(this.formData.type) === AiModelTypeEnum.CHAT
    }
  },
  methods: {
    getDefaultForm() {
      return {
        id: undefined,
        keyId: undefined,
        name: undefined,
        model: undefined,
        platform: undefined,
        type: undefined,
        sort: undefined,
        status: CommonStatusEnum.ENABLE,
        temperature: undefined,
        maxTokens: undefined,
        maxContexts: undefined
      }
    },
    async open(type, id) {
      this.visible = true
      this.title = type === 'create' ? '新增' : '编辑'
      this.formType = type
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id) {
        this.loading = true
        try {
          const response = await ModelApi.getModel(id)
          this.formData = response.data
        } finally {
          this.loading = false
        }
      }
      const response = await ApiKeyApi.getApiKeySimpleList()
      this.apiKeyList = response.data
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const data = Object.assign({}, this.formData)
        if (data.type !== AiModelTypeEnum.CHAT) {
          delete data.temperature
          delete data.maxTokens
          delete data.maxContexts
        }
        const action = this.formType === 'create' ? ModelApi.createModel : ModelApi.updateModel
        action(data).then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.visible = false
          this.$emit('success')
        }).finally(() => {
          this.loading = false
        })
      })
    }
  }
}
</script>
