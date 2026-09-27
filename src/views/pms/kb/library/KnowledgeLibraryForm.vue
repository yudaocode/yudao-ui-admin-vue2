<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="680px"
      append-to-body
    >
      <!-- 知识库模板选择 -->
      <div
        v-if="formType === 'create' && templateSelecting"
        v-loading="templateLoading"
        class="template-selector"
      >
        <div class="template-list">
          <button
            :class="['template-option', { selected: selectedTemplateId === 0 }]"
            type="button"
            @click="selectedTemplateId = 0"
          >
            <div class="template-cover template-cover-empty">
              <i class="el-icon-plus" />
            </div>
            <div class="template-option-text">
              <div class="template-name">空白知识库</div>
              <div class="template-description">邀请团队成员一起创作和交流知识</div>
            </div>
          </button>
          <button
            v-for="template in templateList"
            :key="template.id"
            :class="['template-option', { selected: selectedTemplateId === template.id }]"
            type="button"
            @click="selectedTemplateId = template.id"
          >
            <el-image
              v-if="template.coverUrl"
              class="template-cover"
              fit="cover"
              :src="template.coverUrl"
            />
            <div v-else class="template-cover template-cover-placeholder">
              <i class="el-icon-notebook-2" />
            </div>
            <div class="template-option-text">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-description">{{ template.description }}</div>
            </div>
          </button>
        </div>
        <div class="template-preview">
          <template v-if="selectedTemplate">
            <div class="preview-heading">
              <div class="template-cover template-cover-placeholder">
                <el-image
                  v-if="selectedTemplate.coverUrl"
                  class="template-cover-image"
                  fit="cover"
                  :src="selectedTemplate.coverUrl"
                />
                <i v-else class="el-icon-notebook-2" />
              </div>
              <div class="template-option-text">
                <div class="template-name">{{ selectedTemplate.name }}</div>
                <div class="template-description">{{ selectedTemplate.description }}</div>
              </div>
            </div>
            <el-scrollbar class="template-documents">
              <div
                v-for="document in (selectedTemplate.documents || [])"
                :key="document.title"
                class="template-document"
              >
                <i class="el-icon-document" />
                <span>{{ document.title }}</span>
              </div>
            </el-scrollbar>
          </template>
          <div v-else class="blank-preview">
            <i class="el-icon-notebook-2 blank-preview-icon" />
            <div class="blank-preview-title">从空白知识库开始</div>
            <div class="blank-preview-description">创建后可自由添加目录和文档</div>
          </div>
        </div>
      </div>

      <!-- 知识库基础信息 -->
      <el-form
        v-else
        ref="form"
        v-loading="formLoading"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="知识库名称" prop="name">
          <el-input
            v-model="formData.name"
            maxlength="50"
            placeholder="请输入知识库名称"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="知识库封面" prop="coverUrl">
          <upload-img v-model="formData.coverUrl" />
        </el-form-item>
        <el-form-item label="知识库简介" prop="description">
          <el-input
            v-model="formData.description"
            :rows="4"
            maxlength="300"
            placeholder="请输入知识库简介"
            show-word-limit
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="可见范围" prop="openStatus">
          <el-radio-group
            v-model="formData.openStatus"
            :disabled="formType === 'update' && formData.creatorUserId !== currentUserId"
          >
            <el-radio :label="false">私有：只有知识库成员可以查看</el-radio>
            <el-radio :label="true">公开：所有人可以查看，成员可以协作</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formType === 'create'" label="初始管理员">
          <user-select-v2
            v-model="initialAdminUserIds"
            :disabled-ids="[currentUserId]"
            :multiple="true"
            placeholder="请选择初始管理员"
          />
          <div class="form-tip">可管理知识库信息和成员；创建人由系统自动加入</div>
        </el-form-item>
        <el-form-item v-if="formType === 'create'" label="普通成员">
          <user-select-v2
            v-model="initialMemberUserIds"
            :disabled-ids="[currentUserId]"
            :multiple="true"
            placeholder="请选择普通成员"
          />
          <div class="form-tip">可参与内容协作，具体能力受文档权限控制</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="library-dialog-footer">
        <el-button
          v-if="formType === 'update'"
          v-hasPermi="['pms:kb:library:update']"
          @click="openMemberForm"
        >成员管理</el-button>
        <span v-else></span>
        <div>
          <el-button
            v-if="formType === 'create' && templateSelecting"
            :disabled="templateLoading"
            type="primary"
            @click="handleTemplateNext"
          >下一步</el-button>
          <template v-else>
            <el-button
              v-if="formType === 'create'"
              :disabled="formLoading"
              @click="handleTemplateBack"
            >上一步</el-button>
            <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
          </template>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 知识库成员管理 -->
    <knowledge-member-form ref="memberForm" @success="handleMemberSuccess" />
  </div>
</template>

<script>
import * as KnowledgeLibraryApi from '@/api/pms/kb/library'
import { getCurrentUserId } from '@/utils/auth'
import UploadImg from '@/components/UploadImg'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import KnowledgeMemberForm from './KnowledgeMemberForm.vue'

function getDefaultFormData() {
  return {
    id: undefined,
    name: '',
    description: '',
    openStatus: false,
    coverUrl: undefined,
    adminUserIds: [],
    memberUserIds: [],
    templateId: undefined
  }
}

export default {
  name: 'PmsKnowledgeLibraryForm',
  components: { KnowledgeMemberForm, UploadImg, UserSelectV2 },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: '',
      templateSelecting: false,
      templateLoading: false,
      templateList: [],
      selectedTemplateId: 0,
      formData: getDefaultFormData(),
      currentUserId: getCurrentUserId(),
      initialAdminUserIds: [],
      initialMemberUserIds: [],
      formRules: {
        name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
        openStatus: [{ required: true, message: '请选择可见范围', trigger: 'change' }]
      }
    }
  },
  computed: {
    selectedTemplate() {
      return this.templateList.find(template => template.id === this.selectedTemplateId)
    }
  },
  methods: {
    async open(type, id) {
      this.dialogVisible = true
      this.formType = type
      this.templateSelecting = type === 'create'
      this.dialogTitle = type === 'create' ? '选择知识库模板' : this.$t('action.' + type)
      this.selectedTemplateId = 0
      this.resetForm()
      if (type === 'create') {
        await this.getTemplateList()
      } else if (id) {
        this.formLoading = true
        try {
          const response = await KnowledgeLibraryApi.getKnowledgeLibrary(id)
          this.formData = Object.assign({}, response.data, {
            adminUserIds: [],
            memberUserIds: [],
            templateId: undefined
          })
        } finally {
          this.formLoading = false
        }
      }
    },
    async getTemplateList() {
      this.templateLoading = true
      try {
        const response = await KnowledgeLibraryApi.getKnowledgeLibraryTemplateList()
        this.templateList = response.data
      } finally {
        this.templateLoading = false
      }
    },
    handleTemplateNext() {
      this.formData = this.selectedTemplate
        ? Object.assign(getDefaultFormData(), {
          name: this.selectedTemplate.name,
          description: this.selectedTemplate.description,
          coverUrl: this.selectedTemplate.coverUrl,
          templateId: this.selectedTemplateId
        })
        : getDefaultFormData()
      this.resetInitialMembers()
      this.templateSelecting = false
      this.dialogTitle = '新建知识库'
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    handleTemplateBack() {
      this.templateSelecting = true
      this.dialogTitle = '选择知识库模板'
    },
    resetInitialMembers() {
      this.initialAdminUserIds = []
      this.initialMemberUserIds = []
    },
    validateInitialMembers() {
      const memberUserIdSet = new Set(this.initialMemberUserIds)
      return !this.initialAdminUserIds.some(userId => memberUserIdSet.has(userId))
    },
    openMemberForm() {
      if (!this.formData.id) return
      this.$refs.memberForm.open(this.formData.id)
    },
    handleMemberSuccess() {
      this.$emit('success')
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.formType === 'create' && !this.validateInitialMembers()) {
          this.$modal.msgWarning('同一用户不能同时设置为初始管理员和普通成员')
          return
        }
        this.formLoading = true
        const request = this.formType === 'create'
          ? KnowledgeLibraryApi.createKnowledgeLibrary(Object.assign({}, this.formData, {
            adminUserIds: [...this.initialAdminUserIds],
            memberUserIds: [...this.initialMemberUserIds]
          }))
          : KnowledgeLibraryApi.updateKnowledgeLibrary(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create'
            ? this.$t('common.createSuccess')
            : this.$t('common.updateSuccess'))
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = getDefaultFormData()
      this.resetInitialMembers()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>

<style scoped>
.template-selector {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  min-height: 420px;
  gap: 16px;
}

.template-list {
  max-height: 440px;
  padding-right: 8px;
  overflow-y: auto;
}

.template-option {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 6px;
  padding: 10px;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;
  gap: 12px;
  transition: border-color 0.2s, background-color 0.2s;
}

.template-option:hover,
.template-option.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.template-cover {
  flex: 0 0 54px;
  width: 54px;
  height: 48px;
  overflow: hidden;
  border-radius: 4px;
}

.template-cover-empty,
.template-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 22px;
  background: #ecf5ff;
}

.template-cover-empty {
  background: transparent;
  border: 1px dashed #dcdfe6;
  box-sizing: border-box;
}

.template-cover-image {
  width: 100%;
  height: 100%;
}

.template-option-text {
  min-width: 0;
}

.template-name,
.template-description {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-name {
  font-size: 15px;
  font-weight: 600;
}

.template-description {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.template-preview {
  padding: 18px;
  background: #f5f7fa;
  border-radius: 4px;
}

.preview-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-documents {
  height: 320px;
  margin-top: 20px;
}

.template-document {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  color: #606266;
  gap: 12px;
}

.blank-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #606266;
}

.blank-preview-icon {
  font-size: 46px;
}

.blank-preview-title {
  margin-top: 12px;
}

.blank-preview-description,
.form-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.form-tip {
  margin-top: 4px;
}

.library-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 720px) {
  .template-selector {
    grid-template-columns: 1fr;
  }
}
</style>
