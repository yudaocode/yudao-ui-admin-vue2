<template>
  <Dialog :title="title" v-model="visible" append-to-body>
    <el-form
      ref="form"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      label-width="130px"
    >
      <el-form-item label="知识库名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入知识库名称" />
      </el-form-item>
      <el-form-item label="知识库描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入知识库描述"
        />
      </el-form-item>
      <el-form-item label="向量模型" prop="embeddingModelId">
        <el-select
          v-model="formData.embeddingModelId"
          clearable
          placeholder="请选择向量模型"
          style="width: 100%"
        >
          <el-option
            v-for="item in modelList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="检索 topK" prop="topK">
        <el-input-number
          v-model="formData.topK"
          :min="0"
          :max="10"
          controls-position="right"
          placeholder="请输入检索 topK"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="检索相似度阈值" prop="similarityThreshold">
        <el-input-number
          v-model="formData.similarityThreshold"
          :min="0"
          :max="1"
          :step="0.01"
          :precision="2"
          controls-position="right"
          placeholder="请输入检索相似度阈值"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="Number(dict.value)"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="loading" @click="submitForm">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </span>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { KnowledgeApi } from '@/api/ai/knowledge/knowledge'
import { ModelApi } from '@/api/ai/model/model'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import { AiModelTypeEnum } from '@/views/ai/utils/constants'

export default {
  name: 'KnowledgeForm',
  components: { Dialog },
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      formType: 'create',
      modelList: [],
      statusOptions: getDictDatas(DICT_TYPE.COMMON_STATUS),
      formData: this.getDefaultFormData(),
      rules: {
        name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
        embeddingModelId: [{ required: true, message: '请输入向量模型', trigger: 'blur' }],
        topK: [{ required: true, message: '请输入检索 topK', trigger: 'blur' }],
        similarityThreshold: [
          { required: true, message: '请输入检索相似度阈值', trigger: 'blur' }
        ],
        status: [{ required: true, message: '请选择是否启用', trigger: 'blur' }]
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return {
        id: undefined,
        name: undefined,
        description: undefined,
        embeddingModelId: undefined,
        topK: undefined,
        similarityThreshold: undefined,
        status: CommonStatusEnum.ENABLE
      }
    },
    async open(type, id) {
      this.visible = true
      this.formType = type
      this.title = type === 'create' ? '新增知识库' : '修改知识库'
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
      const modelResponse = await ModelApi.getModelSimpleList(AiModelTypeEnum.EMBEDDING)
      this.modelList = modelResponse.data
      if (id) {
        this.loading = true
        try {
          const response = await KnowledgeApi.getKnowledge(id)
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
          await KnowledgeApi.createKnowledge(this.formData)
          this.$modal.msgSuccess('新增成功')
        } else {
          await KnowledgeApi.updateKnowledge(this.formData)
          this.$modal.msgSuccess('修改成功')
        }
        this.visible = false
        this.$emit('success')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
