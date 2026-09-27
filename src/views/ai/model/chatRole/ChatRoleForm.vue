<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="760px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="角色名称"
        prop="name"
      ><el-input
        v-model="formData.name"
        placeholder="请输入角色名称"
      /></el-form-item>
      <el-form-item
        label="角色头像"
        prop="avatar"
      ><ImageUpload
        v-model="formData.avatar"
        :limit="1"
        :is-show-tip="false"
      /></el-form-item>
      <el-form-item
        v-if="!isUser"
        label="绑定模型"
        prop="modelId"
      ><el-select
        v-model="formData.modelId"
        clearable
        placeholder="请选择模型"
      ><el-option
        v-for="item in models"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      /></el-select></el-form-item>
      <el-form-item
        v-if="!isUser"
        label="角色类别"
        prop="category"
      ><el-input
        v-model="formData.category"
        placeholder="请输入角色类别"
      /></el-form-item>
      <el-form-item
        label="角色描述"
        prop="description"
      ><el-input
        v-model="formData.description"
        type="textarea"
        placeholder="请输入角色描述"
      /></el-form-item>
      <el-form-item
        label="角色设定"
        prop="systemMessage"
      ><el-input
        v-model="formData.systemMessage"
        type="textarea"
        placeholder="请输入角色设定"
      /></el-form-item>
      <el-form-item
        label="引用知识库"
        prop="knowledgeIds"
      ><el-select
        v-model="formData.knowledgeIds"
        multiple
        clearable
        placeholder="请选择知识库"
      ><el-option
        v-for="item in knowledgeList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      /></el-select></el-form-item>
      <el-form-item
        label="引用工具"
        prop="toolIds"
      ><el-select
        v-model="formData.toolIds"
        multiple
        clearable
        placeholder="请选择工具"
      ><el-option
        v-for="item in toolList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      /></el-select></el-form-item>
      <el-form-item
        label="引用 MCP"
        prop="toolIds"
      ><el-select
        v-model="formData.mcpClientNames"
        multiple
        clearable
        placeholder="请选择 MCP"
      ><el-option
        v-for="item in mcpDictDatas"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      /></el-select></el-form-item>
      <el-form-item
        v-if="!isUser"
        label="是否公开"
        prop="publicStatus"
      ><el-radio-group v-model="formData.publicStatus"><el-radio
        v-for="item in boolDictDatas"
        :key="item.value"
        :label="item.value === true || item.value === 'true'"
      >{{ item.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item
        v-if="!isUser"
        label="角色排序"
        prop="sort"
      ><el-input-number
        v-model="formData.sort"
        placeholder="请输入角色排序"
        style="width:100%"
      /></el-form-item>
      <el-form-item
        v-if="!isUser"
        label="开启状态"
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
import { ChatRoleApi } from '@/api/ai/model/chatRole'
import { ModelApi } from '@/api/ai/model/model'
import { KnowledgeApi } from '@/api/ai/knowledge/knowledge'
import { ToolApi } from '@/api/ai/model/tool'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { AiModelTypeEnum } from '@/views/ai/utils/constants'
import ImageUpload from '@/components/ImageUpload'

export default {
  name: 'AiChatRoleForm',
  components: { ImageUpload },
  data() {
    return {
      DICT_TYPE,
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      models: [],
      knowledgeList: [],
      toolList: [],
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      boolDictDatas: getDictDatas(DICT_TYPE.INFRA_BOOLEAN_STRING),
      mcpDictDatas: getDictDatas(DICT_TYPE.AI_MCP_CLIENT_NAME),
      formData: this.getDefaultForm(),
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        avatar: [{ required: true, message: '角色头像不能为空', trigger: 'blur' }],
        category: [{ required: true, message: '角色类别不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '角色排序不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '角色描述不能为空', trigger: 'blur' }],
        systemMessage: [{ required: true, message: '角色设定不能为空', trigger: 'blur' }],
        publicStatus: [{ required: true, message: '是否公开不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: { isUser() { return this.formType === 'my-create' || this.formType === 'my-update' } },
  methods: {
    getDefaultForm() { return { id: undefined, modelId: undefined, name: undefined, avatar: undefined, category: undefined, sort: undefined, description: undefined, systemMessage: undefined, publicStatus: true, status: CommonStatusEnum.ENABLE, knowledgeIds: [], toolIds: [], mcpClientNames: [] } },
    async open(type, id, title) {
      this.visible = true
      this.formType = type
      this.title = title || (type.indexOf('create') >= 0 ? '新增' : '编辑')
      this.formData = this.getDefaultForm()
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      if (id) {
        this.loading = true
        try {
          const response = await ChatRoleApi.getChatRole(id)
          this.formData = response.data
        } finally {
          this.loading = false
        }
      }
      let response = await ModelApi.getModelSimpleList(AiModelTypeEnum.CHAT)
      this.models = response.data
      response = await KnowledgeApi.getSimpleKnowledgeList()
      this.knowledgeList = response.data
      response = await ToolApi.getToolSimpleList()
      this.toolList = response.data
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.loading = true
        const action = this.formType === 'my-create' ? ChatRoleApi.createMy : (this.formType === 'my-update' ? ChatRoleApi.updateMy : (this.formType === 'create' ? ChatRoleApi.createChatRole : ChatRoleApi.updateChatRole))
        action(this.formData).then(() => { this.$modal.msgSuccess(this.formType.indexOf('create') >= 0 ? '新增成功' : '修改成功'); this.visible = false; this.$emit('success') }).finally(() => { this.loading = false })
      })
    }
  }
}
</script>
