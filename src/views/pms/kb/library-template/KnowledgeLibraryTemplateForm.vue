<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="900px"
      append-to-body
      @closed="handleClosed"
    >
      <el-form
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="96px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input
                v-model="formData.name"
                maxlength="100"
                placeholder="请输入模板名称"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.value"
                >{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="显示顺序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板封面" prop="coverUrl">
              <upload-img v-model="formData.coverUrl" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板简介" prop="description">
          <el-input
            v-model="formData.description"
            :rows="3"
            maxlength="500"
            placeholder="请输入模板适用场景"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="模板文档" prop="documents">
          <div class="document-list">
            <el-table :data="formData.documents" border row-key="title">
              <el-table-column align="center" label="#" type="index" width="60" />
              <el-table-column label="文档标题" min-width="300" prop="title" />
              <el-table-column align="center" label="操作" width="160">
                <template slot-scope="scope">
                  <el-button type="text" @click="openDocumentForm(scope.$index)">编辑</el-button>
                  <el-button
                    type="text"
                    class="danger-text"
                    @click="removeDocument(scope.$index)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button class="add-document-button" plain type="primary" @click="openDocumentForm()">
              <i class="el-icon-plus" /> 新增文档
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 模板文档编辑 -->
    <el-dialog
      title="编辑模板文档"
      :visible.sync="documentDialogVisible"
      width="900px"
      append-to-body
    >
      <el-form
        ref="documentForm"
        :model="documentFormData"
        :rules="documentFormRules"
        label-width="80px"
      >
        <el-form-item label="文档标题" prop="title">
          <el-input
            v-model="documentFormData.title"
            maxlength="255"
            placeholder="请输入文档标题"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="文档内容" prop="content">
          <editor v-model="documentFormData.content" :height="420" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDocumentForm">确 定</el-button>
        <el-button @click="documentDialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as KnowledgeLibraryTemplateApi from '@/api/pms/kb/library/template'
import Editor from '@/components/Editor'
import UploadImg from '@/components/UploadImg'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

function getDefaultFormData() {
  return {
    id: undefined,
    name: '',
    description: '',
    coverUrl: undefined,
    status: CommonStatusEnum.ENABLE,
    sort: 0,
    documents: []
  }
}

export default {
  name: 'PmsKnowledgeLibraryTemplateForm',
  components: { Editor, UploadImg },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      formData: getDefaultFormData(),
      formRules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        status: [{ required: true, message: '请选择模板状态', trigger: 'change' }],
        sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
        documents: [{ required: true, message: '请至少添加一篇模板文档', trigger: 'change' }]
      },
      documentDialogVisible: false,
      documentFormData: { title: '', content: '' },
      documentFormRules: {
        title: [{ required: true, message: '请输入文档标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入文档内容', trigger: 'change' }]
      },
      editingDocumentIndex: -1
    }
  },
  computed: {
    statusOptions() {
      return getIntDictOptions(DICT_TYPE.COMMON_STATUS)
    }
  },
  methods: {
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.dialogTitle = type === 'create' ? '新增知识库模板' : '修改知识库模板'
      this.resetForm()
      if (type === 'update' && id) {
        this.formLoading = true
        try {
          const response = await KnowledgeLibraryTemplateApi.getKnowledgeLibraryTemplate(id)
          this.formData = response.data
        } finally {
          this.formLoading = false
        }
      }
    },
    openDocumentForm(index = -1) {
      this.editingDocumentIndex = index
      this.documentFormData = index >= 0
        ? Object.assign({}, this.formData.documents[index])
        : { title: '', content: '<p></p>' }
      this.documentDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.documentForm) this.$refs.documentForm.clearValidate()
      })
    },
    submitDocumentForm() {
      this.$refs.documentForm.validate(valid => {
        if (!valid) return
        const document = Object.assign({}, this.documentFormData)
        if (this.editingDocumentIndex < 0) {
          this.formData.documents.push(document)
        } else {
          this.$set(this.formData.documents, this.editingDocumentIndex, document)
        }
        this.documentDialogVisible = false
        if (this.$refs.form) this.$refs.form.validateField('documents')
      })
    },
    removeDocument(index) {
      return this.$modal.confirm('确定删除该模板文档吗？').then(() => {
        this.formData.documents.splice(index, 1)
      }).catch(() => {})
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const documentTitles = this.formData.documents.map(document => document.title)
        if (new Set(documentTitles).size !== documentTitles.length) {
          this.$modal.msgWarning('模板文档标题不能重复')
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? KnowledgeLibraryTemplateApi.createKnowledgeLibraryTemplate(this.formData)
          : KnowledgeLibraryTemplateApi.updateKnowledgeLibraryTemplate(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '新增成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    handleClosed() {
      this.documentDialogVisible = false
      if (this.$refs.form) this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
.document-list {
  width: 100%;
}

.add-document-button {
  margin-top: 12px;
}

.danger-text {
  color: #f56c6c;
}
</style>
