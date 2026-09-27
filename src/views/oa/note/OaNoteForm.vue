<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800px" @closed="resetForm">
    <el-form
      ref="form"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="90px"
    >
      <!-- 基础信息 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="笔记类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择笔记类型" style="width: 100%">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优先级" prop="priority">
            <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 100%">
              <el-option
                v-for="item in priorityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="笔记目录" prop="categoryId">
            <oa-note-category-select v-model="formData.categoryId" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 笔记内容 -->
      <el-form-item label="笔记标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入笔记标题"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="笔记内容" prop="content">
        <Editor ref="editorRef" v-model="formData.content" height="280px" />
      </el-form-item>
      <el-form-item label="附件">
        <UploadFile v-model="formData.fileUrls" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </div>
  </Dialog>
</template>

<script>
import * as NoteApi from '@/api/oa/note'
import Dialog from '@/components/Dialog'
import Editor from '@/components/Editor'
import UploadFile from '@/components/UploadFile'
import OaNoteCategorySelect from './components/OaNoteCategorySelect.vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { OA_NOTE_TYPE, OA_PRIORITY } from '../utils/constants-collab'

function createDefaultFormData() {
  return {
    id: undefined,
    type: OA_NOTE_TYPE.MINE,
    priority: OA_PRIORITY.NORMAL,
    title: '',
    content: '',
    categoryId: undefined,
    fileUrls: []
  }
}

export default {
  name: 'OaNoteForm',
  components: { Dialog, Editor, UploadFile, OaNoteCategorySelect },
  data() {
    return {
      dialogVisible: false,
      dialogTitle: '',
      formLoading: false,
      formType: 'create',
      formData: createDefaultFormData(),
      formRules: {
        type: [{ required: true, message: '笔记类型不能为空', trigger: 'change' }],
        priority: [{ required: true, message: '优先级不能为空', trigger: 'change' }],
        title: [{ required: true, message: '笔记标题不能为空', trigger: 'blur' }],
        content: [{ required: true, validator: (rule, value, callback) => this.validateContent(rule, value, callback), trigger: 'blur' }]
      }
    }
  },
  computed: {
    typeOptions() {
      return getIntDictOptions(DICT_TYPE.OA_NOTE_TYPE)
    },
    priorityOptions() {
      return getIntDictOptions(DICT_TYPE.OA_PRIORITY).filter(item => item.value <= OA_PRIORITY.IMPORTANT)
    }
  },
  methods: {
    /** 校验笔记正文，空段落标签不算有效内容 */
    validateContent(rule, value, callback) {
      const finish = editor => {
        const html = (this.formData.content || '').trim()
        if (!html || (editor && editor.isEmpty && editor.isEmpty())) {
          callback(new Error('笔记内容不能为空'))
          return
        }
        const text = editor && editor.getText ? editor.getText() : html.replace(/<[^>]+>/g, '')
        if ((text || '').trim().length < 10) {
          callback(new Error('笔记内容不能少于 10 个字'))
          return
        }
        callback()
      }
      const editorRef = this.$refs.editorRef
      if (editorRef && editorRef.getEditorRef) {
        editorRef.getEditorRef().then(finish).catch(() => finish(null))
      } else {
        finish(null)
      }
    },
    open(type, id, categoryId) {
      this.dialogVisible = true
      this.dialogTitle = type === 'create' ? '新增笔记' : '修改笔记'
      this.formType = type
      this.resetForm()
      if (type === 'create') {
        this.formData.categoryId = categoryId
      }
      this.formLoading = true
      // 修改时，加载笔记详情
      const request = id ? NoteApi.getNote(id) : Promise.resolve(null)
      request.then(response => {
        if (response) {
          this.formData = response.data
        }
      }).finally(() => {
        this.formLoading = false
      })
    },
    submitForm() {
      if (this.formLoading) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.formLoading = true
        const request = this.formType === 'create'
          ? NoteApi.createNote(this.formData)
          : NoteApi.updateNote(this.formData)
        request.then(() => {
          this.$modal.msgSuccess(this.formType === 'create' ? '添加成功' : '修改成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.formLoading = false
        })
      })
    },
    resetForm() {
      this.formData = createDefaultFormData()
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    }
  }
}
</script>
